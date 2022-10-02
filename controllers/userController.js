const multer = require('multer');
const User = require('../models/userModel');
const factory = require('./factory');
const appError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const sharp = require('sharp');

const filterObject = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach((key) => {
        if (allowedFields.includes(key)) {
            newObj[key] = obj[key];
        }
    });
    return newObj;
};

exports.getAllUsers = catchAsync(async (req, res, next) => {
    const users = await User.find({});
    console.log(users);
    res.status(200).json({
        status: 'success',
        results: users.length,
        data: {
            users,
        },
    });
});

exports.getUser = (req, res) => {
    res.status(500).json({
        status: 'fail',
        message: "this part it's not defined yet",
    });
};

exports.updateUser = factory.updateOne(User);

exports.patchUser = (req, res) => {
    res.status(500).json({
        status: 'fail',
        message: "this part it's not defined yet",
    });
};

exports.deleteUser = (req, res) => {
    res.status(500).json({
        status: 'fail',
        message: "this part it's not defined yet",
    });
};

exports.createUser = (req, res) => {
    res.status(500).json({
        status: 'fail',
        message: "this part it's not defined yet",
    });
};

exports.updateMe = catchAsync(async (req, res, next) => {
    // 1 - create an error if a user send password or password confirm
    if (req.body.password || req.body.passwordConfirm) {
        return next(
            new appError(
                'You can not update the password on this route! please go to /updateMyPassword'
            )
        );
    }

    // 2 - update the document
    const filteredBody = filterObject(req.body, 'name', 'email');
    if (req.file) filteredBody.photo = req.file.filename;
    const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        filteredBody,
        { new: true, runValidators: true }
    );

    res.status(200).json({
        status: 'success',
        data: {
            user: updatedUser,
        },
    });
});

// we never delete a user we just set his status to inactive
exports.deleteMe = catchAsync(async (req, res, next) => {
    await User.findByIdAndUpdate(req.user._id, { active: false });
    res.status(204).json({
        status: 'success',
        data: null,
    });
});

/* const multerStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/img/users');
    },
    filename: (req, file, cb) => {
        const ext = file.mimetype.split('/')[1];
        cb(null, `user-${req.user._id}-${Date.now()}.${ext}`);
    },
}); */

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
    if (!file.mimetype.startsWith('image')) {
        return cb(
            new appError('Not an image please upload only images', 400),
            false
        );
    }
    cb(null, true);
};
const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter,
});

exports.uploadUserPhoto = upload.single('photo');
exports.resizeUserPhoto = (req, res, next) => {
    console.log('hey', req.file);
    if (!req.file) return next();
    req.file.filename = `user-${req.user._id}-${Date.now()}.jpeg`;
    sharp(req.file.buffer)
        .resize(500, 500)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/users/${req.file.filename}`);
    next();
};
