const { response } = require("../app");
const userhelpers = require("../helpers/userHelpers");
const { user } = require("../model/connection");
const db = require('../model/connection');
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOCKEN;
const client = require('twilio')(accountSid, authToken);
let loginStatus;


module.exports = {

  showLogin: (req, res) => {
      res.render('user/login')
  },

  postLogin: (req, res) => {
    userhelpers.dologin(req.body).then((response) => {
     
      

      loginStatus = response.status;

      let blockedStatus = response.blocked

     
    
      if (loginStatus) {
        req.session.loggedin = true

        req.session.isBlocked = response.response.user.blocked
        req.session.user = response.response.user.username
        req.session.userDetails = response.response.user;
    
        res.redirect('/')

      } else {
        res.render('user/login', { loginStatus, blockedStatus, login: false })

        console.log(blockedStatus + 'blocked status');
        console.log(loginStatus + 'log');
      }
    })

  },

  showSignup: (req, res) => {
    res.render('user/signup', { emailStatus: true })
  },

  postSignup: (req, res) => {
    userhelpers.doSignUp(req.body).then((response) => {

      let emailStatus = response.status
      if (emailStatus) {
        res.redirect('/login')
      }
      else {
        res.render('user/signup', { emailStatus })
      }

    })


  },

  userlogout: (req, res) => {
    logheader = false;
    loginStatus = false;
    req.session.loggedin = false
    req.session.user = null

    res.redirect('/');

  },
  otpLogin: (req, res) => {
    res.render("user/Otp");
  },
  postOtpLogin: async (req, res) => {
    mobileNumber = req.body.number;

    let users = await db.user.find({ phoneNumber: mobileNumber }).exec();
     
     
    req.session.user = users[0].username;
    req.session.userDetails = users[0]
   console.log( req.session.userDetails._id);

    if (users == false) {

      res.render('user/Otp', { userExist: true });
    } else {

      client.verify.v2
        .services("VA788409f7c8f3a3b17484eb3d90426a77")
        .verifications.create({ to: `+91 ${mobileNumber}`, channel: "sms" })
        .then((verification) => {
          console.log(verification.status);


          res.render("user/postOtpVerify", { mobileNumber });

        });
    }

  },


  getHome: (req, res) => {
    userhelpers.getViewProducts().then(async (response) => {
      let cartCount = await userhelpers.getCartCount(req.session.userDetails._id)
      req.session.cartCount=cartCount
      let user = req.session.user;
      let response1 = response
      let banner = await userhelpers.getViewBanner()

      if (user) {
       
       

        res.render('user/userhome', { loginHeader: true, user, response1, banner ,cartCount})


      } else {
        res.render('user/userhome', { loginHeader: false, response1, banner })
      }


    })


  },


  postOtpVerify: (req, res) => {


    let otp = req.body.otp;
    let userMobile = req.body.mobile;

    try {
      client.verify.v2.services('VA788409f7c8f3a3b17484eb3d90426a77')
        .verificationChecks
        .create({ to: `+91${userMobile}`, code: otp })
        .then(verification_check => {

          if (verification_check.valid) {
            req.session.loggedin = true    
            loginStatus = true
        
           
        

            res.redirect('/');
          } else {
            res.render('user/postOtpVerify');
          }
        })
    } catch (err) {
      console.log(err);
      res.render('user/postOtpVerify', { user: true, userMobile, status: true });
    }
  },
  getCart: async(req, res) => {
    let user = req.session.user;

     let cartCount= req.session.cartCount

    let products =await  userhelpers.getCartProducts(req.session.userDetails._id)
  
    console.log(products); 
  
    res.render('user/cart',{user,products,cartCount})
  },

  quickView: (req,res) => {
    
    userhelpers.quick_View(req.params.id).then((response)=>{
      let user = req.session.user;
      let product = response  
      
      res.render('user/quickView', {product, user})

    })
   
    

  },
  addToCart:(req,res) =>{
     
 
 
    userhelpers.add_To_Cart(req.session.userDetails._id,req.params.id).then((response)=>{ 

     res.json({status:true})
    })


  }





}


