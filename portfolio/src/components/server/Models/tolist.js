const mongoose = require('mongoose');

const TodoSchema = new mongoose.Schema({
    data : String
})

const TodoModel = mongoose.model('todos', TodoSchema);

module.exports = TodoModel;


// const mongoose = require('mongoose')

// const TodoSchema = new mogoose.Schema({
//     data : String
// })

// const TodoModel = mongoose.model("todos", TodoSchema)
// module.exports = TodoModel