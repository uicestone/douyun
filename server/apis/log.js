const Log = require('../models/log.js');
const Client = require('../models/client.js');
const sendWechatTemplate = require('../util/sendWechatTemplate.js');

module.exports = (router, io) => {
    // Log CURD
    router.route('/log')

        // create a log
        .post(async (req, res) => {
            
            let log = new Log(req.body); // create a new instance of the Log model

            // save the log and check for errors
            log.save().then(log => {
                res.json(log);
            }).catch(err => {
                console.error(err);
                res.status(500);
            });
            
            const client  = await Client.findById(log.client._id);

            if (client.status && client.status.name !== '良好' && log.title === '更换尿布') {
                const status = {since: new Date(), name: '良好'};
                client.status = status;
                client.save();
                status.client = client._id;

                io.to(`bean ${client.bean._id}`).emit('client status update', status);
                // if status is 煎熬, write 'until' key to that log
                // TODO
                // send message to family
                sendWechatTemplate('report', client, client.families[0]);
            }

        })

        // get all the logs
        .get((req, res) =>{

            const limit = +req.query.limit || 20;
            let skip = +req.query.skip || 0;

            let query = Log.find();

            if(req.query.page && !skip) {
                skip = (req.query.page - 1) * limit;
            }

            if(req.query.assistant) {
                query.find({'assistant._id': req.query.assistant});
            }

            if(req.query.client) {
                query.find({'client._id': req.query.client});
            }

            if(req.query.order) {
                query.sort(req.query.order);
            }
            else{
                query.sort('-createdAt');
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

    // on routes that end in /log/:logId
    // ----------------------------------------------------
    router.route('/log/:logId')

        // get the log with that id
        .get((req, res) =>{
            Log.findById(req.params.logId).then(log => {
                res.json(log);
            }).catch(err => {
                console.error(err);
                res.status(500);
            });
        })

        .put((req, res) =>{
            Log.findByIdAndUpdate(req.params.logId, req.body, {new: true}).then(log => {
                res.json(log);
            }).catch(err => {
                console.error(err);
                res.status(500);
            });
        })

        // delete the log with this id
        .delete((req, res) =>{
            Log.findByIdAndRemove(req.params.logId).then(() => {
                res.end();
            }).catch(err => {
                console.error(err);
                res.status(500);
            });
        });

    return router;
}
