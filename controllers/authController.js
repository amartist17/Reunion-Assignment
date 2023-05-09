const { promisify } = require("util");
const User = require("./../models/userModel");
// const APIFeatures = require('./../utils/apifeatures');
// const catchAsync = require("./../utils/catchAsync");
// const AppError = require("./../utils/appError");
// const SendEmail = require('./../utils/email');
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { token } = require("morgan");
const { findByIdAndUpdate } = require("./../models/userModel");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  let cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  res.cookie("jwt", token, cookieOptions);
  res.json({ token });
};

exports.login = async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.render("error", {
      status: 400,
      message: "Please provide email and password",
    });

  let user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.passwordCheck(password, user.password)))
    // return next(new AppError("Invalid email or password", 401));
    return res.render("error", {
      status: 401,
      message: "Invalid email or password",
    });
  createSendToken(user, 200, res);
};

exports.protect = async (req, res, next) => {
  // 1) If token exists
  let token;
  token = req.cookies.jwt;
  if (!token) return res.redirect("/login");

  // 2) I token is valid
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  console.log(decoded);

  //   3) Check if user still exists (not deleted)
  const currentUser = await User.findById(decoded.id);
  if (!currentUser)
    return res.render("error", {
      status: 401,
      message: "User belonging to this token doesn't Exist",
    });

  req.user = currentUser;
  next();
};

// exports.signup = async (req, res, next) => {
//   try {
//     const newUser = await User.create({
//       name: req.body.name,
//       email: req.body.email,
//       password: req.body.password,
//     });
//     // createSendToken(newUser, 201, res);
//   } catch (err) {
//     console.log(err);
//     return res.json({
//       status: 400,
//       err,
//     });
//   }
// };
