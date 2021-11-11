const jwt = require('jsonwebtoken')
const config = require('./config')

const checkToken = (req, res, next) => {
    let token = req.headers["authorization"]
    console.log(token)
    token = token.slice(7, token.length)
    if(token) {
        jwt.verify(token, config.key, (err,decoded) => {
            if(err) {
                return res.json({
                    status: false,
                    msg: "token invalide"
                })
            } else {
                req.decoded = decoded
                next()
            }
        })
    }
    else {
        res.json({
            status: false,
            msg: "Aucun token reçu"
        })
    }
}

module.exports = {
    checkToken: checkToken
}