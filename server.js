const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const path = require('path');

const app = express();

/* Middleware */

app.use(express.json());
app.use(express.urlencoded({ extended:true }));

app.use(express.static('public'));

app.use(session({

  secret:'secret-key',

  resave:false,

  saveUninitialized:false

}));

/* MongoDB */

mongoose.connect(process.env.MONGODB_URI)
.then(() => {

  console.log('MongoDB Connected');

})
.catch(err => {

  console.log(err);

});

/* User Model */

const userSchema = new mongoose.Schema({

  username:{
    type:String,
    required:true,
    unique:true
  },

  email:{
    type:String,
    required:true,
    unique:true
  },

  password:{
    type:String,
    required:true
  }

});

const User = mongoose.model('User', userSchema);
});
