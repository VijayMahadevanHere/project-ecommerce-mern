const express = require("express");
const router = express.Router();
const adminControl = require("../controller/admincontrol");
const photoload = require("../multer/multer");
const admincontrol = require("../controller/admincontrol");
const adminMiddleware = require("../middleware/middleware");

router.get("/",adminMiddleware.adminAuth, adminControl.getDashboard);

router
  .route("/login")
  .get(adminMiddleware.adminAuth, adminControl.getAdminLogin)
  .post(adminControl.postAdminLogin);

router.get("/logout", adminControl.adminLogout);

router.get("/view-users", adminMiddleware.adminAuth, adminControl.getUserlist);

router.get("/block-users/:id", adminControl.blockUser);

router.get("/unblock-users/:id", adminControl.unblockUser);

router
  .route("/add-product")
  .get(adminMiddleware.adminAuth, adminControl.addProducts)
  .post(photoload.uploads, adminControl.postProducts);

router.get(
  "/view-product",
  adminMiddleware.adminAuth,
  adminControl.viewProducts
);

router
  .route("/edit-product/:id")
  .get(adminControl.editProduct)
  .post(photoload.editeduploads, adminControl.post_EditProduct);

router.get(
  "/add-category",
  adminMiddleware.adminAuth,
  adminControl.getCategory
);

router.post(
  "/add-category",
  adminMiddleware.adminAuth,
  adminControl.postCategory
);

router
  .route("/edit-banner/:id")
  .get(admincontrol.editBanner)
  .post(photoload.editeduploads, admincontrol.post_EditBanner);

router
  .route("/add-banner")
  .get(adminMiddleware.adminAuth, adminControl.getBanner)
  .post(photoload.uploads, adminControl.postBanner);

router.get("/delete-category/:id", adminControl.deleteCategory);

router.get("/delete-product/:id", adminControl.deleteProduct);

router.get("/delete-banner/:id", adminControl.deleteBanner);
router.get("/orderDetails/:id",adminMiddleware.adminAuth,adminControl.OrderDetails);
router.get("/view-banner", adminMiddleware.adminAuth, adminControl.viewBanner);
router.get("/coupon", adminMiddleware.adminAuth, adminControl.showaddCoupon);
router.post("/coupon", adminMiddleware.adminAuth, adminControl.addCoupon);
router.get("/view-coupon", adminMiddleware.adminAuth, adminControl.viewCoupon);
router.get("/orderList", adminMiddleware.adminAuth, adminControl.viewOrderList);
router.get(
  "/sales_report",
  adminMiddleware.adminAuth,
  adminControl.getSalesReport 
);
router.post(
  "/sales_report",
  adminMiddleware.adminAuth,
  adminControl.postSalesReport
);

router.get(
  "/category-discount",
  adminMiddleware.adminAuth,
  adminControl.viewCatdiscount
);
router.get("/apply_offer",adminControl.applyOffer)
 
router.get('/apply_offer/:id',adminControl.getAddOffer)
router.post('/apply_offer/:id',adminControl.PostAddOffer)
router.get('/shipOrder/:id',adminControl.shipOrder)
router.get('/deliverOrder/:id',adminControl.deliverOrder)


router.get(
  "/cancelOrder/:id",
  adminMiddleware.adminAuth,
  adminControl.DeleteOrder
);

module.exports = router;
