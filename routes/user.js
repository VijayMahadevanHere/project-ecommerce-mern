var express = require('express');
var router = express.Router();
const controller= require("../controller/usercontrol")
const userMiddleware = require('../middleware/middleware');

/* GET home page. */
router.get('/',userMiddleware.userBlocked,controller.getHome)


router.route('/login')
        .get(controller.showLogin)
        .post(controller.postLogin)


router.route('/signup')
    .get(controller.showSignup)
    .post(controller.postSignup)





router.get('/logout',controller.userlogout)



router.get('/otp',controller.otpLogin)
router.post('/otp',controller.postOtpLogin)

router.post('/otpnum',controller.postOtpVerify)

router.get('/cart',userMiddleware.userBlocked,controller.getCart)


router.get('/add-to-cart/:id',userMiddleware.userBlocked,controller.addToCart)






module.exports = router;
