const router = require("express").Router()
const Product = require("../models/product")
// below upload will be used as middle ware in /products for saveing image
const upload = require("../middlewares/upload-photos")

router.post("/products",upload.single("photo"), async(req, res)=> {
  console.log("product data",req.body.photo)
  try {
    let product = new Product()
    product.ownerID = req.body.ownerID
    product.categoryID = req.body.categoryID
    product.price = req.body.price
    product.title = req.body.title
    product.description = req.body.description
    // once aws is working replace below code
    product.photo = req.file.location
    // product.photo = req.body.photo
    product.stockQuantity = req.body.stockQuantity

    await product.save()

    res.json({
      status: true,
      message: "successfully saved",
      product
    })
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    })
  }
})

router.get('/products', async (req, res) =>{
  try {
    let products = await Product.find()
    res.json({
      success: true,
      products
    })
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    })
  }
})

router.get('/products/:id', async (req, res) =>{
  try {
    let product = await Product.findOne({_id:req.params.id})
    res.json({
      success: true,
      product
    })
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    })
  }
})

// photo middleware also needded to be added 
router.put('/products/:id', upload.single("photo"), async (req, res) =>{
  try {
    let product = await Product.findOneAndUpdate({_id:req.params.id}, {
      $set: {
        title: req.body.title,
        price: req.body.price,
        category: req.body.categoryID,
       // update photo after aws req.file.location 
        photo : req.file.location,
        description: req.body.description,
        stockQuantity: req.body.stockQuantity,
        owner: req.body.ownerID,
      }
    },
    {upsert : true})
    res.json({
      success: true,
      product
    })
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    })
  }
})

router.delete('/products/:id', async (req, res)=> {
  try {
    let deletedProduct = await Product.findOneAndDelete( {
      _id: req.params.id
    })

    if(deletedProduct) {
      res.json({
        status: true,
        message: "Successfully deleted product",
        deletedProduct
      })
    }
  } catch (err){
    res.status(500).json({
      success: false,
      message: err.message
    })
  }
})

module.exports = router