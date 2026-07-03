const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const Todomodel = require('./Models/Todo');

const app = express();
app.use(cors());
app.use(express.json());

// mongoose.connect("mongodb://127.0.0.1:27017/test")
// mongoose.connect('mongodb+srv://ijazathayi:ijazathayi@ijazathayi.ldmbfo7.mongodb.net/projects?retryWrites=true&w=majority&appName=ijazathayi')
mongoose.connect('mongodb+srv://ijazathayi:ijazathayi@ijazdb.4gn43p6.mongodb.net/?appName=ijazdb')
.then(() => console.log("Connected to MongoDB"))
.catch((err) => console.log(err));


app.post("/add", (req, res) => {
    const task = req.body.task;
    console.log(task);
    Todomodel.create({ task: task }).then((data) => {
        res.json(data);
    }).catch((err) => {
        res.json(err);
    })
})
    app.listen(3001, ()=>{
    console.log("Server is running on port 3001");
})


app.delete("/delete/:id", (req, res) => {
    const { id } = req.params;
    Todomodel.findByIdAndDelete(id).then((data) => {
        res.json(data);
    }).catch((err) => {
        res.json(err);
    });
});

app.get("/get", (req, res) => {
    Todomodel.find().then((data) => {
        res.json(data);
    }).catch((err) => {
        res.json(err);
    });
});