const User = require('../models/user');
const crypto = require('crypto');

module.exports = (router) => {
    
    router.route('/auth/login')
        .post((req, res) => {
            
            if(!req.body.username) {
                res.status(400).json({message: '请输入用户名'});
                return;
            }

            if(!req.body.password) {
                res.status(400).json({message: '请输入密码'});
                return;
            }

            User.findOne({$or:[{email: req.body.username}, {username: req.body.username}]}).then((user) => {
                
                if(!user) {
                    res.status(401).json({message: '用户不存在'});
                    return;
                }

                if(user.password !== req.body.password) {
                    res.status(403).json({message: '密码错误'});
                    return;
                }

                if(user.token) {
                    res.send(user);
                }
                else {
                    crypto.randomBytes(48, (err, buffer) => {
                        const token = buffer.toString('hex');
                        user.token = token;
                        user.save();
                        res.json(user);
                    });
                }

            });
        });

    router.route('/auth/logout')
        .get((req, res) => {
            res.end();
        });

    router.route('/auth/user')
        .get((req, res) => {
            res.json(req.user);
        });

    return router;
}
