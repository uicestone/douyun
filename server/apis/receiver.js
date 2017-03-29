const Receiver = require('../models/receiver.js');

module.exports = (router) => {
    // Receiver CURD
    router.route('/receiver')

        // create a receiver
        .post((req, res) => {
            
            let receiver = new Receiver(req.body); // create a new instance of the Receiver model

            // save the receiver and check for errors
            receiver.save().then(receiver => {
                res.json(receiver);
            }).catch(err => {
                console.error(err);
                res.status(500);
            })  ;
            
        })

        // get all the receivers
        .get((req, res) =>{

            const limit = +req.query.limit || 20;
            let skip = +req.query.skip || 0;

            let query = Receiver.find();

            if(req.query.page && !skip) {
                skip = (req.query.page - 1) * limit;
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

    // on routes that end in /receiver/:receiverId
    // ----------------------------------------------------
    router.route('/receiver/:receiverId')

        // get the receiver with that id
        .get((req, res) =>{
            Receiver.findById(req.params.receiverId).then(receiver => {
                res.json(receiver);
            }).catch(err => {
                console.error(err);
                res.status(500);
            });
        })

        .put((req, res) =>{
            Receiver.findByIdAndUpdate(req.params.receiverId, req.body, {new: true}).then(receiver => {
                res.json(receiver);
            }).catch(err => {
                console.error(err);
                res.status(500);
            });
        })

        // delete the receiver with this id
        .delete((req, res) =>{
            Receiver.findByIdAndRemove(req.params.receiverId).then(() => {
                res.end();
            }).catch(err => {
                console.error(err);
                res.status(500);
            });
        });

    return router;
}
