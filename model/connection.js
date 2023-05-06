let mongoose = require("mongoose");


const db = mongoose.connect('mongodb://0.0.0.0:27017/ecommerce', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log("Database connected!"))
  .catch(err => console.log(err));


const userschema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  Password: {
    type: String,
    required: true,

  },
  email: {
    type: String,
    required: true,
    unique: true,
  },


  CreatedAt: {
    type: Date,
    default: Date.now,
  },
  phoneNumber: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  blocked: {
    type: Boolean, default: false
  }




})
const productSchema = new mongoose.Schema({
  Productname: {
    type: String
  },
  ProductDescription: {
    type: String
  },
  Quantity: {
    type: Number
  },
  Image: {
    type: Array

  },
  Price: {
    type: Number
  },
  Category: {
    type: String
  },
  discountPerCent: {
    type: Number
  }

})

const addressSchema = new mongoose.Schema({


  userid: {
    type: mongoose.Schema.Types.ObjectId,
    ref:'user'
  },
  Address: [
    {
      fname: { type: String },
      lname: { type: String },
      street: { type: String },
      apartment: { type: String },
      city: { type: String },
      state: { type: String },
      pincode: { type: Number },
      mobile: { type: Number },
      email: { type: String }
    }
  ]


})
const bannerSchema = new mongoose.Schema({
  Productname: {
    type: String
  },
  Image: {
    type: Array

  }

})


const categorySchema = new mongoose.Schema({
  CategoryName: {
    type: String
  }
})
const couponSchema = new mongoose.Schema({
  Name:{
    type:String
  },
   Price:{
    type:String
  },

  Discription:{
    type:String
  }, 
   startDate:{
    type:String
  },
  endDate:{
    type:String
  }
})
const cartSchema = new mongoose.Schema({
  userid: mongoose.SchemaTypes.ObjectId,
  products: []
})
const walletSchema = new mongoose.Schema({
 
  user: {
    type: mongoose.Schema.Types.ObjectId,
  },
  Amount:{
    type:Number
  },
  
})
const orderSchema = new mongoose.Schema({
  deleveryDetails: {
    
    
   
  },
  orderId:{
    type:String
  },

  userId: {
    type: mongoose.Schema.Types.ObjectId,


  },
  paymentMethod: {
    type: String,

  },
  products: [{
    type: Array,

  }],
  status: {
    type: String

  },
  total: {
    type: String
  },
  discount: {
    type: String
  },
  date: {
    type: Date

  },
  cartId:{
    type: mongoose.Schema.Types.ObjectId
  }, 

  
})

const wishSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
  },
  wishitems: [{
    productId: { type: mongoose.Schema.Types.ObjectId },
  }],
  addedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = {
  user: mongoose.model('user', userschema),
  category: mongoose.model('Category', categorySchema),
  products: mongoose.model('products', productSchema),
  banner: mongoose.model('banner', bannerSchema),
  cart: mongoose.model('userCarts', cartSchema),
  order: mongoose.model('orders', orderSchema),
  coupon: mongoose.model('coupon', couponSchema),
  wishlist: mongoose.model('wishlist', wishSchema),
  address: mongoose.model('address', addressSchema),
  wallet: mongoose.model('wallet', walletSchema)
}