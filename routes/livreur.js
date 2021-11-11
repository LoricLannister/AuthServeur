const express = require('express')
//const mongoose = require('mongoose')
const Livreur = require('../models/livreur.model')
const router = express.Router()
const config = require("../config")
const jwt = require("jsonwebtoken")
const middleware = require("../middleware")

router.route("/inscription").post((req, res) => {
    console.log("Tentative d'inscription de livreur")
    Livreur.findOne({
        nomL: req.body.nom,
        emailL: req.body.email,
        numeroL: req.body.numero,
    }, (error, livreur) => {
        if (error) {
            console.log(error)
            res.json("Une erreur est survenue")
        } else {
            if (livreur == null) {
                const livreur = Livreur({
                    nomL: req.body.nom,
                    mdpL: req.body.mdp,
                    emailL: req.body.email,
                    numeroL: req.body.numero,
                    villeL: req.body.ville,
                    imgL: req.body.img
                })
                livreur.save()
                    .then(() => {
                        if (error) {
                            console.log(error)
                            res.json(error)
                        } else {
                            console.log("Inscription du coursier " + req.body.nom + " réussie")
                            res.json(livreur)
                        }
                    })
            } else {
                res.json("Un coursier utilise déjà ces données")
            }
        }
    })
})

module.exports = router