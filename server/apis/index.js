const authenticate = require('../middlewares/authenticate');
const cors = require('cors');

module.exports = (app, router, io) => {
    // register routes
    router = require('./institution.js')(router);
    router = require('./room.js')(router);
    router = require('./receiver.js')(router);
    router = require('./bed.js')(router);
    router = require('./bean.js')(router);
    router = require('./client.js')(router);
    router = require('./log.js')(router);
    router = require('./user.js')(router);
    router = require('./auth.js')(router);
    router = require('./tempData.js')(router, io);
    router = require('./wechat.js')(router);
    app.use('/api', cors({exposedHeaders:['items-total', 'items-start', 'items-end']}), authenticate, router);
};
