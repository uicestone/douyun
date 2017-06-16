const wechatApi = require('wechat-api');
const wechat = new wechatApi(process.env.WECHAT_APP_ID, process.env.WECHAT_APP_SECRET);

module.exports = function (type, client, toUser) {

    if (!toUser.openid) {
        throw `no openid for user ${toUser.name}`;
    }

    let templateId, data;
    const url = `http://douyun.ltd/#!/client/${client._id}`;
    
    if (type === 'notice') {

        templateId = 'S0e89um95JqYwLKCTCyxzIusKOWknLuodRbWjuu9ykk';

        data = {
            first: {value: `您好，${client.name}的尿布已耗尽，请及时更换\n`},
            keyword1: {value: client.name, color: '#00bcd4'},
            keyword2: {value: `${client.institution.name}-${client.room.num}房间-${client.room.bedNum}号床位`, color: '#00bcd4'},
            keyword3: {value: '尿布耗尽', color: '#00bcd4'},
            keyword4: {value: client.bean.mac, color: '#00bcd4'},
            remark: {value: "\n点击查看护理对象详情", color: '#AAAAAA'}
        };
    }
    else {

        templateId = 'KkqFXWo73buBxK4KmC7f72ThSjDsA_hGljscHSOd27E';

        let relation;
        switch (client.gender) {
            case '男': relation = '父亲'; break;
            case '女': relation = '母亲'; break;
            default: relation = '长辈';
        }

        data = {
            first: {value: `亲爱的的${toUser.name}，您${relation} ${client.name} 刚刚完成一次护理\n`},
            keyword1: {value: new Date(), color: '#00bcd4'},
            keyword2: {value: '未知', color: '#00bcd4'},
            keyword3: {value: '未知', color: '#00bcd4'},
            keyword4: {value: '未知', color: '#00bcd4'},
            remark: {value: "\n点击查看护理详情", color: '#AAAAAA'}
        };
    }

    wechat.sendTemplate(toUser.openid, templateId, url, data, (err, result) => {
        if (err) {
            console.error(err);
        }
    });
};
