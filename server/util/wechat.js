const env = require('node-env-file');
const wechatApi = require('wechat-api');    

env(`${__dirname}/../../.env`);
const wechat = new wechatApi(process.env.WECHAT_APP_ID, process.env.WECHAT_APP_SECRET);

module.exports = function (type) {
    wechat.getFollowers((err, result) => {
        const openids = result.data.openid;
        const openid = process.env.TEST_OPENID;
        let templateId, data;

        if (type === 'notice')
        {
            templateId = 'S0e89um95JqYwLKCTCyxzIusKOWknLuodRbWjuu9ykk';
        }
        else {
            templateId = 'KkqFXWo73buBxK4KmC7f72ThSjDsA_hGljscHSOd27E';
        }

        const url = 'http://douyun.ltd:8080/#!/client/58dc596638547ebbb964e0cb';
        
        if (type === 'notice') {
            data = {
                first: {value: "您好，张翠花 尿布已耗尽，请及时更换\n"},
                keyword1: {value: '张翠花', color: '#00bcd4'},
                keyword2: {value: '虹梅-602房间-2号床位', color: '#00bcd4'},
                keyword3: {value: '尿布耗尽', color: '#00bcd4'},
                keyword4: {value: 'A2:20:21:12:E4:4F', color: '#00bcd4'},
                remark: {value: "\n点击查看护理对象详情", color: '#AAAAAA'}
            };
        }
        else {
            data = {
                first: {value: "尊敬的李先生，您母亲 张翠花 今日的护理已完成\n"},
                keyword1: {value: '2016/4/2', color: '#00bcd4'},
                keyword2: {value: '36.5°C', color: '#00bcd4'},
                keyword3: {value: '60次/分', color: '#00bcd4'},
                keyword4: {value: '90/120', color: '#00bcd4'},
                remark: {value: "\n点击查看护理详情", color: '#AAAAAA'}
            };
        }

        wechat.sendTemplate(openid2, templateId, url, data, (err, result) => {
            console.log(err, result);
        });
    });
};
