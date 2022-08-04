const mongoose = require("mongoose");

// Configure DB connection
mongoose.connect(process.env.MONGO_URL);

// Define 'connection' object
const connection = mongoose.connection;

// Display success/error messages when connecting
connection.on("connected", () => {
  console.log("MongoDB is connected");
});
connection.on("error", (error) => {
  console.log("MongoDB connection error: ", error);
});

// Export this module
module.exports = -mongoose;
