require('dotenv').config()
const express = require('express')
const app = express()
const ejs = require('ejs')
const path = require('path')
const expressLayout = require('express-ejs-layouts')
const PORT = process.env.PORT || 3000
const mongoose = require('mongoose')
const session = require('express-session')
const flash = require ('express-flash')
const MongoDbStore = require('connect-mongo')
// Database Connection
const url = 'mongodb://127.0.0.1:27017/pizza';

// mongoose.connect(url, {useNewUrlParser: true, useCreateIndex:true, useUnifiedTopology: true, useFindAndModify: true});
// const connection = mongoose.connection;
// connection.once('open',()=>{
//     console.log('Database connected.....');
// }).catch(err => {
//     console.log('Connection failed.....')
// });

mongoose.connect(url,{useNewUrlParser: true});
const db=mongoose.connection;
db.once('open',_=>{
    console.log('Database connected:',url)
})

db.on('error',err =>{
    console.log('connection error:',err)
})
//session store
// let mongoStore = new MongoDbStore({
//     mongooseConnection: db,
//     collection: 'sessions'
// })

// Session config
app.use(session({
    secret: 'jhvhg cgfcgfcgf',
    resave: false,
    store: MongoDbStore.create({
        mongoUrl: url
    }),
    saveUninitialized: false,
    cookie: {maxAge:1000*60*60*24} // 24 hours
}))

app.use(flash())

// Assets
app.use(express.static('public')) 
app.use(express.json())

//Global Middleware
app.use((req,res,next) => {
    res.locals.session = req.session
    next()
})

// set Template engine

app.use(expressLayout)
app.set('views',path.join(__dirname,'/resources/views'))
app.set('view engine', 'ejs')


require('./routes/web')(app)



// app.get('/register',(req,res) =>{
//     res.render('auth/register')
// })

app.listen(PORT,() => {
    console.log(`Listening on port ${PORT}`)
})