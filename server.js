const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const path = require('path');

const app = express();

/* MIDDLEWARE */

app.use(express.json());

app.use(express.urlencoded({ extended:true }));

app.use(express.static('public'));

app.use(session({

  secret:'forumsecret',

  resave:false,

  saveUninitialized:false

}));

/* MONGODB */

mongoose.connect(process.env.MONGODB_URI)

.then(() => {

  console.log('MongoDB Connected');

})

.catch(err => {

  console.log(err);

});

/* USER SCHEMA */

const userSchema = new mongoose.Schema({

  username:String,

  email:String,

  password:String,

  avatar:{
    type:String,
    default:'icon.jpg'
  }

});

const User = mongoose.model('ForumUser', userSchema);

/* THREAD SCHEMA */

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

/* REGISTER */

app.post('/register', async (req,res) => {

  try{

    const { username,email,password } = req.body;

    const existingUser = await User.findOne({ email });

    if(existingUser){

      return res.json({

        success:false,

        message:'Email already exists'

      });

    }

    const hashedPassword = await bcrypt.hash(password,10);

    const user = new User({

      username,

      email,

      password:hashedPassword

    });

    await user.save();

    req.session.user = {

      username:user.username,

      email:user.email,

      avatar:user.avatar

    };

    res.json({

      success:true

    });

  }catch(err){

    res.json({

      success:false,

      message:err.message

    });

  }

});

/* LOGIN */

app.post('/login', async (req,res) => {

  try{

    const { email,password } = req.body;

    const user = await User.findOne({ email });

    if(!user){

      return res.json({

        success:false,

        message:'User not found'

      });

    }

    const validPassword = await bcrypt.compare(password,user.password);

    if(!validPassword){

      return res.json({

        success:false,

        message:'Wrong password'

      });

    }

    req.session.user = {

      username:user.username,

      email:user.email,

      avatar:user.avatar

    };

    res.json({

      success:true

    });

  }catch(err){

    res.json({

      success:false,

      message:err.message

    });

  }

});

/* GET USER */

app.get('/me',(req,res) => {

  if(req.session.user){

    res.json({

      loggedIn:true,

      username:req.session.user.username,

      avatar:req.session.user.avatar

    });

  }else{

    res.json({

      loggedIn:false

    });

  }

});

/* LOGOUT */

app.get('/logout',(req,res) => {

  req.session.destroy(() => {

    res.redirect('/');

  });

});

/* CREATE THREAD */

app.post('/create-thread', async (req,res) => {

  try{

    const thread = new Thread({

      title:req.body.title,

      message:req.body.message,

      username:req.body.username,

      avatar:req.body.avatar

    });

    await thread.save();

    res.json({

      success:true

    });

  }catch(err){

    res.json({

      success:false,

      message:err.message

    });

  }

});

/* GET THREADS */

app.get('/threads', async (req,res) => {

  const threads = await Thread.find()

  .sort({ createdAt:-1 });

  res.json(threads);

});

/* HOME */

app.get('/',(req,res) => {

  res.sendFile(path.join(__dirname,'public/index.html'));

});

/* START */

const PORT = process.env.PORT || 3000;

app.listen(PORT,() => {

  console.log('Server running on port ' + PORT);

});
