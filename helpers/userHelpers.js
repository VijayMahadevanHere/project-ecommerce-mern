const bcrypt = require('bcrypt')

const db = require('../model/connection')
const ObjectId=require('mongodb').ObjectId



module.exports = {



    doSignUp: (userData)=>{
        
        let response= {}
        return new Promise(async(resolve,reject)=>{
            

            try{
                email= userData.email;
                existingUser=  await db.user.findOne({email:email})
                if (existingUser)
                {
                    response= {status:false}
                    return resolve(response)
                }
                else{
                    let hashPassword= await bcrypt.hash(userData.password,10);
                    const data = {
                        username:userData.username,
                        Password:hashPassword,
                        email:userData.email,
                        phoneNumber:userData.phonenumber
                    }
                    console.log(data);
                    await db.user.create(data).then((data)=>{
                        resolve({data,status:true})
                    })

                }

            }
            catch(err){
                console.log(err)
            }
        })
    },

    dologin:(userData)=>{
        
        
        return new Promise (async(resolve,reject)=>{
            try{
                let response={}
                let users= await db.user.findOne({email:userData.email})
                
                if(users){
                    if(users.blocked==false){
                        await bcrypt.compare(userData.password,users.Password).then((status)=>{
                            if(status){
                                response.user= users;
                                resolve({response,status:true})
                                
                            }else{
                                resolve({blockedStatus:false,status:false})
                            }
                        })

                    }else{
                      
                        resolve({blockedStatus:true,status:false})
                            }

                }else{
                    resolve({blockedStatus:false,status:false})


                    }
                    
            }
            catch(err){
                console.log(err);
            }

            })
        

    },
    getViewProducts:()=>{
        return new Promise(async(resolve,reject)=>{
            await db.products.find().exec().then((response)=>{
                resolve(response)
                
            })

        })
    },
    getViewBanner:()=>{
        return new Promise( async (resolve,reject)=>{
            await db.banner.find().exec().then((response)=>{
                resolve(response)
                
            })

        })
    },

    add_To_Cart:(userId,prodId)=>{
       
   
       return new Promise(async(resolve,reject)=>{
       let   proobj={
            product:ObjectId(prodId),
            quantity:1
        }
        let  obj={
            userid:userId,
            products:proobj
        }
        let usercart=await db.cart.find({userid:userId})
        if(usercart.length<1){
            db.cart.create(obj)
            console.log('test1');
            resolve()
        }else{

            let proExist = await db.cart.findOne({userid:userId,"products.product": ObjectId(prodId)})
            
            console.log(proExist+"PRO EXIST TTT TTT");
            
            if(proExist){
              db.cart.findOneAndUpdate({userid:userId,"products.product":ObjectId(prodId)},{$inc:{"products.$.quantity":1}},function (err){
                if(err){
                  console.log(err);
                }
              })
            }
            else{
              console.log('test2');
            db.cart.findOneAndUpdate({userid:userId},{$push:{products:proobj}},function(err){
              if(err){
                console.log(err);
              }
            })
          }
          }resolve()
        })
       
      },

    getCartProducts: (userId) => {
        return new Promise(async (resolve, reject) => {
          try {
            userId = new ObjectId(userId);
            let cartItems = await db.cart
            .aggregate([
                {
                  '$match': {
                    'userid': userId
                  }
                }, {
                  '$unwind': {
                    'path': '$products', 
                    'preserveNullAndEmptyArrays': true
                  }
                }, {
                  '$lookup': {
                    'from': 'products', 
                    'localField': 'products.product', 
                    'foreignField': '_id', 
                    'as': 'proDetails'
                  }
                }, {
                  '$project': {
                    'proDetails': 1, 
                    'products.quantity': 1, 
                    '_id': 0
                  }
                }
              ])
          
        
            resolve(cartItems);
          } catch {
            resolve(null);
          }
        });
      },
      getCartCount:(userId)=>{
     return new Promise (async(resolve,reject)=>{
      let count =0
      let cart= await db.cart.findOne({userid:ObjectId(userId)})
      if(cart){
        count=cart.products.length
        console.log(count);
      }
      resolve(count)
     })

      }

    }      

