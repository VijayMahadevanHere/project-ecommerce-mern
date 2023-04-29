const FaxResponse = require("twilio/lib/twiml/FaxResponse");
const {response} = require("../app");
const userhelpers = require("../helpers/userHelpers");
const moment = require('moment');
const db = require('../model/connection');
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOCKEN;
const secret = process.env.TWILIO_AUTH_SECRET;
const client = require('twilio')(accountSid, authToken);
let loginStatus;
let user,UserId;


module.exports = {

    showLogin: (req, res) => {
        if (req.session.loggedin) {
            res.redirect('/')
        } else {
            res.render('user/login')
        }

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
                UserId=req.session.userDetails._id
                res.redirect('/')

            } else {
                res.render('user/login', {loginStatus, blockedStatus, login: false})

                console.log(blockedStatus + 'blocked status');
                console.log(loginStatus + 'log');
            }
        })

    },

    showSignup: (req, res) => {
        res.render('user/signup', {emailStatus: true})
    },

    postSignup: (req, res) => {
        userhelpers.doSignUp(req.body).then((response) => {

            let emailStatus = response.status
            if (emailStatus) {
                res.redirect('/login')
            } else {
                res.render('user/signup', {emailStatus})
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

        let users = await db.user.find({phoneNumber: mobileNumber}).exec();


        req.session.user = users[0].username;
        req.session.userDetails = users[0]


        if (users == false) {

            res.render('user/Otp', {userExist: true});
        } else {

            client.verify.v2.services(secret).verifications.create({to: `+91 ${mobileNumber}`, channel: "sms"}).then((verification) => {
                console.log(verification.status);


                res.render("user/postOtpVerify", {mobileNumber});

            });
        }

    },


    getHome: (req, res) => {
        userhelpers.getViewProducts(req.query.page).then(async (response) => {
            let cartCount = await userhelpers.getCartCount(req.session.userDetails._id)
            req.session.cartCount = cartCount
            let user = req.session.user;
            const pageSize = 8
            let response1= response
          
       
            let banner = await userhelpers.getViewBanner()
            let Category = await userhelpers.findAllcategories()  
            let doCount=await db.products.countDocuments()
        
          let pageno=Math.ceil(doCount/pageSize)
       
            if (user) {
                res.render('user/userhome', {
                    loginHeader: true,
                    user,
                    response1,
                    banner,
                    cartCount,
                    Category,
                    doCount,
                    pages:pageno,
                    UserId
                })


            } else {
                res.render('user/userhome', {
                    loginHeader: false,
                    response1,
                    banner
                })
            }


        })


    },


    postOtpVerify: (req, res) => {


        let otp = req.body.otp;
        let userMobile = req.body.mobile;

        try {
            client.verify.v2.services(secret).verificationChecks.create({to: `+91${userMobile}`, code: otp}).then(verification_check => {

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
            res.render('user/postOtpVerify', {
                user: true,
                userMobile,
                status: true
            });
        }
    },
    getCart: async (req, res) => {
       
        let user = req.session.user;

        let cartCount = await userhelpers.getCartCount(req.session.userDetails._id)
      
        if (cartCount > 0) {
            let userId = req.session.userDetails._id
           
            let products = await userhelpers.getCartProducts(req.session.userDetails._id)
           
            let totalAmount = 0
            if (products.length > 0) {
                totalAmount = await userhelpers.getTotalAmount(req.session.userDetails._id)
               
            }
    
  
            res.render('user/cart', {
                user,
                products,
                cartCount,
                totalAmount,
                userId,
                UserId
            })
        } else {
            res.render('user/nocart')
        }

    },

    quickView: (req, res) => {

        userhelpers.quick_View(req.params.id).then((response) => {
            let user = req.session.user;
            let product = response

            res.render('user/quickView', {product, user})

        })


    },
    addToCart: (req, res) => {


        userhelpers.add_To_Cart(req.session.userDetails._id, req.params.id).then((response) => {

            res.json({status: true})
        }).catch((error)=>{
            res.status(500)
        })


    },
    changeQuantity: (req, res) => {


        userhelpers.change_Quantity(req.body).then(async (response) => {
            response.total = await userhelpers.getTotalAmount(req.body.userId)
       
            res.json(response)

        }).catch((error)=>{
            res.status(500)
        })
    },
    removeCartItem: (req, res) => {


        userhelpers.removeCartItem(req.body).then((response) => {
            res.json(response)
        }).catch((error)=>{
            res.status(500)
        })
    },


    orderDetails:(req, res) => {
      userhelpers.getTotalAmount(req.session.userDetails._id).then(async(response)=>{
        let totalAmount = response
            let userid = req.session.userDetails._id
            let Address= await userhelpers.getAddress(UserId)
          
          let address=Address.Address
            if(totalAmount.length>0){
               
         
            let wallet =   await userhelpers.findWallet(UserId)
            console.log(wallet,'gotit');
                res.render('user/order', {totalAmount, userid,UserId,address,wallet})
            }else{
                res.redirect('/cart')
            }
        
        
         
        }).catch((error)=>{
            res.status(500)
        })

       
    },
    placeOrder: async (req, res) => {
  
  
      let discount=0
     if(req.session.discoundPrice){
        discount = req.session.discoundPrice
     } 
          
     
       try{
        let carts = await userhelpers.getCartProductList(req.session.userDetails._id)
        let totalAmount = await userhelpers.getTotalAmount(req.session.userDetails._id)
       
         let Address= await userhelpers.getPostAddress(UserId,req.body.address)
             
         totalAmount=totalAmount[0].total
       
        if (discount >0 ) {
            
       
            let discountAmt = parseInt(totalAmount) - parseInt(discount)
            totalAmount = parseInt(totalAmount) - parseInt(discountAmt)
            totalAmount = '' + totalAmount
        
        }else{
          
             totalAmount = totalAmount
        }
        userhelpers.placeOrder(req.body,Address, carts, totalAmount, discount).then((orderID) => {

            if (req.body['payment-method'] == 'COD') {
                res.json({codstatus: true})
            }else if(req.body['payment-method'] == 'wallet'){
              res.json({walletstatus: true})
            } else {
                userhelpers.generateRazorPay(orderID, totalAmount).then((response) => {
                  
                    res.json(response)
                }).catch((error)=>{
                    console.log(error)
                    res.status(500,{error})
                })
            }
    

        })
       }
       catch(error){
    
         res.status(500,{error})
       }
       
         

       
       
    },
    getOrderList: async (req, res) => {
        let user = req.session.user;
          
     userhelpers.getCartCount(req.session.userDetails._id).then((response)=>{
        let cartCount=response
        userhelpers.getOrderList(req.session.userDetails._id).then((response)=>{
            let orders = response
           
     
           
         
             
          
            res.render('user/orderList', {user, cartCount, orders,UserId})
         }).catch((error)=>{
             console.log(error);
            res.status(500,{error})
         })
     }).catch((error)=>{
        console.log(error)
        res.status(500,{error})
     })
        

     
    },
     OrderProd: (req, res) => { 
         
      
         userhelpers.getOrderProd(req.params.id).then((response)=>{
       
            const products = response;
     
            res.render('user/orderDetails', {products,UserId})
         }).catch((error)=>{ 
           res.status(500,{error})
         })
        

    },
    OrderSuccess: (req, res) => {


        userhelpers.verifyPayment(req.body).then(() => {

            userhelpers.changePamentStatus(req.body['order[receipt]']).then(() => {

                res.json({status: true})
            })
        }).catch((err) => {
            console.log('err', err);
            res.json({status: false, errMsg: ''})
        })
    },
    orderPlaced: async (req, res) => {
    
        res.render('user/orderplaced')
    },
    applyCoupon: async (req, res) => {
 
        const {couponCode, total} = req.body
               
      
        let discount = await db.coupon.findOne({Name: couponCode})

        if (couponCode === discount.Name) {
         if(new Date(discount.Date)>new Date()){
            const discountedPrice = (total - discount.Price).toFixed(2);
            req.session.discoundPrice = discountedPrice
            
            res.json({status: true, discountedPrice}); 
       }else{
        res.json({status: false});
       }
        } else {
            res.json({status: false});
        }
    },
    searchProducts: (req, res) => {
        try {
          

            userhelpers.search(req.body.search).then(async (response1) => {

                let banner = await userhelpers.getViewBanner()

                let user = req.session.user;
                   
                let cartCount = await userhelpers.getCartCount(req.session.userDetails._id)

                res.render("user/search", {
                    response1,
                    user,
                    cartCount,
                    banner,
                    UserId,
                    loginHeader: true
                });
            });
        } catch (error) {
            res.status(500);
        }
    },
    categoryFilter: (req, res) => {
        try {
         
           
            userhelpers.findSelectedCategory(req.body.selectedValue).then(async (response1) => {
              
                let banner = await userhelpers.getViewBanner()
                let Category = await userhelpers.findAllcategories()
                 let user = req.session.user;

                 let cartCount = await userhelpers.getCartCount(req.session.userDetails._id)

                res.render("user/filterCat", {
                    response1,
                    UserId,
                    Category,
                     user,
                    cartCount,
                   banner,
                     loginHeader: true
                });
            });
        } catch (error) {
            res.status(500);
        }
    },
    sortProducts: (req, res) => {
        try {
        
          userhelpers.sortProducts(req.body.selectedValue).then(async (response) => {
             user = req.session.user;
            let response1 = response
            let banner = await userhelpers.getViewBanner()
            let Category = await userhelpers.findAllcategories()
            let cartCount = await userhelpers.getCartCount(req.session.userDetails._id)
            res.render("user/sort", { user,UserId,response1,banner,Category, loginHeader: true,cartCount});
          });
        } catch (error) {
          res.status(500);
        }
      },
      pagination:async(req,res)=>{
        const page = parseInt(req.query.page) || 1; // get the current page number from the client, or default to 1
const pageSize = 10; // set the number of records to show per page
const skip = (page - 1) * pageSize; // calculate the number of records to skip based on the current page number and page size

const results = await db.products.find().skip(skip).limit(pageSize) // retrieve the data from the database and apply the pagination

const pageCount = Math.ceil(await db.products.count() / pageSize); // calculate the total number of pages based on the number of records and page size
   
res.json({ results, pageCount }); // return the paginated data and page count to the client


      },
      DeleteOrder:(req,res)=>{
        userhelpers.deleteOrder(req.params.id).then((response)=>{
            res.redirect('/orderList')
        }).catch((error)=>{
            res.status(500)
        })
      },
      
  getProfile: async (req, res) => {
    try {
      let data = await userhelpers.findUser(UserId);
      
      res.render("user/profile", { data ,UserId});
    } catch (error) {
      res.status(500)
    }

  },
   changeProfile: async (req, res) => {
    try {
      await userhelpers.changeProfile(UserId,req.body)
        .then((data) => {
          res.json({ data })
        });
    } catch (error) {
      res.status(500)
    }

  },
  getWishlist: async (req, res) => {

    userhelpers
      .addToWishList(req.query.wishid, req.session.user.id)
      .then((response) => {
        res.json(response.status);
      });
  },
  listWishList: async (req, res) => {
    wishcount = await userhelpers.getWishCount(req.session.user.id)
  
    await userhelpers
      .ListWishList(req.session.user.id)
      .then((wishlistItems) => {
       console.log(wishlistItems,'wishoutingg')

        res.render("user/wishlist", {
          wishlistItems,
          wishcount,
          user,
          UserId
        })
      }).catch((error)=>{
        console.log(error);  
    })
  },
  deleteWishList: async (req, res) => {
    try {
      await userhelpers.getDeleteWishList(req.body).then((response) => {

        res.json(response)

      })
    } catch (error) {
      res.status(500)
    }

  },
  
  getAddresspage: (req, res) => {
   
    try {
      res.render('user/add-address', {UserId })

    } catch (error) {
      res.status(500)
    }

  },
  
  postAddresspage: async (req, res) => {

    try {
      await userhelpers.postAddress( req.session.userDetails._id, req.body).then(() => {
        res.redirect('/')
      })
    } catch (error) {
      res.status(500)
    }

  },
  returnOrder:async(req,res)=>{
    await userhelpers.returnOrder(req.params.id).then(()=>{
        
        res.redirect('/orderList')
    })

  },
  getWallet:async(req,res)=>{
     let wallet =  await userhelpers.findWallet(UserId)
     let walletAmount=wallet.Amount
   
    res.render('user/wallet',{walletAmount,user})
  }
}