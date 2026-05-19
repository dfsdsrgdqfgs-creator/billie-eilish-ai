// server.js

const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const path = require("path");

const app = express();

mongoose.connect("mongodb://127.0.0.1:27017/forumdb");

const UserSchema = new mongoose.Schema({
  username: String,
  password: String,
  avatar: {
    type: String,
    default:
      "https://i.imgur.com/6VBx3io.png",
  },
});

const PostSchema = new mongoose.Schema({
  title: String,
  content: String,
  section: String,
  author: String,
  created: {
    type: Date,
    default: Date.now,
  },
});

const User = mongoose.model(
  "User",
  UserSchema
);

const Post = mongoose.model(
  "Post",
  PostSchema
);

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(
  session({
    secret: "forum_secret",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(
  express.static(
    path.join(__dirname, "public")
  )
);

function auth(req, res, next) {
  if (!req.session.user) {
    return res.redirect("/");
  }

  next();
}

const sections = [
  "General",
  "Games",
  "Technology",
  "Movies",
  "Anime",
];

app.get("/", (req, res) => {
  res.render("index", {
    user: req.session.user,
  });
});

app.post("/register", async (req, res) => {
  const { username, password } =
    req.body;

  const exists = await User.findOne({
    username,
  });

  if (exists) {
    return res.send("User exists");
  }

  const hash = await bcrypt.hash(
    password,
    10
  );

  const user = await User.create({
    username,
    password: hash,
  });

  req.session.user = {
    id: user._id,
    username: user.username,
  };

  res.redirect("/forum");
});

app.post("/login", async (req, res) => {
  const { username, password } =
    req.body;

  const user = await User.findOne({
    username,
  });

  if (!user) {
    return res.send("Wrong account");
  }

  const match = await bcrypt.compare(
    password,
    user.password
  );

  if (!match) {
    return res.send("Wrong password");
  }

  req.session.user = {
    id: user._id,
    username: user.username,
  };

  res.redirect("/forum");
});

app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
});

app.get("/forum", auth, async (req, res) => {
  const posts = await Post.find().sort({
    created: -1,
  });

  res.render("forum", {
    user: req.session.user,
    sections,
    posts,
  });
});

app.get(
  "/section/:name",
  auth,
  async (req, res) => {
    const posts = await Post.find({
      section: req.params.name,
    }).sort({
      created: -1,
    });

    res.render("section", {
      user: req.session.user,
      posts,
      section: req.params.name,
    });
  }
);

app.post(
  "/create-post",
  auth,
  async (req, res) => {
    const {
      title,
      content,
      section,
    } = req.body;

    await Post.create({
      title,
      content,
      section,
      author:
        req.session.user.username,
    });

    res.redirect(
      "/section/" + section
    );
  }
);

app.get("/profile", auth, async (
  req,
  res
) => {
  const posts = await Post.find({
    author: req.session.user.username,
  });

  res.render("profile", {
    user: req.session.user,
    posts,
  });
});

app.listen(3000, () => {
  console.log(
    "Forum running on port 3000"
  );
});
