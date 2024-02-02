const User=require("../models/User")
const crypto=require("crypto")


const sendEmail=require("../middleware/sendagainEmail")

const Post=require("../models/Post")
const cloudinary=require("cloudinary")
exports.registerUser=async (req,res,next)=>{


try {
    const {name,email,password,avatar}=req.body
    let user=await User.findOne({email})
    if(user){
        return res.status(404).json({
            success:false,
            message:"user already exits"
        })
    }
    const myCloud=await cloudinary.v2.uploader.upload(avatar,{
        folder:"avatar",
    })
     user =await User.create({
        name,email,password ,avatar:{
            public_id:myCloud.public_id,
            url:myCloud.secure_url
        }
     })

     const token=await user.generateToken()
     res.status(200).cookie("token",token,{
         expires:new Date(Date.now()+90*24*60*60*1000),
         httpOnly:true
     }).json({
         success:true,
         token,
         user
     })
        
     
} catch (error) {
    res.status(500).json({
        success:false,
        message:error.message
    })
}


}
exports.login=async (req,res,next)=>{
    try {
        const {email,password}=req.body
        const user=await User.findOne({email}).select("+password").populate("follower following posts")
        if(!user){
            return res.status(401).json({
                message:'user not exist'
            })
        }
        const isMatch=await user.matchPassword(password)
        if(!isMatch){
            return res.status(400).json({
                success:false,
                message:"incorrect password"
            })

        }
        const token=await user.generateToken()
        res.status(200).cookie("token",token,{
            expires:new Date(Date.now()+90*24*60*60*1000),
            httpOnly:true
        }).json({
            success:true,
            token,
            user
        })
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message:error.message
        }) 
    }
}

exports.logout=async(req,res)=>{
 try {
    res.status(200).cookie("token",null,{
        expires:new Date(Date.now()),httpOnly:true
    }).json({
        success:true,
        message:"logout successfully"
    })
 } catch (error) {
    res.status(500).json({
        success: false,
        message:error.message
    }) 
 }   
}


exports.followUser=async (req,res,next)=>{
    try {
        const usertoFollow=await User.findById(req.params.id)

        const loggedinUser=await User.findById(req.user._id)
          
        if(!usertoFollow){
            return res.status(404).json({
                success:false,
                message:"user not found"
            })
        }
        if(loggedinUser.following.includes(usertoFollow._id)){

const indexfollowing=loggedinUser.following.indexOf(usertoFollow._id)
loggedinUser.following.splice(indexfollowing,1)
const indexfollower=usertoFollow.follower.indexOf(loggedinUser._id)
usertoFollow.follower.splice(indexfollower,1)
await usertoFollow.save()
await loggedinUser.save()

res.status(200).json({
    success:true,
    message:"User Unfollowed"
})
        }

        else{
            loggedinUser.following.push(usertoFollow._id)
            usertoFollow.follower.push(loggedinUser._id)
            await loggedinUser.save()
            await usertoFollow.save()
            res.status(200).json({
                success:true,
                message:"User followed"
            })

        }
       
        



    } catch (error) {
        res.status(500).json({
            success:false,
            message:"error.message"
        })          
    }
 
}
exports.updatePassword=async(req,res,next)=>{


    try {
        const user=await User.findById(req.user._id).select("+password")
        const {oldPassword,newPassword}=req.body
        if(!oldPassword||!newPassword){
            return res.status(400).json({
                success:false,
                message:"please provide old and new password"
            })
        }
        const isMatch=await user.matchPassword(oldPassword)
        if(!isMatch){
            return res.status(401).json({
                success:false,
                message:'please entre the correct password'
            })
           
        }
        user.password=newPassword
        await user.save()
        res.status(200).json({
            success:true,
            message:"password change successfully"
        })
    } catch (error) {
        res.status(500).json({
            success:false,
            message:error.message
        })  
    }
}

exports.updateProfile=async(req,res,next)=>{
    try {
        const user=await User.findById(req.user._id)
        const {name,email,avatar}=req.body
        if(name){
            user.name=name
        }
        if(email){
            user.email=email
        }
if(avatar){
    await cloudinary.v2.uploader.destroy(user.avatar.url)
    const myCloud=await cloudinary.v2.uploader.upload(avatar,{
        folder:"avatars"
    })
    user.avatar.public_id=myCloud.public_id
    user.avatar.url=myCloud.secure_url
}
        await user.save()
        res.status(200).json({
            success:true,
            message:"profile change successfully"
        })
    } catch (error) {
        res.status(500).json({
            success:false,
            message:error.message
        })  
        
    }
}
exports.deleteMyProfile=async(req,res)=>{

    try {
        
        const user= await User.findById(req.user._id)
        const followers=user.follower
        const followings=user.following
        const posts=user.posts
        const userId=user._id
        await cloudinary.v2.uploader.destroy(user.avatar.public_id)
        await user.deleteOne()
        //logout after deleting the account
        res.cookie("token",null,{
            expires:new Date(Date.now()),httpOnly:true
        })
        //removing this user from all the follower and following

for(let i =0; i<followers.length;i++){
    const follows=await User.findById(followers[i])
const index=follows.following.indexOf(userId)
follows.following.splice(index,1)
await follows.save()

}
for(let i=0; i<followings.length;i++){
const following=await User.findById(followings[i])
const index=following.follower.indexOf(userId)
following.follower.splice(index,1)
await following.save()
}



        for(let i=0;i<posts.length;i++){
            const post=await Post.findById(posts[i])
            await cloudinary.v2.uploader.destroy(post.image.public_id)
            await post.deleteOne()

        }
        //removing comment
        const allPosts=await Post.find()
        for(leti=0; i<allPosts.length;i++){
            const post=await Post.findById(allPosts[i]._id)
            for(let j=0;j<post.comments.length;i++){
                if(post.comments[i].user===userId){
                    post.comments.splice(j,1)
              post.comments.save()
                }
                await post.save
            }
        }

//removing likes
for(leti=0; i<allPosts.length;i++){
    const post=await Post.findById(allPosts[i]._id)
    for(let j=0;j<post.likes.length;i++){
        if(post.likes[j]===userId){
            post.likes.splice(j,1)
      post.likes.save()
        }
        await post.save
    }
}


        res.status(200).json({
            sucess:true,
            message:"Profile deleted"
        })
    } catch (error) {
        res.status(500).json({
            success:false,
            message:error.message
        })
    }0
}


