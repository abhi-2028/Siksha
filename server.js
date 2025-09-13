const mongoose = require("mongoose");
const express = require("express");
const app = express();
const path = require("path");
const Student = require("./models/student");
const Teacher = require("./models/teacher"); // <-- create this model
const bcrypt = require("bcryptjs");

mongoose.connect("mongodb://127.0.0.1:27017/digitalLearning")
.then(() => console.log("MongoDB connected"))
.catch((err) => console.log(err));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));

// ================== HOME ==================
app.get("/", (req, res) => {
  res.render("home");
});

// ================== STUDENT ROUTES ==================

// Register Page
app.get("/students/register", (req, res) => {
  res.render("registerStudent");
});

// Handle Register
app.post("/students/register", async (req, res) => {
  const { name, class: studentClass, rollNo, password } = req.body;

  const existing = await Student.findOne({ rollNo });
  if (existing) return res.send("Student already exists!");

  const hashPass = await bcrypt.hash(password, 8);

  const student = new Student({
    name,
    class: studentClass,
    rollNo,
    password: hashPass
  });
  await student.save();
  res.redirect("/students/login");
});

// Login Page
app.get("/students/login", (req, res) => {
  res.render("loginStudent");
});

// Handle Login
app.post("/students/login", async (req, res) => {
  const { rollNo, password } = req.body;

  const student = await Student.findOne({ rollNo });
  if (!student) return res.send("No Student Found");

  const passMatch = await bcrypt.compare(password, student.password);
  if (!passMatch) return res.send("Wrong Password");

  res.render("studentdashboard", { student });
});

// ================== TEACHER ROUTES ==================

// Register Page
app.get("/teachers/register", (req, res) => {
  res.render("registerTeacher");
});

// Handle Register
app.post("/teachers/register", async (req, res) => {
  const { name, email, password } = req.body;

  const existing = await Teacher.findOne({ email });
  if (existing) return res.send("Teacher already exists!");

  const hashPass = await bcrypt.hash(password, 8);

  const teacher = new Teacher({
    name,
    email,
    password: hashPass
  });
  await teacher.save();
  res.redirect("/teachers/login");
});

// Login Page
app.get("/teachers/login", (req, res) => {
  res.render("loginTeacher");
});

// Handle Login
app.post("/teachers/login", async (req, res) => {
  const { email, password } = req.body;

  const teacher = await Teacher.findOne({ email });
  if (!teacher) return res.send("No Teacher Found");

  const passMatch = await bcrypt.compare(password, teacher.password);
  if (!passMatch) return res.send("Wrong Password");

  res.render("teacherdashboard", { teacher });
});

// ================== DASHBOARD + LOGOUT ==================
app.get("/demodashboard1", (req, res) => {
  res.render("demodashboard");
});

app.get("/demodashboard2", (req, res) => {
  res.render("demoTeacherDashboard");
});

app.post("/logout", (req, res) => {
  res.redirect("/");
});

// ================== SERVER ==================
app.listen(8080, () => {
  console.log("Listening to port 8080");
});
