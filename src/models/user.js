const mongoose = require("mongoose")
const validator = require("validator")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const Task = require("./task")

const userSchema = new mongoose.Schema({
    name : {
        type : String,
        required : true,
        trim : true
    },
    email : {
        type : String,
        required : true,
        unique : true,
        lowercase : true,
        trim : true,
        validate(value){
           if(!validator.isEmail(value)){
               throw new Error("Email is invalid")
           }
        }
    },
    age : {
        type : Number,
        default: 0,
        validate(value){
            if(value < 0){
                throw new Error("age must be greater than 0")
            }
        }
    },
    password : {
        type : String,
        required : true,
        trim : true,
        minlength : 7,
        validate(value){
            if(value.toLowerCase().includes("password")){
                throw new Error("invalid password value")
            }
        }
    },
    tokens : [{
        token : {
            type:String,
            required:true
        }
    }],
    avatar : {
        type : Buffer
    }
},{
    timestamps : true
})

userSchema.virtual("task", {
    ref : "tasks",
    localField : "_id",
    foreignField : "owner"

})
userSchema.methods.toJSON = function () {
    const user = this
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar
    return userObject
}
userSchema.methods.generateAuthToken = async function(){
    const User = this
    const token = await jwt.sign({_id : User._id.toString()},process.env.JWT_SECRET)

    User.tokens = User.tokens.concat({token})
    await User.save()
    return token

}
userSchema.statics.findByCredentials = async (email,password) => {

    const User = await user.findOne({email})
    if(!User){
        throw new Error("unable to login")
    }
    const isMatch = await bcrypt.compare(password,User.password)
    if(!isMatch){
        throw new Error("unable to login")
    }
    return User
}

userSchema.pre("save",async function(next) {

     const User = this
     if(User.isModified('password')){
        User.password = await bcrypt.hash(User.password,8)
     }
    next()
})

userSchema.pre("remove", async function(next) {
   const user = this
   await Task.deleteMany({owner : user._id})
   next()
})
const user = mongoose.model('user',userSchema)
module.exports = user