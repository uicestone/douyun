const Bed = require('../models/bed.js');

module.exports = (router) => {
    // Bed CURD
    router.route('/bed')

        // create a bed
        .post((req, res) => {
            
            let bed = new Bed(req.body); // create a new instance of the Bed model

            // save the bed and check for errors
            bed.save().then(bed => {
                res.json(bed);
            }).catch(err => {
                console.error(err);
                res.status(500);
            });
            
        })

        // get all the beds
        .get((req, res) =>{

            const limit = +req.query.limit || 20;
            let skip = +req.query.skip || 0;

            let query = Bed.find();

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

    // on routes that end in /bed/:bedId
    // ----------------------------------------------------
    router.route('/bed/:bedId')

        // get the bed with that id
        .get((req, res) =>{
            Bed.findById(req.params.bedId).then(bed => {
                res.json(bed);
            }).catch(err => {
                console.error(err);
                res.status(500);
            });
        })

        .put((req, res) =>{
            Bed.findByIdAndUpdate(req.params.bedId, req.body, {new: true}).then(bed => {
                res.json(bed);
            }).catch(err => {
                console.error(err);
                res.status(500);
            });
        })

        // delete the bed with this id
        .delete((req, res) =>{
            Bed.findByIdAndRemove(req.params.bedId).then(() => {
                res.end();
            }).catch(err => {
                console.error(err);
                res.status(500);
            });
        });

    return router;
}
