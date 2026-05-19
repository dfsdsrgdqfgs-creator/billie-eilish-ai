// server.js

const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(
  session({
    secret: "forum_secret_key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);

app.use(express.static(path.join(__dirname, "public")));

const users = [];

const sections = [
  {
    id: 1,
    title: "General Discussion",
    description: "Talk about anything here",
  },
  {
    id: 2,
    title: "Games",
    description: "Gaming section",
  },
  {
    id: 3,
    title: "Technology",
    description: "Technology news",
  },
  {
    id: 4,
    title: "Movies",
    description: "Movies and series",
  },
];

function auth(req, res, next) {
  if (!req.session.user) {
    return res.redirect("/");
  }

  next();
}

app.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.json({
      success: false,
      message: "Fill all fields",
    });
  }

  const exists = users.find(
    (u) => u.username === username
  );

  if (exists) {
    return res.json({
      success: false,
      message: "Username already exists",
    });
  }

  users.push({
    username,
    password,
  });

  req.session.user = {
    username,
  };

  res.json({
    success: true,
  });
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  const user = users.find(
    (u) =>
      u.username === username &&
      u.password === password
  );

  if (!user) {
    return res.json({
      success: false,
      message: "Wrong username or password",
    });
  }

  req.session.user = {
    username: user.username,
  };

  res.json({
    success: true,
  });
});

app.get("/logout", auth, (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
});

app.get("/profile", auth, (req, res) => {
  res.send(`
  <!DOCTYPE html>
  <html>
  <head>
    <title>Profile</title>

    <style>
      body{
        background:#0f0f0f;
        color:white;
        font-family:Arial;
        padding:40px;
      }

      .box{
        background:#1c1c1c;
        padding:30px;
        border-radius:20px;
        max-width:500px;
      }

      a{
        color:#4da6ff;
        text-decoration:none;
      }

      .btn{
        display:inline-block;
        margin-top:15px;
      }
    </style>
  </head>

  <body>

    <div class="box">
      <h1>Welcome ${
        req.session.user.username
      }</h1>

      <p>
        This is your profile page.
      </p>

      <a class="btn" href="/sections">
        Open Forum Sections
      </a>

      <br><br>

      <a class="btn" href="/logout">
        Logout
      </a>
    </div>

  </body>
  </html>
  `);
});

app.get("/sections", auth, (req, res) => {
  const html = sections
    .map(
      (section) => `
      <div class="card">
        <h2>${section.title}</h2>

        <p>${section.description}</p>

        <a href="/section/${section.id}">
          Enter Section
        </a>
      </div>
    `
    )
    .join("");

  res.send(`
  <!DOCTYPE html>
  <html>
  <head>
    <title>Forum Sections</title>

    <style>
      body{
        background:#0f0f0f;
        color:white;
        font-family:Arial;
        padding:30px;
      }

      .card{
        background:#1c1c1c;
        padding:20px;
        border-radius:20px;
        margin-bottom:20px;
      }

      a{
        color:#4da6ff;
        text-decoration:none;
      }
    </style>
  </head>

  <body>

    <h1>Forum Sections</h1>

    ${html}

    <br>

    <a href="/profile">
      Back To Profile
    </a>

  </body>
  </html>
  `);
});

app.get("/section/:id", auth, (req, res) => {
  const section = sections.find(
    (s) => s.id == req.params.id
  );

  if (!section) {
    return res.send("Section not found");
  }

  res.send(`
  <!DOCTYPE html>
  <html>
  <head>
    <title>${section.title}</title>

    <style>
      body{
        background:#0f0f0f;
        color:white;
        font-family:Arial;
        padding:30px;
      }

      .box{
        background:#1c1c1c;
        padding:25px;
        border-radius:20px;
      }

      a{
        color:#4da6ff;
      }
    </style>
  </head>

  <body>

    <div class="box">

      <h1>${section.title}</h1>

      <p>
        ${section.description}
      </p>

      <p>
        Welcome to the section.
      </p>

      <a href="/sections">
        Back To Sections
      </a>

    </div>

  </body>
  </html>
  `);
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
