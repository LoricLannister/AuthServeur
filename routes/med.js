const express = require('express')
const router = express.Router()
const Med = require('../models/med.model')

router.route("/getMed/:name").get((req, res) => {
    console.log("L'image "+req.params.name+".png est sollicitée.")
    res.download("./imagesMeds/"+req.params.name+".png")
})
router.route("/all/meds").get((req, res) => {
    Med.find({
    }).then((meds) => {
        res.send(meds)
    }).catch((error) => {
        res.status(500).send(error)
    })
})
module.exports = router