const env = require('node-env-file');
const mongoose = require('mongoose');
const bluebird = require('bluebird');
const wechatApi = require('wechat-api');
const User = require('../models/user.js');

env(`${__dirname}/../../.env`);
mongoose.connect(process.env.MONGODB_URL);
mongoose.Promise = global.Promise;

const wechat = new wechatApi(process.env.WECHAT_APP_ID, process.env.WECHAT_APP_SECRET);
bluebird.promisifyAll(wechat);

wechat.getFollowersAsync().then(result => {
    // 超过10000个要多次请求
    const openids = result.data.openid;
    const batchGetUsersPromises = [];
    while (openids.length > 0) {
        batchGetUsersPromises.push(wechat.batchGetUsersAsync(openids.splice(0, 100)));
    }
    return Promise.all(batchGetUsersPromises);
})
.then(results => {
    
    const users = results.reduce((previous, result) => {
        return previous.concat(result.user_info_list);
    }, []);

    const upsertUserPromises = [];

    users.forEach(user => {

        const userInfoToUpdate = {
            subscribed: user.subscribe === 1,
            subscribedAt: new Date(user.subscribe_time * 1000),
            gender: user.sex === 1 ? '男' : (user.sex === 2 ? '女' : '未知'),
            region: `${user.country} ${user.province} ${user.city}`,
            avatar: user.headimgurl,
            remark: user.remark
        };

        const promise = User.findOneAndUpdate({openid: user.openid}, userInfoToUpdate)
        .exec().then(existedUser => {
            if (!existedUser) {
                userInfoToUpdate.username = user.openid;
                userInfoToUpdate.name = user.nickname;
                userInfoToUpdate.roles = ['subscriber'];
                userInfoToUpdate.openid = user.openid;
                User.create(userInfoToUpdate);
            }
        }).catch(err => {
            console.error(err);
        });

        upsertUserPromises.push(promise);
    });

    return Promise.all(upsertUserPromises);

}).then(results => {
    process.exit();
}).catch(err => {
    console.error(err);
});