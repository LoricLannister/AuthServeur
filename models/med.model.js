const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Med = new Schema({
    "nom": {
        type: String,
        required: true,
        //unique:true
    },
    "img": {
        type: String,
        default: ""
    },
    "description": {
        type: String,
        default: ""
    }
},{timestamps:true})

module.exports = mongoose.model('Med', Med)