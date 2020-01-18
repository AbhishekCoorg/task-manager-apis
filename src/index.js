const express = require('express')
require("./db/mongoose")
const userRouter = require("./routers/user")
const taskRouter = require("./routers/task")

const app = express()
const port = process.env.PORT
// app.use((req,res,next) => {
//     if(req.method == 'GET'){
//         res.send("get requests are disabled")
//     } else {
//         next()
//     }
// })

// app.use((req,res) => {
//     res.status(503).send('Site is under maintenance. Please try back later')
// })
app.use(express.json())
app.use(userRouter)
app.use(taskRouter)



app.listen(port,() => {
    console.log("Server is up on port " + port)
})

// const user = require("./models/user")
// const task = require("./models/task")

// const main = async () => {
//     // const Task = await task.findById("5e0a39b15b2cc41fb80206b9")
//     // await Task.populate("owner").execPopulate()
//     // console.log(Task.owner)

//     const User = await user.findById("5e0a393e5b2cc41fb80206b6")
//     await User.populate("task").execPopulate()
//    console.log(User.task)
// }

// main()