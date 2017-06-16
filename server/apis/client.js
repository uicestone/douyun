const Client = require('../models/client.js');
const Bean = require('../models/bean.js');
const Room = require('../models/room.js');
const Log = require('../models/log.js');
const Types = require('mongoose').Types;
const moment = require('moment');

module.exports = (router) => {
    // Client CURD
    router.route('/client')

        // create a client
        .post((req, res) => {
            
            let client = new Client(req.body); // create a new instance of the Client model

            // save the client and check for errors
            client.save().then(client => {
                res.json(client);
            }).catch(err => {
                console.error(err);
                res.status(500);
            });
            
        })

        // get all the clients
        .get(async (req, res) =>{

            const limit = +req.query.limit || 20;
            let skip = +req.query.skip || 0;

            let query = Client.find();

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

            if (req.query.family === '-') {
                query.find({$or: [{families: {$exists: false}}, {families: {$size: 0}}]});
            }

            const total = await query.count();
            let page = await query.find().limit(limit).skip(skip).exec();

            if(skip + page.length > total) {
                total = skip + page.length;
            }

            const processPage = [];

            page = await Promise.all(page.map(client => {

                return new Promise(async resolve => {

                    const clientObject = client.toObject();
                    
                    clientObject.changesToday = await Log.count({
                        'client._id': client._id,
                        title: '更换尿布',
                        createdAt: {
                            $gte: moment().startOf('day'),
                            $lte: moment().endOf('day')
                        }
                    });

                    const lastChangeLog = await Log.findOne({
                        'client._id': client._id,
                        title: '更换尿布'
                    }).sort({createdAt: -1});

                    clientObject.lastChangedAt = lastChangeLog ? lastChangeLog.createdAt : null;

                    resolve(clientObject);
                });
                
            }));

            console.log('return page');

            res.set('items-total', total)
            .set('items-start', Math.min(skip + 1, total))
            .set('items-end', Math.min(skip + limit, total))
            .json(page);
        });

    // on routes that end in /client/:clientId
    // ----------------------------------------------------
    router.route('/client/:clientId')

        // get the client with that id
        .get(async (req, res) => {

            try {
                const client = await Client.findById(req.params.clientId);

                if (!client) {
                    res.status(404).json({message: 'Client not found.'});
                    return;
                }

                const clientObject = client.toObject();
                
                clientObject.changesToday = await Log.count({
                    'client._id': client._id,
                    title: '更换尿布',
                    createdAt: {
                        $gte: moment().startOf('day'),
                        $lte: moment().endOf('day')
                    }
                });

                const lastChangeLog = await Log.findOne({
                    'client._id': client._id,
                    title: '更换尿布'
                }).sort({createdAt: -1});

                clientObject.lastChangedAt = lastChangeLog ? lastChangeLog.createdAt : null;

                res.json(clientObject);
            }
            catch(err) {
                console.error(err);
                res.status(500);
            };

        })

        .put((req, res) => {

            Client.findByIdAndUpdate(req.params.clientId, req.body, {new: true})
            .then(client => {

                // 绑定传感器
                if (client.bean) {
                    Bean.findByIdAndUpdate(client.bean._id, {client: client}).exec();
                }

                res.json(client);

                if (client.room) {
                    console.log('addToSet', client.room._id, {
                        _id: Types.ObjectId(client._id),
                        name: client.name
                    });
                    Room.findByIdAndUpdate(client.room._id, {$addToSet: {clients: {
                        _id: Types.ObjectId(client._id),
                        name: client.name
                    }}}).exec();
                }
            })
            .catch(err => {
                console.error(err);
                res.status(500);
            });
        })

        // delete the client with this id
        .delete((req, res) =>{
            Client.findByIdAndRemove(req.params.clientId).then(() => {
                res.end();
            }).catch(err => {
                console.error(err);
                res.status(500);
            });
        });

    return router;
}
