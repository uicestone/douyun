const User = require('../models/user.js');
const Client = require('../models/client.js');

module.exports = (router) => {
    // User CURD
    router.route('/user')

        // create a user
        .post((req, res) => {
            
            let user = new User(req.body);      // create a new instance of the User model

            if (!user.username) {
                user.username = user.mobile;
            }
            // save the user and check for errors
            user.save().then(user => {
                res.json(user);
            }).catch(err => {
                console.error(err);
                res.status(500);
            });
            
        })

        // get all the users
        .get((req, res) => {

            const limit = +req.query.limit || 20;
            let skip = +req.query.skip || 0;

            let query = User.find();

            if(req.query.page && !skip) {
                skip = (req.query.page - 1) * limit;
            }

            if(req.query.institution) {
                query.find({'institution._id': req.query.institution});
            }
            else if(req.user.roles.indexOf('admin') === -1) {
                query.find({
                    'institution._id': req.user.institution._id
                });
            }

            if(req.query.keyword) {
                query.find({
                    name: new RegExp(req.query.keyword, 'i')
                });
            }

            if(req.query.roles) {
                const roles = Array.isArray(req.query.roles) ? req.query.roles : [req.query.roles];
                query.find({
                    roles: {$in: roles}
                });
            }

            query.count()
            .then((total) => {
                return Promise.all([total,
                    query.find().limit(limit).skip(skip).exec()
                ]);
            })
            .then((result) => {
                let [total, page] = result;

                if(skip + page.length > total) {
                    total = skip + page.length;
                }

                res.set('items-total', total)
                .set('items-start', Math.min(skip + 1, total))
                .set('items-end', Math.min(skip + limit, total))
                .json(page);
            });
        });

    // on routes that end in /user/:userId
    // ----------------------------------------------------
    router.route('/user/:userId')

        // get the user with that id
        .get((req, res) => {
            User.findById(req.params.userId).then(user => {
                res.json(user);
            }).catch(err => {
                console.error(err);
                res.status(500);
            });
        })

        .put((req, res) => {

            if (req.body.wechatUser) {
                // copy wechatUser into user
                ['avatar', 'gender', 'openid', 'region', 'remark', 'subscribed', 'subscribedAt'].forEach(key => {
                    req.body[key] = req.body.wechatUser[key];
                });

                // delete wechat user from database
                User.remove({_id: req.body.wechatUser._id}).exec();
                delete req.body.wechatUser;
            }

            User.findByIdAndUpdate(req.params.userId, req.body, {new: true}).then(user => {
                
                res.json(user);

                Client.update(user.client ? {_id: {$ne: user.client._id}} : {}, {
                    $pull: {
                        families: {
                            _id: user._id
                        }
                    }
                }, {multi: true}).exec();

                if (user.client) {
                    Client.findByIdAndUpdate(user.client._id, {
                        $addToSet: {
                            families: {
                                _id: user._id,
                                name: user.name,
                                avatar: user.avatar,
                                openid: user.openid
                            }
                        }
                    }).exec();
                }
            }).then(user => {

            }).catch(err => {
                console.error(err);
                res.status(500);
            });
        })

        // delete the user with this id
        .delete((req, res) => {
            User.findByIdAndRemove(req.params.userId).then(() => {
                res.end();
            }).catch(err => {
                console.error(err);
                res.status(500);
            });
        });

    router.route('/user/:userId/message')
        .post((req, res) => {
            require('../util/wechat.js')(req.query.type);
        });

    return router;
}
