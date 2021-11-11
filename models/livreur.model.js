const mongoose = require('mongoose')
const Schema = mongoose.Schema

const newSchema = new Schema({
    "nomL": {
        type: String,
        required: true,
        unique:true
    },
    "mdpL": {
        type: String,
        required: true,
    },
    "emailL": {
        type: String,
        required: false,
    },
    "numeroL": {
        type: String,
        required: false,
    },
    "villeL": {
        type: String,
        required: false,
    },
    "img": {
        type: String,
        default: ""
    }
},{timestamps:true})

module.exports = mongoose.model('Livreur', newSchema)