const express = require("express")
const task = require("../models/task")
const auth = require("../middlewares/auth")
const Router = new express.Router()


Router.post("/tasks", auth, async (req,res) => {

    try {
        //const newTask = new task(req.body)
        const newTask = new task({
            ...req.body,
            owner : req.user._id
        })
        await newTask.save()
        res.status(201).send(newTask)
    } catch(e) {
        res.status(400).send(e)
    }

   //res.send(req.body)
//    const newTask = new task(req.body)
//    newTask.save().then(() => {
//        res.status(201).send(newTask)
//    }).catch((e) => {
//        res.status(400).send(e)
//    })
})
Router.get("/tasks", auth, async (req,res)=>{
   
    const match = {}
    const sort = {}
    if(req.query.completed){
        match.completed = req.query.completed === "true"
    }

    if(req.query.sortBy){
        const parts = req.query.sortBy.split(":")
        sort[parts[0]] = parts[1] ==="desc" ? -1 :1 
    }

   try {
      // const tasks = await task.find({owner : req.user._id})
      await req.user.populate({
          path : "task",
          match,
          options : {
              limit : parseInt(req.query.limit),
              skip : parseInt(req.query.skip),
              sort 
          },
      }).execPopulate()
       res.send(req.user.task)
   } catch (e) {
       res.status(500).send(e)
   }
   // task.find({}).then((tasks) => {
   //     res.send(tasks)
   // }).catch((e) => {
   //     res.status(500).send(e)
   // })
})

Router.get("/tasks/:id", auth ,async (req,res) => {
   const _id = req.params.id

   try {
      // const Task = await task.findById(_id)
      const Task = await task.findOne({_id, owner : req.user._id})
       if(!Task){
           return res.status(404).send()
       }
       res.send(Task)
   } catch (e) {
       res.status(500).send(e)
   }

   // task.findById(_id).then((Task) => {
   //     if(!Task){
   //       return  res.status(404).send()
   //     }

   //     res.send(Task)
   // }).catch((e) => {
   //     res.status(500).send(e)
   // })
})

Router.patch("/tasks/:id", auth, async (req,res) => {
   const updates = Object.keys(req.body)
   const updatesAvailable = ["description","completed"]
   const isUpdateAllowed = updates.every((update) => updatesAvailable.includes(update))

   if(!isUpdateAllowed){
       return res.status(400).send({error : "invalid updates !"})
   }

   try {
    //    const Task = await task.findById(req.params.id)
       const Task = await task.findOne({_id : req.params.id , owner : req.user._id})

       if(!Task){
          return res.status(404).send()
       }

       await updates.forEach((update) => Task[update] = req.body[update])
       await Task.save()
     //  const Task = await task.findByIdAndUpdate(req.params.id,req.body,{new : true, runValidators : true})
       res.send(Task)
   } catch(e) {
       res.status(400).send(e)
   }
})

Router.delete("/tasks/:id", auth,async (req,res) => {
   try{
      // const Task = await task.findByIdAndDelete(req.params.id)
      const Task = await task.findOneAndDelete({_id : req.params.id , owner : req.user._id})
       if(!Task){
           return res.status(404).send()
       }
       res.send(Task)
   } catch(e) {
       res.status(400).send(e)
   }
})

module.exports = Router