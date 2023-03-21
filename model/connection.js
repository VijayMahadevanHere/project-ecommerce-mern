let mongoose = require("mongoose");
const db =mongoose .connect("mongodb://0.0.0.0:27017/ecommerce", {
        useNewUrlParser: true,
        useUnifiedTopology: true })   
 .then(() => console.log("Database connected!"))
 .catch(err => console.log(err));


 const userschema= new mongoose.Schema({
    username:{
        type:String,
        required: true,
        unique:true
    },
    Password:{
        type:String,
        required:true,
    
    },
    email:{
        type:String,
        required:true,
        unique:true,
    },
    
   
    CreatedAt:{
        type:Date,
        default:Date.now,
    }, 
    phoneNumber:{
        type:String,
        required:true,
        unique:true,
        index:true
    },
    blocked:{
      type:Boolean,default:false
  }
   



 })
 const productSchema=new mongoose.Schema({
    Productname:{
      type:String
    },
    ProductDescription:{
      type:String
    },
    Quantity:{
      type:Number
    },
    Image:{
      type:Array
     
    },
     Price:{
    type:Number
    },
    Category:{
      type:String
    },
   
  
    })
    const bannerSchema=new mongoose.Schema({
      Productname:{
        type:String
      },
      Image:{
        type:Array
       
      }
    
      })


 const categorySchema= new mongoose.Schema({
    CategoryName:{
        type:String
    }
 })
const cartSchema= new mongoose.Schema({
  userid:mongoose.SchemaTypes.ObjectId,
  products:[]
})
 module.exports={
    user : mongoose.model('user',userschema),
    category : mongoose.model('Category',categorySchema),
    products : mongoose.model('products',productSchema),
    banner : mongoose.model('banner',bannerSchema),
    cart : mongoose.model('userCarts',cartSchema)
 }