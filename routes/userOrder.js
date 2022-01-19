const router = require("express").Router()
const UserOrder = require("../models/userOrder")
const verifyToken = require("../middlewares/verify-token")

router.post('/userorders', async (req, res) => {
  try {
    let order = new UserOrder()
    order.estimatedDelivery = req.body.estimatedDelivery
    order.owner = req.body.owner
    order.products = req.body.products

    await order.save()

    res.json({
      success: true,
      message: "Successfully created a new order",
      order
    })
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    })
  }
})

router.get('/userorders',verifyToken, async (req, res) =>{
  try {
    let orders = await UserOrder.find({ email: req.decoded.email})
    .populate("owner products.productID").exec()
    res.json({
      success: true,
      orders
    })
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    })
  }
})

module.exports = router