const verifyAgency = async(req,res)=>{
    try {
        res.status(200).json({
            errorStatus:0,
            message:'Valid User'
        })
    } catch (error) {
        res.status(500).json({
            errorStatus:1,
            message:'server error, please try again later'
        })
    }
}

module.exports = {verifyAgency};