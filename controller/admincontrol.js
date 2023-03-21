const { response } = require('../app')
// const adminHelpers = require('../helpers/adminhelpers')
const adminHelper = require('../helpers/adminHelpers')
const db =require('../model/connection')



const adminCredential={
    name:'superAdmin',
    email:'admin@gmail.com',
    password:'123'
   }
   let adminStatus

module.exports={
  

    showDashboard: (req,res)=>{
    
      
       
       if(  req.session.adminloggedIn){
            res.render('admin/admin-dash',{layout:"adminLayout",adminStatus})
         }else{
            res.redirect('/admin/login')
         }
    },

    getAdminLogin:(req, res)=> {
            res.render("admin/admin-dash",{layout:"adminLayout",adminStatus})
      },

    postAdminLogin: (req,res)=>{
        if(req.body.email==adminCredential.email && req.body.password==adminCredential.password){
            req.session.admin=adminCredential
           req.session.adminloggedIn=true
           adminStatus=req.session.adminloggedIn
           
          res.redirect('/admin')
        }
        
          else{
           req.session.adminloginErr ="Invalid";
          
          res.redirect('/admin/login')
         
          }
         },

         adminLogout:(req,res)=>{
          
            req.session.admin=null
            req.session.adminloggedIn=false
           adminStatus=false
           res.render('admin/login',{ layout: "adminLayout", 'adminloginErr': req.session.adminloginErr, adminStatus})
            

         },

         getUserlist:(req,res)=>{
            adminHelper.listUsers().then((user)=>{
               res.render('admin/view-users',{layout:"adminLayout",user,adminStatus})
            })
         },

         addProducts : (req, res) =>{
          adminHelper.findAllcategories().then((availCategory)=>{
            res.render("admin/add-product", { layout: "adminLayout",adminStatus,availCategory})
          })

          
        },


        postProducts:(req,res)=>{ 
       let image=req.files.map(files=>(files.filename))
      
          adminHelper.postAddProduct(req.body,image).then((response)=>{
            res.redirect('/admin/view-product')
        })
      },  
       postBanner:(req,res)=>{
        let image=req.files.map(files=>(files.filename))
        console.log(image);
        adminHelper.postBanner(req.body,image).then((response)=>{
          res.redirect('/admin/view-banner')
      })
    },


        viewProducts:(req,res)=>{
          adminHelper.getViewProducts().then((response)=>{
            res.render("admin/view-product",{ layout: "adminLayout" ,response,adminStatus})
           })  
        },

     

        postCategory: (req,res)=>{
         
          adminHelper.addCategory(req.body).then((response)=>{
             res.redirect('/admin/add-category')
          })

        },

        getCategory: (req,res)=>{
          adminHelper.viewAddCategory().then((response)=>{
            let viewCategory = response
            res.render('admin/add-category',{layout:"adminLayout",viewCategory,adminStatus})
          })
        },
           //banner
           getBanner:(req,res)=>{
        
            res.render('admin/add-banner',{layout:"adminLayout",adminStatus})

        
            
           },
           viewBanner:(req,res)=>{
            adminHelper.getViewBanner().then((response)=>{
              res.render('admin/view-banner',{response,layout:"adminLayout",adminStatus})
            })
    
          },
          editBanner:(req,res)=>{
            adminHelper.editBanner(req.params.id).then((response)=>{
              let editBanner=response
            
            
              res.render('admin/edit-banner',{editBanner,layout:"adminLayout",adminStatus})
            })
          },
          post_EditBanner:(req,res) =>{
      
           
            adminHelper.postEditBanner(req.params.id, req.body,req?.file?.filename).then((response)=>{
              
              res.redirect('/admin/view-banner')
            })
          
            
          },
          deleteBanner:(req,res) =>{
      
            adminHelper.delete_Banner(req.params.id).then((response)=>{
      
              res.redirect('/admin/view-banner')
            })
            
          },
      
        //edit product 


        editProduct:(req,res) =>{
      
      adminHelper.viewAddCategory().then((response)=>{
    
        let procategory=response
          adminHelper.editProduct(req.params.id).then((response)=>{
         let editproduct=response
         
   
        res.render('admin/edit-viewproduct',{ layout: "adminLayout" ,editproduct,procategory,adminStatus});
    
      })})
      
      
    
    },
    
    //posteditaddproduct
    
    
    post_EditProduct:(req,res) =>{
      console.log(req.body);
      let images =[]
      if(!req.files.image1){
        images.push(req.body.image1)
      }else{
        images.push(req.files.image1[0].originalname)
      }
      if(!req.files.image2){
        images.push(req.body.image2)
      }else{
        images.push(req.files.image2[0].originalname)
      }
      
      adminHelper.postEditProduct(req.params.id, req.body,images).then((response)=>{
        
        res.redirect('/admin/view-product')
      })
    
      
    },

     //delete view product 
    
    
     deleteProduct:(req,res) =>{
      
      adminHelper.delete_Product(req.params.id).then((response)=>{

        res.redirect('/admin/view-product')
      })
      
    },
    //delete category
    deleteCategory:(req,res) =>{
      console.log('test',req.params.id);
      adminHelper.delete_Category(req.params.id).then((response)=>{
             
    
        res.redirect('/admin/add-category')
      })
      
    },

    // block user

    blockUser: (req,res)=>{
      adminHelper.block_User(req.params.id).then((response)=>{
        res.redirect('/admin/view-users')
      })
    },

    unblockUser: (req,res)=>{
      adminHelper.Unblock_User(req.params.id).then((response)=>{
        res.redirect('/admin/view-users')
      })
    },










}



    
