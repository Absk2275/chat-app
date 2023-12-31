// const mongoose = require("mongoose");

// const userModel = new mongoose.Schema({
//     name:{type:String, required:true},
//     email: {type:String, required: true, unique:true},
//     password: {type:String, required: true},
//     pic: {type:String,  default:"https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg"}
// },
// {timestamps:true})

// const User = mongoose.model("users", userModel);

// module.exports = User;

const mongoose = require("mongoose");


const userSchema = new mongoose.Schema(
  {
    name: { type: "String", required: true },
    email: { type: "String", unique: true, required: true },
    password: { type: "String", required: true },
    pic: {
      type: "String",
      required: true,
      default:
        "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
    },
    isAdmin: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  { timestaps: true }
);

const User = mongoose.model("User", userSchema);

module.exports = User;