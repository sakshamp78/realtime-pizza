const Menu = require('../../models/menu');

function homeController(){
    return {
        async index(req,res) {
            // Menu.find().then(function(pizzas){
            //     console.log(pizzas)
            //     return res.render('home',{pizzas: pizzas})
            // })
            const pizzas = await Menu.find()
            // console.log(pizzas)
            return res.render('home',{pizzas: pizzas})
        }
    }
}

module.exports = homeController