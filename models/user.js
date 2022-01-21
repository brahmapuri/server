const mongoose = require("mongoose")
const Schema = mongoose.Schema
const bcrypt = require("bcrypt")

const UserSchema = new Schema({
  name: String,
  email: { type: String, unique: true, required: true},
  password: { type: String, required: true},
  address: { type: Schema.Types.ObjectId, ref: 'Address'}
})

UserSchema.methods.comparePassword = function(password, next){
  let user = this;
  return bcrypt.compareSync(password, user.password)
}
module.exports = mongoose.model("User", UserSchema)


   