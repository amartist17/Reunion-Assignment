const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  date: { type: Date, default: Date.now },
});

// Hash password before saving
userSchema.pre("save", async function (next) {
  try {
    if (!this.isModified("password")) {
      return next();
    }
    const hashedPassword = await bcrypt.hash(this.password, 10);
    this.password = hashedPassword;
    return next();
  } catch (err) {
    return next(err);
  }
});

// Check password
userSchema.methods.passwordCheck = async function (password) {
  try {
    return await bcrypt.compare(password, this.password);
  } catch (err) {
    throw err;
  }
};

userSchema.methods.addPost = async function (postId) {
  try {
    // Check if post ID already exists in user's posts array
    if (this.posts.includes(postId)) {
      throw new Error("Post ID already exists in user's posts array");
    }

    // Add post ID to user's posts array and save updated user object to the database
    this.posts.push(postId);
    await this.save();

    return this;
  } catch (err) {
    throw err;
  }
};

// Method to remove post ID from user's posts array
userSchema.methods.removePost = async function (postId) {
  try {
    // Check if post ID exists in user's posts array
    if (!this.posts.includes(postId)) {
      return "Post ID not found in user's posts array";
    }

    // Remove post ID from user's posts array and save updated user object to the database
    this.posts = this.posts.filter((id) => id.toString() !== postId.toString());
    await this.save();

    return this;
  } catch (err) {
    throw err;
  }
};

userSchema.methods.follow = async function (userId) {
  try {
    // Check if post ID already exists in user's posts array
    if (this.following.includes(userId)) {
      return "You have already followed this user";
    }

    // Add post ID to user's posts array and save updated user object to the database
    this.following.push(userId);
    await this.save();
    let doc = await User.findById(userId);
    doc.followers.push(this._id);
    await doc.save();
    return "Followed";
  } catch (err) {
    return err;
  }
};

userSchema.methods.unfollow = async function (userId) {
  try {
    // Check if post ID already exists in user's posts array
    if (!this.following.includes(userId)) {
      return "You are not following this user";
    }

    // Add post ID to user's posts array and save updated user object to the database
    this.following.pop(userId);
    await this.save();
    let doc = await User.findById(userId);
    doc.followers.pop(this._id);
    await doc.save();
    return "Unfollowed";
  } catch (err) {
    return err;
  }
};

const User = mongoose.model("User", userSchema);

module.exports = User;
