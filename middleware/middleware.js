const db = require('../model/connection')


module.exports={
    adminAuth:(req,res,next)=>{
         if(req.session.adminloggedIn){
            next()
         }else{
            let adminStatus

           res.render("admin/login", {layout:"adminLayout", adminloginErr: req.session.adminloginErr,adminStatus});
           req.session.adminloginErr=false
          
         }
    },
    userBlocked:async(req,res,next)=>{
      
    if(req.session.loggedin) {
      
      const userId=req.session.userDetails._id;
      let user = await db.user.findOne({_id:userId});
      if(user.blocked){
        loginStatus = true;
        blockedStatus = true;
        res.render('user/login', { loginStatus, blockedStatus, login: false })
       
      }
    else{
        next()
      }
    }else{
      res.redirect('/login')
    }
    }
    
  
   
}