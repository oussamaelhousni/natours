const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const Email = require('../utils/email');

const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const appError = require('./../utils/appError');
// const { sendEmail } = require('./../utils/email');

// authorization check if a user has the right of access a certain resources even he logged in.

const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
};

const createSendToken = (res, statusCode, user) => {
    const token = signToken(user._id);
    const cookieOptions = {
        expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
    };

    //
    if (process.env.NODE_ENV === 'production') {
        cookieOptions.secure = true;
    }

    res.cookie('jwt', token, cookieOptions);

    // hide the password because of the creation and from the query
    user.password = undefined;

    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user,
        },
    });
};

exports.signup = catchAsync(async (req, res, next) => {
    // we manually set the infos that we need
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
    });
    // create a token for the user
    // const token = signToken(newUser._id)
    // res.status(201).json({
    //     status: 'success',
    //     token,
    //     data: {
    //         user: newUser,
    //     },
    // });
    const email = new Email(newUser, 'https://www.facebook.com');
    email.sendWelcome();
    createSendToken(res, 201, newUser);
});

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return next(
            new appError('Please provide the email and the password', 400)
        );
    }
    // the + allows us to access the none selected values on the schema
    const user = await User.findOne({ email: email }).select('+password');

    // 401 unauthorized
    if (!user || !(await user.comparePasswords(password, user.password))) {
        return next(new appError('The email or password is incorrect', 404));
    }

    const token = signToken(user._id);
    const cookieOptions = {
        expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
    };
    //
    if (process.env.NODE_ENV === 'production') {
        cookieOptions.secure = true;
    }
    res.cookie('jwt', token, cookieOptions);

    res.status(200).json({
        status: 'success',
        token,
    });
});

// logout
exports.logout = (req, res) => {
    res.cookie('jwt', 'User logged out', {
        httpOnly: true,
        expires: new Date(Date.now() + 10 * 1000),
    });
    return res.status(200).json({
        status: 'success',
    });
};
// this function check for the token
exports.protect = catchAsync(async (req, res, next) => {
    // check if the token present on the header
    let token;
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.jwt) {
        token = req.cookies.jwt;
    }
    if (!token) {
        return next(new appError(`You're not logged in, to get access`, 401));
    }

    // verify the token
    // if the token is invalid this will throw invalid signature
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // check if the user still exits
    const freshUser = await User.findById(decoded.id);
    if (!freshUser) {
        return next(
            new appError(
                'The user belongs to this token does no more exists',
                404
            )
        );
    }

    // check if the user change his password after the token was issued
    if (freshUser.changedPasswordAfter(decoded.iat)) {
        return next(
            new appError(
                'User recently changed his password! Please login',
                401
            )
        );
    }
    // Grant The Access
    req.user = freshUser;
    next();
});

// restrict non admin users from modifying the resources
exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        // if the user role it's not in the array we send an error
        if (!roles.includes(req.user.role)) {
            return next(
                new appError(
                    'you do not have the permission to perform this action',
                    403
                )
            );
        }
        next();
    };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
    // 1 - get the user base on the posted Email
    if (!req.body.email) {
        return next(new appError('please provide an email', 400));
    }

    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        return next(
            new appError('There is no user with this email address', 404)
        );
    }
    // 2 - generate random reset token
    const resetPasswordToken = user.createPasswordResetToken();
    // user.save({validateBeforeSave:false})
    await user.save();

    //
    const resetURL = `${req.protocol}://${req.get(
        'host'
    )}/api/v1/users/${resetPasswordToken}`;

    // const message = `Forgot your password! Please submit a patch request with the new password and confirm password to this url ${resetURL}`;
    try {
        const email = new Email(user, resetURL);
        email.sendResetPassword();
        res.status(200).json({
            status: 'success',
            message: 'token is sent to email',
        });
    } catch (err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpire = undefined;
        await user.save({ validateBeforeSave: false });
        return next(
            new appError(
                `there was an error sending the email. please try again later !`,
                400
            )
        );
    }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
    console.log('in reset');
    // 1 - Get User Based on the token
    const hashToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');
    // good way to check the expiration of the token and the token
    const user = await User.findOne({
        passwordResetToken: hashToken,
        passwordResetExpire: { $gt: Date.now() },
    });
    console.log('user founded');
    // 2 - if the token not expired and the user exist set the new password
    if (!user) {
        return next(new appError('Token is invalid or has expired', 400));
    }

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpire = undefined;
    console.log('before user saved');
    await user.save();
    console.log('after user saved');
    // log the user in
    const token = signToken(user._id);

    res.status(200).json({
        status: 'success',
        token,
    });
});

exports.updatePassword = catchAsync(async (req, res, next) => {
    // get the user from the collection
    const user = User.findById(req.user.id).select('+password');

    // check if the password is correct
    if (user.comparePasswords(req.body.currentPassword, user.password)) {
        return next(new appError('The current password is wrong', 401));
    }

    this.password = req.body.password;
    this.passwordConfirm = req.body.passwordConfirm;
    await user.save();

    // Generate new token
    const token = signToken(user._id);
    res.status(201).json({
        status: 'success',
        token,
    });
});

exports.isLoggedIn = catchAsync(async (req, res, next) => {
    // check for the jwt
    if (req.cookies && req.cookies.jwt) {
        console.log('my jwt', req.cookies);
        try {
            const decoded = await promisify(jwt.verify)(
                req.cookies.jwt,
                process.env.JWT_SECRET
            );

            // if the jwt is correct get the  user
            const loggedInUser = await User.findById(decoded.id);
            if (!loggedInUser) return next();

            // check if the user change his password after the token was issued
            if (loggedInUser.changedPasswordAfter(decoded.iat)) {
                return next();
            }

            // there is a logged in user
            // pass the user variavle to  all templates
            res.locals.user = loggedInUser;
        } catch (error) {
            return next();
        }
    }

    next();
});
