const express = require('express')
const router = express.Router()
const Profile = require('../models/profile.model')
const middleware = require('../middleware')
const multer = require('multer')
const path = require('path')

//multer configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./imagesProfils")
    },
    filename: (req, file, cb) => {
        cb(null, req.params.nom + ".jpg")
    }
})
const fileFilter = (req, file, cb) => {
    if (file.mimetype == "image/jpeg" || file.mimetype == "image/png" || file.mimetype == "image/jpg") {
        cb(null, true)
    } else {
        cb(null, false)
    }
}
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 6
    },
    //fileFilter: fileFilter
})
// adding and update profile image
router.route("/add/image/:nom").patch(upload.single("img"), (req, res) => {
    Profile.findOneAndUpdate({
            nom: req.params.nom
        }, {
            $set: {
                img: req.file.path
            }
        }, {
            new: true
        },
        (err, profile) => {
            if (err) return res.status(500).send(err)
            const response = {
                message: "Image sauvegardée avec succès",
                data: profile
            }
            console.log("L'utilisateur " + req.params.nom + " vient de changer sa photo de profil")
            return res.status(200).send(response)
        }
    )
})
router.route("/add").post(middleware.checkToken, (req, res) => {
    const profile = Profile({
        nom: req.decoded.nom,
        email: req.body.email,
        numero: req.body.numero,
    })
    profile.save()
        .then(() => {
            return res.json({
                msg: "Profil enregistré"
            })
        })
        .catch((err) => {
            return res.status(400).json({
                err: err
            })
        })
})

router.route("/getFile/:name").get((req, res) => {
    console.log("La photo de profil de " + req.params.name + " vient d'être téléchargée sur son appareil pendant le processus de connexion ou de changement de pp")
    res.download("./imagesProfils/" + req.params.name + ".jpg")
})

module.exports = router