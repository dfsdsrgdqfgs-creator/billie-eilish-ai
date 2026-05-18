const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const mongoose = require('mongoose');

const app = express();

app.use(express.static('public'));
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
.then(() => {
  console.log('MongoDB Connected');
})
.catch((err) => {
  console.log(err);
});

const postSchema = new mongoose.Schema({
  url: String,
  type: String
});

const Post = mongoose.model('Post', postSchema);

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET
});

const storage = multer.memoryStorage();

const upload = multer({
  storage
});

app.post('/upload', upload.single('media'), async (req, res) => {

  try {

    const streamUpload = (req) => {

      return new Promise((resolve, reject) => {

        const stream = cloudinary.uploader.upload_stream(
          {
            resource_type: 'auto'
          },

          (error, result) => {

            if (result) {
              resolve(result);
            } else {
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

    const newPost = new Post({
      url: result.secure_url,
      type: req.file.mimetype
    });

    await newPost.save();

    res.json({
      success: true,
      url: result.secure_url
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      error: error.message
    });

  }

});

app.get('/posts', async (req, res) => {

  const posts = await Post.find().sort({ _id: -1 });

  res.json(posts);

});

app.delete('/delete/:id', async (req, res) => {

  try {

    await Post.findByIdAndDelete(req.params.id);

    res.json({
      success: true
    });

  } catch (error) {

    res.status(500).json({
      success: false
    });

  }

});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
