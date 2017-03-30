const Room = require('../models/room.js');

module.exports = (router) => {
    // Room CURD
    router.route('/room')

        // create a room
        .post((req, res) => {
            
            let room = new Room(req.body); // create a new instance of the Room model

            // save the room and check for errors
            room.save().then(room => {
                res.json(room);
            }).catch(err => {
                console.error(err);
                res.status(500);
            });
            
        })

        // get all the rooms
        .get((req, res) =>{

            const limit = +req.query.limit || 20;
            let skip = +req.query.skip || 0;

            let query = Room.find();

            if(req.query.page && !skip) {
                skip = (req.query.page - 1) * limit;
            }

            if(req.query.institution) {
                query.find({'institution._id': institution});
            }
            else if(req.user.roles.indexOf('admin') === -1) {
                query.find({
                    'institution._id': req.user.institution._id
                });
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

    // on routes that end in /room/:roomId
    // ----------------------------------------------------
    router.route('/room/:roomId')

        // get the room with that id
        .get((req, res) =>{
            Room.findById(req.params.roomId).then(room => {
                res.json(room);
            }).catch(err => {
                console.error(err);
                res.status(500);
            });
        })

        .put((req, res) =>{
            Room.findByIdAndUpdate(req.params.roomId, req.body, {new: true}).then(room => {
                res.json(room);
            }).catch(err => {
                console.error(err);
                res.status(500);
            });
        })

        // delete the room with this id
        .delete((req, res) =>{
            Room.findByIdAndRemove(req.params.roomId).then(() => {
                res.end();
            }).catch(err => {
                console.error(err);
                res.status(500);
            });
        });

    return router;
}
