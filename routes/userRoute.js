const express = require("express");
const router = express.Router();
const User = require("../models/userModel");
const bcrypt = require("bcryptjs");

router.post("/register", async (req, res) => {
  try {
    // First, check that no user exists with the given email address
    const userExists = await User.findOne({ email: req.body.email });
    if (userExists) {
      return res
        .status(200)
        .send({ message: "User already exists", success: false });
    }

    // Encrypt password
    const password = req.body.password;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Replace provided password with encrypted password
    req.body.password = hashedPassword;

    // Create new User with provided details
    const newUser = new User(req.body);
    await newUser.save();

    // Confirm success
    res
      .status(200)
      .send({ message: "User created successfully", success: true });
  } catch (error) {
    // Throw + confirm error if user creation fails
    res.status(500).send({ message: "Error creating user", success: false, error });
  }
});

router.post("/login", async (req, res) => {
  try {
  } catch (error) {}
});

module.exports = router;
