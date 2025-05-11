
const getPackage = async (data) => {
    // here i will write XML code to get package
    const package = [
        {
            package_code: "NDCDEMO",
            package_name: "NDC Demo Package",
            package_type: "DOT"
        },
        {
            package_code: "DOTDEMO",
            package_name: "DOT Demo Package",
            package_type: "DOT"
        },
    ]
    return package;
}


const getOrderReason = async (data) => {
    // here i will write XML code to get order reason
    const orderReason = [
        {
            order_reason_code: "POST OFFER",
            order_reason_name: "POST OFFER",
        },
        {
            order_reason_code: "PRE EMPLOYMENT",
            order_reason_name: "PRE EMPLOYMENT",
        },
    ]
    return orderReason;
}

module.exports = {
    getPackage,
    getOrderReason
}