const mongoose = require("mongoose")
const Schema = mongoose.Schema
const bcrypt = require("bcrypt")

const UserSchema = new Schema({
  name: String,
  email: { type: String, unique: true, required: true},
  password: { type: String, required: true},
  address: { type: Schema.Types.ObjectId, ref: 'Address'}
})

// UserSchema.pre("save", function(next){
//   let user = this
//   console.log("user in pre save", user)
//   if(this.isModified('password') || this.isNew){
//     bcrypt.genSalt(10, function(err, salt) {
//       if(err){
//         console.log('error in pre save hook',err)
//         return next(err)
//       }
//       bcrypt.hash(user.password, salt, null, function(err, hash){
//         if(err){
//           console.log('error in pre save hook hash',err)
//           return next(err)
//         }
//         user.password = hash
//         console.log('password hased', user)
//         next()
//       })
//     })
//   } else {
//     console.log('in presave else', user)
//     return next()
//   }
// })

UserSchema.methods.comparePassword = function(password, next){
  let user = this;
  return bcrypt.compareSync(password, user.password)
}
module.exports = mongoose.model("User", UserSchema)


   