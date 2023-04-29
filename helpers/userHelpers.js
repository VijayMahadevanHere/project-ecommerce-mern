const bcrypt = require('bcrypt')
const Razorpay = require('razorpay');
const db = require('../model/connection');
const {resolve} = require('path');
const ObjectId = require('mongodb').ObjectId
let key_id = process.env.RAZORPAY_KEY_ID
let key_secret = process.env.RAZORPAY_KEY_SECRET
const instance = new Razorpay({key_id: key_id, key_secret: key_secret});


module.exports = {


    doSignUp: (userData) => {

        let response = {}
        return new Promise(async (resolve, reject) => {


            try {
                email = userData.email;
                existingUser = await db.user.findOne({email: email})
                if (existingUser) {
                    response = {
                        status: false
                    }
                    return resolve(response)
                } else {
                    let hashPassword = await bcrypt.hash(userData.password, 10);
                    const data = {
                        username: userData.username,
                        Password: hashPassword,
                        email: userData.email,
                        phoneNumber: userData.phonenumber
                    }

                    await db.user.create(data).then((data) => {
                        resolve({data, status: true})
                    })

                }

            } catch (err) {
                console.log(err)
            }
        })
    },

    dologin: (userData) => {


        return new Promise(async (resolve, reject) => {
            try {
                let response = {}
                let users = await db.user.findOne({email: userData.email})

                if (users) {
                    if (users.blocked == false) {
                        await bcrypt.compare(userData.password, users.Password).then((status) => {
                            if (status) {
                                response.user = users;
                                resolve({response, status: true})

                            } else {
                                resolve({blockedStatus: false, status: false})
                            }
                        })

                    } else {

                        resolve({blockedStatus: true, status: false})
                    }

                } else {
                    resolve({blockedStatus: false, status: false})


                }

            } catch (err) {
                console.log(err);
            }

        })


    },
    getViewProducts: (details) => {
        return new Promise(async (resolve, reject) => {
            const page = parseInt(details) || 1
            const pageSize = 8
            const skip = (page - 1) * pageSize
  
            const results = await db.products.find().skip(skip).limit(pageSize).then()
      
             if(results){
                resolve(results)
             }else{
                reject()
             }

        })

    },
    getViewBanner: () => {
        return new Promise(async (resolve, reject) => {
            await db.banner.find().exec().then((response) => {
                resolve(response)

            })

        })
    },

    add_To_Cart: (userId, prodId) => {

        return new Promise(async (resolve, reject) => {
            let proobj = {
                product: ObjectId(prodId),
                quantity: 1
            }
            let obj = {
                userid: userId,
                products: proobj
            }
            try {
                let usercart = await db.cart.find({userid: userId})
                if (usercart.length < 1) {
                    await db.cart.create(obj)
                    resolve()
                } else {
                    let proExist = await db.cart.findOne({userid: userId, "products.product": ObjectId(prodId)})
                    if (proExist) {
                        await db.cart.findOneAndUpdate({
                            userid: userId,
                            "products.product": ObjectId(prodId)
                        }, {
                            $inc: {
                                "products.$.quantity": 1
                            }
                        })
                    } else {
                        await db.cart.findOneAndUpdate({
                            userid: userId
                        }, {
                            $push: {
                                products: proobj
                            }
                        })
                    }
                    resolve()
                }
            } catch (error) {
                reject(error)
            }
        })
    },

    getCartProducts: (userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                    userId = new ObjectId(userId);
                    let cartItems = await db.cart.aggregate([
                        {
                            '$match': {
                                'userid': userId
                            }
                        },
                        {
                            '$unwind': {
                                'path': '$products',
                                'preserveNullAndEmptyArrays': true
                            }
                        },
                        {
                            '$unwind': {
                                'path': '$products',
                                'preserveNullAndEmptyArrays': true
                            }
                        },
                        {
                            '$lookup': {
                                'from': 'products',
                                'localField': 'products.product',
                                'foreignField': '_id',
                                'as': 'proDetails'
                            }
                        },
                        {
                            '$project': {
                                'proDetails': 1,
                                'products.quantity': 1,
                                '_id': 1

                            }
                        }, {
                            '$unwind': "$proDetails"

                        },

                    ])


                    resolve(cartItems);
                } catch {
                    resolve(null);
                }}
        );
    },
    getCartCount : (userId) => {
        return new Promise(async (resolve, reject) => {
            let count = 0
            let cart = await db.cart.findOne({userid: ObjectId(userId)})
            if (cart) {
                count = cart.products.length

            }
            resolve(count)
        })

    },
    change_Quantity : (details) => {

        details.count = parseInt(details.count)
        details.quantity = parseInt(details.quantity)

        return new Promise((resolve, reject) => {
            if (details.count == -1 && details.quantity == 1) {
                db.cart.findOneAndUpdate({
                    _id: details.cart
                }, {
                    $pull: {
                        products: {
                            product: ObjectId(details.product)
                        }
                    }
                }).then((response) => {
                    resolve({removeProduct: true})
                }).catch((error) => {
                    reject()
                })
            } else {

                db.cart.findOneAndUpdate({
                    _id: details.cart,
                    "products.product": ObjectId(details.product)
                }, {
                    $inc: {
                        "products.$.quantity": details.count
                    }
                }).then((response) => {
                    resolve({status: true})
                }).catch((error) => {
                    reject()
                })
            }


        })

    },
    removeCartItem : (details) => {
        return new Promise((resolve, reject) => {
            db.cart.findOneAndUpdate({
                _id: details.cart
            }, {
                $pull: {
                    products: {
                        product: ObjectId(details.product)
                    }
                }
            }).then((response) => {
                resolve(response)
            }).catch((error) => {
                reject(error)
            })


        })
    },
    getTotalAmount : (userId) => {

        return new Promise(async (resolve, reject) => {
            try {
               
                let total = await db.cart.aggregate([
                    {
                        '$match': {
                            'userid':ObjectId(userId)
                        }
                    },
                    {
                        '$unwind': {
                            'path': '$products',
                            'preserveNullAndEmptyArrays': true
                        }
                    },
                    {
                        '$lookup': {
                            'from': 'products',
                            'localField': 'products.product',
                            'foreignField': '_id',
                            'as': 'proDetails'
                        }
                    },
                    {
                        '$project': {
                            'products.quantity': 1,
                            'product': {
                                $arrayElemAt: ["$proDetails", 0]
                            },
                            '_id': 1,
                            'proDetails.price':1

                        }
                    }, {
                        '$group': {
                            _id: null,

                            total: {
                                '$sum': {
                                    '$multiply': ['$products.quantity', '$product.Price']
                                }
                            },
                         
                        }
                    }
                ])

                resolve(total);
            } catch (error) {
                reject(error);
            }
        })
    },
    getRawAmount:(userId)=>{
        return new Promise(async (resolve, reject) => {
            try {
               
                let total = await db.cart.aggregate([
                    {
                        '$match': {
                            'userid':ObjectId(userId)
                        }
                    },
                    {
                        '$unwind': {
                            'path': '$products',
                            'preserveNullAndEmptyArrays': true
                        }
                    },
                    {
                        '$lookup': {
                            'from': 'products',
                            'localField': 'products.product',
                            'foreignField': '_id',
                            'as': 'proDetails'
                        }
                    },
                    {
                     '$unwind':"$proDetails"
                    },
                    {
                        '$project': {
                            'proDetails.Price':1

                        }
                    },
                  
                ])

                resolve(total);
            } catch (error) {
                reject(error);
            }
        })
      
    },
    placeOrder : (order,address, carts, total, discount) => {
        
        return new Promise((resolve, reject) => {
            const orderId = Math.floor(Math.random() * 90000) + 10000;
            let status = order['payment-method'] === 'COD'||'wallet' ? 'Placed' : 'Pending'
            db.order.create({
                deleveryDetails: {
                   Name:address.fname,
                   Street:address.street,

                   Apartment:address.apartment,
                   City:address.city,
                   Pincode:address.pincode,
                   Mobile:address.mobile,
                   Email:address.email

                },
                userId: ObjectId(order.user),
                orderId:orderId,
                paymentMethod: order['payment-method'],
                products: carts.products,
                status: status,
                total: total,
                discount: discount,
                date: new Date,
                cartId: carts._id,
               
            }).then(async (response) => {
                if(response.paymentMethod==='wallet'){
                  
                        const userWallet = await db.wallet.findOne({ user: order.user });
                        const newAmount = userWallet.Amount - parseInt(total);
                        await db.wallet.updateOne({ user: order.user }, { $set: { Amount: newAmount } })
                      
                  

                     }
              
                
                  
                if (response.status) {
                    await db.cart.deleteOne({
                        userid: ObjectId(order.user)
                    })
                    
                }
                resolve(response._id)
            }).catch((error) => {
                reject(error)
            })
        })
    },

    getCartProductList : (userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let cart = await db.cart.findOne({userid: ObjectId(userId)})

                resolve(cart)
            } catch (error) {
                reject(error)
            }
        })

    },


    getOrderProd : (orderId) => {
        orderId = ObjectId(orderId)
        return new Promise(async (resolve, reject) => {
            try {
              
                let Items = await db.order.aggregate([
                    {
                        '$match': {
                            '_id': orderId
                        }
                    },
                    {
                        '$unwind': {
                            'path': '$products',
                            'preserveNullAndEmptyArrays': true
                        }
                    },
                    
                    {
                        '$lookup': {
                            'from': 'products',
                            'localField': 'products.product',
                            'foreignField': '_id',
                            'as': 'proDetails'
                        }
                    }, 
                    
                    {
                        '$unwind':'$proDetails'
                    },
                    {
                        '$unwind':"$products"
                    }
                   
                ]);
              
                resolve(Items);
            } catch (err) {
                console.error('Error getting order products: ', err);
                reject(err);
            } 
        });
    },
    generateRazorPay : (orderID, total) => {
        return new Promise((resolve, reject) => {
            let options = {
                amount: total * 100,
                currency: "INR",
                receipt: "" + orderID
            }
            instance.orders.create(options, (err, order) => {
                if (err) {
                    console.log(err);
                    reject(err);
                } else {
                    resolve(order);
                }
            });
        });
    },
    verifyPayment : (details) => {

        return new Promise((resolve, reject) => {
            const crypto = require('crypto')
            let hmac = crypto.createHmac('sha256', 'MZlzHlhNrPfNyg80IrSEk1qh')
            hmac.update(details['payment[razorpay_order_id]'] + '|' + details['payment[razorpay_payment_id]'])
            hmac = hmac.digest('hex')
            if (hmac == details['payment[razorpay_signature]']) {

                resolve()
            } else {
                reject()
            }
        })
    },
    changePamentStatus : (orderId) => {
        return new Promise((resolve, reject) => {
            db.order.findOneAndUpdate({
                _id: ObjectId(orderId)
            }, {
                $set: {
                    status: "Placed"
                }
            }).then(() => {
                resolve();
            }).catch((err) => {
               
                reject(err);
            });
        });
    },

    search : (bodyData) => {
        try {
            return new Promise(async (resolve, reject) => {
                let product = await db.products.find({Productname: bodyData})

                resolve(product);
            });
        } catch (error) {
            reject(error);
        }
    },
    findAllcategories : () => {
        return new Promise(async (resolve, reject) => {
            try {
                const response = await db.category.find().exec();
                resolve(response);
            } catch (error) {
                reject(error);
            }
        });
    },
    getOrderList : (userId) => {
       
        return new Promise(async (resolve, reject) => {

            let order = await db.order.find({userId:ObjectId(userId)})
            if (order) {
            
                resolve(order)
            } else {
                reject()
            }


        })
    },
    sortProducts : (value) => {
        try {
            return new Promise(async (resolve, reject) => {
                if (value == "price-low-to-high") {
                    await db.products.find().sort({Price: 1}).then((response) => {

                        resolve(response);
                    });
                } else {
                    await db.products.find().sort({Price: -1}).then((response) => {

                        resolve(response);
                    });
                }
            });
        } catch (error) {
            reject(error);
        }
    },
    findSelectedCategory : (category) => {
        return new Promise(async (resolve, reject) => {
            try {
                let prod = await db.products.find({Category: category});
                resolve(prod);
            } catch (error) {
                reject(error);
            }
        });
    },
    deleteOrder : (id) => {
        return new Promise((resolve, reject) => {
            try {
                    db.order.updateOne({_id: id},{
                        $set:{
                            status:'canceled'
                        }
                    }).then((response) => {
                        resolve(response)

                    })

                } catch {reject()}}
        )},
        findUser: (userId) => {
            return new Promise(async (resolve, reject) => {
              await db.user.findById({ _id: userId }).then((user) => {
        
                resolve(user)
              }).catch((error)=>{
                reject(error)
              })
        
            })
          },
          changeProfile: async (userId, data) => {
            let number = data.phone;
            
            
            await new Promise(async (resolve, reject) => {
        
              await db.user.updateOne({ _id: userId },
                {
                  $set: {
                    username: data.fname,
                    email: data.email,
                    phoneNumber: Number(number),
                  }
                }).then((data) => {
                  console.log(data);
                  resolve(data)
                });
            });
        
          },
          addToWishList: (proId, userId) => {
            let proObj = {
                productId: proId
            };
    
            return new Promise(async (resolve, reject) => {
                let wishlist = await db.wishlist.findOne({ user: userId });
                if (wishlist) {
                    let productExist = wishlist.wishitems.findIndex(
                        (item) => item.productId == proId
                    );
                    if (productExist == -1) {
                        db.wishlist.updateOne({ user: userId },
                            {
                                $addToSet: {
                                    wishitems: proObj
                                },
                            }
                        )
                            .then(() => {
                                resolve({ status: true });
                            });
                    }
    
                } else {
                    const newWishlist = new db.wishlist({
                        user: userId,
                        wishitems: proObj
                    });
    
                    await newWishlist.save().then(() => {
                        resolve({ status: true });
                    });
                }
            });
        },
        ListWishList: (userId) => {
            return new Promise(async (resolve, reject) => {
    
    
            let wish =await db.wishlist.aggregate([
                    {
                        $match: {
                            user: userId
                        }
                    },
                    {
                        $unwind: '$wishitems'
                    },
                    {
                        $project: {
                            item: '$wishitems.productId',
                        }
                    },
                    {
                        $lookup: {
                            from: 'products',
                            localField: "item",
                            foreignField: "_id",
                            as: 'wishlist'
                        }
                    },
                    {
                        $project: {
                            item: 1, wishlist:1
                        }
                    },
                ])
              
                resolve(wish)
            })
        },
        getWishCount: (userId) => {
            return new Promise(async (resolve, reject) => {
                let count = 0;
                let wishlist = await db.wishlist.findOne({ user: userId })
                if (wishlist) {
                    count = wishlist.wishitems.length
                }
    
                resolve(count)
    
            })
        },
        getDeleteWishList: (body) => {
           
    
            return new Promise(async (resolve, reject) => {
    
                await db.wishlist.updateOne({ _id: body.wishlistId },
                    {
                        "$pull":
    
                            { wishitems: { productId: body.productId } }
                    }).then(() => {
                        resolve({ removeProduct: true })
                    })
    
    
            })
        },
    
        postAddress: (user, data) => {
          
            return new Promise(async (resolve, reject) => {
    
                let addressInfo = {
                    fname: data.fname,
                    lname: data.lname,
                    street: data.street,
                    apartment: data.apartment,
                    city: data.city,
                    state: data.state,
                    pincode: data.pincode,
                    mobile: data.mobile,
                    email: data.email,
    
                }
                let userExist=await db.address.findOne({userid:user})
                if(userExist){
                   
                    await db.address.updateOne({userid:user},
                        {
                            "$push":
    
                            { Address:addressInfo }
                        }
                        
                        
                        )
                        resolve()
                }
                else{
                  const newAddress=new db.address({
                    userid:user,
                    Address:addressInfo
                })
                     await newAddress.save().then(()=>{
                        resolve()
                     })
                }
              
            })
    
    
    
               
    
        },
        getAddress:(userId)=>{
           
            return new Promise(async(resolve,reject)=>{
                let Address= await db.address.findOne({userid:ObjectId(userId)})
                resolve(Address)
            })
        },
        getPostAddress: (userId, addId) => {
            return new Promise(async (resolve, reject) => {
                try {
                    const address = await db.address.findOne({
                        userid: ObjectId(userId),
                        'Address._id': ObjectId(addId)
                    }, {
                        'Address.$': 1 // Only retrieve the matching subdocument
                    });
                    resolve(address?.Address?.[0]); // Return the matching subdocument
                } catch (error) {
                    reject(error);
                }
            });
        },
        
        returnOrder:(orderId)=>{
            return new Promise(async(resolve,reject)=>{
                await db.order.updateOne({orderId:orderId},{
                    $set:{
                        status:'returned'
                    }
                }).then(async()=>{
                  let order =  await db.order.findOne({orderId:orderId})
               
                  let userid=order.userId
                  let amount=order.total
                 let walletExist =   await db.wallet.findOne({user:userid})
             
                 if(walletExist){
                    
                   await  db.wallet.updateOne({user:userid},
                        { $inc: { Amount: amount } }
                    )
                 }else{
                    const newWallet = new db.wallet({
                        user: userid,
                        Amount: amount
                    });
    
                    await newWallet.save().then(() => {
                        resolve( );
                    });
                 }
                  resolve( )
                })
            })
        },
        findWallet:(userid)=>{
            return new Promise(async(resolve,reject)=>{
                db.wallet.findOne({user:userid}).then((wallet)=>{
                
                    resolve(wallet)
                })

            })
        },
      
        
}
