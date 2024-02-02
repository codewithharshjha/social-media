const express=require("express")
const { createPost, likeAndUnlikePost, deletePost, getPostofFollowing, updateCaption, addComment, deleteComment } = require("../controllers/Postcontroller")
const { isAuthenticated } = require("../middleware/auth")
const router=express.Router()
router.route("/post/upload").post( isAuthenticated,  createPost)

router.route("/post/:id").get(isAuthenticated,likeAndUnlikePost)
router.route("/post/:id").delete(isAuthenticated,deletePost)
router.route("/posts").get(isAuthenticated,getPostofFollowing)
router.route("/post/:id").put(isAuthenticated,updateCaption)
router.route("/post/comment/:id").put(isAuthenticated,addComment)
router.route("/post/comment/:id").delete(isAuthenticated,deleteComment)
module.exports=router