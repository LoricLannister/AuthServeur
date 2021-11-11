//Constants definition
const express = require('express')
const app = express()
const port = 3000 || process.env.PORT
const cors = require('cors')
const mongoose = require('mongoose')
//End of constants list

//Connection to mongodb
//mongodb+srv://admin:admin@cluster0.jrgkz.mongodb.net/test
//ceci est notre base gratuite en ligne sur Atlas
//Notre base locale: mongodb+srv://admin:admin@cluster0.jrgkz.mongodb.net/testmongodb+srv://admin:admin@cluster0.jrgkz.mongodb.net/test
const connectDB = async () => {
    try {
        await mongoose.connect("mongodb+srv://lannister:sasuke2002@cluster0.vzt2y.mongodb.net/test", {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false,
            useCreateIndex: true
        })
        console.log("Connecté à mongoDb!!")
    } catch(error) {
        console.log("Echec de la connection à mongoDb, " + err)
    }
}

connectDB();
//Fin de la partie connection

app.use(cors())
app.use("/imagesProfils", express.static("imagesProfils"))
app.use("/imagesMeds", express.static("imagesMeds"))
app.use(express.urlencoded({
    extended: true
}))
app.use(express.json())
const userRoute = require('./routes/user')
app.use("/user", userRoute)
const profileRoute = require('./routes/profile')
app.use("/profile", profileRoute)
const MedRoute = require('./routes/med')
app.use("/med", MedRoute)
const livreurRoute = require('./routes/livreur')
app.use("/livreur", livreurRoute)

app.listen(port, () => {
    console.log('port running on: ' + port)
})