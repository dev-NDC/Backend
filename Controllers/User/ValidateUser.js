const verifyUser = async(req,res)=>{
    try {
        res.status(200).json({
            errorStatus:0,
            message:'Valid User'
        })
    } catch (error) {
        res.status(500).json({
            errorStatus:1,
            message:'An unexpected error occurred. Please try again later.'
        })
    }
}

module.exports = {verifyUser};