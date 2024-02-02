const Post = require("../models/Post");
const User = require("../models/User");
const cloudinary=require("cloudinary")
exports.createPost = async (req, res, next) => {
  try {
    const myCloud=await cloudinary.v2.uploader.upload(req.body.image,{
      folder:"post"
  ,
    })
    // yai req.body.image isliyai kuki action folder mai post create krnai valai action mai hmnai image name sai bheji hai aur caption bhi bheja hai but sirf image he cloudinary pai upload hoga
    const newPostData = {
      caption: req.body.caption,
      image: {
        public_id: myCloud.public_id,
        url: myCloud.secure_url,
      },
      owner: req.user._id,
    };

    const post = await Post.create(newPostData);
    const user = await User.findById(req.user._id);
    user.posts.unshift(post._id);
    await user.save();
    res.status(201).json({
      success: true,
      message:"your post created"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
exports.deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(400).json({
        success: false,
        message: "post  not found",
      });
    }

    if (post.owner.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        success: false,
        message: "unauthorized",
      });
    }
     await cloudinary.v2.uploader.destroy(post.image.public_id)
    await post.deleteOne();
    const user = await User.findById(req.user._id);
    const index = user.posts.indexOf(req.params._id);
    user.posts.splice(index, 1);
    await user.save();
    res.status(200).json({
      success: true,
      message: "post deleted",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
exports.likeAndUnlikePost = async (req, res, next) => {
  const post = await Post.findById(req.params.id);
  try {
    if (post.likes.includes(req.user._id)) {
      if (!post) {
        return res.status(404).json({
          success: false,
          message: "user not found",
        });
      }
      // await post.likes.pull(req.user._id)
      const index = post.likes.indexOf(req.user._id);
      post.likes.splice(index, 1);
      await post.save();
      return res.status(200).json({
        success: true,
        message: "unliked",
      });
    } else {
      post.likes.push(req.user._id);
      await post.save();
      res.status(200).json({
        success: true,
        message: "like",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getPostofFollowing = async (req, res, next) => {
  //normalyy user kai following ka id sirf milega bu populate krnai sai pura following user ka sb kuch mil jayega
  try {
    const user = await User.findById(req.user._id);
    const posts = await Post.find({
      owner: {
        $in: user.following,
      },
    }).populate("owner  likes comments.user");
    res.status(200).json({
      success: true,
      posts:posts.reverse(),
      //this post.reverse because we want to send the latest post first
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
exports.updateCaption = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(400).json({
        success: false,
        message: "post not found",
      });
    }
    if (post.owner.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        success: false,
        message: "You are not authorized to perform this action",
      });
    }
    post.caption = req.body.caption;
    await post.save();
    res.status(200).json({
      success: true,
      message: "post  updated",
      post,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.addComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "post not found",
      });
    }

    let commentIndex = -1;
    //checking if comment already exists
    post.comments.forEach((item, index) => {
      if (item.user.toString() === req.user._id.toString()) {
        commentIndex = index;
      }
    });
    if (commentIndex !== -1) {
      post.comments[commentIndex].comment = req.body.comment;
      await post.save();
      return res.status(200).json({
        success: true,
        message: "comment updated",
      });
    } else {
      post.comments.push({
        comment: req.body.comment,
        user: req.user._id,
      });
    }

    await post.save();
    return res.status(200).json({
      success: true,
      message: "comment added sucessfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post does not exits",
      });
    }

    if (post.owner.toString() === req.user._id) {
      if (req.body.commentId === undefined) {
        return res.status(400).json({
          success: false,
          message: "commentId required",
        });
      }
      post.comments.forEach((item, index) => {
        if (item._id.toString() === req.body.commentId.toString()) {
          return post.comments.splice(index, 1);
        }
      });
      await post.save();
      res.status(200).json({
        success: true,
        message: " selected comment deleted",
      });
    } else {
      post.comments.forEach((item, index) => {
        if (item.user.toString() === req.user._id.toString()) {
          return post.comments.splice(index, 1);
        }
      });
      await post.save();
      return res.status(200).json({
        success: true,
        message: "comment deleted",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
