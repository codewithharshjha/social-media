const express = require("express");
const {
  registerUser,
  login,
  followUser,
  logout,
  updatePassword,
  updateProfile,
  deleteMyProfile,
  myProfile,
  getUserPofile,
  getAllUsers,
  forgotPassword,
  resetPassword,
  getMyPosts,
  getUserPosts,
} = require("../controllers/Usercontroller");
const { isAuthenticated } = require("../middleware/auth");

const router = express.Router();

router.route("/register").post(registerUser);
router.route("/login").post(login);
router.route("/logout").get(isAuthenticated, logout);
router.route("/update/password").put(isAuthenticated, updatePassword);
// router.route("/follow/:id").get(isAuthenticated,followUser)
router.route("/update/profile").put(isAuthenticated, updateProfile);
router.route("/follow/:id").get(isAuthenticated, followUser);
router.route("/delete/me").delete(isAuthenticated, deleteMyProfile);
router.route("/me").get(isAuthenticated, myProfile);
router.route("/user/:id").get(isAuthenticated, getUserPofile);
router.route("/users").get(isAuthenticated, getAllUsers);
router.route("/forgot/password").post(forgotPassword);
router.route("/password/reset/:token").put(resetPassword);
router.route("/my/posts").get(isAuthenticated, getMyPosts);
router.route("/userposts/:id").get(isAuthenticated, getUserPosts);
module.exports = router;
