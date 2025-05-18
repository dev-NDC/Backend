const axios = require("axios");
const { parseStringPromise } = require("xml2js");
const { XMLParser } = require("fast-xml-parser");


const username = process.env.USERID;
const password = process.env.PASSWORD;

const getOrgId = async (data) => {
    const url = "https://demo.i3screen.net/web_services/Customer?wsdl";
    const username = "ndcdemo";
    const password = "peslwruspebrEth4flst";

    const xmlPayload = `
    <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:i3l="http://i3logix.com">
      <soapenv:Header/>
      <soapenv:Body>
        <i3l:addCustomer>
          <userName>${username}</userName>
          <password>${password}</password>
          <customerName>${data.companyInfoData.companyName}</customerName>
          <accountStatus>New</accountStatus>
          <address>${data.companyInfoData.address}</address>
          <address2></address2>
          <municipality>${data.companyInfoData.city}</municipality>
          <region>${data.companyInfoData.state}</region>
          <postalCode>${data.companyInfoData.zip}</postalCode>
          <country>US</country>
          <mailingAddress></mailingAddress>
          <mailingAddress2></mailingAddress2>
          <mailingMunicipality></mailingMunicipality>
          <mailingRegion></mailingRegion>
          <mailingPostalCode></mailingPostalCode>
          <mailingCountry></mailingCountry>
          <billingAddress></billingAddress>
          <billingAddress2></billingAddress2>
          <billingMunicipality></billingMunicipality>
          <billingRegion></billingRegion>
          <billingPostalCode>${data.paymentData.billingZip}</billingPostalCode>
          <billingCountry></billingCountry>
          <phone>${data.companyInfoData.contactNumber}</phone>
          <phone2></phone2>
          <fax></fax>
          <fax2></fax2>
          <website></website>
          <orgId></orgId>
          <customerCostCode></customerCostCode>
          <matchOrderDays></matchOrderDays>
          <supportLinkUrl></supportLinkUrl>
          <supportEmail></supportEmail>
          <supportLinkText></supportLinkText>
          <supportPhone></supportPhone>
          <supportPhoneExt></supportPhoneExt>
          <supportHours></supportHours>
          <displayLocationCode></displayLocationCode>
          <useLocationCodeToMatch></useLocationCodeToMatch>
          <orderSearchDistance></orderSearchDistance>
          <wizardSendEmail></wizardSendEmail>
          <requireIdOnWizard></requireIdOnWizard>
          <scheduleReminderPriorToExpiration></scheduleReminderPriorToExpiration>
          <scheduleReminderFromOrder></scheduleReminderFromOrder>
          <requireDobAndNineDigitDonorId></requireDobAndNineDigitDonorId>
          <showContractPriceInternal></showContractPriceInternal>
          <showContractPriceSso></showContractPriceSso>
          <useParentNetwork></useParentNetwork>
          <emailDonorPass></emailDonorPass>
          <locationCodeLabel></locationCodeLabel>
          <sendLocationCodeToLab></sendLocationCodeToLab>
          <manageBillingExceptions></manageBillingExceptions>
          <markAsViewed></markAsViewed>
        </i3l:addCustomer>
      </soapenv:Body>
    </soapenv:Envelope>
  `;

    try {
        const response = await axios.post(url, xmlPayload, {
            headers: {
                "Content-Type": "text/xml;charset=UTF-8",
                "Authorization": "Basic " + Buffer.from(`${username}:${password}`).toString("base64")
            }
        });

        const parsed = await parseStringPromise(response.data, { explicitArray: false });
        const orgIdObj = parsed["SOAP-ENV:Envelope"]["SOAP-ENV:Body"]["ns1:addCustomerResponse"]["return"]["orgId"];

        // Get only the value
        const orgId = typeof orgIdObj === "object" ? orgIdObj._ : orgIdObj;

        return orgId;
    } catch (error) {
        console.error("Failed to get orgId:", error?.response?.data || error.message);
        return null;
    }
};

const getLocationCode = async (data, orgId) => {
    const username = "ndcdemo";
    const password = "peslwruspebrEth4flst";

    const xmlPayload = `
        <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
        xmlns:i3l="http://i3logix.com">
            <soapenv:Header/>
            <soapenv:Body>
                <i3l:addLocation>
                    <userName>${username}</userName>
                    <password>${password}</password>
                    <orgId>${orgId}</orgId>
                    <locationName>${data.companyInfoData.companyName}</locationName>
                    <locationCode></locationCode>
                    <status>Active</status>
                    <address>${data.companyInfoData.address}</address>
                    <address2></address2>
                    <municipality>${data.companyInfoData.city}</municipality>
                    <region>${data.companyInfoData.state}</region>
                    <postalCode>${data.companyInfoData.zip}</postalCode>
                    <country>US</country>
                    <mailingAddress></mailingAddress>
                    <mailingAddress2></mailingAddress2>
                    <mailingMunicipality></mailingMunicipality>
                    <mailingRegion></mailingRegion>
                    <mailingPostalCode></mailingPostalCode>
                    <mailingCountry></mailingCountry>
                    <billingAddress></billingAddress>
                    <billingAddress2></billingAddress2>
                    <billingMunicipality></billingMunicipality>
                    <billingRegion></billingRegion>
                    <billingPostalCode>${data.paymentData.billingZip}</billingPostalCode>
                    <billingCountry></billingCountry>
                    <phone>${data.companyInfoData.contactNumber}</phone>
                    <phone2></phone2>
                    <fax></fax>
                    <fax2></fax2>
                    <hierarchyName>COMPANY</hierarchyName>
                    <locationCodeType></locationCodeType>
                    <clinicInfo></clinicInfo>
                    <labLocationCode></labLocationCode>
                    <labLocationCodeLab></labLocationCodeLab>
                    <primaryDer></primaryDer>
                </i3l:addLocation>
            </soapenv:Body>
        </soapenv:Envelope>
    `;

    try {
        const response = await axios.post(
            "https://demo.i3screen.net/web_services/Customer?wsdl",
            xmlPayload,
            {
                headers: {
                    "Content-Type": "text/xml;charset=UTF-8",
                    "Authorization": "Basic " + Buffer.from(`${username}:${password}`).toString("base64"),
                }
            }
        );

        const parser = new XMLParser();
        const jsonData = parser.parse(response.data);

        const locationCodeObj = jsonData["SOAP-ENV:Envelope"]
            ?.["SOAP-ENV:Body"]
            ?.["ns1:addLocationResponse"]
            ?.return
            ?.locationCode;

        const locationCode = typeof locationCodeObj === "object" ? locationCodeObj._ : locationCodeObj;

        return locationCode || null;

    } catch (error) {
        console.error("Error fetching locationCode:", error.response?.data || error.message);
        return null;
    }
};

module.exports = {
    getOrgId,
    getLocationCode
}