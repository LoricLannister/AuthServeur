const express = require('express')
const mongoose = require('mongoose')
const User = require('../models/user.model')
const router = express.Router()
const config = require("../config")
const jwt = require("jsonwebtoken")
const middleware = require("../middleware")
const moment = require("moment")
moment.locale('fr')

router.route("/").get((req, res) => {
    res.send('connexion réussie')
})

router.route("/inscription").post(async (req, res) => {
    console.log("Tentative d'inscription de client")
    await mongoose.connect("mongodb://localhost:27017/test", {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        useCreateIndex: true
    })
    User.findOne({
        nom: req.body.nom
    }, (error, user) => {
        if (error) {
            console.log(error)
            res.json(error)
        } else {
            if (user == null) {
                const user = User({
                    nom: req.body.nom,
                    mdp: req.body.mdp,
                    email: req.body.email,
                    numero: req.body.numero,
                    ville: req.body.ville,
                    img: req.body.img,
                    restOfTests: 3
                })
                user.save()
                    .then(() => {
                        if (error) {
                            console.log(error)
                            res.json(error)
                        } else {
                            console.log("Inscription du client " + req.body.nom + " réussie")
                            res.json(user)
                        }
                    })
            } else {
                res.status(200).json("Cet utilisateur est déjà repertorié")
            }
        }
    })
})

router.route("/connexion").post(async (req, res) => {
    await mongoose.connect("mongodb://localhost:27017/test", {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        useCreateIndex: true
    })
    User.findOne({
        nom: req.body.nom
    }, (error, result) => {
        if (error) {
            console.log(error)
            return res.status(500).json({
                msg: error
            })
        }
        if (result === null) {
            console.log("Tentative de connection")
            return res.status(403).json("Nom d'utilisateur incorrect")
        }
        if (result.mdp === req.body.mdp) {
            // I must implement token here
            let token = jwt.sign({
                    nom: req.body.nom
                },
                config.key, {
                    //    expiresIn: "24h"
                })
            res.json({
                token: token,
                msg: "success",
                numero: result.numero,
                email: result.email
            })
            console.log("Utilisateur " + req.body.nom + " connecté")
        } else {
            res.status(200).json("Vérifiez votre mot de passe")
        }
    })
})

router.route("/update/:nom").patch(middleware.checkToken, (req, res) => {
    User.findOneAndUpdate({
            nom: req.params.nom
        }, {
            $set: {
                mdp: req.body.mdp
            }
        },
        (err, result) => {
            if (err) return res.status(500).json({
                msg: err
            })
            const msg = {
                msg: "mot de passe modifié avec succès",
                nom: req.params.nom,
            }
            return res.json(msg)
        }
    )
})

router.route("/delete/:nom").delete(middleware.checkToken, (req, res) => {
    User.findOneAndDelete({
            nom: req.params.nom
        },
        (err, result) => {
            if (err) return res.status(500).json({
                msg: err
            })
            const msg = {
                msg: "Utilisateur supprimé avec succès",
                nom: req.params.nom
            }
            return res.json(msg)
        }
    )
})

router.route("/deconnexion").get((req, res) => {
    try {
        mongoose.disconnect()
        res.status(200).send("Deconnexion réussie")
        console.log("Un utilisateur vient de se déconnecter")
    } catch (error) {
        console.log(error)
    }
})

router.route("/:nom").get(middleware.checkToken, (req, res) => {
    User.findOne({
        nom: req.params.nom
    }, (err, result) => {
        if (err) return res.status(500).json({
            msg: err
        })
        return res.json({
            data: result,
            nom: req.params.nom
        })
    })
})

router.route("/chatId/:nom").get(middleware.checkToken, (req, res) => {
    User.findOne({
        nom: req.params.nom
    }, (err, result) => {
        if (err) return res.status(500).json({
            msg: err
        })
        return res.json({
            id: result["_id"],
            nom: req.params.nom
        })
    })
})

router.route("/all/users").get((req, res) => {
    User.find({
        livreur: true
    }).then((users) => {
        res.send(users)
    }).catch((error) => {
        res.status(500).send(error)
    })
})

// Recherches gratuites pour test des clients
router.route("/freeSearch/:nom").get(async (req, res) => {
    await mongoose.connect("mongodb://localhost:27017/test", {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        useCreateIndex: true
    })
    User.findOne({
        nom: req.params.nom
    }, (error, user) => {
        if (error) {
            console.log(req.params.nom)
            console.log(error)
            res.json(error)
        } else if (user == null) {
            console.log("Aucun utilisateur ne correspond à ce nom")
        } else if (user != null) {
            // On check si l'utilisateur à encore des recherches gratuites
            if (user.restOfTests >= 1) {
                res.status(200).json(user.restOfTests)
                console.log(user)
            } else if (user.restOfTests == 0) {
                console.log(user)
                res.json("Recherches gratuites épuisées, veuillez vous abonner")
            }
        } else if (user == null) {
            res.json("Utilisateur non reconnu")
        }
    })
})

// Avant tout abonnement, on se rassure q'un autre n'est pas actuellement effectif.
router.route("/checkSubscription/:nom").get(async (req, res) => {
    await mongoose.connect("mongodb://localhost:27017/test", {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        useCreateIndex: true
    })
    User.findOne({
        nom: req.params.nom
    }, (error, user) => {
        if (error) {
            console.log(error)
            res.status(200).json("Une erreur est survenue")
        } else if (user == null) {
            res.status(200).json("Utilisateur non reconnu")
        } else if (user.startDate == null) {
            res.status(200).json("Aucun abonnement actif")
        } else {
            let nowTime = new Date().getTime()
            if (nowTime > user.endDate.getTime()) {
                res.status(200).json("Aucun abonnement actif")
            } else {
                res.status(200).json("Un abonnement est déjà en cours jusqu'au: " + user.endDate)
            }
        }
    })
})

