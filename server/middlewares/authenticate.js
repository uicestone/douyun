const User = require('../models/user');

module.exports = function(req, res, next) {

    if(['/api/auth/login', '/api/temp-data', '/api/wechat'].indexOf(req._parsedUrl.pathname) > -1 ) {
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