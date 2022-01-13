const router = require('express').Router()
const User = require('../models/user')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const verifyToken = require('../middlewares/verify-token')
const bcrypt = require('bcrypt')
const user = require('../models/user')

// signup api
router.post('/auth/signup', async(req, res) => {
  if(!req.body.email || !req.body.password) {
      return res.json({success: false, message: 'please enter email or password'})
    }
    
    let checkUser = await User.findOne({email: req.body.email})
        if(checkUser){
          return res.json({
            success: false,
            message: 'user already exists kindly login'
          })
        }

  bcrypt.hash(req.body.password, 10, (err, hash)=>{
      if(err){
        return res.status(500).json({
          error:err
        }) 
      } else {
        const user = new User({
          email: req.body.email,
          name: req.body.name,
          password: hash
        })
        user.save()
        .then(result => {
          let newUser = {
            name: result.name,
            email: result.email,
            password: result.password
          }
          let token = jwt.sign(newUser, process.env.SECRET,{
                  expiresIn: 604800 // 1 week
                })
          console.log(result, newUser)
          res.status(201).json({
            success: true,
            token,
            message: 'user created successfully'
          })
        }).catch(err=>{
          console.log(err)
          res.status(500).json({
            success: false,
            error: err
          })
        })
      }
    })
  })

  // if(!req.body.email || !req.body.password) {
  //   res.json({success: false, message: 'please enter email or password'})
  // } else {
  //   try {
  //     let checkUser = await User.findOne({email: req.body.email})
  //     if(checkUser){
  //       res.json({
  //         message: 'user already exists kindly login'
  //       })
  //     }
  //     let newUser = new User()
  //     newUser.name = req.body.name
  //     newUser.email = req.body.email
  //     newUser.password = req.body.password
  //     console.log('going to save',newUser)
  //     let ab = await newUser.save()
  //     console.log('new user', ab)
  //     let token = jwt.sign(newUser.JSON(), process.env.SECRET,{
  //       expiresIn: 604800 // 1 week
  //     })
  //     console.log('token', token)

  //     res.json({
  //       success: true,
  //       token:token,
  //       message : 'Successfully created new user'
  //     })
  //   } catch (err) {
  //     console.log('reached in err')
  //     res.status(500).json({
  //       success: false,
  //       message: err.message
  //     })
  //   }
  // }
// })

router.get("/auth/user", verifyToken, async(req, res) => {
  try {
    let foundUser = await User.findOne({email: req.decoded.email}).populate('address').exec()
    console.log('foundUser', foundUser)
    if(foundUser){
      res.json({
        success: true,
        user: foundUser
      })
    }
  } catch (err) {
    console.log("userAuth error", err)
    res.status(500).json({
      success: false,
      message: err.message
    })
  }
})

// update a profile
router.put("/auth/user", verifyToken, async(req, res) =>{
  try{
    let foundUser = await User.findOne({email: req.decoded.email})
    if(foundUser){
      if(req.body.name) foundUser.name = req.body.name
      if(req.body.email) foundUser.email = req.body.email
      if(req.body.password) foundUser.password = req.body.password
      await foundUser.save()
    }
    res.json({
      success: true,
      message: "Successfully updated user"
    })
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    })
  }
})

router.post("/auth/login", async(req,res) => {
  try {
    let foundUser = await User.findOne({ email: req.body.email}).populate('address').exec()
    if(!foundUser) {
      res.status(403).json({
        success: false,
        message: "user not found in detabase"
      })
    } else {
      if(foundUser.comparePassword(req.body.password)) {
        let token = jwt.sign(foundUser.toJSON(), process.env.SECRET, {
          expiresIn: 604800 // 1 week
        })
        res.json({success: true, token : token, foundUser})
      } else {
        res.status(403).json({
          success: false,
          message: 'Auth failed, wrong password'
        })
      }
    }
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    })
  }
})

module.exports = router