const mongoose = require("mongoose");

const todoSchema = new mongoose.Schema({
    task: String
});

const Todomodel = mongoose.model("Todo", todoSchema);

module.exports = Todomodel;