// Abonnement d'un jour.
router.route("/startDailySubscription/:nom").patch(async (req, res) => {
    await mongoose.connect("mongodb://localhost:27017/test", {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        useCreateIndex: true
    })
    User.findOne({
        nom: req.params.nom
    }, (error, user) => {
        if (error) {
            console.log(error)
            res.status(200).json("Une erreur est survenue")
        } else if (user == null) {
            res.status(200).json("Utilisateur non reconnu")
        } else {
            User.updateOne({
                nom: req.params.nom
            }, {
                startDate: new Date(),
                endDate: new Date(new Date().setDate(new Date().getDate() + 1)),
                subscription: "D"
            }).then(() => res.status(200).json("Abonnement activé avec succès"))
            console.log(user)
        }
    })
})

// Abonnement d'une semaine
router.route("/startWeeklySubscription/:nom").patch(async (req, res) => {
    await mongoose.connect("mongodb://localhost:27017/test", {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        useCreateIndex: true
    })
    User.findOne({
        nom: req.params.nom
    }, (error, user) => {
        if (error) {
            console.log(error)
            res.status(200).json("Une erreur est survenue")
        } else if (user == null) {
            res.status(200).json("Utilisateur non reconnu")
        } else {
            User.updateOne({
                nom: req.params.nom
            }, {
                startDate: new Date(),
                endDate: new Date(new Date().setDate(new Date().getDate() + 7)),
                subscription: "W"
            }).then(() => res.status(200).json("Abonnement activé avec succès"))
            console.log(user)
        }
    })
})

router.route("/startMonthlySubscription/:nom").patch(async (req, res) => {
    await mongoose.connect("mongodb://localhost:27017/test", {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        useCreateIndex: true
    })
    User.findOne({
        nom: req.params.nom
    }, (error, user) => {
        if (error) {
            console.log(error)
            res.status(200).json("Une erreur est survenue")
        } else if (user == null) {
            res.status(200).json("Utilisateur non reconnu")
        } else {
            User.updateOne({
                nom: req.params.nom
            }, {
                startDate: new Date(),
                endDate: new Date(new Date().setDate(new Date().getDate() + 30)),
                subscription: "M"
            }).then(() => res.status(200).json("Abonnement activé avec succès"))
            console.log(user)
        }
    })
})

// On se rassure que le client est autorisé à faire une requête
router.route("/checkBeforeSearch/:nom").patch(async (req, res) => {
    await mongoose.connect("mongodb://localhost:27017/test", {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        useCreateIndex: true
    })
    User.findOne({
        nom: req.params.nom
    }, (error, user) => {
        if (error) {
            console.log(error)
            res.status(200).json("Une erreur est survenue")
        } else if (user == null) {
            res.status(200).json("Utilisateur non reconnu")
        } else if (user.startDate == null) {
            if (user.restOfTests > 0) {
                console.log(user.restOfTests)
                User.updateOne({
                    nom: req.params.nom
                }, {
                    restOfTests: user.restOfTests - 1
                }).then(() => res.status(200).json("Recherche autorisée"))
            } else {
                res.status(200).json("Veuillez souscrire à un abonnement")
            }
        } else {
            let nowTime = new Date().getTime()
            if (user.restOfTests > 0) {
                User.updateOne({
                    nom: req.params.nom
                }, {
                    restOfTests: user.restOfTests - 1,
                }).then(() => {
                    res.status(200).json("Recherche autorisée")
                })
            } else if (nowTime > user.endDate.getTime()) {
                res.status(200).json("Votre abonnement a expiré")
            } else {
                res.status(200).json("Recherche autorisée")
            }
        }
    })
})

router.route("/saveToHistory/:nom/:med").patch(async (req, res) => {
    await mongoose.connect("mongodb://localhost:27017/test", {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        useCreateIndex: true
    })
    User.findOne({
        nom: req.params.nom
    }, (error, user) => {
        if (error) {
            console.log(error)
            res.status(200).json("Une erreur est survenue")
        } else if (user == null) {
            res.status(200).json("Utilisateur non reconnu")
        } else {
            User.updateOne({
                nom: req.params.nom
            }, {
                $push: {
                    history: [
                        [req.params.med, moment().format('dddd, D MMMM YYYY')]
                    ]
                }
            }).then(() => {
                console.log(req.params.med + " ajouté à l'historique de l'utilisateur " + req.params.nom)
                res.status(200).json("Historique mis à jour")
            })
        }
    })
})

router.route("/getHistory/:nom").get(async (req, res) => {
    await mongoose.connect("mongodb://localhost:27017/test", {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        useCreateIndex: true
    })
    User.findOne({
        nom: req.params.nom
    }, (error, user) => {
        if (error) {
            console.log(error)
            res.status(200).json("Une erreur est survenue: "+error)
        } else if (user == null) {
            res.status(200).json("Utilisateur non reconnu")
        } else {
            console.log("L'utilisateur "+req.params.nom+" a consulté son historique")
            res.status(200).json(user.history)
        }
    })
})

module.exports = router