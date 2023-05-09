const User = require("./../models/userModel");
const Post = require("./../models/postModel");
const Comment = require("./../models/commentModel");
const { findById } = require("./../models/userModel");

exports.createPost = async (req, res, next) => {
  try {
    let user = await User.findById(req.user._id);
    req.body.user = req.user._id;
    // await User.findByIdAndUpdate(req.user._id);
    let post = await Post.create(req.body);
    let newPost = await Post.findById(post._id).select([
      "_id",
      "title",
      "description",
      "date",
    ]);
    user.addPost(newPost._id);
    return res.json(newPost);
  } catch (err) {
    return res.json({ message: err.message });
  }
};

exports.deletePost = async (req, res, next) => {
  try {
    let post = await Post.findById(req.params.id);
    if (post.user == req.user.id) {
      const deletedPost = await Post.findOneAndDelete({ _id: req.params.id });
      let user = await User.findById(req.user._id);
      user.removePost(post._id);
      return res.json({ message: "Deleted" });
    }
    return res.json({ message: "Authorization Denied." });
  } catch (err) {
    return res.json({ message: "Post doesnt exist" });
  }
};

exports.getPost = async (req, res, next) => {
  try {
    //   req.body.user = req.user._id;
    //   let newComment = await Comment.create(req.body);
    //   let commentId = newComment._id;
    //   let post = await Post.findById(req.params.id);
    //   post.comment(commentId);
    let post = await Post.findById(req.params.id);
    result = await post.getPost(req.params.id);
    return res.json({ result });
  } catch (err) {
    console.log(err);
    return res.json({ message: "Post doesnt exist" });
  }
};

exports.getAllPost = async (req, res, next) => {
  try {
    let posts = await Post.find({ user: req.user._id })
      .select(["-user", "- __v"])
      .sort("-date")
      .populate("comments");
    // posts.filter((post) => post.user == req.user._id);

    return res.json({ posts });
  } catch (err) {
    console.log(err);
    return res.json({ message: "Error Occured" });
  }
};

exports.likePost = async (req, res, next) => {
  try {
    let post = await Post.findById(req.params.id);

    let result = await post.addlike(req.user._id);
    return res.json({ message: result });
  } catch (err) {
    return res.json({ message: "Post doesnt exist" });
  }
};

exports.dislikePost = async (req, res, next) => {
  try {
    let post = await Post.findById(req.params.id);

    let result = await post.dislike(req.user._id);
    console.log(result);
    return res.json({ message: result });
  } catch (err) {
    return res.json({ message: "Post doesnt exist" });
  }
};

exports.comment = async (req, res, next) => {
  try {
    req.body.user = req.user._id;
    let newComment = await Comment.create(req.body);
    let commentId = newComment._id;
    let post = await Post.findById(req.params.id);
    post.comment(commentId);
    return res.json({ id: commentId });
  } catch (err) {
    return res.json({ message: "Post doesnt exist" });
  }
};

exports.follow = async (req, res, next) => {
  try {
    let user = await User.findById(req.user._id);
    let result = await user.follow(req.params.id);

    return res.json({ result: "Followed" });
  } catch (err) {
    console.log(err);
    return res.json({ message: "Error Occured" });
  }
};

exports.unfollow = async (req, res, next) => {
  try {
    let user = await User.findById(req.user._id);
    let result = await user.unfollow(req.params.id);
    return res.json({ result });
  } catch (err) {
    console.log(err);
    return res.json({ message: "Error Occured" });
  }
};

exports.user = async (req, res, next) => {
  try {
    let user = await User.findById(req.user._id).select([
      "name",
      "following",
      "followers",
    ]);
    return res.json({
      username: user.name,
      following: user.following.length,
      followers: user.followers.length,
    });
  } catch (err) {
    console.log(err);
    return res.json({ message: "Error Occured" });
  }
};
