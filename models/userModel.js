const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcryptjs = require('bcryptjs');

// The user Schema
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'please enter a name'],
    },
    email: {
        type: String,
        unique: true,
        required: [true, 'please enter the email'],
        lowercase: true,
        validate: [validator.isEmail, 'please provide a valid email'],
    },
    photo: String,
    role: {
        type: String,
        enum: ['user', 'guide', 'lead-guide', 'admin'],
        default: 'user',
    },
    password: {
        type: String,
        required: [true, 'please enter a password'],
        minlength: 8,
        select: false,
    },
    passwordConfirm: {
        type: String,
        required: [true, 'please enter a password'],
        validate: {
            // this only works on create or save
            validator: function (val) {
                return this.password === val;
            },
            message: 'passwords are not the same',
        },
        select: false,
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpire: Date,
    active: {
        type: Boolean,
        default: true,
        select: false,
    },
});

// after the user signing up or modified the password
//we need to Hash The Password
userSchema.pre('save', async function (next) {
    // only run when the password was actually modified
    // check if the field is modified
    if (!this.isModified('password')) {
        return next();
    }
    // Hash the password
    this.password = await bcryptjs.hash(this.password, 12);
    this.passwordConfirm = undefined;
    next();
});

// an instance method

// check if the token is older than the password
// if the the token is older than the password that's mean the user changed his password and still work with the old token
userSchema.methods.changedPasswordAfter = function changedPasswordAfter(
    JWTTimestamp
) {
    if (this.passwordChangedAt) {
        const changeTimestamp = parseInt(
            this.passwordChangedAt.getTime() / 1000,
            10
        );
        return JWTTimestamp < changeTimestamp;
    }
    return false;
};

userSchema.methods.comparePasswords = async function (
    candidatePassword,
    userPassword
) {
    return await bcryptjs.compare(candidatePassword, userPassword);
};
//
userSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');
    this.passwordResetExpire = new Date(Date.now() + 10 * 60 * 1000);
    return resetToken;
};

userSchema.pre('save', function (next) {
    if (!this.isModified('password') || this.isNew) return next();
    this.passwordChangedAt = Date.now() - 1000;
    next();
});

// find only the active users
userSchema.pre(/$find/, function (next) {
    this.find({ active: { $ne: false } });
    next();
});
// create the model from the userSchema
const User = mongoose.model('User', userSchema);

module.exports = User;
