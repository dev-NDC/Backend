const express = require('express');
const bodyParser = require("body-parser");
const path = require("path");
const cors = require("cors");
require('dotenv').config();

const app = express();
const port = process.env.PORT || 8000;

require("./database/db");

// Increase request payload limits
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(bodyParser.text({ type: 'text/xml' }));
app.use(cors());

// Serve static files from EmailTempletes folder
app.use("/email-assets", express.static(path.join(__dirname, "Controllers", "User", "EmailTempletes")));

// If you're using express.json() as well, apply limit there too
app.use(express.json({ limit: '50mb' }));

// ------------------ ROUTES ------------------

// User routes
const loginAndSignUp = require('./Routes/User/LoginAndSignUp');
const validateUser = require("./Routes/User/ValidateUser");
const userDataRoutes = require("./Routes/User/UserData");

app.use("/api/loginAndSignUp", loginAndSignUp);
app.use("/api/validateUser", validateUser);
app.use("/api/user", userDataRoutes);

// Admin routes
const AdminRoutes = require("./Routes/Admin/Admin");
app.use("/api/admin", AdminRoutes);

// Agency routes
const AgencyRoutes = require("./Routes/Agency/Agency");
app.use("/api/agency", AgencyRoutes);


// I3Screen Routes
// Accept raw XML at the SOAP endpoint
app.use('/api/i3Screen/I3screenListner', express.raw({ type: 'application/xml' }));
const resultRoutes = require("./Routes/Result/Result")
app.use("/api/i3Screen", resultRoutes);

// ------------------ SERVER ------------------
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
