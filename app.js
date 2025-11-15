require("dotenv").config();
console.log("USE_LOCAL_DB:", process.env.USE_LOCAL_DB);

const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const cookieParser = require("cookie-parser");
const path = require("path");
const multer = require("multer");
const crypto = require("crypto");
const fetch = require("node-fetch");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");

// ROUTES
const companyRoutes = require("./routes/company");
app.use("/company", companyRoutes);
app.use("/api/contact", require("./routes/company"));

// DB CONNECTION
const mongoUri =
  process.env.USE_LOCAL_DB === "true"
    ? process.env.LOCAL_MONGO_URI
    : process.env.CLOUD_MONGO_URI;

if (!mongoUri) {
  console.error("❌ No MongoDB URI provided.");
  process.exit(1);
}

mongoose
  .connect(mongoUri)
  .then(() =>
    console.log(
      `Database connected: ${
        mongoUri.includes("localhost") ? "Local" : "Cloud"
      }`
    )
  )
  .catch((err) => console.error("❌ Database not connected:", err));

// EXPRESS CONFIG
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());
app.set("view engine", "ejs");

// MODELS
const usermodel = require("./models/user");
const workermodel = require("./models/worker");
const postmodel = require("./models/post");
const feedbackmodel = require("./models/feedback");

// -----------------------------------------------------------
// PROFILE IMAGE UPLOAD
// -----------------------------------------------------------
const profilestorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "./public/images/profileuploads"),
  filename: (req, file, cb) => {
    crypto.randomBytes(12, (err, bytes) => {
      cb(null, bytes.toString("hex") + path.extname(file.originalname));
    });
  },
});

const profileupload = multer({ storage: profilestorage });

// -----------------------------------------------------------
// PROBLEM IMAGE UPLOAD
// -----------------------------------------------------------
const problemstorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "./public/images/problemuploads"),
  filename: (req, file, cb) => {
    crypto.randomBytes(12, (err, bytes) => {
      cb(null, bytes.toString("hex") + path.extname(file.originalname));
    });
  },
});

const problemupload = multer({ storage: problemstorage });

// -----------------------------------------------------------
// ROUTES
// -----------------------------------------------------------
app.get("/", (req, res) => res.render("landingpage"));
app.get("/about", (req, res) => res.render("about"));
app.get("/howToHire", (req, res) => res.render("howToHire"));
app.get("/howToWork", (req, res) => res.render("howToWork"));

// -----------------------------------------------------------
// PASSWORD RESET
// -----------------------------------------------------------
app.get("/forgetPassword", (req, res) => res.render("forgetPassword"));

app.post("/forgetPassword", async (req, res) => {
  const { email } = req.body;
  const user = await usermodel.findOne({ email });

  if (!user) return res.status(404).send("User not found");

  let token = jwt.sign({ email }, "wfhsoptbb");
  user.resetToken = token;
  user.resetTokenExpiry = Date.now() + 30 * 60 * 1000;
  await user.save();

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "shramsetumailer@gmail.com",
      pass: "ywopqtrsmrlogzcz",
    },
  });

  const resetlink = `https://shram-setu.onrender.com/resetPassword?token=${token}`;

  const mailoptions = {
    from: '"Shram Setu" <shramsetumailer@gmail.com>',
    to: email,
    subject: "🔐 Reset your ShramSetu Password",
    html: `
      <p>Hello, ${user.name}</p>
      <p>Click the link below to reset your password:</p>
      <a href="${resetlink}">${resetlink}</a>
      <p>This link will expire in 30 minutes.</p>
    `,
  };

  transporter.sendMail(mailoptions, (error, info) => {
    if (error) console.log("Error :", error);
    else console.log("email sent :", info.response);
  });

  res.redirect("/");
});

app.get("/resetPassword", (req, res) => {
  const { token } = req.query;
  if (!token) return res.status(400).send("Missing token");
  res.render("resetPassword", { token });
});

app.post("/resetPassword", async (req, res) => {
  const { token, password, confirm_password } = req.body;

  if (!token) return res.status(400).send("Invalid or expired token");
  if (password !== confirm_password)
    return res.status(400).send("Passwords do not match");

  try {
    const decoded = jwt.verify(token, "wfhsoptbb");
    const user = await usermodel.findOne({
      email: decoded.email,
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() },
    });

    if (!user) return res.status(400).send("Token expired or user not found");

    user.password = await bcrypt.hash(password, 10);
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;

    await user.save();

    res.redirect("/login_user");
  } catch (err) {
    res.status(500).send("Internal Server Error");
  }
});

// -----------------------------------------------------------
// SIGNUP / LOGIN
// -----------------------------------------------------------
app.get("/signup_user", (req, res) => res.render("signup_user"));

app.post("/signup_user", async (req, res) => {
  const { name, mobile, email, password, confirm_password, formattedAddress, latitude, longitude } = req.body;

  let user = await usermodel.findOne({ mobile });
  if (user) return res.send("User already exists");
  if (password !== confirm_password) return res.send("Passwords do not match");

  const hash = await bcrypt.hash(password, 10);

  let created = await usermodel.create({
    name,
    mobile,
    email,
    password: hash,
    latitude,
    longitude,
    formattedAddress,
  });

  let token = jwt.sign({ _id: created._id, mobile }, "wfhsoptbb");
  res.cookie("token", token);
  res.render("landingpage");
});

