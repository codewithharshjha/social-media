const nodemailer=require("nodemailer")
exports.sendEmail=async (options)=>{
    const transpoter=nodemailer.createTransport({
        host: "sandbox.smtp.mailtrap.io",
        port: 2525,
        auth: {
          user: "6f24a2b8e2d5fc",
          pass: "********7a9c"
        }
    })
    const mailOptions={
                 from:process.env.SMPT_MAIL,
                 to:options.email,
                 subject:options.subject,
                 text:options.message
             }
             await transpoter.sendMail(mailOptions)
}