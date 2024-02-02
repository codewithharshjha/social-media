const express = require("express")
const post=require("../backend/routes/Postroutes")

const user=require("./routes/Userroute")
const cookieparser=require("cookie-parser")
if(process.env.NODE_ENV!=="production"){
    
    require("dotenv").config({path:"backend/config/config.env"})
}
const app=express()



//middleware


app.use(express.json({limit:"100mb"}))
app.use(express.urlencoded({ limit:"100mb" ,extended:true}))
app.use(cookieparser())
app.use("/api/v1/",post)
app.use("/api/v1",user)
module.exports=app