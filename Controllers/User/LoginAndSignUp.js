const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken");

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
const User = require("../../database/schema")


const login = async (req, res) => {
    try {
        const {email, password} = req.body;
        if(email === "" || password == ""){
            return res.status(400).json({
                errorStatus:1,
                message:"Email and password are required."
            })
        }
        const user = await User.findOne({"contactInfoData.email": email})
        if(!user){
            return res.status(401).json({
                errorStatus:1,
                message:"Incorrect email or password",
            })
        }
        const savedPassword = user.contactInfoData.password;
        const isMatch = await bcrypt.compare(password, savedPassword);
        if(!isMatch){
            return res.status(401).json({
                errorStatus:1,
                message:"Incorrect email or password",
            })
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, email: user.contactInfoData.email },
            JWT_SECRET_KEY,
            { expiresIn: "24h" }
        );

        res.status(200).json({
            errorStatus:0,
            message:"Login successfull",
            token
        })
        
    } catch (error) {
        res.status(500).json({
            errorStatus:1,
            message:'server error, please try again later'
        })
    }
}

const signup = async (req, res) => {
    try {
        const {email} = req.body.contactInfoData;
        const exitingUser = await User.findOne({ "contactInfoData.email": email })
        if(exitingUser) {
            return res.status(400).json({
                errorStatus: 1,
                message: "User already exists with this email!"
            });
        }
        const newUser = new User(req.body);
        await newUser.save();
        res.status(200).json({
            errorStatus:0,
            message:"Account created Successfully"
        })
    }catch (error) {
        res.status(500).json({
            errorStatus: 1,
            error,
            message: "Failed to Signup"
        })
    }

}

module.exports = { login, signup }