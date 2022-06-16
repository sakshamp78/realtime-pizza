function authController(){
    return {
        login(req,res) {
            res.render('auth/login');
        }
    }
}

module.exports = authController