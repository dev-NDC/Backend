const express = require('express');
const path = require("path");
const cors = require("cors");
require('dotenv').config();

const app = express();
const port = process.env.PORT || 8000;

// MongoDB connection
require("./database/db");

// Body parsers for JSON and URL-encoded data
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Enable text body for XML (optional if you're using express.raw below)
app.use(express.text({ type: 'text/xml', limit: '50mb' }));

// CORS configuration
app.use(cors({
  origin: (origin, callback) => {
    callback(null, origin); // allow all origins for now
  },
  credentials: true
}));

// Serve static files from EmailTempletes folder
app.use("/email-assets", express.static(path.join(__dirname, "Controllers", "User", "EmailTempletes")));

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

// Random routes
const RandomRoutes = require("./Routes/Random/Random");
app.use("/api/random", RandomRoutes);

// I3Screen SOAP Listener — accepts raw XML (application/xml)
const { I3screenListner, sendWSDLFile } = require("./Routes/Result/Result");

app.post(
  "/api/i3Screen/I3screenListner",
  express.raw({ type: "application/xml", limit: "50mb" }),
  I3screenListner
);

// Optional: serve WSDL for testing
app.get("/api/i3Screen/wsdl", sendWSDLFile);

// ------------------ SERVER ------------------
app.listen(port, () => {
  console.log(`✅ Server listening on port ${port}`);
});


































/*const express = require('express');
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
//app.use(bodyParser.text({ type: 'text/xml' }));
app.use(bodyParser.text({ type: 'text/xml', limit: '50mb' }));

app.use(cors({
  origin: (origin, callback) => {
    // Allow all origins for now (but required when credentials are true)
    callback(null, origin);
  },
  credentials: true
}));

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

// random routes
const RandomRoutes = require("./Routes/Random/Random")
app.use("/api/random", RandomRoutes)


// I3Screen Routes
// Accept raw XML at the SOAP endpoint
app.use('/api/i3Screen/I3screenListner', express.raw({ type: 'application/xml', limit: '50mb' }));
const resultRoutes = require("./Routes/Result/Result")
app.use("/api/i3Screen", resultRoutes);

// ------------------ SERVER ------------------
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);


});
