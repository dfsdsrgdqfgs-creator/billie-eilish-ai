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
  { id: 1, name: "General Discussion" },
  { id: 2, name: "Games" },
  { id: 3, name: "Technology" },
  { id: 4, name: "Movies" },
];

app.post("/register", (req, res) => {
  const { username, password } = req.body;

  const exists = users.find((u) => u.username === username);

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
      message: "Invalid username or password",
    });
  }

  req.session.user = {
    username: user.username,
  };

  res.json({
    success: true,
  });
});

app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
});

app.get("/profile", (req, res) => {
  if (!req.session.user) {
    return res.redirect("/");
  }

  res.send(`
    <html>
    <head>
      <title>Profile</title>
      <style>
        body{
          background:#111;
          color:white;
          font-family:Arial;
          padding:40px;
        }

        .box{
          background:#1c1c1c;
          padding:30px;
          border-radius:15px;
          width:300px;
        }

        a{
          color:#4da6ff;
          text-decoration:none;
        }
      </style>
    </head>
    <body>
      <div class="box">
        <h1>Profile</h1>
        <p>Username: ${req.session.user.username}</p>

        <br>

        <a href="/sections">Enter Sections</a>

        <br><br>

        <a href="/logout">Logout</a>
      </div>
    </body>
    </html>
  `);
});

app.get("/sections", (req, res) => {
  if (!req.session.user) {
    return res.redirect("/");
  }

  const html = sections
    .map(
      (s) => `
      <div class="card">
        <h2>${s.name}</h2>
        <a href="/section/${s.id}">
          Open Section
        </a>
      </div>
    `
    )
    .join("");

  res.send(`
    <html>
    <head>
      <title>Sections</title>

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
          border-radius:15px;
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
        Back Profile
      </a>
    </body>
    </html>
  `);
});

app.get("/section/:id", (req, res) => {
  if (!req.session.user) {
    return res.redirect("/");
  }

  const section = sections.find(
    (s) => s.id == req.params.id
  );

  if (!section) {
    return res.send("Section Not Found");
  }

  res.send(`
    <html>
    <head>
      <title>${section.name}</title>

      <style>
        body{
          background:#111;
          color:white;
          font-family:Arial;
          padding:40px;
        }

        .box{
          background:#1c1c1c;
          padding:25px;
          border-radius:15px;
        }

        a{
          color:#4da6ff;
        }
      </style>
    </head>

    <body>
      <div class="box">
        <h1>${section.name}</h1>

        <p>
          Welcome to this section.
        </p>

        <a href="/sections">
          Back Sections
        </a>
      </div>
    </body>
    </html>
  `);
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
