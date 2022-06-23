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
const passport = require('passport')
const Emitter = require('events')
// Database Connection
// const url = 'mongodb://127.0.0.1:27017/pizza';

// mongoose.connect(url, {useNewUrlParser: true, useCreateIndex:true, useUnifiedTopology: true, useFindAndModify: true});
// const connection = mongoose.connection;
// connection.once('open',()=>{
//     console.log('Database connected.....');
// }).catch(err => {
//     console.log('Connection failed.....')
// });

// Database Connection
mongoose.connect(process.env.MONGO_CONNECTION_URL,{useNewUrlParser: true});
const db=mongoose.connection;
db.once('open',_=>{
    console.log('Database connected:',process.env.MONGO_CONNECTION_URL)
})

db.on('error',err =>{
    console.log('connection error:',err)
})


// Session config
app.use(session({
    secret: 'jhvhg cgfcgfcgf',
    resave: false,
    store: MongoDbStore.create({
        mongoUrl: process.env.MONGO_CONNECTION_URL
    }),
    saveUninitialized: false,
    cookie: {maxAge:1000*60*60*24} // 24 hours
}))

//Event emitter
const eventEmitter = new Emitter()
app.set('eventEmitter',eventEmitter)

// Passport config
const passportInit = require('./app/config/passport')
// const { Socket } = require('dgram')
passportInit(passport)
app.use(passport.initialize())
app.use(passport.session())

app.use(flash())

// Assets
app.use(express.static('public')) 
app.use(express.urlencoded({ extended: false }))
app.use(express.json())

//Global Middleware
app.use((req,res,next) => {
    res.locals.session = req.session
    res.locals.user = req.user
    next()
})

// set Template engine

app.use(expressLayout)
app.set('views',path.join(__dirname,'/resources/views'))
app.set('view engine', 'ejs')


require('./routes/web')(app)
app.use((req,res)=>{
    res.status(404).render('errors/404')
})

const server = app.listen(PORT,() => {
                console.log(`Listening on port ${PORT}`)
            })

// Socket

const io = require('socket.io')(server)
io.on('connection',(socket)=>{
    // Join 
    socket.on('join',(orderId) => {
        socket.join(orderId)
    })
})

eventEmitter.on('orderUpdated', (data) => {
    io.to(`order_${data.id}`).emit('orderUpdated', data)
})

eventEmitter.on('orderPlaced', (data) => {
    io.to('adminRoom').emit('orderPlaced', data)
})