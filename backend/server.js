const app =require("./app")
const {connecttodatabase}=require("../backend/config/database")


const cloudinary=require("cloudinary")
cloudinary.config({
    cloud_name:process.env.CLOUDINARY_NAME,
    api_key:process.env.CLOUDINARY_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET
})


connecttodatabase()
app.listen(process.env.PORT,()=>{
    console.log(`server is running on PORT ${process.env.PORT}`)

})