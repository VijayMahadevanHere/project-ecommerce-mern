const { response } = require('../app')
const db= require('../model/connection')



module.exports={ 

    listUsers:()=>{
        let userData=[]
        return new Promise(async(resolve,reject)=>{
            await db.user.find().exec().then((result)=>{
                userData= result
                
            })
        
            resolve(userData)
        })
    },

    //block and unblock users
    block_User:(userId)=>{

        return new Promise(async(resolve,reject)=>{
        await db.user.updateOne({_id:userId},{$set:{blocked:true}}).then((data)=>{
            console.log('user blocked success');
            
            resolve()
        })
        })
    },

    Unblock_User:(userId)=>{
        return new Promise(async(resolve,reject)=>{
        await db.user.updateOne({_id:userId},{$set:{blocked:false}}).then((data)=>{
            console.log('user unblocked success');
            resolve()
        })
        })
    },







    //for finding all catagories available and making them to passable object

    findAllcategories:()=>{
        return new Promise (async(resolve,reject)=>{
            await db.category.find().exec().then((response)=>{
                resolve(response)
            })

        })
    },



    postAddProduct: (userData,filename)=>{
        return new Promise((resolve,reject)=>{
            uploadedImage= new db.products({
                Productname:userData.name,
                ProductDescription:userData.description,
                Quantity:parseInt(userData.quantity),
                Price:parseInt(userData.price),
                Category:userData.category,
                Image:filename
                   
            })            
            uploadedImage.save().then((data)=>{
                resolve(data)
            })
        })
    },

    getViewProducts:()=>{
        return new Promise(async(resolve,reject)=>{
            await db.products.find().exec().then((response)=>{
                resolve(response)
            })

        })
    },

    addCategory: (data) => {
        return new Promise(async (resolve, reject) => {
          const existingCat = await db.category.findOne({ CategoryName: data.categoryname.trim().toLowerCase() });
          if (existingCat) {
            resolve(existingCat)
            return; 
          }
      
          const categoryName = data.categoryname.trim().toLowerCase();
          const catData = new db.category({ CategoryName: categoryName });
         
          await catData.save().then((data) => {
            resolve(data);
          });
        });
      }
      
      ,
    postBanner: (userData,filename)=>{
        return new Promise((resolve,reject)=>{
            uploadedImage= new db.banner({
                Productname:userData.description,
                Image:filename,
            })
            uploadedImage.save().then((data)=>{
                resolve(data)
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

    viewAddCategory: ()=>{
        return new Promise(async(resolve,reject)=>{
            await db.category.find().exec().then((response)=>{
                resolve(response)
            })
        }) 
    },
    delete_Category:(CateId)=>{
        
        return new Promise (async(resolve,reject)=>{
            await db.category.deleteOne({_id:CateId}).then((response)=>{
                resolve (response)
            })
        })
    },

    editProduct: (productId)=>{
        return new Promise(async(resolve,reject)=>{
            await db.products.findOne({_id:productId}).exec().then((response)=>{
                resolve(response)
            })
        })
    },
    postEditProduct:(productId,editedData,filename)=>{
        return new Promise(async(resolve,reject)=>{
            await db.products.updateOne({_id:productId},{$set:{
            Productname:editedData.name,
            ProductDescription:editedData.description,
            Quantity:editedData.quantity,
            Price:editedData.price,
            category:editedData.category,
            Image:filename
           }}) .then((response)=>{
            resolve(response)
           }) 
        })
    },
    delete_Product:(productId)=>{
        return new Promise (async(resolve,reject)=>{
            await db.products.deleteOne({_id:productId}).then((response)=>{
                resolve (response)
            })
        })
    },



    editBanner:(BannerId)=>{
        return new Promise(async (resolve,reject)=>{
            await  db.banner.findOne({_id:BannerId}).exec().then((response)=>{
                      resolve(response)
            })
        })
    },
    postEditBanner:(BannerId,editedData,filename)=>{
       console.log(editedData);
        return new Promise(async(resolve,reject)=>{
            await db.banner.updateOne({_id:BannerId},{$set:{
            
            Productname:editedData.description,
            Image:filename
           }}) .then((response)=>{
            console.log(response);

            resolve(response)
           }) 
        })
    },
    delete_Banner:(BannerId)=>{
        
        return new Promise (async(resolve,reject)=>{
            await db.banner.deleteOne({_id:BannerId}).then((response)=>{
                resolve (response)
            })
        })
    },



}
