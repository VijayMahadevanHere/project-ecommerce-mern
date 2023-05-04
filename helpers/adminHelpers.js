const db = require('../model/connection')
const ObjectId = require('mongodb').ObjectId

module.exports = {

    listUsers: () => {
        let userData = []
        return new Promise(async (resolve, reject) => {
            await db.user.find().exec().then((result) => {
                userData = result

            })

            resolve(userData)
        })
    },

    // block and unblock users
    block_User: (userId) => {

        return new Promise(async (resolve, reject) => {
            await db.user.updateOne({
                _id: userId
            }, {
                $set: {
                    blocked: true
                }
            }).then((data) => {

                resolve()
            })
        })
    },

    Unblock_User: (userId) => {
        return new Promise(async (resolve, reject) => {
            await db.user.updateOne({
                _id: userId
            }, {
                $set: {
                    blocked: false
                }
            }).then((data) => {
               
                resolve()
            })
        })
    },


    // for finding all catagories available and making them to passable object

    findAllcategories: () => {
        return new Promise(async (resolve, reject) => {
            await db.category.find().exec().then((response) => {
              
                resolve(response)
            })

        })
    },


    postAddProduct: (userData, filename) => {
        return new Promise((resolve, reject) => {
            uploadedImage = new db.products({
                Productname: userData.name,
                ProductDescription: userData.description,
                Quantity: parseInt(userData.quantity),
                Price: parseInt(userData.price)-userData.discount,
                Category: userData.category,
                discountPerCent:userData.discount,
                Image: filename
                
            })
            uploadedImage.save().then((data) => {
                resolve(data)
            })
        })
    },

    getViewProducts: () => {
        return new Promise(async (resolve, reject) => {
            await db.products.find().exec().then((response) => {
                resolve(response)
            })

        })
    },

    addCategory: (data) => {
        return new Promise(async (resolve, reject) => {
            const existingCat = await db.category.findOne({CategoryName: data.categoryname.trim().toLowerCase()});
            if (existingCat) {
                resolve(existingCat)
                return;
            }

            const categoryName = data.categoryname.trim().toLowerCase();
            const catData = new db.category({CategoryName: categoryName});

            await catData.save().then((data) => {
                resolve(data);
            });
        });
    },
    postBanner: (userData, filename) => {
        return new Promise((resolve, reject) => {
            uploadedImage = new db.banner({Productname: userData.description, Image: filename})
            uploadedImage.save().then((data) => {
                resolve(data)
            })
        })
    },

    getViewBanner: () => {
        return new Promise(async (resolve, reject) => {
            await db.banner.find().exec().then((response) => {
                resolve(response)

            })

        })
    },

    viewAddCategory: () => {
        return new Promise(async (resolve, reject) => {
            await db.category.find().exec().then((response) => {
                resolve(response)
            })
        })
    },
    delete_Category: (CateId) => {

        return new Promise(async (resolve, reject) => {
            await db.category.deleteOne({_id: CateId}).then((response) => {
                resolve(response)
            })
        })
    },

     editProduct: (productId) => {
        return new Promise(async (resolve, reject) => {
            await db.products.findOne({_id: productId }).then((response) => {
                resolve(response)
            })
        })
    },
    postEditProduct: (productId, editedData, filename) => {
        return new Promise(async (resolve, reject) => {
            await db.products.updateOne({
                _id: productId
            }, {
                $set: {
                    Productname: editedData.name,
                    ProductDescription: editedData.description,
                    Quantity: editedData.quantity,
                    Price: editedData.price,
                    category: editedData.category,
                    discountPerCent:editedData.discount,
                    Image: filename
                }
            }).then((response) => {
                resolve(response)
            })
        })
    },
    delete_Product: (productId) => {
        return new Promise((resolve, reject) => {
             db.products.deleteOne({_id: productId}).then((response) => {
                resolve(response)
            })
        })
    },


    editBanner: (BannerId) => {
        return new Promise( (resolve, reject) => {
        db.banner.findOne({_id: BannerId}).exec().then((response) => {
                resolve(response)
            })
        })
    },
    postEditBanner: (BannerId, editedData, filename) => {
    
        return new Promise(async (resolve, reject) => {
            await db.banner.updateOne({
                _id: BannerId
            }, {
                $set: {

                    Productname: editedData.description,
                    Image: filename
                }
            }).then((response) => {
               

                resolve(response)
            })
        })
    },
    delete_Banner: (BannerId) => {

        return new Promise(async (resolve, reject) => {
            await db.banner.deleteOne({_id: BannerId}).then((response) => {
                resolve(response)
            })
        })
    },
    addCoupon: (details) => {
        const couponName = details['coupon-name'];
        const couponDescription = details['coupon-description'];
        const couponStartDate=details['coupon-date-start']
        const couponDate = details['coupon-date-end'];
        const couponPrice = details['coupon-price'];


        return new Promise((resolve, reject) => {
            let coupon = new db.coupon({Name: couponName, Price: couponPrice, Discription: couponDescription, startDate: couponStartDate, endDate: couponDate})
            coupon.save().then((data) => {
                resolve(data)
            })
        })
    },
    viewCoupon: () => {
        return new Promise((resolve, reject) => {
            db.coupon.find().then((response) => {
                resolve(response)
            })
        })
    },
    getSalesReport: () => {
        return new Promise(async (resolve, reject) => {
            let response = await db.order.aggregate([
                {
                    $match: {
                        "status": "delivered"
                    }
                },
                {
                    $unwind: "$products"
               
                },
                {
                    $unwind: '$products'
                }
            ]);
 
            resolve(response);
        });
    },

    gettotalamout: () => {
        return new Promise(async (resolve, reject) => {
            try {
                let total = await db.order.aggregate([
                    {
                        $match: {
                            "status": "delivered"
                        }
                    }, {
                        $group: {
                            _id: null,
                            totalDiscount: {
                                $sum: {
                                    $toDouble: "$total"
                                }
                            }
                        }
                    }
                ]);
              
                resolve(total);
            } catch (err) {
                reject(err);
            }
        });


    },

    getTotalAmount: (date) => {
        let start = new Date(date.startdate);
        let end = new Date(date.enddate);
        return new Promise(async (resolve, reject) => {
            let total = await db.order.aggregate([
                {
                    $match: {
                        $and: [
                            {
                                "status": "delivered"
                            }, {
                                "date": {
                                    $gte: start,
                                    $lte: end
                                }
                            }
                        ]
                    }
                }, {
                    $group: {
                        _id: null,
                        totalDiscount: {
                            $sum: {
                                $toDouble: "$total"
                            }
                        }
                    }
                }

            ])
            resolve(total)


        })

    },
    postReport: (date) => {

        let start = new Date(date.startdate);
        let end = new Date(date.enddate);

        return new Promise(async (resolve, reject) => {
            let prod = await db.order.aggregate([
                {
                    $match: {
                        $and: [
                            {
                                "status": "delivered"
                            }, {
                                "date": {
                                    $gte: start,
                                    $lte: end
                                }
                            }
                        ]
                    }
                }, {
                    $unwind: "$products"
                }, 
                {
                    $unwind: '$products'
                }, {
                    $unwind: '$products'
                }
            ])

            resolve(prod)
        })

    },
    getOrderList: (userId) => {
        return new Promise((resolve, reject) => {
            let orderlist = db.order.find({userId: ObjectId(userId)})
            if (orderlist) {
                resolve(orderlist)
            } else {
                reject('No order found for this user.')
            }
        })
    },
    getAllOrders:()=>{
        return new Promise(async(resolve,reject)=>{
            let order=await db.order.find()
            if(order){
                resolve(order)
            }else{
                reject(error)
            }
           
        })
    },
    getCodCount: () => {
        return new Promise(async (resolve, reject) => {
          let response = await db.order.aggregate([
           
            {
              $match: {
                "paymentMethod": "COD"
              }
            },
          ])
          resolve(response)
        })
      },
      getOnlineCount:()=> {
        return new Promise(async (resolve, reject) => {
          let response = await db.order.aggregate([
           
            {
              $match: {
                "paymentMethod": "ONLINE"
              }
            },
          ])
          resolve(response)
        })
      },
      totalUserCount: () => {

        return new Promise(async (resolve, reject) => {
          let response = await db.user.find().exec()
    
          resolve(response)
    
        })
      },
      
  getOrderByDate: async () => {

    try {
      const startDate = new Date('2022-01-01');
      let orderDate = await db.order.find({ date: { $gte:startDate } });
 
      return orderDate
    }
    catch (err) {
      console.log(err);
    }
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
        
            reject(err);
        } 
    });
},
applyOffer: async (category, offer) => {
    offer=parseInt(offer)
    await db.products.updateMany(
        { Category: category },
        { $inc: { Price: -(offer) } }
      );
   
},
findCat:(id)=>{
    return new Promise(async(resolve,reject)=>{
   let cat= await db.category.findOne({_id:id})
   
    resolve(cat)
    })
},
 shipOrder:(orderId)=>{
    return new Promise(async(resolve,reject)=>{
        await db.order.updateOne({orderId:orderId},{
         $set:{
            status:'shipped'
         }
        }).then(()=>{
            resolve()
        })
    })
},
deliverOrder:(orderId)=>{
    return new Promise(async(resolve,reject)=>{
        await db.order.updateOne({orderId:orderId},{
            $set:{
                status:'delivered'
            }
        }).then(()=>{
            resolve()
        })
    })
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
    )}
}