const jwt = require("jsonwebtoken");

// Authorisation for protected routes
module.exports = async (req, res, next) => {
  try {
    // Check if token exists and is valid
    // Note on .split: in the front end, we configured Authorization to "Bearer " + localStorage.getItem("token")
    // .split(" ") should split this at the space after "Bearer", meaning position 0 is "Bearer" and position 1 will be the token
    const token = req.headers["authorization"].split(" ")[1];

    // Check the token is valid
    // jwt.verify does the heavy lifting in this process. The first parameter will be the token (what we're decrypting), and the second is the secret key for decryption
    // This will return either and error, or the decoded information: (err, decoded)
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).send({
          message: "Authorisation failed",
          success: false,
        });
      } else {
        // Update the request with the decoded user ID
        req.body.userId = decoded.id;
        next();
      }
    });
  } catch (error) {
    return res.status(401).send({
      message: "Authorisation failed",
      success: false,
    });
  }
};
