const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const path = require('path');

const app = express();

/* =========================
   MIDDLEWARE
========================= */

app.use(express.json());

app.use(express.urlencoded({ extended:true }));

app.use(express.static(path.join(__dirname,'public')));

app.use(session({

  secret:'forumsecretkey',

  resave:false,

  saveUninitialized:false

}));

/* =========================
   MONGODB
========================= */

mongoose.connect(process.env.MONGODB_URI)

.then(() => {

  console.log('MongoDB Connected');

})

.catch(err => {

  console.log(err);

});

/* =========================
   USER SCHEMA
========================= */

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

/* =========================
   THREAD SCHEMA
========================= */

const threadSchema = new mongoose.Schema({

  title:String,

  content:String,

  category:String,

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

const Thread = mongoose.model('ForumThread', threadSchema);

/* =========================
   REPLY SCHEMA
========================= */

const replySchema = new mongoose.Schema({

  threadId:String,

  username:String,

  avatar:String,

  message:String,

  createdAt:{
    type:Date,
    default:Date.now
  }

});

const Reply = mongoose.model('ForumReply', replySchema);

/* =========================
   REGISTER
========================= */

app.post('/register', async (req,res) => {

  try{

    const { username,email,password } = req.body;

    const exists = await User.findOne({ email });

    if(exists){

      return res.json({

        success:false,

        message:'Email already exists'

      });

    }

    const hashedPassword =
    await bcrypt.hash(password,10);

    const user = new User({

      username,

      email,

      password:hashedPassword

    });

    await user.save();

    req.session.user = {

      id:user._id,

      username:user.username,

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

/* =========================
   LOGIN
========================= */

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

    const valid =
    await bcrypt.compare(password,user.password);

    if(!valid){

      return res.json({

        success:false,

        message:'Wrong password'

      });

    }

    req.session.user = {

      id:user._id,

      username:user.username,

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

/* =========================
   GET CURRENT USER
========================= */

app.get('/me',(req,res) => {

  if(req.session.user){

    res.json({

      loggedIn:true,

      user:req.session.user

    });

  }else{

    res.json({

      loggedIn:false

    });

  }

});

/* =========================
   LOGOUT
========================= */

app.get('/logout',(req,res) => {

  req.session.destroy(() => {

    res.redirect('/');

  });

});

/* =========================
   CREATE THREAD
========================= */

app.post('/create-thread', async (req,res) => {

  try{

    if(!req.session.user){

      return res.json({

        success:false,

        message:'Login required'

      });

    }

    const thread = new Thread({

      title:req.body.title,

      content:req.body.content,

      category:req.body.category,

      username:req.session.user.username,

      avatar:req.session.user.avatar

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

/* =========================
   GET THREADS
========================= */

app.get('/threads', async (req,res) => {

  const threads =
  await Thread.find()

  .sort({ createdAt:-1 });

  res.json(threads);

});

/* =========================
   CREATE REPLY
========================= */

app.post('/reply', async (req,res) => {

  try{

    if(!req.session.user){

      return res.json({

        success:false,

        message:'Login required'

      });

    }

    const reply = new Reply({

      threadId:req.body.threadId,

      username:req.session.user.username,

      avatar:req.session.user.avatar,

      message:req.body.message

    });

    await reply.save();

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

/* =========================
   GET REPLIES
========================= */

app.get('/replies/:threadId', async (req,res) => {

  const replies =
  await Reply.find({

    threadId:req.params.threadId

  })

  .sort({ createdAt:1 });

  res.json(replies);

});

/* =========================
   LIKE THREAD
========================= */

app.post('/like-thread/:id', async (req,res) => {

  try{

    const thread =
    await Thread.findById(req.params.id);

    if(!thread){

      return res.json({

        success:false

      });

    }

    thread.likes += 1;

    await thread.save();

    res.json({

      success:true,

      likes:thread.likes

    });

  }catch(err){

    res.json({

      success:false

    });

  }

});

/* =========================
   USERS COUNT
========================= */

app.get('/stats', async (req,res) => {

  const users =
  await User.countDocuments();

  const threads =
  await Thread.countDocuments();

  const replies =
  await Reply.countDocuments();

  res.json({

    users,
    threads,
    replies

  });

});

/* =========================
   ROUTES
========================= */

app.get('/',(req,res) => {

  res.sendFile(

    path.join(__dirname,'public/index.html')

  );

});

app.get('/forum',(req,res) => {

  res.sendFile(

    path.join(__dirname,'public/forum.html')

  );

});

app.get('/profile',(req,res) => {

  res.sendFile(

    path.join(__dirname,'public/profile.html')

  );

});

app.get('/admin',(req,res) => {

  res.sendFile(

    path.join(__dirname,'public/admin.html')

  );

});

/* =========================
   START SERVER
========================= */

const PORT =
process.env.PORT || 3000;

app.listen(PORT,() => {

  console.log(

    'Server running on port ' + PORT

  );

});
