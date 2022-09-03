const express = require("express");
const router = express.Router();
const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../middleware/authMiddleware");
const { request } = require("express");

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
    // Throw + confirm error if user creation fails. Log error in console for debugging
    console.log(error);
    res
      .status(500)
      .send({ message: "Error creating user", success: false, error });
  }
});

router.post("/login", async (req, res) => {
  try {
    // Search for user by provided email
    const user = await User.findOne({ email: req.body.email });

    // If no matching user found, don't execute the rest of the login logic, and return error message
    if (!user) {
      return res
        .status(200)
        .send({ message: "User does not exist", success: false });
    }

    // Check provided password against stored (encrypted) password
    // Bcrypt 'compare' method handles this, so there is no need to explicitly handle encrypted password vs unencrypted password provided by user
    const isMatch = await bcrypt.compare(req.body.password, user.password);

    // If password doesn't match, don't execute further login logic, return error message
    if (!isMatch) {
      return res
        .status(200)
        .send({ message: "Password incorrect", success: false });
    }

    // Otherwise, proceed with login and return authentication (access) token
    // JWT 'sign' method will generate the token. The first parameter for this method is the data JWT is to encrypt in the token payload
    // The second parameter is the secret key to decode the token payload
    // The third parameter provided is validity period for the token (how long until it expires). There is no default value for this, so one must
    // be provided at some point in the process if we wish to restrict this
    else {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "2h",
      });

      // If login successful, confirm login and return token
      res
        .status(200)
        // The returned data is only the token, so there is no need for an object (i.e., 'data: { token }').
        .send({ message: "Login successful", success: true, data: token });
    }
  } catch (error) {
    // On other errors (network issues, browser issues, etc.), return error message and details, and log error details in console for debugging
    console.log(error);
    res
      .status(500)
      .send({ message: "Error logging in", success: false, error });
  }
});

// This will return a users name and email once they are logged in.
// A logged in user only has a token as stored information, so this token needs to be used
// to request further information about the user from the database.
// This is the first protected route in this project, so will have differences to the two routes above.
// This will call authMiddleware to verify the user token before proceeding
router.post("/get-user-info-by-id", authMiddleware, async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.body.userId });
    // The user object will be passed as data in the response, so the password should be obscured for security
    user.password = undefined;
    // If matching user ID not found, return error message and don't execute further logic
    if (!user) {
      return res
        .status(200)
        .send({ message: "User does not exist", success: false });
    } else {
      // Otherwise, return user's name and email
      res.status(200).send({
        success: true,
        data: user,
      });
    }
  } catch (error) {
    // On error, return error message and details
    res
      .status(500)
      .send({ message: "Error getting user info", success, error });
  }
});

module.exports = router;
