const router = require("express").Router()
const Razorpay = require('razorpay')
const crypto = require("crypto");
const Orders = require("../models/orders")
const UserOrders = require("../models/userOrder");
const product = require("../models/product");
const verifyToken = require("../middlewares/verify-token")
const SibApiV3Sdk = require('sib-api-v3-sdk');

router.post("/payment", (req, res)=>{
  console.log("amount", req.body.amount)
  var amount = req.body.amount
  var instance = new Razorpay({
    key_id: process.env.key_id,
    key_secret: process.env.key_secret,
  });
  
  var options = {
    amount: amount,  // amount in the smallest currency unit
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
        userOrder.email = newOrderToSave.email
        userOrder.owner = req.decoded._id
        userOrder.estimatedDelivery = 10
        userOrder.razorpayPaymentId = orderr.razorpay_payment_id
        userOrder.razorpayOrderId = orderr.razorpay_order_id_my
        await order.save()
        await userOrder.save()
        let defaultClient = SibApiV3Sdk.ApiClient.instance;
let apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.brahmapuri_key;
let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
let myProd = []
cart.map(prod => {  
  myProd.push({    
    name: prod.title,    
    quantity: prod.quantity,    
    imgsrc: prod.photo  
  })
  })
  let mailAddress = `${newOrderToSave.address[0].address}, ${newOrderToSave.address[0].city}, ${newOrderToSave.address[0].state} - ${newOrderToSave.address[0].zipCode}, Phone No: ${newOrderToSave.address[0].phoneNumber}`
sendSmtpEmail.subject = "{{params.subject}}";
sendSmtpEmail.htmlContent = "<html><body><h1>Hi {{params.parameter}}</h1><p style='font-size:16px'>Your order has been successfully placed.</p><p style='font-size:16px'>OrderID: {{params.orderId}}</p><p style='font-size:16px'>paymentId: {{params.paymentId}}</p>{%for products in params.product %} <h3 style='font-size:20px;border-bottom: 1px solid #eee; padding:20px; margin-bottom:10px'><img style='width: 100px; height: 50px' src={{products.imgsrc}} />  {{products.name}} - Quantity: {{products.quantity}}</h3>{%endfor%}<p style='font-size:16px'>Delivery Address:</p><p style='font-size:16px'>{{params.address}}</p><hr /><p style='font-size:14px'>Thank you for shopping with Us!</p></body></html>";
sendSmtpEmail.sender = {"name":"Brahmapuri Life Essentials","email":"brahmapurisahajayoga@gmail.com"};
sendSmtpEmail.to = [{"email":newOrderToSave.email,"name":newOrderToSave.name}];sendSmtpEmail.cc = [{"email":"brahmapurisahajayoga@gmail.com","name":"Brahmapuri Sahaja yoga"}];
// sendSmtpEmail.bcc = [{"email":"John Doe","name":"example@example.com"}];
sendSmtpEmail.replyTo = {"email":"brahmapurisahajayoga@gmail.com","name":"Brahmapuri Sahaja yoga"};
// sendSmtpEmail.headers = {"Some-Custom-Name":"unique-id-1234"};
sendSmtpEmail.params = {"parameter":newOrderToSave.name,"subject":"Your Order has been successfully placed", "product": myProd, "orderId":orderr.razorpay_order_id_my, "paymentId":orderr.razorpay_payment_id, "address":mailAddress};
await apiInstance.sendTransacEmail(sendSmtpEmail).then(function(data) {  console.log('API called successfully. Returned data: ' + JSON.stringify(data));}, function(error) {  console.error(error);});
    
  })().catch(err => {
      console.error(err);
  });
    return res.status(201).send({ success: true, message: "Successful payment and Successfully created a new order" });
  } else {
    return res.status(400).send({ success: false, message: "Payment verification failed" });
  }
})

module.exports = router