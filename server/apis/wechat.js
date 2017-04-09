const Buffer = require('buffer').Buffer;
const wechat = require('wechat');
const config = {
    token: process.env.WECHAT_TOKEN,
    appid: process.env.WECHAT_APP_ID,
    encodingAESKey: process.env.WECHAT_ENCODING_AES_KEY,
    checkSignature: true
};

module.exports = (router) => {
    
    router.route('/wechat').all(wechat(config, function (req, res, next) {
        const message = req.weixin;
        console.log('Message received', message);
    }));

    return router;
};
