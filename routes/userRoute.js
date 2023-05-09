const express = require("express");
const authController = require("./../controllers/authController");
const userController = require("./../controllers/userController");

const router = express.Router({ mergeParams: true });

// router.route("/signup").post(authController.signup);
router.route("/authenticate").post(authController.login);

// router.get("/dashboarduser", authController.protect, userController.user);

router.route("/follow/:id").post(authController.protect, userController.follow);
router
  .route("/unfollow/:id")
  .post(authController.protect, userController.unfollow);

router.route("/user").get(authController.protect, userController.user);

// posts
router.route("/posts").post(authController.protect, userController.createPost);
router
  .route("/posts/:id")
  .delete(authController.protect, userController.deletePost)
  .get(authController.protect, userController.getPost);
router
  .route("/all_posts")
  .get(authController.protect, userController.getAllPost);

router.route("/like/:id").post(authController.protect, userController.likePost);
router
  .route("/unlike/:id")
  .post(authController.protect, userController.dislikePost);

router
  .route("/comment/:id")
  .post(authController.protect, userController.comment);

module.exports = router;
