const express = require("express")
const morgan = require("morgan")
const bodyParser = require("body-parser")
const Mongoose = require("mongoose")
const dotenv = require("dotenv")
const User = require("./models/user")
const cors = require("cors")
const app = express()

dotenv.config()

Mongoose.connect(
  process.env.DATABASE, err=>{
    if(err){
      console.log("database error",err)
    } else {
      console.log("database connected...")
    }
  }
)

// middlewares
app.use(morgan("dev"))
app.use(cors());
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))
app.get("/", (req, res)=>{
  res.send("welcome to the API...")
})

const productRoutes = require("./routes/product")
const CategoryRoutes = require("./routes/category")
const OwnerRoutes = require("./routes/owner")
const ordersRoutes = require("./routes/orders")
const userOrdersRoutes = require("./routes/userOrder")
const userRoutes = require("./routes/auth")
const addressRoutes = require("./routes/address")
const paymentRoutes = require("./routes/payment")
app.use("/api", userRoutes)
app.use("/api", productRoutes)
app.use("/api", CategoryRoutes)
app.use("/api", OwnerRoutes)
app.use("/api", addressRoutes)
app.use("/api", paymentRoutes)
app.use("/api", ordersRoutes)
app.use("/api", userOrdersRoutes)

let port = process.env.PORT || 8000

app.listen(port, (err) => {
  if(err) {
    console.log(err)
  } else {
    console.log("listening on post", port)
  }
})