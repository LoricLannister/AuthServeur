const mongoose = require('mongoose')
const Schema = mongoose.Schema

const newSchema = new Schema({
    "nom": {
        type: String,
        required: true,
        unique:true
    },
    "mdp": {
        type: String,
        required: true,
    },
    "email": {
        type: String,
        required: false,
    },
    "numero": {
        type: String,
        required: false,
    },
    "ville": {
        type: String,
        required: false,
    },
    "livreur": {
        type: Boolean,
        required: false,
        default: false
    },
    "img": {
        type: String,
        default: ""
    },
    "restOfTests": {
        type: Number,
        default: 3
    },
    "subscription": {
        type: String,
        default: ""
    },
    "startDate": {
        type: Date,
        default: null
    },
    "endDate": {
        type: Date,
        default: null
    },
    "history": {
        type: Array,
        default: []
    }
},{timestamps:true})

module.exports = mongoose.model('User', newSchema)