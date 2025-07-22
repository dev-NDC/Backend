const path = require("path");
const xml2js = require("xml2js");
const User = require("../../database/User");
const Result = require("../../database/Result"); // Add path as per your structure
const Driver = require("../../database/Driver"); // Add path as per your structure

const sendWSDLFile = async (req, res) => {
    try {
        res.status(200).sendFile(path.join(__dirname, "wsdl.xml"));
    } catch (error) {
        res.status(500).json({
            errorStatus: 1,
            message: "An unexpected error occurred. Please try again later.",
        });
    }
};

const I3screenListner = async (req, res) => {
    const xml = req.body?.toString?.();
    if (!xml || typeof xml !== "string") {
        return res.status(400).send("<error>Missing or invalid XML payload</error>");
    }

    try {
        const result = await xml2js.parseStringPromise(xml, { explicitArray: false });

        const envelope = result["SOAP-ENV:Envelope"] || result["soapenv:Envelope"];
        const body = envelope["SOAP-ENV:Body"] || envelope["soapenv:Body"];
        const resultBody = body["ns1:result"] || body["i3:result"] || body["result"] || body;

        const user = resultBody?.userid;
        const pass = resultBody?.password;

        if (!user || !pass) {
            return res.status(400).send("<error>Missing user or password</error>");
        }
        // Validate user credentials
        if (user !== process.env.USERID || pass !== process.env.PASSWORD) {
            return res.status(401).send("<error>Invalid user or password</error>");
        }

        const rawData = resultBody?.data?._ || resultBody?.data;
        if (!rawData) {
            console.error("[!] Missing <data> element:", JSON.stringify(resultBody));
            return res.status(400).send("<error>Missing data element</error>");
        }

        const parsedData = typeof rawData === "string"
            ? await xml2js.parseStringPromise(rawData, { explicitArray: false })
            : rawData;

        const report = parsedData.BackgroundReports;
        const caseId = report?.ProviderReferenceId?.IdValue?.toString();
        const screening = report?.BackgroundReportPackage?.Screenings?.Screening;
        const status = screening?.ScreeningStatus?.OrderStatus || "UNKNOWN";

        const imageNode = report?.BackgroundReportPackage?.SupportingDocumentation?.Documentation?.Image;
        const pdfBase64 = imageNode?._ || imageNode;
        const filename = imageNode?.$.fileName || "report.pdf";
        const mimeType = imageNode?.$.mediaType === "pdf" ? "application/pdf" : "application/octet-stream";
        const pdfBuffer = pdfBase64 ? Buffer.from(pdfBase64, "base64") : null;

        // 🔍 Find the result by caseNumber
        const resultDoc = await Result.findOne({ caseNumber: caseId });

        if (!resultDoc) {
            const errorSoapResponse = `
        <SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/">
          <SOAP-ENV:Body>
            <ns1:resultResponse xmlns:ns1="http://i3logix.com">
              <status>Error</status>
              <message>No matching result found for case ID: ${caseId}</message>
            </ns1:resultResponse>
          </SOAP-ENV:Body>
        </SOAP-ENV:Envelope>
      `;
            res.set("Content-Type", "text/xml");
            return res.status(404).send(errorSoapResponse);
        }

        // ✏️ Update result
        resultDoc.status = status;
        if (pdfBuffer) {
            resultDoc.file = pdfBuffer;
            resultDoc.filename = filename;
            resultDoc.mimeType = mimeType;
        }
        await resultDoc.save();

        // 🚦 Update corresponding driver
        if (resultDoc.driverId) {
            await Driver.findByIdAndUpdate(
                resultDoc.driverId,
                { isActive: status === "Negative" },
                { new: true }
            );
        }

        const soapResponse = `
      <SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/">
        <SOAP-ENV:Body>
          <ns1:resultResponse xmlns:ns1="http://i3logix.com">
            <status>Success</status>
            <message>Result parsed, PDF saved, and DB updated</message>
          </ns1:resultResponse>
        </SOAP-ENV:Body>
      </SOAP-ENV:Envelope>
    `;

        res.set("Content-Type", "text/xml");
        res.send(soapResponse);
    } catch (err) {
        console.error("[!] XML Parse Error:", err.message);
        res.status(500).send(`<error>${err.message}</error>`);
    }
};

module.exports = { sendWSDLFile, I3screenListner };