exports.myProfile=async(req,res,next)=>{

try {
    const user=await User.findById(req.user._id).populate("posts following follower")

    res.status(201).json({
        sucess:true,
        user
    })
    
} catch (error) {
    res.status(500).json({
        success:false,
        message:error.message
    })   
}

}



exports.getUserPofile=async(req,res)=>{

try {
 
 
    const user=await User.findById(req.params.id).populate("posts follower following")
    if(!user){
        return res.status(404).json({
            success:false,
            message:"User not found"
        })
    }
    res.status(200).json({
        success:true,
        user
    })
    
} catch (error) {
    res.status(500).json({
        success:false,
        message:error.message
    })
}

}

exports.getAllUsers=async(req,res)=>{
    try {
        const users=await User.find({
          name:
            {$regex:req.query.name,$options:"i"}     
      }  )
        res.status(200).json({
            success:true,
            users
        })
    } catch (error) {
        res.status(500).json({
            success:false,
            message:error.message
        })
    }
}
exports.forgotPassword=async(req,res)=>{


    try {
        const user = await User.findOne({ email: req.body.email })
        if(!user){
            return res.status(404).json({
                success:false,
                message:"User does not exits"
            })
        }

    const resetpasswordToken=user.getresetPasswordToken()
    //resetpasswordToken ek simple token return krega
    const resetUrl=`{req.protocol}://${req.get("host")}/password/reset/${resetpasswordToken}`
    const message=`Reset Your password by clicking on the link below \n\n ${resetUrl}`
    try{
        await sendEmail({email:user.email,subjct:"Reset Password",message})
        res.status(200).json({
            successs:true,
            message:"Email send"
        })
// await sendEmail({email:user.email,subject:"Reset email",message})
// res.status(200).json({
//     success:true,
//     message:`Email is sent to ${user.email}`

// 

    }
    catch(error){
        user.resetPasswordExpire=undefined,
        user.resetPasswordToken=undefined
res.status(500).json({
    sucess:false,
    message:error.message
})
    }
    await user.save()

        
    } catch (error) {
        res.status(500).json({
            success:false,
            message:error.message
        })
    }
}


exports.resetPassword=async(req,res)=>{
    try {
        
        const resetPasswordToken=crypto.createHash("sha256").update(req.params.token).digest("hex")
        const user=await User.findOne({

            resetPasswordToken,
            resetPasswordExpire:{$gt:Date.noew()},

        })
        if(!user){
            return res.status(401).json({
                success:false,
                message:"Token is invalid or has expired"
                
            })
        }
        user.password=req.body.password
        await user.save()
        res.status(200).json({
            sucess:true,
            message:"your password is updated"
        })
    } catch (error) {
        res.status(500).json({
            sucess:false,
            message:error.message
        }) 
    }
}
exports.getUserPofile=async(req,res)=>{

    try {
     
     
        const user=await User.findById(req.params.id).populate("posts")
        if(!user){
            return res.status(404).json({
                success:false,
                message:"User not found"
            })
        }
        res.status(200).json({
            success:true,
            user
        })
        
    } catch (error) {
        res.status(500).json({
            success:false,
            message:error.message
        })
    }
    
    }
    
    exports.getMyPosts=async(req,res)=>{
        try {
            const user=await User.findById(req.user._id)
            const posts=[]
            for(let i=0;i<user.posts.length;i++){
                const post=await Post.findById(user.posts[i]).populate("likes comments.user owner")
                posts.push(post)
            }
            res.status(200).json({
                success:true,
                posts
                
            })
        } catch (error) {
            res.status(500).json({
                success:false,
                message:error.message
            })
        }
    }
    exports.getUserPosts=async(req,res)=>{
        try {
            const user=await User.findById(req.params.id)
            const posts=[]
            for(let i=0;i<user.posts.length;i++){
                const post=await Post.findById(user.posts[i]).populate("likes comments.user owner")
                posts.push(post)
            }
            res.status(200).json({
                success:true,
                posts
                
            })
        } catch (error) {
            res.status(500).json({
                success:false,
                message:error.message
            })
        }
    }