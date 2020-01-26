const User = require('../models/Volunteer');
const path = require('path');
const leaf = require('../models/Leaflet');
const express = require('express');
const router = express.Router();
const upload = require('../util/storage');
const uuid = require('uuid/v4');


let totalSize = 0;

router.post('/', ensureAuthenticated, async (req, res) => {
    upload(req, res, async err => {
        if (err) {
            res.status(400).send({
                success: false,
                err: err.message
            });
        } else {
            if (req.files === undefined) {
                res.status(400).send({
                    success: false,
                    err: 'No File selected'
                });
            } else {
                const { address, descr } = req.body;
                const file = req.files[0];

                let temp = await leaf.create({
                    id : uuid(),
                    photo: file.filename,
                    address: address,
                    description: descr,
                    posted_by: req.user.name,
                    verified_by: [req.user.name]
                });

                let temp = await User.updateOne(
                    { username: req.user.username },
                    {
                        $push: { files: filesdata },
                        $inc: { usedSpace: totalSize }
                    }
                );
                totalSize = 0;
                res.status(201).send({ success: true, files: filesdata });
            }
        }
    });
});

/*router.post('/collection/:name', ensureAuthenticated, async (req, res) => {
    try {
        let tmp = await Collection.create({
            name: req.params.name,
            creater: req.user.username
        });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).send({
                success: false,
                err:
                    'This collection name is already taken, please choose another one.'
            });
        } else {
            console.error(err);
            return res.status(500).send({
                success: false,
                err: 'Server error'
            });
        }
    }

    req.file_group = `coll-${req.params.name}`; //* make sure coll is same as the one in frontend FileView Component render condition
    upload(req, res, async err => {
        if (err) {
            res.status(400).send({
                success: false,
                err: err.message
            });
        } else {
            if (req.files === undefined) {
                res.status(400).send({
                    success: false,
                    err: 'No File selected'
                });
            } else {
                const filesdata = req.files.map(file => {
                    totalSize += file.size;
                    return {
                        name: req.params.name,
                        ext: path.extname(file.originalname).substring(1),
                        originalname: file.originalname,
                        dbfilename: file.filename,
                        date: file.uploadDate,
                        mimetype: file.mimetype,
                        size: file.size
                    };
                });
                let temp = await User.updateOne(
                    { username: req.user.username },
                    {
                        $push: { collections: filesdata }
                    }
                );
                temp = await Collection.updateOne(
                    { name: req.params.name },
                    {
                        $push: { files: filesdata }
                    }
                );

                res.status(201).send({ success: true, files: filesdata });
            }
        }
    });
});
*/
router.post('/verify/:id', async (req,res) => {
    let temp = await leaf.findOneAndUpdate({id : req.params.id},{new : true});
    



})

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        res.status(401).send({
            success: false,
            err: 'Authentication Error. Please Sign In.'
        });
    }
}

module.exports = router;
