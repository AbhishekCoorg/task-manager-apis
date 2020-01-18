const sendGridAPIKey = ''
const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeMail = (email,name) => {

    sgMail.send({
        to : email,
        from : "abhishek.bb.coorg@gmail.com",
        subject : "Welcome",
        text : `Welcome ${name}`
    })
}

const sendCancellationMail = (email,name) => {

    sgMail.send({
        to : email,
        from : "abhishek.bb.coorg@gmail.com",
        subject : "Good Bye",
        text : `Good Bye ${name}`
    })
}

module.exports = {
    sendWelcomeMail,
    sendCancellationMail
}