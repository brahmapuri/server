const mongoose = require("mongoose")
const Schema = mongoose.Schema

const OrderSchema = new Schema({
  name: String,
  email: String,
  address: Array,
  productOrder: Array,
  razorpayPaymentId: String,
  razorpayOrderId: String
},{timestamps: true})

module.exports = mongoose.model("Order", OrderSchema)