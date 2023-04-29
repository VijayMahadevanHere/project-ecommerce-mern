const express = require("express");
const router = express.Router();
const controller = require("../controller/usercontrol");
const userMiddleware = require("../middleware/middleware");
const db = require("../model/connection");
/* GET home page. */
router.get("/", userMiddleware.userBlocked, controller.getHome);

router.route("/login").get(controller.showLogin).post(controller.postLogin);

router.route("/signup").get(controller.showSignup).post(controller.postSignup);

router.get("/logout", controller.userlogout);

router.get("/otp", controller.otpLogin);
router.post("/otp", controller.postOtpLogin);

router.post("/otpnum", controller.postOtpVerify);

router.get("/cart", userMiddleware.userBlocked, controller.getCart);

router.get(
  "/add-to-cart/:id",
  userMiddleware.userBlocked,
  controller.addToCart
);

router.post("/change-product-quantity", controller.changeQuantity);

router.post("/remove-cart-item", controller.removeCartItem);

router.get("/place-order", userMiddleware.userBlocked, controller.orderDetails);
router.post("/place-order", userMiddleware.userBlocked, controller.placeOrder);
router.post(
  "/verify-payment",
  userMiddleware.userBlocked,
  controller.OrderSuccess
);

router.get("/orderList", userMiddleware.userBlocked, controller.getOrderList);

router.get(
  "/DeleteOrder/:id",
  userMiddleware.userBlocked,
  controller.DeleteOrder
);
router.get(
  "/orderDetails/:id",
  userMiddleware.userBlocked,
  controller.OrderProd
);
router.get("/orderPlaced", userMiddleware.userBlocked, controller.orderPlaced);

router.post("/apply-coupon", controller.applyCoupon);


router.post("/search", userMiddleware.userBlocked, controller.searchProducts);
router.post(
  "/filterCategory",
  userMiddleware.userBlocked,
  controller.categoryFilter
);
router.post("/sort", userMiddleware.userBlocked, controller.sortProducts);
router.get("/pagination", userMiddleware.userBlocked, controller.pagination);
router.get("/profile/:id", userMiddleware.userBlocked, controller.getProfile);
router.put("/profile/:id",controller.changeProfile);
router.get("/add_to_wishlist",userMiddleware.userBlocked,controller.getWishlist);
router.get('/view_wishlist',userMiddleware.userBlocked, controller.listWishList);
router.delete('/delete_wishlist',userMiddleware.userBlocked,controller.deleteWishList)
router.get("/new_address",userMiddleware.userBlocked,controller.getAddresspage)
router.post('/add_address',userMiddleware.userBlocked, controller.postAddresspage)
router.get('/returnOrder/:id',userMiddleware.userBlocked, controller.returnOrder)
router.get('/wallet',userMiddleware.userBlocked, controller.getWallet)
module.exports = router;

