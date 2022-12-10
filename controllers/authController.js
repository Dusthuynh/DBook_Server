const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../Models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET);
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    httpOnly: true
  };
  if (process.env.NODE_ENV === 'production') {
    cookieOptions.secure = true;
  }

  res.cookie('jwt', token, cookieOptions);

  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  var user = await User.find({ email: req.body.email });
  user = user[0];
  if (user) {
    return next(new AppError('Email is valid', 409));
  }

  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt
  });

  createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // Kiem tra email voi password co dien vao khong
  if (!email || !password)
    return next(new AppError('Please provide email and password', 400));

  // Kiem tra user co ton tai khong, xac thuc mat khau
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password)))
    return next(new AppError('Incorrect email or password', 401));

  createSendToken(user, 200, res);
});

exports.logout = (req, res) => {
  console.log('da log out');
  res.cookie('jwt', 'loggedout', {
    httpOnly: true
  });
  res.status(200).json({ status: 'success' });
};

exports.protect = catchAsync(async (req, res, next) => {
  //Kiem tra co token khong
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new AppError('You are not logged in. Please log in to get access', 401)
    );
  }

  //Xac thuc token
  //do no lam ham bat dong bo, promisify giup no tro thanh mot promise
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  //Kiem tra user con ton tai khong
  const currentUser = await User.findById(decoded.id);
  if (!currentUser)
    return next(
      new AppError(
        'The user belonging to this token does no longer exist.',
        401
      )
    );

  //Kiem tra user co thay doi password sau khi lay token khong
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    console.log(currentUser.changedPasswordAfter(decoded.iat));
    return next(
      new AppError('User recently changed password. Please log in again.', 401)
    );
  }

  //protect thanh cong
  req.user = currentUser;
  next();
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  //lay user tu colection

  const user = await User.findById(req.user.id).select('+password');
  //kiem tra password hien tai
  const checkCorrectPassword = user.correctPassword(
    req.body.passwordCurrent,
    user.password
  );
  if (!checkCorrectPassword) {
    return next(
      new AppError('Your current password is wrong. Please try again.', 401)
    );
  }
  //neu dung, update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  //dang nhap user, gui jwt
  createSendToken(user, 200, res);
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }

    next();
  };
};
