const adminHelper = require('../helpers/adminHelpers')
const name = process.env.ADMIN_CREDINTIALS_NAME
const email = process.env.ADMIN_CREDINTIALS_EMAIL
const password = process.env.ADMIN_CREDINTIALS_PASSWORD

const adminCredential = {
    name: name,
    email: email,
    password: password
}
let adminStatus

module.exports = {


    showDashboard: (req, res) => {
            res.render('admin/admin-dash', {
                layout: "adminLayout",
                adminStatus
            })
        },

        getDashboard: async (req, res) => {


            let variable = req.session.admin;
        
            let totalProducts, days = []
            let ordersPerDay = {};
            let paymentCount = []
        
            await adminHelper.getViewProducts().then((Products) => {
        
              totalProducts = Products.length
            
            })
            let orderByCod = await adminHelper.getCodCount()
         
            let codCount = orderByCod.length
        
            let orderByOnline = await adminHelper.getOnlineCount()
             
            let totalUser = await adminHelper.totalUserCount()
          
            let totalUserCount = totalUser.length
           
            let onlineCount = orderByOnline.length;
        
        
            paymentCount.push(onlineCount)
            paymentCount.push(codCount)
            
        
            await adminHelper.getOrderByDate().then((response) => {
              if (response.length > 0) {
                let result = response
                for (let i = 0; i < result.length; i++) {
                  let ans = {}
                  ans['createdAt'] = result[i].date
                  days.push(ans)
                  ans = {}
              
                }
                
              }
              days.forEach((order) => {
                const day = order.createdAt.toLocaleDateString('en-US', { weekday: 'long' });
                ordersPerDay[day] = (ordersPerDay[day] || 0) + 1;
        
              });
        
            })
        
        
            await adminHelper.getAllOrders().then((response) => {
             
        
              let length = response.length
        
              let total = 0;
        
              for (let i = 0; i < length; i++) {
                total += parseInt(response[i].total) 
               
              }
        
              res.render("admin/admin-dash", {   layout: "adminLayout",adminStatus, variable, adminStatus, length, total, totalProducts, ordersPerDay, paymentCount, totalUserCount });
        
            })
          },

    getAdminLogin: (req, res) => {
        res.render("admin/admin-dash", {
            layout: "adminLayout",
            adminStatus
        })
    },

    postAdminLogin: (req, res) => {
        if (req.body.email == adminCredential.email && req.body.password == adminCredential.password) {
            req.session.admin = adminCredential
            req.session.adminloggedIn = true
            adminStatus = req.session.adminloggedIn

            res.redirect('/admin')
        } else {
            req.session.adminloginErr = "Invalid";

            res.redirect('/admin/login')

        }
    },

    adminLogout: (req, res) => {

        req.session.admin = null
        req.session.adminloggedIn = false
        adminStatus = false
        res.render('admin/login', {
            layout: "adminLayout",
            'adminloginErr': req.session.adminloginErr,
            adminStatus
        })


    },

    getUserlist: (req, res) => {
        adminHelper.listUsers().then((user) => {
            res.render('admin/view-users', {
                layout: "adminLayout",
                user,
                adminStatus
            })
        })
    },

    addProducts: (req, res) => {
        adminHelper.findAllcategories().then((availCategory) => {
            res.render("admin/add-product", {
                layout: "adminLayout",
                adminStatus,
                availCategory
            })
        })


    },


    postProducts: (req, res) => {
        let image = req.files.map(files => (files.filename))

        adminHelper.postAddProduct(req.body, image).then((response) => {
            res.redirect('/admin/view-product')
        })
    },
    postBanner: (req, res) => {
        let image = req.files.map(files => (files.filename))
        console.log(image);

        adminHelper.postBanner(req.body, image).then((response) => {
            res.redirect('/admin/view-banner')
        })
    },


    viewProducts: (req, res) => {
       
        adminHelper.getViewProducts().then((response) => {
            res.render("admin/view-product", {
                layout: "adminLayout",
                response,
                adminStatus
            })
        })
    },


    postCategory: (req, res) => {

        adminHelper.addCategory(req.body).then((response) => {
            res.redirect('/admin/add-category')
        })

    },

    getCategory: (req, res) => {
        adminHelper.viewAddCategory().then((response) => {
            let viewCategory = response
            res.render('admin/add-category', {
                layout: "adminLayout",
                viewCategory,
                adminStatus
            })
        })
    },
    // banner
    getBanner: (req, res) => {

        res.render('admin/add-banner', {
            layout: "adminLayout",
            adminStatus
        })


    },
    viewBanner: (req, res) => {
        adminHelper.getViewBanner().then((response) => {
            res.render('admin/view-banner', {
                response,
                layout: "adminLayout",
                adminStatus
            })
        })

    },
    editBanner: (req, res) => {
        adminHelper.editBanner(req.params.id).then((response) => {
            let editBanner = response


            res.render('admin/edit-banner', {
                editBanner,
                layout: "adminLayout",
                adminStatus
            })
        })
    },
    post_EditBanner: (req, res) => {


        adminHelper.postEditBanner(req.params.id, req.body, req ?. file ?. filename).then((response) => {

            res.redirect('/admin/view-banner')
        })


    },
    deleteBanner: (req, res) => {

        adminHelper.delete_Banner(req.params.id).then((response) => {

            res.redirect('/admin/view-banner')
        })

    },

    // edit product


    editProduct: (req, res) => {
 
        adminHelper.viewAddCategory().then(async(response) => {

            let procategory = response
           await  adminHelper.editProduct(req.params.id).then((response) => {
                let editproduct = response
                    console.log(editproduct,'editproducts');

                res.render('admin/edit-viewproduct', {
                    layout: "adminLayout",
                    editproduct,
                    procategory,
                    adminStatus
                });

            })
        })


    },

    // posteditaddproduct


    post_EditProduct: (req, res) => {
        console.log(req.body);
        let images = []
        if (!req.files.image1) {
            images.push(req.body.image1)
        } else {
            images.push(req.files.image1[0].originalname)
        }
        if (!req.files.image2) {
            images.push(req.body.image2)
        } else {
            images.push(req.files.image2[0].originalname)
        } adminHelper.postEditProduct(req.params.id, req.body, images).then((response) => {

            res.redirect('/admin/view-product')
        })


    },

    // delete view product


    deleteProduct: (req, res) => {

        adminHelper.delete_Product(req.params.id).then((response) => {

            res.redirect('/admin/view-product')
        })

    },
    // delete category
    deleteCategory: (req, res) => {
        console.log('test', req.params.id);
        adminHelper.delete_Category(req.params.id).then((response) => {


            res.redirect('/admin/add-category')
        })

    },

    // block user

    blockUser: (req, res) => {
        adminHelper.block_User(req.params.id).then((response) => {
            res.redirect('/admin/view-users')
        })
    },

    unblockUser: (req, res) => {
        adminHelper.Unblock_User(req.params.id).then((response) => {
            res.redirect('/admin/view-users')
        })
    },
    showaddCoupon: (req, res) => {
        res.render('admin/add-coupon')
    },
    addCoupon: (req, res) => {

        adminHelper.addCoupon(req.body).then((response) => {
            res.redirect('/admin/coupon')
        })
    },
    viewCoupon: (req, res) => {
        adminHelper.viewCoupon().then((response) => {
            res.render("admin/view-coupon", {response})
        })

    },
    getSalesReport: async (req, res) => {
        getDate = (date) => {
            let orderDate = new Date(date);
            let day = orderDate.getDate();
            let month = orderDate.getMonth() + 1;
            let year = orderDate.getFullYear();
            let hours = date.getHours();
            let minutes = date.getMinutes();
            let seconds = date.getSeconds();
            return `${
                isNaN(day) ? "00" : day
            }-${
                isNaN(month) ? "00" : month
            }-${
                isNaN(year) ? "0000" : year
            } ${
                date.getHours(hours)
            }:${
                date.getMinutes(minutes)
            }:${
                date.getSeconds(seconds)
            }`;
        };
        let report = await adminHelper.getSalesReport()
  
   
        let total = await adminHelper.gettotalamout()
        
        let Details = []
        report.forEach(orders => {
            Details.push(orders)
        })


        res.render('admin/sales-report', {
            layout: "adminLayout",
            adminStatus,
            Details,
            total
        })


    },
    postSalesReport: (req, res) => {


        adminHelper.postReport(req.body).then(async (orderdata) => {
            let total = await adminHelper.getTotalAmount(req.body)

            let Details = [];
            orderdata.forEach(orders => {
                Details.push(orders)
            })


            res.render('admin/sales-report', {
                layout: "adminLayout",
                adminStatus,
                Details,
                getDate,
                total
            })
        })


    },
    viewOrderList: async (req, res) => {
        adminHelper.getAllOrders().then((response) => {
          
            res.render("admin/orderLIst", {orders: response,layout: "adminLayout",
            adminStatus})
        }).catch(() => {
            res.status(500, {error: 'No Orders Found!!!'})
        })

    },
    OrderDetails:(req,res)=>{
        
        adminHelper.getOrderProd(req.params.id).then((response)=>{
       let products=response
      
             res.render('admin/orderDetails',{products})
         }).catch((error)=>{
           res.status(500,{error})
         })
    },
    viewCatdiscount:async(req,res)=>{
        let category= await adminHelper.findAllcategories()
        
        res.render('admin/category-offer',{layout: "adminLayout",
        adminStatus,category})
    },
    
  applyOffer:async(req,res)=>{
     const Cate=   req.body.Name
     const Price=   req.body.value
  
  console.log(Cate);
    
 
},

getAddOffer:async(req,res)=>{
    let id=req.params.id

   let cate =await adminHelper.findCat(id)
    res.render('admin/addOffer',{cate})
},
PostAddOffer:async(req,res)=>{
   
       let Cate=req.body.Category
       let Price=req.body.Price

    await adminHelper.applyOffer(Cate,Price)  

    res.redirect('/admin')
},
shipOrder:(req,res)=>{
   adminHelper.shipOrder(req.params.id).then(()=>{
    res.redirect("/admin/orderList")
   })
     
},
deliverOrder:(req,res)=>{
    adminHelper.deliverOrder(req.params.id).then(()=>{
        res.redirect("/admin/orderList")
    })
}
}