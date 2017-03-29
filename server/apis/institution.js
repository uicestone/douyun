const Institution = require('../models/institution.js');

module.exports = (router) => {
    // Institution CURD
    router.route('/institution')

        // create an institution
        .post((req, res) => {
            
            let institution = new Institution(req.body); // create a new instance of the Institution model

            // save the institution and check for errors
            institution.save().then(institution => {
                res.json(institution);
            }).catch(err => {
                console.error(err);
                res.status(500);
            });
            
        })

        // get all the institutions
        .get((req, res) =>{

            const limit = +req.query.limit || 20;
            let skip = +req.query.skip || 0;

            let query = Institution.find();

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

    // on routes that end in /institution/:institutionId
    // ----------------------------------------------------
    router.route('/institution/:institutionId')

        // get the institution with that id
        .get((req, res) =>{
            Institution.findById(req.params.institutionId).then(institution => {
                res.json(institution);
            }).catch(err => {
                console.error(err);
                res.status(500);
            });
        })

        .put((req, res) =>{
            Institution.findByIdAndUpdate(req.params.institutionId, req.body, {new: true}).then(institution => {
                res.json(institution);
            }).catch(err => {
                console.error(err);
                res.status(500);
            });
        })

        // delete the institution with this id
        .delete((req, res) =>{
            Institution.findByIdAndRemove(req.params.institutionId).then(() => {
                res.end();
            }).catch(err => {
                console.error(err);
                res.status(500);
            });
        });

    return router;
}
