import express from "express";
import { dirname } from "path";
import path from "path";
import { fileURLToPath } from "url";
const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
const port = 3000;

// Set the view engine to ejs
app.set("view engine", "ejs");

// Set the view directory
app.set("views", path.join(__dirname, "views"));

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, "public")));

//Install Middleware
app.use(express.urlencoded({ extended: true }));

// Route Handling
app.get("/", (req, res) => {
  res.render("index");
});
app.get("/login", (req, res) => {
  res.render("sign-in");
});
app.get("/signup", (req, res) => {
  res.render("signup");
});

// Login form + Authentication
app.post("/login", (req, res) => {
  let user = req.body["email"];
  let password = req.body["password"];
  if ((user === "nes.elimbi@gmail.com") & (password === "nessie")) {
    res.render("bucket");
  }

  //collect the email and password

  // check if the email and password match

  // if we have matching items, show the list of all bucket (bucket.ejs)
});

//Admin dashboard
app.get("/admin", (req, res) => {
  console.log("Hello");
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
