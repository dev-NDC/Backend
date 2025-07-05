const axios = require("axios");
const Visitor = require("../../database/Visitor");

const getValueFromUSDOT = async (req, res) => {
    try {
        const { dot_number } = req.body;
        if (!dot_number) {
            return res.status(400).json({ error: "dot_number is required" });
        }
        const response = await axios.get(
            `https://data.transportation.gov/resource/az4n-8mr2.json?dot_number=${dot_number}`
        );
        const data = response.data[0];
        res.status(200).json({
            data
        });
    } catch (error) {
        console.error("Error in getValueFromUSDOT:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};


// Utility to get IP address
const getIpAddress = (req) => {
    const forwarded = req.headers["x-forwarded-for"];
    return forwarded ? forwarded.split(",")[0] : req.socket.remoteAddress;
};


const handleVisitor = async (req, res) => {
    try {
        const ipAddress = getIpAddress(req);
        const userAgent = req.headers["user-agent"] || "Unknown";

        let locationData = {
            country: "Unknown",
            city: "Unknown",
            region: "Unknown",
            timezone: "Unknown"
        };

        // Optional: fetch location info using ipapi.co or ipinfo.io (free tier usage limits)
        try {
            const geoRes = await axios.get(`https://ipapi.co/${ipAddress}/json/`);
            const geo = geoRes.data;
            locationData = {
                country: geo.country_name || "Unknown",
                city: geo.city || "Unknown",
                region: geo.region || "Unknown",
                timezone: geo.timezone || "Unknown"
            };
        } catch (geoErr) {
            console.warn("Geo IP fetch failed:", geoErr.message);
        }

        const visitor = new Visitor({
            ipAddress,
            userAgent,
            location: locationData,
            userId: req.user?.userId || null  // Attach user ID if available
        });

        await visitor.save();

        res.status(200).json({
            errorStatus: 0,
            message: "Visitor logged successfully",
        });
    } catch (error) {
        console.error("Visitor logging error:", error);
        res.status(500).json({
            errorStatus: 1,
            message: "Failed to log visitor",
            error: error.message,
        });
    }
};

module.exports = { getValueFromUSDOT, handleVisitor };