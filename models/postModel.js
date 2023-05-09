const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  title: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, default: Date.now },
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});

postSchema.methods.addlike = async function (userId) {
  try {
    // Check if post ID already exists in user's posts array
    if (this.likes.includes(userId)) {
      return "Already liked";
    }

    // Add post ID to user's posts array and save updated user object to the database
    this.likes.push(userId);
    await this.save();

    return "Liked";
  } catch (err) {
    return "Error Occured";
  }
};

postSchema.methods.dislike = async function (userId) {
  try {
    if (!this.likes.includes(userId)) {
      return "You havent liked this post";
    }

    this.likes.pop(userId);
    await this.save();

    return "Disliked";
  } catch (err) {
    return "Error Occured";
  }
};

postSchema.methods.comment = async function (commentId) {
  try {
    // Check if post ID already exists in user's posts array
    // if (this.likes.includes(userId)) {
    //   return "Already liked";
    // }

    // Add post ID to user's posts array and save updated user object to the database
    this.comments.push(commentId);
    await this.save();

    return "Commented";
  } catch (err) {
    return "Error Occured";
  }
};

postSchema.methods.getPost = async function () {
  try {
    // Get number of comments on post
    // const numComments = await Comment.countDocuments({ post: this._id });

    // Get number of likes on post
    // const numLikes = this.likes.length;

    // Return post object with likes and comments count
    return {
      _id: this._id,
      // user: this.user,
      // title: this.title,
      // description: this.description,
      // date: this.date,
      // comments: this.comments,
      // likes: this.likes,
      comments: this.comments.length,
      likes: this.likes.length,
    };
  } catch (err) {
    console.log(err);
    return "Post does'nt exists ";
  }
};

const Post = mongoose.model("Post", postSchema);

module.exports = Post;