app.get("/signup_worker", (req, res) => res.render("signup_worker"));

app.post("/signup_worker", profileupload.single("profilepic"), async (req, res) => {
  try {
    let { name, email, mobile, intro, pincode, job, minimumpay, doNotDisturbStart, doNotDisturbEnd } = req.body;

    let profilepic = req.file?.filename;

    let created = await workermodel.create({
      name,
      email,
      mobile,
      intro,
      pincode,
      job,
      minimumpay,
      doNotDisturbStart,
      doNotDisturbEnd,
      profilepic,
    });

    let token = jwt.sign({ mobile }, "wfhsoptbb");
    res.cookie("token", token);
    res.redirect("/");
  } catch (err) {
    console.log(err);
    res.status(500).send("Worker signup error");
  }
});

// LOGIN
app.get("/login_user", (req, res) => res.render("login_user"));

app.post("/login_user", async (req, res) => {
  const { mobile, password } = req.body;

  const user = await usermodel.findOne({ mobile });
  if (!user) return res.send("User not found");

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.send("Invalid credentials");

  const token = jwt.sign({ _id: user._id, mobile }, "wfhsoptbb");
  res.cookie("token", token);
  res.render("landingpage");
});

app.get("/login_worker", (req, res) => res.render("login_worker"));

app.post("/login_worker", async (req, res) => {
  const { mobile, password } = req.body;

  const worker = await workermodel.findOne({ mobile });
  if (!worker) return res.send("Worker not found");

  const ok = await bcrypt.compare(password, worker.password);
  if (!ok) return res.send("Invalid credentials");

  const token = jwt.sign({ _id: worker._id, mobile }, "wfhsoptbb");
  res.cookie("token", token);

  res.render("landingpage");
});

// -----------------------------------------------------------
// MIDDLEWARE
// -----------------------------------------------------------
function isLoggedIn(req, res, next) {
  const token = req.cookies?.token;
  if (!token) return res.redirect("/login_user");

  try {
    const data = jwt.verify(token, "wfhsoptbb");
    req.user = data;

    usermodel.findOne({ mobile: data.mobile }).then((user) => {
      if (user) {
        req.userType = "user";
        return next();
      }

      workermodel.findOne({ mobile: data.mobile }).then((worker) => {
        if (worker) {
          req.userType = "worker";
          req.worker = worker;
          return next();
        }

        return res.status(403).send("Invalid token");
      });
    });
  } catch (err) {
    res.status(401).send("Invalid or expired token");
  }
}

// -----------------------------------------------------------
// UPLOAD PROFILE IMAGE
// -----------------------------------------------------------
app.post("/uploadprofile", isLoggedIn, profileupload.single("image"), async (req, res) => {
  if (req.userType === "user") {
    let user = await usermodel.findOne({ mobile: req.user.mobile });
    user.profilepic = req.file.filename;
    await user.save();
    return res.redirect("/profile");
  }

  if (req.userType === "worker") {
    let worker = await workermodel.findOne({ mobile: req.user.mobile });
    worker.profilepic = req.file.filename;
    await worker.save();
    return res.redirect("/profile");
  }
});

// -----------------------------------------------------------
// UPLOAD PROBLEMS
// -----------------------------------------------------------
app.post("/uploadproblem", isLoggedIn, problemupload.array("pictures[]", 4), async (req, res) => {
  let user = await usermodel.findOne({ mobile: req.user.mobile }).populate("posts");
  if (!user) return res.redirect("/login_user");

  const filenames = req.files?.map((f) => f.filename) || [];

  const { name, mobile: contactMobile, job, description, estimate_budget, formattedAddress, latitude, longitude } = req.body;

  let post = await postmodel.create({
    user: user._id,
    name,
    mobile: contactMobile,
    job,
    description,
    estimate_budget,
    formattedAddress,
    latitude,
    longitude,
    pictures: filenames,
  });

  user.posts.push(post._id);
  await user.save();

  res.redirect("/");
});

// -----------------------------------------------------------
// PROFILE PAGE
// -----------------------------------------------------------
app.get("/profile", isLoggedIn, async (req, res) => {
  if (req.userType === "user") {
    let user = await usermodel.findOne({ mobile: req.user.mobile });
    return res.render("profile_user", { user });
  }

  if (req.userType === "worker") {
    let worker = await workermodel.findOne({ mobile: req.user.mobile });
    return res.render("profile_worker", { worker });
  }
});

// -----------------------------------------------------------
// LOGOUT
// -----------------------------------------------------------
app.get("/logout", isLoggedIn, (req, res) => {
  res.clearCookie("token");
  res.send("Logged out");
});

// -----------------------------------------------------------
// REVERSE GEOLOCATION
// -----------------------------------------------------------
app.post("/mylocation", async (req, res) => {
  const { latitude, longitude } = req.body;

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
    );
    const data = await response.json();

    res.json({ formatted: data.display_name });
  } catch (err) {
    res.status(500).json({ formatted: "Location fetch failed" });
  }
});

// -----------------------------------------------------------
// SERVER
// -----------------------------------------------------------
app.listen(3000, () => console.log("Server running on port 3000"));