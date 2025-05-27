import express from "express";
import cors from "cors";
import { dirname } from "path";
import path from "path";
import { fileURLToPath } from "url";
import { goals, category } from "./Bucketlify/data/data.js";
import fs from "fs";
import { title } from "process";

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
app.use(express.json());

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
  if ((user === "nes.elimbi@gmail.com") & (password === "nes")) {
    res.render("bucket", { goals, category });
  }
});
//Add new goal
app.get("/add", (req, res) => {
  res.render("new-goal");
});

app.post("/add", (req, res) => {
  // save file to goal
  const data = req.body;
  //save file to the data
  const goal_id = goals.length + 1;
  const new_goal = {
    id: goal_id,
    title: data.title,
    category: data.category,
    completed: false,
  };
  goals.push(new_goal);
  const fileContent = `export const goals = ${JSON.stringify(goals, null, 2)}
  export const category = ${JSON.stringify(category, null, 2)}`;
  fs.writeFile("./Bucketlify/data/data.js", fileContent, (err) => {
    if (err) {
      console.error("Error writing to data.js", err);
      return res.status(500).send("Failed to save goal.");
    }
    console.log("Goal successfully added to the database");
    res.render("bucket", { goals, category });
  });
});

//Admin dashboard
app.get("/admin", (req, res) => {
  res.render("admin", { goals, category });
});

//Update a given
app.get("/bucket-item", (req, res) => {
  const { id, title, category, completed } = req.query;
  console.log(req.query);
  res.render("editgoal", { id, title, category, completed });
});

app.post("/bucket-item", (req, res) => {
  const data = req.body;
  for (let i = 0; i < goals.length; i++) {
    if (data.id == goals[i].id) {
      // console.log(title);
      goals[i].title = data.title;
      goals[i].category = data.category;
      goals[i].completed = Boolean(data.completed);
      // Write to the database
      const fileContent = `export const goals = ${JSON.stringify(
        goals,
        null,
        2
      )}
      export const category = ${JSON.stringify(category, null, 2)} `;
      fs.writeFile("./Bucketlify/data/data.js", fileContent, (err) => {
        if (err) {
          console.error("Error writing to data.js", err);
          return res.status(500).send("Failed to save goal.");
        }
        console.log("Goal updated successfully");
        res.render("admin", { goals, category });
      });
      break;
    }
  }
});

app.delete("/bucket-item", (req, res) => {
  const id = req.query.id;
  for (let i = 0; i < goals.length; i++) {
    if (id == goals[i].id) {
      goals.splice(goals.indexOf(i), 1);
      // Write to the database
      const fileContent = `export const goals = ${JSON.stringify(
        goals,
        null,
        2
      )}
      export const category = ${JSON.stringify(category, null, 2)} `;
      fs.writeFile("./Bucketlify/data/data.js", fileContent, (err) => {
        if (err) {
          console.error("Error writing to data.js", err);
          return res.status(500).send("Failed to save goal.");
        }
        console.log("Goal deleted successfully");
        res.render("admin", { goals, category });
      });
      break;
    }
  }
  console.log("Unable to find goal");
});
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
