const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const transporter = require("./Transpoter")
const User = require("../../database/User");

const createCustomPDF = async (userData, id) => {
    const email = userData.contactInfoData.email;
    const doc = new PDFDocument({ size: "A4", margin: 10 });
    const outputPath = path.join(__dirname, "temp", "custom.pdf");

    if (!fs.existsSync(path.dirname(outputPath))) {
        fs.mkdirSync(path.dirname(outputPath));
    }

    const stream = fs.createWriteStream(outputPath);
    doc.pipe(stream);

    // ====== Draw Company Logo (centered with top margin 10px) ======
    const logoPath = path.join(__dirname, "logo.png");
    if (fs.existsSync(logoPath)) {
        const logoWidth = 60;
        const xPosition = (doc.page.width - logoWidth) / 2;
        const yPosition = 10;
        doc.image(logoPath, xPosition, yPosition, { width: logoWidth });
    }

    // ====== Draw Page Border ======
    const borderMarginTop = 80;
    const borderMarginOther = 10;

    doc.rect(
        borderMarginOther,
        borderMarginTop,
        doc.page.width - 2 * borderMarginOther,
        doc.page.height - borderMarginTop - borderMarginOther
    ).stroke();

    // Move inside the border for actual content
    const translateX = borderMarginOther + 10;
    const translateY = borderMarginTop + 10;
    doc.translate(translateX, translateY);

    const contentWidth = doc.page.width - 2 * borderMarginOther - 20;

    // ====== Header ======
    doc.fontSize(32)
        .font("Helvetica-Bold")
        .fillColor("blue")
        .text("New Client Sign-Up Form", {
            align: "center",
            width: contentWidth,
        });

    // ====== Subtext ======
    doc.moveDown(1)
        .fontSize(12)
        .font("Helvetica")
        .fillColor("black")
        .text(
            "Please carefully read applicant terms, information must be complete. This will allow NDC Billing Department to provide proper service. All Invoices are due upon receipt. Any late charges incurred may not be waived and are to be paid in full.",
            {
                align: "left",
                width: contentWidth,
            }
        );

    // ====== Horizontal Line ======
    const lineMarginTop = 4;
    const lineMarginBottom = 4;

    doc.moveDown(lineMarginTop);

    const lineStartX = 1;
    const lineEndX = contentWidth - 1;

    doc.strokeColor("black")
        .moveTo(lineStartX, doc.y)
        .lineTo(lineEndX, doc.y)
        .stroke();

    doc.moveDown(lineMarginBottom);

    doc.moveDown(1)
        .fontSize(26)
        .font("Helvetica")
        .fillColor("blue")
        .text("Contact Information", {
            align: "left",
            width: contentWidth,
        });

    doc.moveDown(0)
        .fillColor("black");
    doc.y += 20;

    const colGap = 20;
    const colWidth = (contentWidth - colGap) / 2;
    const startX = doc.x;
    const startY = doc.y;

    // First Row: First Name & Last Name
    doc.font("Helvetica-Bold").fontSize(12);
    doc.text("First Name:", startX, startY, { width: colWidth });
    doc.text("Last Name:", startX + colWidth + colGap, startY, { width: colWidth });

    doc.font("Helvetica").fontSize(12);
    const afterLabelY = doc.y + 4;
    doc.text(userData.contactInfoData.firstName, startX, afterLabelY, { width: colWidth });
    doc.text(userData.contactInfoData.lastName, startX + colWidth + colGap, afterLabelY, { width: colWidth });

    doc.moveDown(1);

    // Second Row: Phone No & Email
    const secondRowY = doc.y;
    doc.font("Helvetica-Bold");
    doc.text("Phone No:", startX, secondRowY, { width: colWidth });
    doc.text("Email:", startX + colWidth + colGap, secondRowY, { width: colWidth });

    doc.font("Helvetica");
    const afterSecondLabelY = doc.y + 4;
    doc.text(userData.contactInfoData.phone, startX, afterSecondLabelY, { width: colWidth });
    doc.text(userData.contactInfoData.email, startX + colWidth + colGap, afterSecondLabelY, { width: colWidth });

    // ====== Add Second Page ======
    doc.addPage({ size: "A4", margin: 10 });

    // Redraw logo
    if (fs.existsSync(logoPath)) {
        const logoWidth = 60;
        const xPosition = (doc.page.width - logoWidth) / 2;
        const yPosition = 10;
        doc.image(logoPath, xPosition, yPosition, { width: logoWidth });
    }

    // Redraw border
    doc.rect(
        borderMarginOther,
        borderMarginTop,
        doc.page.width - 2 * borderMarginOther,
        doc.page.height - borderMarginTop - borderMarginOther
    ).stroke();

    doc.translate(translateX, translateY);

    const newContentWidth = doc.page.width - 2 * borderMarginOther - 20;

    // === Company Info Section ===
    doc.moveDown(2);
    doc.fontSize(26)
        .font("Helvetica")
        .fillColor("blue")
        .text("Company Information", {
            align: "left",
            width: newContentWidth,
        });

    doc.moveDown(0)
        .fillColor("black");
    doc.y += 20;

    const colGap2 = 20;
    const colWidth2 = (newContentWidth - colGap2) / 2;
    const startX2 = doc.x;
    const startY2 = doc.y;

    doc.font("Helvetica-Bold").fontSize(12);
    doc.text("Company Name *", startX2, startY2, { width: colWidth2 });
    doc.text("USDOT# *", startX2 + colWidth2 + colGap2, startY2, { width: colWidth2 });

    doc.font("Helvetica").fontSize(12);
    let y1 = doc.y + 4;
    doc.text(userData.companyInfoData.companyName, startX2, y1, { width: colWidth2 });
    doc.text(userData.companyInfoData.usdot, startX2 + colWidth2 + colGap2, y1, { width: colWidth2 });

    doc.moveDown(1);

    let secondY2 = doc.y;
    doc.font("Helvetica-Bold");
    doc.text("Contact Number *", startX2, secondY2, { width: colWidth2 });
    doc.text("Company E-mail *", startX2 + colWidth2 + colGap2, secondY2, { width: colWidth2 });

    doc.font("Helvetica");
    let y2 = doc.y + 4;
    doc.text(userData.companyInfoData.contactNumber, startX2, y2, { width: colWidth2 });
    doc.text(userData.companyInfoData.companyEmail, startX2 + colWidth2 + colGap2, y2, { width: colWidth2 });

    doc.moveDown(1);

    let thirdY2 = doc.y;
    doc.font("Helvetica-Bold");
    doc.text("Safety Agency Name", startX2, thirdY2, { width: colWidth2 });
    doc.text("No. of Employees/Drivers *", startX2 + colWidth2 + colGap2, thirdY2, { width: colWidth2 });

    doc.font("Helvetica");
    let y3 = doc.y + 4;
    doc.text(userData.companyInfoData?.safetyAgencyName, startX2, y3, { width: colWidth2 });
    doc.text(userData.companyInfoData.employees, startX2 + colWidth2 + colGap2, y3, { width: colWidth2 });

    // ====== Address Section ======
    doc.moveDown(2);

    const addressStartX = startX2;

    doc.font("Helvetica-Bold")
        .fontSize(12)
        .fillColor("black")
        .text("Address Information", addressStartX, doc.y, {
            align: "left",
            width: newContentWidth,
        });

    doc.moveDown(1);

    const addressColGap = 20;
    const addressColWidth = (newContentWidth - addressColGap) / 2;
    let currentY = doc.y;

    // Street Address
    doc.font("Helvetica-Bold").fontSize(12);
    doc.text("Street Address", addressStartX, currentY, { width: newContentWidth });

    currentY = doc.y + 4;
    doc.font("Helvetica").fontSize(12);
    doc.text(userData.companyInfoData.address, addressStartX, currentY, { width: newContentWidth });

    doc.moveDown(1);

    // City
    currentY = doc.y;
    doc.font("Helvetica-Bold").fontSize(12);
    doc.text("City", addressStartX, currentY, { width: addressColWidth });
    doc.text("Postal / Zip Code", addressStartX + addressColWidth + addressColGap, currentY, { width: addressColWidth });

    currentY = doc.y + 4;
    doc.font("Helvetica").fontSize(12);
    doc.text(userData.companyInfoData.city, addressStartX, currentY, { width: addressColWidth });
    doc.text(userData.companyInfoData.zip, addressStartX + addressColWidth + addressColGap, currentY, { width: addressColWidth });

    doc.moveDown(1);

    // Suite/Apt/Unit#
    currentY = doc.y;
    doc.font("Helvetica-Bold").fontSize(12);
    doc.text("Suite/Apt/Unit#", addressStartX, currentY, { width: addressColWidth });
    doc.text("State / Province", addressStartX + addressColWidth + addressColGap, currentY, { width: addressColWidth });

    currentY = doc.y + 4;
    doc.font("Helvetica").fontSize(12);
    doc.text(userData.companyInfoData.suite, addressStartX, currentY, { width: addressColWidth });
    doc.text(userData.companyInfoData.state, addressStartX + addressColWidth + addressColGap, currentY, { width: addressColWidth });

    // ====== Credit Card Section ======
    doc.moveDown(6);

    const cardStartX = startX2;

    doc.font("Helvetica")
        .fontSize(26)
        .fillColor("blue")
        .text("Credit Card Information", cardStartX, doc.y, {
            align: "left",
            width: newContentWidth,
        });

    doc.moveDown(0.5)
        .fillColor("black");

    const cardColGap = 20;
    const cardColWidth = (newContentWidth - cardColGap) / 2;
    let cardCurrentY = doc.y;

    // Card Number
    doc.font("Helvetica-Bold").fontSize(12);
    doc.text("Card Number", cardStartX, cardCurrentY, { width: newContentWidth });

    cardCurrentY = doc.y + 4;
    doc.font("Helvetica").fontSize(12);
    doc.text(userData.paymentData.creditCardNumber, cardStartX, cardCurrentY, { width: newContentWidth });

    doc.moveDown(1);

    // Expiry Date
    cardCurrentY = doc.y;
    doc.font("Helvetica-Bold").fontSize(12);
    doc.text("Expiry Month", cardStartX, cardCurrentY, { width: cardColWidth });
    doc.text("Expiry Year", cardStartX + cardColWidth + cardColGap, cardCurrentY, { width: cardColWidth });

    cardCurrentY = doc.y + 4;
    doc.font("Helvetica").fontSize(12);
    doc.text(userData.paymentData.expMonth, cardStartX, cardCurrentY, { width: cardColWidth });
    doc.text(userData.paymentData.expYear, cardStartX + cardColWidth + cardColGap, cardCurrentY, { width: cardColWidth });

    doc.moveDown(1);
    // Expiry Date
    cardCurrentY = doc.y;
    doc.font("Helvetica-Bold").fontSize(12);
    doc.text("CVV", cardStartX, cardCurrentY, { width: cardColWidth });
    doc.text("Billing Zipcode", cardStartX + cardColWidth + cardColGap, cardCurrentY, { width: cardColWidth });

    cardCurrentY = doc.y + 4;
    doc.font("Helvetica").fontSize(12);
    doc.text(userData.paymentData.cvv, cardStartX, cardCurrentY, { width: cardColWidth });
    doc.text(userData.paymentData.billingZip, cardStartX + cardColWidth + cardColGap, cardCurrentY, { width: cardColWidth });


    // ====== Add Third Page ======
    doc.addPage({ size: "A4", margin: 10 });

    // Redraw logo
    if (fs.existsSync(logoPath)) {
        const logoWidth = 60;
        const xPosition = (doc.page.width - logoWidth) / 2;
        const yPosition = 10;
        doc.image(logoPath, xPosition, yPosition, { width: logoWidth });
    }

    // Redraw border
    doc.rect(
        borderMarginOther,
        borderMarginTop,
        doc.page.width - 2 * borderMarginOther,
        doc.page.height - borderMarginTop - borderMarginOther
    ).stroke();

    doc.translate(translateX, translateY);

    const newContentWidth3 = doc.page.width - 2 * borderMarginOther - 20;

    // ====== Add Content for Third Page ======
    doc.moveDown(2);
    doc.fontSize(12)
        .font("Helvetica")
        .fillColor("black")
        .text(
            "I authorize Nationwide Drug Centers to electronically debit my bank account according to the Business name to the terms outlined below. I acknowledge that electronic debits against my account must comply with United States law. This payment authorization is to remain in effect until I, ",
            {
                width: newContentWidth3,
                continued: true,
            }
        );

    // Make "AL ROYAL TRUCKING INC" bold and blue
    doc.fillColor("blue")
        .font("Helvetica-Bold")
        .text("AL ROYAL TRUCKING INC", {
            width: newContentWidth3,
            continued: true,
        });

    // Continue with the rest of the text
    doc.fillColor("black")
        .font("Helvetica")
        .text(
            ", notify Nationwide Drug Centers of its cancellation by giving written notice in enough time for the Business name business and receiving financial instruction to have a reasonable opportunity to act on it.",
            {
                width: newContentWidth3,
            }
        );

    // ====== ECheck ACH Section ======
    doc.moveDown(2);
    doc.fontSize(26)
        .font("Helvetica")
        .fillColor("blue")
        .text("ECheck ACH", {
            align: "left",
            width: newContentWidth3,
        });
    doc.moveDown(0)
        .fillColor("black");;
    doc.y += 10;
    const colGap3 = 20;
    const colWidth3 = (newContentWidth3 - colGap3) / 2;
    const startX3 = doc.x;
    const startY3 = doc.y;

    doc.font("Helvetica-Bold").fontSize(12);
    doc.text("Account Number", startX3, startY3, { width: colWidth3 });
    doc.text("Routing Number", startX3 + colWidth3 + colGap3, startY3, { width: colWidth3 });

    doc.font("Helvetica").fontSize(12);
    let y4 = doc.y + 4;
    doc.text(userData.paymentData.accountNumber, startX3, y4, { width: colWidth3 });
    doc.text(userData.paymentData.routingNumber, startX3 + colWidth3 + colGap3, y4, { width: colWidth3 });

    doc.moveDown(1);

    let secondY3 = doc.y;
    doc.font("Helvetica-Bold");
    doc.text("Account Name", startX3, secondY3, { width: colWidth3 });
    doc.text("Account Type", startX3 + colWidth3 + colGap3, secondY3, { width: colWidth3 });

    doc.font("Helvetica");
    let y5 = doc.y + 4;
    doc.text(userData.paymentData.accountName, startX3, y5, { width: colWidth3 });
    doc.text(userData.paymentData.accountType, startX3 + colWidth3 + colGap3, y5, { width: colWidth3 });

    doc.moveDown(3);
    // signature section
    doc.font("Helvetica")
        .fontSize(18)
        .fillColor("blue")
        .text("Signature", cardStartX, doc.y, {
            align: "left",
            width: newContentWidth,
        });

    // URL of the signature image
    const signatureImageUrl = userData.submitFormData.signature; // Replace with your image URL

    try {
        const response = await axios.get(signatureImageUrl, { responseType: "arraybuffer" });
        const signatureBuffer = Buffer.from(response.data, "binary");

        const signatureWidth = 150;
        const signatureHeight = 50;
        const signatureX = cardStartX;
        const signatureY = doc.y;

        doc.image(signatureBuffer, signatureX, signatureY, {
            width: signatureWidth,
            height: signatureHeight,
        });
    } catch (error) {
        doc.fillColor("black").text("Unable to load signature image from URL.", cardStartX, doc.y);
        console.error("Error loading signature image:", error.message);
    }
    // Saving PDF
    doc.end();

    stream.on("finish", async () => {
        // Send the PDF via email once it's created
        await sendEmailWithPDF(outputPath, email, userData.companyInfoData.companyName, id);
        // Optional: Delete the file after sending email
        fs.unlink(outputPath, (err) => {
            if (err) console.error("Error deleting certificate:", err);
        });
    });
};

// Function to send email with the PDF attachment
const sendEmailWithPDF = async (pdfPath, recipientEmail, companyName, userId) => {

    // Email options
    const mailOptions = {
        from: "your-email@gmail.com", // Sender address
        to: recipientEmail,           // Recipient's email address
        subject: `New Client Sign-Up Form - ${companyName}`, // Subject line
        text: "Please find attached the signed-up form.", // Plain text body
        attachments: [
            {
                filename: `${companyName}.pdf`, // Name of the file attached
                path: pdfPath,          // Path to the generated PDF
            },
        ],
    };

    try {
        // Send email
        // await transporter.sendMail(mailOptions);

        // Read PDF as buffer
        const fileBuffer = fs.readFileSync(pdfPath);

        // Save to user's documents
        await User.findByIdAndUpdate(userId, {
            $push: {
                documents: {
                    description: `Signup form`,
                    date: new Date(),
                    documentFile: fileBuffer,
                    filename: `${companyName}.pdf`,
                    mimeType: 'application/pdf',
                }
            }
        });
    } catch (error) {
        console.error("Error sending email: ", error);
    }
};

module.exports = { createCustomPDF }