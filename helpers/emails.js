const nodemailer = require("nodemailer");
const pug = require("pug");
const path = require("path");

const TEMPLATE_DIR = path.join(__dirname, "/../src/views/emails_templates/");

/* send mails config */
const transporter = nodemailer.createTransport({
      service: "gmail",
    // host: "smtp.googlemail.com",
    // port: 465,
    //   secure: false,
    //   ignoreTLS: true,
    auth: {
        user: process.env.EMAIL_LOGIN,
        pass: process.env.EMAIL_PASSWORD
    }
  })




/* reset password Email*/
 const resetPasswordTemplate = (user, url) => {
    const from = process.env.EMAIL_LOGIN
    const to = user.email
    const subject = "Password Reset"
    const data = {user:user,url:url};

    var html = pug.renderFile(TEMPLATE_DIR+"/forgot_password.pug", data);
    
    return { from, to, subject, html }
  }
  module.exports={
    transporter,
    resetPasswordTemplate
  }