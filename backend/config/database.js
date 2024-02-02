const mongoose = require("mongoose");

exports.connecttodatabase = () => {
  mongoose.connect(process.env.MONGO_URL,{


    useNewUrlParser: true, 
    useUnifiedTopology: true,
    family: 4,
    
  }).then((con)=>console.log(`Database is Connected :${con.connection.host}`)).catch((err)=>console.log(err))
};
