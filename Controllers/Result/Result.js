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
    const xml = req.body.toString(); // convert Buffer to string
    if (!xml || typeof xml !== 'string') {
        return res.status(400).send('Missing or invalid XML payload');
    }

    try {
        // Parse the outer SOAP envelope
        const result = await xml2js.parseStringPromise(xml, {
            explicitArray: false
        });

        // Navigate into envelope → body → result
        const envelope = result['SOAP-ENV:Envelope'] || result['soapenv:Envelope'];
        const body = envelope['SOAP-ENV:Body'] || envelope['soapenv:Body'];
        const resultBody = body['ns1:result'] || body['result'];

        // 🔽 INSERT HERE: Parse <data> XML payload
        const rawData = resultBody?.data;
        if (!rawData) {
            return res.status(400).send('<error>Missing data element</error>');
        }

        // Parse inner XML from <data><![CDATA[...]]]>
        const parsedData = await xml2js.parseStringPromise(rawData, {
            explicitArray: false
        });

        // Now you can access data like this:
        const report = parsedData?.BackgroundReports || {};
        const caseId = report?.ProviderReferenceId?.IdValue || 'UNKNOWN';

        const screening = report?.BackgroundReportPackage?.Screenings?.Screening;
        const status = screening?.ScreeningStatus?.OrderStatus || 'UNKNOWN';
        const adjudication = screening?.ScreeningStatus?.AdditionalItems?.Text || 'UNKNOWN';

        // ✅ Debug logs
        console.log(`[✔] i3screen Result Received`);
        console.log(`- Case ID: ${caseId}`);
        console.log(`- Status: ${status}`);
        console.log(`- Result: ${adjudication}`);

        // Respond with SOAP success
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
