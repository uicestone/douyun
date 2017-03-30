const User = require('../models/user.js');

module.exports = (router) => {
    // User CURD
    router.route('/user')

        // create a user
        .post((req, res) => {
            
            let user = new User(req.body);      // create a new instance of the User model

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
                    name: new RegExp(req.query.keyword)
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
            User.findByIdAndUpdate(req.params.userId, req.body, {new: true}).then(user => {
                res.json(user);
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

    return router;
}
