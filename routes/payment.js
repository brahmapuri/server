const router = require("express").Router()
const Razorpay = require('razorpay')
const crypto = require("crypto");
const Orders = require("../models/orders")
const UserOrders = require("../models/userOrder");
const product = require("../models/product");
const verifyToken = require("../middlewares/verify-token")

router.post("/payment", (req, res)=>{
  console.log("amount", req.body.amount)
  let amount = req.body.amount * 100
  var instance = new Razorpay({
    key_id: process.env.key_id,
    key_secret: process.env.key_secret,
  });
  
  // var instance = new Razorpay({ key_id: 'YOUR_KEY_ID', key_secret: 'YOUR_SECRET' })
  
  var options = {
    amount: 100,  // amount in the smallest currency unit
    currency: "INR",
    receipt: "order_rcptid_11"
  };
  instance.orders.create(options, function(err, order) {
    console.log(order);
    res.send(order)
  });
})

router.post("/payment/fail", (req, res)=>{
  console.log("payment fails", req.body)
  res.send("saved all data for fail")
})

router.post("/payment/pass",verifyToken, (req, res)=>{
  console.log("reqBody", req.body)
  const orderr = req.body.passResponse.passPaymentData;
  const newOrderToSave = req.body.passResponse.orderDataOnSuccess
  const cart = req.body.passResponse.cart
  console.log("order received",orderr, "newOrderToSave", newOrderToSave)
  console.log("cart in response", cart)

  const text = orderr.razorpay_order_id_my + "|" + orderr.razorpay_payment_id;
  // replace key--------------------------------------------------------------------
  var signature = crypto
    .createHmac("sha256", process.env.key_secret)
    .update(text)
    .digest("hex");

    console.log("signature", signature, "order signature", orderr.razorpay_signature)

  if (signature === orderr.razorpay_signature) {
    // You can update payment details in your database here
    (async () => {
        let order = new Orders()
        order.name = newOrderToSave.name
        order.email = newOrderToSave.email
        order.address = newOrderToSave.address
        order.productOrder = newOrderToSave.productOrder
        order.razorpayPaymentId = orderr.razorpay_payment_id
        order.razorpayOrderId = orderr.razorpay_order_id_my

        let userOrder = new UserOrders()
        cart.map(prod => {
          userOrder.products.push({
            productID: prod._id,
            quantity: prod.quantity,
            price: prod.price
          })
        })
        userOrder.owner = req.decoded._id
        userOrder.estimatedDelivery = 10
        userOrder.razorpayPaymentId = orderr.razorpay_payment_id
        userOrder.razorpayOrderId = orderr.razorpay_order_id_my
        await order.save()
        await userOrder.save()
    
        // res.json({
        //   success: true,
        //   message: "Successfully created a new order",
        //   order
        // })
  })().catch(err => {
      console.error(err);
  });
    return res.status(201).send({ success: true, message: "Successful payment and Successfully created a new order" });
  } else {
    return res.status(400).send({ success: false, message: "Payment verification failed" });
  }
})

// const { URLSearchParams } = require('url');
// // const fetch = import('node-fetch');
// const axios = require('axios');

// router.get('/payment', (req, res)=>{
// // let amount = req.body.amount
//   const encodedParams = new URLSearchParams();
// encodedParams.set('key','JPM7Fg');
// encodedParams.set('amount','10.00');
// encodedParams.set('txnid','5E4UPXKGXwPznp');
// encodedParams.set('firstname','PayU User');
// encodedParams.set('email','test@gmail.com');
// encodedParams.set('phone','9876543210');
// encodedParams.set('productinfo','iPhone');
// encodedParams.set('surl','https://apiplayground-response.herokuapp.com/');
// encodedParams.set('furl','https://apiplayground-response.herokuapp.com/');
// encodedParams.set('pg','');
// encodedParams.set('bankcode','');
// encodedParams.set('ccnum','');
// encodedParams.set('ccexpmon','');
// encodedParams.set('ccexpyr','');
// encodedParams.set('ccvv','');
// encodedParams.set('ccname','');
// encodedParams.set('txn_s2s_flow','');
// encodedParams.set('hash','4251b88864821c177dfe7dfa7e41eb8716231857fdd87b6ff03d5a4f1529b1c7fb59da6106bd054cd2211bf9a5998533423f131faeafe3b5d4f74df219542cb8');
// const url = 'https://test.payu.in/_payment';
// const options = {
// method: 'POST',
// headers: {
// Accept: 'application/json',
// 'Content-Type': 'application/x-www-form-urlencoded'
// },
// body: encodedParams
// };
// let response
// axios(url, options)
// // .then(res => res.json())
// .then(json => {response = json 
//   console.log("json--------------------",json)})
// .catch(err => console.error('error:' + err));
// console.log("response in api", response)
// res.send(response)
// })

module.exports = router