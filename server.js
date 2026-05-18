const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const bcrypt = require('bcryptjs');
const session = require('express-session');

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

const User = mongoose.model('ForumUser', userSchema);

/* Cloudinary */

cloudinary.config({

  cloud_name: process.env.CLOUD_NAME,

  api_key: process.env.API_KEY,

  api_secret: process.env.API_SECRET

});

/* Multer */

const storage = multer.memoryStorage();

const upload = multer({
  storage
});

/* Register */

app.post('/register', async (req,res) => {

  try{

    const { username, email, password } = req.body;

    const existingUser = await User.findOne({

      $or:[
        { email },
        { username }
      ]

    });

    if(existingUser){

      return res.json({

        success:false,

        message:'User already exists'

      });

    }

    const hashedPassword = await bcrypt.hash(password,10);

    const user = new User({

      username,

      email,

      password:hashedPassword

    });

    await user.save();

    req.session.userId = user._id;

    res.json({

      success:true,

      username:user.username,

      message:'Registered successfully'

    });

  }catch(error){

    res.json({

      success:false,

      message:error.message

    });

  }

});

/* Login */

app.post('/login', async (req,res) => {

  try{

    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if(!user){

      return res.json({

        success:false,

        message:'User not found'

      });

    }

    const validPassword = await bcrypt.compare(password, user.password);

    if(!validPassword){

      return res.json({

        success:false,

        message:'Wrong password'

      });

    }

    req.session.userId = user._id;

    res.json({

      success:true,

      username:user.username

    });

  }catch(error){

    res.json({

      success:false,

      message:error.message

    });

  }

});

/* Current User */

app.get('/me', async (req,res) => {

  try{

    if(!req.session.userId){

      return res.json({

        loggedIn:false

      });

    }

    const user = await User.findById(req.session.userId);

    if(!user){

      return res.json({

        loggedIn:false

      });

    }

    res.json({

      loggedIn:true,

      username:user.username

    });

  }catch(error){

    res.json({

      loggedIn:false

    });

  }

});

/* Logout */

app.get('/logout', (req,res) => {

  req.session.destroy();

  res.json({

    success:true

  });

});

/* Upload */

app.post('/upload', upload.single('media'), async (req,res) => {

  try{

    const streamUpload = (req) => {

      return new Promise((resolve,reject) => {

        const stream = cloudinary.uploader.upload_stream(

          {

            resource_type:'auto'

          },

          (error,result) => {

            if(result){

              resolve(result);

            }else{

              reject(error);

            }

          }

        );

        streamifier
        .createReadStream(req.file.buffer)
        .pipe(stream);

      });

    };

    const result = await streamUpload(req);

    res.json({

      success:true,

      url:result.secure_url

    });

  }catch(error){

    res.json({

      success:false,

      message:error.message

    });

  }

});

/* Start Server */

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {

  console.log('Server running on port ' + PORT);

});
