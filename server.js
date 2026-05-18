const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const path = require('path');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended:true }));

app.use(express.static('public'));

app.use(session({
  secret:'forumsecret',
  resave:false,
  saveUninitialized:false
}));

mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('MongoDB Connected'))
.catch(err => console.log(err));

/* USERS */

const userSchema = new mongoose.Schema({
  username:String,
  email:String,
  password:String,
  avatar:{
    type:String,
    default:'icon.jpg'
  },
  joined:{
    type:Date,
    default:Date.now
  }
});

const User = mongoose.model('ForumUser', userSchema);

/* THREADS */

const threadSchema = new mongoose.Schema({
  title:String,
  message:String,
  username:String,
  avatar:String,
  likes:{
    type:Number,
    default:0
  },
  createdAt:{
    type:Date,
    default:Date.now
  }
});

const Thread = mongoose.model('Thread', threadSchema);

/* REPLIES */

const replySchema = new mongoose.Schema({
  threadId:String,
  username:String,
  avatar:String,
  text:String,
  createdAt:{
    type:Date,
    default:Date.now
  }
});

const Reply = mongoose.model('Reply', replySchema);

/* REGISTER */

app.post('/register', async (req,res) => {

  const { username,email,password } = req.body;

});
