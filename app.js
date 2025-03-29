const express = require('express')
const bodyParse = require("body-parser")
const cors = require("cors");
require('dotenv').config()

const app = express()
const port = process.env.PORT | 8000

require("./database/db")

app.use(bodyParse.json());
app.use(express.json())
app.use(bodyParse.urlencoded({
    extended:true
}))
app.use(cors()); 

// User routes
const loginAndSignUp = require('./Routes/User/LoginAndSignUp')
const validateUser = require("./Routes/User/ValidateUser")
const userDataRoutes = require("./Routes/User/UserData")
app.use("/api/loginAndSignUp",loginAndSignUp)
app.use("/api/validateUser",validateUser)
app.use("/api/user",userDataRoutes)



app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
