const  getValueFromUSDOT = async (req, res) => {
    try {

    } catch (error) {
        console.error("Error in getValueFromUSDOT:", error);
        res.status(500).json({ error: "Internal Server Error" });

    }
}

module.exports = { getValueFromUSDOT };