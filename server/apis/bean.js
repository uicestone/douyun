const Bean = require('../models/bean.js');

module.exports = (router) => {
    // Bean CURD
    router.route('/bean')

        // create a bean
        .post((req, res) => {
            
            let bean = new Bean(req.body); // create a new instance of the Bean model

            // save the bean and check for errors
            bean.save().then(bean => {
                res.json(bean);
            }).catch(err => {
                console.error(err);
                res.status(500);
            });
            
        })

        // get all the beans
        .get((req, res) =>{

            const limit = +req.query.limit || 20;
            let skip = +req.query.skip || 0;

            let query = Bean.find();

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

    // on routes that end in /bean/:beanId
    // ----------------------------------------------------
    router.route('/bean/:beanId')

        // get the bean with that id
        .get((req, res) =>{
            Bean.findById(req.params.beanId).then(bean => {
                res.json(bean);
            }).catch(err => {
                console.error(err);
                res.status(500);
            });
        })

        .put((req, res) =>{
            Bean.findByIdAndUpdate(req.params.beanId, req.body, {new: true}).then(bean => {
                res.json(bean);
            }).catch(err => {
                console.error(err);
                res.status(500);
            });
        })

        // delete the bean with this id
        .delete((req, res) =>{
            Bean.findByIdAndRemove(req.params.beanId).then(() => {
                res.end();
            }).catch(err => {
                console.error(err);
                res.status(500);
            });
        });

    return router;
}
