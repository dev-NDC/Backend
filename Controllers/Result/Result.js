const path = require("path")
const xml2js = require('xml2js');

const sendWSDLFile = async (req, res) => {
    try {
        res.status(200).sendFile(path.join(__dirname, "wsdl.xml"));
    } catch (error) {
        res.status(500).json({
            errorStatus: 1,
            message: "An unexpected error occurred. Please try again later."
        })
    }
}

const I3screenListner = async (req, res) => {
    const xml = req.body?.toString?.();
    if (!xml || typeof xml !== 'string') {
        return res.status(400).send('<error>Missing or invalid XML payload</error>');
    }

    try {
        const result = await xml2js.parseStringPromise(xml, { explicitArray: false });

        const envelope = result['SOAP-ENV:Envelope'] || result['soapenv:Envelope'];
        const body = envelope['SOAP-ENV:Body'] || envelope['soapenv:Body'];

        // ✅ Accept either wrapper format
        const resultBody = body['ns1:result'] || body['i3:result'] || body['result'] || body;

        const user = resultBody?.userid;
        const pass = resultBody?.password;

        const rawData = resultBody?.data?._ || resultBody?.data;
        if (!rawData) {
            console.error('[!] Missing <data> element:', JSON.stringify(resultBody));
            return res.status(400).send('<error>Missing data element</error>');
        }

        const parsedData = typeof rawData === 'string'
            ? await xml2js.parseStringPromise(rawData, { explicitArray: false })
            : rawData;

        const report = parsedData.BackgroundReports;
        const caseId = report?.ProviderReferenceId?.IdValue || 'UNKNOWN';
        const screening = report?.BackgroundReportPackage?.Screenings?.Screening;
        const status = screening?.ScreeningStatus?.OrderStatus || 'UNKNOWN';
        const adjudication = screening?.ScreeningStatus?.AdditionalItems?.Text || 'UNKNOWN';

        console.log(`[✔] i3screen Result Received`);
        console.log(`- User: ${user}`);
        console.log(`- Case ID: ${caseId}`);
        console.log(`- Status: ${status}`);
        console.log(`- Result: ${adjudication}`);

        const soapResponse = `
        <SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/">
            <SOAP-ENV:Body>
                <ns1:resultResponse xmlns:ns1="http://i3logix.com">
                    <status>Success</status>
                    <message>Result parsed</message>
                </ns1:resultResponse>
            </SOAP-ENV:Body>
        </SOAP-ENV:Envelope>
        `;

        res.set('Content-Type', 'text/xml');
        res.send(soapResponse);

    } catch (err) {
        console.error('[!] XML Parse Error:', err.message);
        res.status(500).send(`<error>${err.message}</error>`);
    }
};

module.exports = { sendWSDLFile, I3screenListner };
