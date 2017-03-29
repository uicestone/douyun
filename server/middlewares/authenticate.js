const User = require('../models/user');

module.exports = function(req, res, next) {

    if(req.originalUrl === '/api/auth/login') {
        next();
        return;
    }

    if(req.originalUrl === '/api/temp-data') {
        next();
        return;
    }

    const token = req.get('authorization') || req.query.token;

    if(!token) {
        res.status(401).json({message:'无效登录，请重新登录'});
        return;
    }

    User.findOne({token}).then((user) => {
        if(!user) {
            res.status(401).json({message:'无效登录，请重新登录'});
            return;
        }

        req.user = user;
        next();
    });

}