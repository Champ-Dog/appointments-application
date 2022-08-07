const express = require('express');
const app = express()
require('dotenv').config()

// DB Config will execute automatically when file is imported.
// There are no functions defined in in the dbConfig module, so nothing needs to be called - there are only instructions that will be executed immediately
const dbConfig = require('./config/dbConfig')

// Information will be sent from the front-end in JSON format, we need to instruct the back-end how to interpret this.
app.use(express.json())

// Connect to User Routes
const userRoute = require('./routes/userRoute')
app.use('/api/user', userRoute)

const port = process.env.PORT || 5000

// Instructs app to listen on specified port - this takes two parameters: first the port, then a callback function
app.listen(port, () => console.log('Node server listening on port ' + port))