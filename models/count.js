const mongoose = require("mongoose")
const Schema = mongoose.Schema

const CountSchema = new Schema({
  people: Number,
})

module.exports = mongoose.model("Count", CountSchema)