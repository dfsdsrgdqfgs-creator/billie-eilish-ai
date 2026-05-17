
const express = require('express');
const multer = require('multer');
const path = require('path');

const app = express();

app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

app.post('/upload', upload.single('media'), (req, res) => {
  res.json({
    success: true,
    file: req.file.filename
  });
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
