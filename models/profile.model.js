const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Profile = new Schema({
    "nom": {
        type: String,
        required: true,
        //unique:true
    },
    "email": {
        type: String,
        required: false,
    },
    "numero": {
        type: String,
        required: false,
    },
    "img": {
        type: String,
        default: ""
    }
},{timestamps:true})

module.exports = mongoose.model('Profile', Profile)