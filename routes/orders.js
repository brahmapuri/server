const router = require("express").Router()
const Orders = require("../models/orders")

router.post('/orders', async (req, res) => {
  try {
    let order = new Orders()
    order.name = req.body.name
    order.email = req.body.email
    order.address = req.body.address
    order.productOrder = req.body.productOrder

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

router.get('/orders', async (req, res) =>{
  try {
    let orders = await Orders.find()
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

router.delete("/orders/:id", async(req, res)=>{
  try{
    let deletedOrder = await Orders.findOneAndDelete( {
      _id: req.params.id
    })
    if(deletedOrder){
      res.json({
        success: true,
        message: "order has been deleted"
      })
    }
  }catch (err){
    res.status(500).json({
      success: false,
      message: err.message
    })
  }
})

module.exports = router