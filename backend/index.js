const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const app = express();

mongoose
  .connect("mongodb://localhost:27017/User")
  .then(() => console.log("DB is Connected"))
  .catch((err) => console.log(err.message));

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  email: {
    type: String,
    require: true,
    unique: true,
  },
  password: {
    type: String,
  },
});

const User = mongoose.model("user", UserSchema);
app.use(express.json());
app.use(cors());

app.post("/Register", async (req, res) => {
  try {
    const result = await User.create(req.body);
    res.send({ message: "Register successful" });
  } catch (error) {
    if (error.code === 11000) {
      return res.send({ message: "email is already registered" });
    }
  }
});

app.get("/", async (req, res) => {
  const result = await User.find({});
  res.send(result);
});

app.post("/Login", async (req, res) => {
  const user = await User.findOne(req.body);

  if (!user) {
    return res.send({ success: false, message: "Wrong login" });
  }

  const token = jwt.sign({ email: user.email }, "abc123");

  res.send({ success: true, message: "Successfully login", token });
});

app.post("/verify", async (req, res) => {
  try {
    const { email } = jwt.verify(req.body.token, "abc123");
    const user = await User.findOne({ email });
    console.log(user);

    if (user) {
      return res.json({
        success: true,
        DBData: {
          name: user.name,
          email: user.email,
        },
      });
    }
  } catch (err) {
    res.json({ success: false, message: "token invalid" });
  }
});

app.listen(80, () => console.log("Server is Stared !"));
