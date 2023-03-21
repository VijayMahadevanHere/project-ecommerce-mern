var express = require('express');
const { getMaxListeners } = require("../app");
var router = express.Router();
const adminControl = require('../controller/admincontrol')
const adminHelper = require('../helpers/adminHelpers')
const db = require('../model/connection')
const multer = require('multer')
const photoload = require('../multer/multer');
const admincontrol = require('../controller/admincontrol');
const adminMiddleware = require('../middleware/middleware');

router.get('/', adminControl.showDashboard)

router.route('/login')
    .get(adminMiddleware.adminAuth,adminControl.getAdminLogin)
    .post(adminControl.postAdminLogin)


router.get('/logout', adminControl.adminLogout)

router.get('/view-users',adminMiddleware.adminAuth,adminControl.getUserlist)


router.get('/block-users/:id',adminControl.blockUser)

router.get('/unblock-users/:id',adminControl.unblockUser)

router.route("/add-product")
        .get(adminMiddleware.adminAuth,adminControl.addProducts)
         .post(photoload.uploads, adminControl.postProducts)


router.get('/view-product',adminMiddleware.adminAuth, adminControl.viewProducts)

router.route('/edit-product/:id')
        .get(adminControl.editProduct)

        .post(photoload.editeduploads,adminControl.post_EditProduct)


router.get('/add-category',adminMiddleware.adminAuth, adminControl.getCategory)


router.route("/edit-banner/:id")
      .get(admincontrol.editBanner)
      .post(photoload.editeduploads,admincontrol.post_EditBanner)



router.route("/add-banner")
      .get(adminMiddleware.adminAuth, adminControl.getBanner)
      .post(photoload.uploads, adminControl.postBanner)

router.post('/add-category',adminMiddleware.adminAuth, adminControl.postCategory)

router.get('/delete-category/:id', adminControl.deleteCategory)

router.get('/delete-product/:id',adminControl.deleteProduct)

router.get('/delete-banner/:id',adminControl.deleteBanner)



router.get('/view-banner',adminMiddleware.adminAuth,adminControl.viewBanner)









module.exports = router;