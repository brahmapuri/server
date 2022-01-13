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

// const OrderSchema = new Schema({
//   owner: { type: Schema.Types.ObjectId, ref: "User"},
//   estimatedDelivery: String,
//   products: [
//     {
//       productID: { type: Schema.Types.ObjectId, ref: "Product" },
//       quantity: Number,
//       price: Number
//     }
//   ]
// })

module.exports = mongoose.model("Order", OrderSchema)