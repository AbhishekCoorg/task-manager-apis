const express = require("express")
const multer = require("multer")
const sharp = require("sharp")
const user = require("../models/user")
const auth = require("../middlewares/auth")
const { sendWelcomeMail , sendCancellationMail} = require("../emails/account")
const Router = new express.Router()

Router.post("/users",async (req,res) => {

    //return res.send(req.body)
    const userDetails = new user(req.body)

    userDetails.save().then(async () => {
        sendWelcomeMail(userDetails.email, userDetails.name)
        const token = await userDetails.generateAuthToken()
        res.send({userDetails,token})
    }).catch((error) => {
        res.status(400).send("error : "+error)
    })

})

Router.post("/users/login",async (req,res) => {

    try{
        const User = await user.findByCredentials(req.body.email,req.body.password)
        const token = await User.generateAuthToken()
        res.send({User,token})
    } catch(e) {
        res.status(400).send(e)
    }
})

Router.post("/users/logout", auth, async (req,res) => {
    try{

        req.user.tokens = req.user.tokens.filter((token) => {
           return req.token !== token.token
        })
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

Router.post("/users/logoutAll", auth, async (req,res) => {
    try{

        req.user.tokens = []
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send(e)
    }
})
Router.get("/users/me",auth,(req,res) => {
    res.send(req.user)
})

// Router.get("/users/:id",(req,res) => {
//     const _id = req.params.id
//     user.findById(_id).then((User) => {
//         if(!User){
//            return res.status(404).send()
//         }
//         res.send(User)
//     }).catch((e) => {
//         res.status(500).send(e)
//     })
// })

Router.patch("/users/me", auth ,async (req,res) => {
    const updates = Object.keys(req.body)
    const updatesAvailable = ["name","email","password","age"]
    const isAllowed = updates.every((update) => updatesAvailable.includes(update))

    if(!isAllowed){
        return res.status(400).send({error : "invalid update !"})
    }

    try{
        const User = req.user
        await updates.forEach((update) => User[update] = req.body[update])
        await User.save()
       // const User = await user.findByIdAndUpdate(req.params.id,req.body,{new : true, runValidators : true})
        res.send(User)
    } catch(e) {
        res.status(400).send(e)
    }
})


Router.delete("/users/me", auth , async (req,res) => {
    try {
        await req.user.remove()
        sendCancellationMail(req.user.email, req.user.name)
        res.send(req.user)
    } catch (e) {
        res.status(500).send()
    }
})

const avatar = multer({

    limits : {
        fileSize : 1000000
    },
    fileFilter(req, file, cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            cb(new Error('file should be an image'))
        }

        cb(undefined,true) 

    }

})

Router.post("/users/me/avatar", auth, avatar.single("avatar"), async (req,res) => {
    const buffer = await sharp(req.file.buffer).resize({width:250, height:250}).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.send()
},(error, req, res, next) => {
    res.status(400).send({error : error.message})
})

Router.delete("/users/me/avatar", auth , async (req , res) => {
    req.user.avatar = undefined
    await req.user.save()
    res.send()
})

Router.get("/users/:id/avatar", async (req , res) => {
    try{
        const User = await user.findById(req.params.id)
        if(!User || !User.avatar){
            throw new Error()
        }
        res.set('Content-Type','image/jpg')
        res.send(User.avatar)
    } catch(e) {
        res.status(404).send()
    }
})
module.exports = Router