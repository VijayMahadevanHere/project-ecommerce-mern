const multer = require('multer');
const path = require('path');

const imageFilter = (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Only images are allowed'))
    }
};

const Storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

const editedStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

module.exports = {
    uploads: multer({ storage: Storage, fileFilter: imageFilter }).array('Image', 3),
    editeduploads: multer({ storage: editedStorage, fileFilter: imageFilter }).fields([
        { name: 'image1', maxCount: 1 },
        { name: 'image2', maxCount: 1 }
    ])
};

