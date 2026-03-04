const express = require('express')
const mongoose  = require('mongoose')
const cors = require('cors')
const TodoModel = require('./Models/tolist')

const app = express()
app.use(cors())
app.use(express.json())

// mongoose.connect('mongodb+srv://projects:projects@ijazdb.3fzhiek.mongodb.net/projects?retryWrites=true&w=majority&appName=ijazdb')
mongoose.connect('mongodb+srv://ijazathayi:ijazathayi@ijazathayi.ldmbfo7.mongodb.net/projects?retryWrites=true&w=majority&appName=ijazathayi')

app.listen(3001, ()=>{
    console.log("server is running ")
})

app.post('/add' ,(req,res) =>{
    const data = req.body.data;
    TodoModel.create({
        data: data
    })
    .then(result => res.json(result))
    .catch(err => res.json(err))
})