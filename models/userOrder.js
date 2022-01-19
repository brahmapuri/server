const mongoose = require("mongoose")
const Schema = mongoose.Schema


const UserOrderSchema = new Schema({
  owner: { type: Schema.Types.ObjectId, ref: "User"},
  estimatedDelivery: Number,
  products: [
    {
      productID: { type: Schema.Types.ObjectId, ref: "Product" },
      quantity: Number,
      price: Number
    }
  ],
  razorpayPaymentId: String,
  razorpayOrderId: String,
  email: String
},{timestamps: true})

module.exports = mongoose.model("UserOrder", UserOrderSchema)