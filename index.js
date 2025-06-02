import express from "express";
import cors from "cors";
import { dirname } from "path";
import path from "path";
import { fileURLToPath } from "url";
import { title } from "process";
import { createClient } from "@supabase/supabase-js";
import { create } from "domain";
import {
  findUser,
  getAllGoals,
  getGoalById,
  createGoal,
  updateGoal,
  deleteGoal,
} from "./public/db.js";
import { get } from "http";
import session from "express-session";
import dotenv from "dotenv";
import flash from "connect-flash";

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const secret = process.env.SECRET_SESSION;
const supabase = createClient(supabaseUrl, supabaseKey);

//Retrieve all categories
const { data: category, error: categoryError } = await supabase
  .from("category")
  .select("*");
if (categoryError) {
  console.log("[ERROR] Unable to fetch category:", categoryError);
}
console.log(category);
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
app.use(
  session({
    secret: secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false, // Set to true in production with HTTPS
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
  })
);
app.use(flash());
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success");
  res.locals.error_msg = req.flash("error");
  next();
});

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

//Sign_up
app.post("/signup", async (req, res) => {
  const { data, error } = await supabase.auth.signUp({
    email: req.body.email,
    password: req.body.password,
  });
  if (error) {
    console.log("[ERROR] Unable to create user", error);
    req.flash("error", "Signup failed: " + error.message);
    return res.status(401).send("Unable to create user");
  }
  req.flash(
    "success",
    "Signup successful!  Please confirm your email before  logging in."
  );
  return res.redirect("/login");
});

// Login form + Authentication
app.post("/login", async (req, res) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: req.body.email,
    password: req.body.password,
  });
  if (error) {
    console.log("[ERROR] Unable to login", error);
    return res.status(401).send("Unauthorized");
  }
  const user = data.user;
  req.session.user = user;
  return res.redirect("/bucket");
});

app.get("/bucket", async (req, res) => {
  const user = req.session.user;
  if (!user) {
    console.log("[Error] No user in session");
    return res.redirect("/login");
  }

  const { data: goals, error: goalsError } = await getAllGoals(supabase, user);
  if (goalsError) {
    console.error("[Error] Failed to fetch goals:", goalsError);
    return res.status(500).send("Error fetching goals");
  }
  // console.log(goals);
  // if (!Array.isArray(goals)) {
  //   res.locals.goals = [];
  // } else {
  //   res.locals.goals = goals;
  // }

  return res.render("bucket", { goals, category });
});

//Add new goal
app.get("/add", async (req, res) => {
  res.render("new-goal", { category });
});

app.post("/add", async (req, res) => {
  const goal = req.body;
  const user = req.session.user;
  if (!user) {
    console.log("[Error] No user in session");
    return res.redirect("/login");
  }
  try {
    const { data: addedGoal } = await createGoal(supabase, goal, user);
    console.log("added goal", addedGoal);
    if (addedGoal) {
      const { data: goals, error } = await getAllGoals(supabase, user);
      if (error) {
        console.error("[Error] Failed to fetch updated goals:", error);
        return res
          .status(500)
          .send("Goal added, but failed to fetch updated goals.");
      }
      return res.render("bucket", { goals, category });
    }
  } catch (err) {
    console.error("[Error] Exception during goal creation:", err.message);
    return res.status(400).send(err.message); // e.g. duplicate goal title
  }
});

//Admin dashboard
app.get("/admin", async (req, res) => {
  const user = req.session.user;
  if (!user) {
    console.log("[Error] No user in session");
    return res.redirect("/login");
  }
  //Get all the goals from the table
  const { data: goals } = await getAllGoals(supabase, user);
  res.render("admin", { goals, category });
});

//Update a given
app.get("/bucket-item", (req, res) => {
  const goal = req.query;
  console.log(req.query);
  res.render("editgoal", { goal, category });
});

app.post("/bucket-item", async (req, res) => {
  const goal = req.body;
  //Get user id
  const user = req.session.user;
  console.log(user);
  if (!user) {
    console.log("[Error] No user in session");
    return res.redirect("/login");
  }
  // Update the goal with the given id
  const { data: updatedgoal, error: updatedGoalError } = await updateGoal(
    supabase,
    goal,
    user
  );
  console.log("Goal updated successfully");
  const { data: goals, error } = await getAllGoals(supabase, user);
  return res.render("admin", { goals, category });
});

app.delete("/bucket-item", async (req, res) => {
  const id = req.query.id;
  const user = req.session.user;
  if (!user) {
    console.log("[Error] No user in session");
    return res.redirect("/login");
  }

  const { data: goal, error: goalError } = await deleteGoal(supabase, id);
  console.log("Goal deleted successfully");
  const { data: goals, error } = await getAllGoals(supabase, user);
  return res.render("bucket", { goals, category });
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
