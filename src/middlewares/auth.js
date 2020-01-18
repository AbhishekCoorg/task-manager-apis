const user = require("../models/user")
const jwt = require("jsonwebtoken")

const auth = async (req,res,next) => {
    try {

        const token = req.header("Authorization").replace('Bearer ','')
        const decoded = await jwt.verify(token, process.env.JWT_SECRET)

        const User = await user.findOne({ _id : decoded._id , "tokens.token" : token})

        if(!User){
            throw new Error()
        }
        req.token = token
        req.user = User
        next()

    } catch (e) {
        res.status(401).send("Please Authenticate..")
    }
}

module.exports = auth