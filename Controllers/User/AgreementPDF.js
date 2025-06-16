const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const transporter = require("./Transpoter")

const User = require("../../database/schema");

const createAgreementPDF = async (userData, id) => {
    const pageMargin = 30; // Same margin on all sides
    const contentPadding = 10;

    const doc = new PDFDocument({ size: "A4", margin: pageMargin });
    const outputPath = path.join(__dirname, "agreement.pdf");

    const logoPath = path.join(__dirname, "logo.png"); // optional logo
    const borderMarginTop = 80;

    if (!fs.existsSync(path.dirname(outputPath))) {
        fs.mkdirSync(path.dirname(outputPath));
    }

    const stream = fs.createWriteStream(outputPath);
    doc.pipe(stream);

    // ====== Draw Logo (optional) ======
    if (fs.existsSync(logoPath)) {
        const logoWidth = 60;
        const xPosition = (doc.page.width - logoWidth) / 2;
        doc.image(logoPath, xPosition, 10, { width: logoWidth });
    }

    // === Content Dimensions ===
    const translateX = contentPadding;
    const translateY = borderMarginTop + contentPadding;
    const contentWidth = doc.page.width - 2 * pageMargin - 2 * contentPadding;

    doc.translate(translateX, translateY);
    doc.font("Times-Roman").fontSize(12);

    // ====== Title ======
    doc.font("Times-Bold")
        .fontSize(16)
        .fillColor("black")
        .text("Drug Screening Service Agreement", {
            align: "center",
            width: contentWidth,
        });

    doc.moveDown(1);

    const underlinedText = `I, ${userData.companyInfoData.companyName} `;
    const followingText = "agree to the below Service Agreement with NDC:";

    // Step 1: Write underlined text
    doc.font("Times-Roman").fontSize(12);
    const x = doc.x;
    const y = doc.y;

    doc.text(underlinedText, {
        continued: true
    });

    // Step 2: Measure and draw underline
    const underlineWidth = doc.widthOfString(underlinedText);
    doc.moveTo(x, y + 13).lineTo(x + underlineWidth, y + 13).stroke();

    // Step 3: Continue with bold portion
    doc.font("Times-Bold");
    doc.text(followingText);
    doc.moveDown(1);

    // ====== Intro Text ======
    doc.font("Times-Bold").fontSize(11).text(
        `Nationwide Drug Centers aka “NDC”, a Consortium and Third-Party Administrator (C/TPA) which ` +
        `owns and manages a drug and alcohol testing program designed for businesses and regulated entities ` +
        `with safety sensitive and drug free employees or members. This agreement is made between the parties ` +
        `with the following understanding:\n`
    );

    doc.moveDown(1);
    doc.font("Times-Roman").fontSize(11).text(
        `1. Company elects to participate in NDC (C/TPA) program that is compliant with the requirements of the 49 ` +
        `CFR, Parts 40, 382, (FMCSA), 219 (FRA), 655 (FTA), 199 (PHMSA), 14 & 120 (FAA), 46 CFR Parts 4 ` +
        `& 16 (USCG), for all Companies regulated by the Department of Transportation.\n\n` +
        `2. Company elects to retain NDC to administer its drug and alcohol testing program for compliance.\n\n` +
        `3. Non-regulated companies do not need to follow the criteria laid forth by the Department of ` +
        `Transportation (DOT) and may elect to enforce their own regulations per their Company Drug and Alcohol ` +
        `policy. The C/TPA will administer and manage their program separately.\n\n` +
        `In consideration of the mutual obligations hereunder, both parties agree as follows:`
    );

    doc.moveDown(1);

    // ====== Section 1 ======
    doc.font("Times-Bold").fontSize(12).text("Section - 1", {
        underline: true,
        width: contentWidth,
    });
    doc.font("Times-BoldItalic").fontSize(12).text("NDC General Obligations and Responsibilities:", {
        underline: false,
        width: contentWidth,
    });
    doc.moveDown(1);
    doc.font("Times-Roman")
        .fontSize(12)
        .text(`To administer the Company’s drug and alcohol testing program, NDC shall:`);

    doc.fontSize(12);

    // 1.

    // 1.

    doc.font("Times-Bold").text("1. ", { continued: true });
    doc.font("Times-Roman").text(
        "Maintain qualified random testing pools for regulated Company employees or members. " +
        "Meet or exceed minimum testing rates as set forth by the Department of Transportation " +
        "for the specific governing agency of the Company and/or other percentages defined by the Company " +
        "for other employees or members."
    );

    // 2.
    doc.moveDown(0.5);
    doc.font("Times-Bold").text("2. ", { continued: true });
    doc.font("Times-Roman").text(
        "Manage a random selection and notification program minimally consistent with DOT or other regulated " +
        "controlled substance and alcohol testing requirements."
    );

    // 3.
    doc.moveDown(0.5);
    doc.font("Times-Bold").text("3. ", { continued: true });
    doc.font("Times-Roman").text("Provide the following:");
    doc.moveDown(0.3);

    // Bullet Points
    doc.list([
        "Access to NDC network of collection sites through their online portal, email, phone.",
        "A laboratory certified by the Department of Health and Human Services’ SAMHSA Agency.",
        "A Medical Review Officer (MRO) to provide test result notifications as required by DOT regulations. " +
        "The MRO service is also provided for all non-DOT testing as an option."
    ], {
        bulletRadius: 2,
        textIndent: 20,
        bulletIndent: 10
    });

    // 4.
    doc.moveDown(0.5);
    doc.font("Times-Bold").text("4. ", { continued: true });
    doc.font("Times-Roman").text(
        "Maintain records documenting Company’s participation in NDC random testing program and will provide " +
        "Company with these records and other compliance information within 72 hours of its designated " +
        "Representatives (DER) request."
    );

    // 5.
    doc.moveDown(0.5);
    doc.font("Times-Bold").text("5. ", { continued: true });
    doc.font("Times-Roman").text(
        "Upon Company’s request by written consent, NDC will release drug and alcohol"
    );
    doc.moveDown(1);
    doc.font("Times-Roman")
        .fontSize(12)
        .text(`To administer the Company’s drug and alcohol testing program, NDC shall:`);

    doc.addPage();

    doc.font("Times-Roman")
        .fontSize(12)
        .text(`(D&A) testing history and information in accordance with DOT, other regulatory agencies or a Company’s
D&A Policy. Information requested may include: verification of participation in the C/TPA program and/or
current enrollment status, test results if maintained by C/TPA for a Company’s driver or employee / member
within the last two years, and positive information for the last 5 years (DOT) or consistent with other noted
regulatory requirements.`);
    doc.moveDown(4);
    // ====== Section 2 ======
    doc.font("Times-Bold").fontSize(12).text("Section - 2", {
        underline: true,
        width: contentWidth,
    });
    doc.moveDown(.5);
    doc.font("Times-BoldItalic").fontSize(12).text("Company’s Obligations and Responsibilities:", {
        underline: false,
        width: contentWidth,
    });
    doc.moveDown(1);
    doc.font("Times-Roman")
        .fontSize(12)
        .text(`To qualify for and maintain enrollment in NDC C/TPA program, the Company agrees to: `);


    doc.moveDown(1);

    // 1.
    doc.font("Times-Bold").text("1.     ", { continued: true }); // 5 spaces added
    doc.font("Times-Roman").text(
        "Maintain a Company Policy for controlled substance and alcohol (D&A) misuse implemented before initiating testing. " +
        "Complete verification of prior drug, alcohol violations for each new member."
    );

    // 2.
    doc.moveDown(0.5);
    doc.font("Times-Bold").text("2.     ", { continued: true });
    doc.font("Times-Roman").text(
        "For reasons of reasonable suspicion testing, Company agrees to have a person who supervises employees or members trained " +
        "in the aid of recognizing the signs and symptoms of substance abuse and alcohol misuse, unless self-employed."
    );

    // 3.
    doc.moveDown(0.5);
    doc.font("Times-Bold").text("3.     ", { continued: true });
    doc.font("Times-Roman").text(
        "Notify NDC immediately of any changes in Company information including name, address, telephone number(s), " +
        "(office, mobile and/or emergency numbers), fax number(s), authorized contact(s), Designated Employer Representative (DER) " +
        "or enrolled Company employee(s) information."
    );

    // 4 (inside 3)
    doc.moveDown(0.3);
    doc.font("Times-Bold").text("4.     ", { continued: true });
    doc.font("Times-Roman").text(
        "Notify NDC immediately of any changes in the status of a Company’s employee(s) or member(s) including termination, out-of-service, " +
        "driver license changes, etc. "
    );

    // (Note)
    doc.font("Times-Roman").fontSize(11).text(
        "(The Company understands that if there is more than a 30-day lapse of enrollment in a random testing program, they are responsible " +
        "to have that employee / member submit to a pre-employment drug test before returning to a safety sensitive position.)"
    );

    // 5.
    doc.moveDown(0.5);
    doc.fontSize(12);
    doc.font("Times-Bold").text("5.     ", { continued: true });
    doc.font("Times-Roman").text(
        "Have new employee / member complete a pre-employment drug screen, for DOT employees / members in safety sensitive positions. " +
        "Employee / Member can only be added to the Random Pool with a negative DOT drug test result. " +
        "If Company elects not to forward test results to C/TPA, they are responsible for maintaining and producing such records in the event of an agency audit. " +
        "It is the Companies responsibility to ensure that employees / members are properly and adequately tested."
    );

    // 6.
    doc.moveDown(0.5);
    doc.fontSize(12);
    doc.font("Times-Bold").text("6.     ", { continued: true });
    doc.font("Times-Roman").text(
        "Have employee or member proceed immediately to the closest available authorized drug and/or alcohol collection site once they are notified of a random testing selection by the DER."
    );

    // 7.
    doc.moveDown(0.5);
    doc.fontSize(12);
    doc.font("Times-Bold").text("7.     ", { continued: true });
    doc.font("Times-Roman").text(
        "Fully document any reason(s) leading to the failure to comply with all requests for a random test. " +
        "Failure to randomly test your employees or members may result in termination from NDC program and Company agrees to the release of this information to any applicable and appropriate regulatory enforcement agencies."
    );

    // 8.
    doc.moveDown(0.5);
    doc.fontSize(12);
    doc.font("Times-Bold").text("8.     ", { continued: true });
    doc.font("Times-Roman").text(
        "Determine if post-accident drug and alcohol testing is necessary following any accident. " +
        "If testing is required, it is the Companies responsibility to locate a collection site and ensure the individual is tested within the appropriate timeframe."
    );

    // 9.
    doc.moveDown(0.5);
    doc.fontSize(12);
    doc.font("Times-Bold").text("9.     ", { continued: true });
    doc.font("Times-Roman").text(
        "Ensure an employee / member does not resume safety sensitive duties prior to SAP approval and Return-to-Duty testing."
    );

    // 10.
    doc.moveDown(0.5);
    doc.fontSize(12);
    doc.font("Times-Bold").text("10.     ", { continued: true });
    doc.font("Times-Roman").text(
        "Notify NDC immediately and remove employee / member from service upon notification from either:"
    );

    // 10a (aligned and bold 'a.')
    doc.moveDown(0.3);
    const baseX = doc.x;
    const indent = 40;

    doc.font("Times-Bold").text("a.", baseX + indent, doc.y, {
        continued: true
    });
    doc.font("Times-Roman").text(
        " A Medical Review Officer (MRO) that an individual tested positive on a DOT drug test;",
        baseX + indent + doc.widthOfString("a."),
        doc.y,
        {
            width: doc.page.width - baseX - indent - 30,
            lineGap: 2
        }
    );
    doc.addPage();
    // 10b (aligned and bold 'b.')
    doc.moveDown(0.5);
    doc.fontSize(12);
    doc.font("Times-Bold").text("       ", { continued: true });
    doc.font("Times-Roman").text(
        "b. Breath Alcohol Technician (BAT) or Saliva Alcohol Technician that the individual’s confirmation test result has an alcohol concentration of .02 or greater"
    );
    doc.moveDown(1);
    doc.font("Times-Bold").fontSize(12).text("11.     ", { continued: true });
    doc.font("Times-Roman").text(
        "Responsibility to establish an alternate provision within their Company’s D&A policy pertaining to post accident testing when a NDC collection site or personnel is unavailable. (e.g. out of the area, on site needed, after hours, holidays, etc.). This cost is not covered under any provisions and is an additional and separate fee."
    );

    doc.moveDown(0.5);
    doc.font("Times-Bold").text("12.     ", { continued: true });
    doc.font("Times-Roman").text(
        "Have available a same gender observer, if necessary, when a direct observed collection is required and the collection site is unable to provide a same gender observer."
    );

    doc.moveDown(0.5);
    doc.font("Times-Bold").text("13.     ", { continued: true });
    doc.font("Times-Roman").text(
        "Should Company request the assistance of NDC to prepare the Management Information System Report (MIS), Company shall contact NDC at least three (3) business days prior to a scheduled enforcement inspection date."
    );

    doc.moveDown(0.5);
    doc.font("Times-Bold").text("14.     ", { continued: true });
    doc.font("Times-Roman").text(
        "Company accepts full responsibility for understanding the obligations under and participating in NDC C/TPA program in a manner that is compliant with the 49 CFR, Parts 40, 382, (FMCSA), 219 (FRA), 655 (FTA), 199 (PHMSA), 14 & 120 (FAA), 46 CFR Parts 4 & 16 (USCG)."
    );

    doc.moveDown(0.5);
    doc.font("Times-Bold").text("15.     ", { continued: true });
    doc.font("Times-Roman").text(
        "Ensure that the Company and all safety-sensitive employees are registered with the FMCSA Clearinghouse as required by law."
    );

    doc.moveDown(0.5);
    doc.font("Times-Bold").text("16.     ", { continued: true });
    doc.font("Times-Roman").text(
        "Maintain a sufficient balance for conducting queries in the Clearinghouse system, ensuring that pre-employment queries are completed before hiring any driver into a safety-sensitive role and annual queries are conducted for current employees."
    );

    doc.moveDown(0.5);
    doc.font("Times-Bold").text("17.     ", { continued: true });
    doc.font("Times-Roman").text(
        "Provide any necessary information to the C/TPA for conducting queries, including names, driver’s license numbers, and other relevant information for each employee."
    );

    doc.moveDown(0.5);
    doc.font("Times-Bold").text("18.     ", { continued: true });
    doc.font("Times-Roman").text(
        "Take appropriate action based on the results of any FMCSA Clearinghouse query, including removing drivers from safety-sensitive duties if required."
    );

    // ====== Section 3 ======

    doc.moveDown(1);
    doc.font("Times-Bold").fontSize(12).text("Section - 3", {
        underline: false,
    });
    doc.moveDown(0.3);
    doc.font("Times-BoldItalic").fontSize(12).text("Payment/Fees terms for Services:");
    doc.moveDown(1);

    // Section 3 - Point 1
    doc.font("Times-Bold").text("1.  ", { continued: true });
    doc.font("Times-Roman").text(
        "For performance of NDC obligations listed in Part-1 of this Agreement, Company shall pay a fee according to the current pricing schedule or prior written agreement at the time of enrollment or renewal."
    );

    // Section 3 - Point 2
    doc.moveDown(0.5);
    doc.font("Times-Bold").text("2.  ", { continued: true });
    doc.font("Times-Roman").text(
        "Company is responsible to pay NDC directly for testing fees regardless of the payment arrangements made between the Company and / or employee."
    );

    // === Continue Section - 3 ===

    doc.moveDown(0.5);
    doc.font("Times-Bold").text("3.  ", { continued: true });
    doc.font("Times-Roman").text(
        "Arrangement for split specimen testing fees shall be made between Company, employee/ member and MRO at the time of the request; the cost of split specimen testing is not NDC responsibility. Any split specimen testing will be automatically billed to the Company account."
    );

    doc.moveDown(0.5);
    doc.font("Times-Bold").text("4.  ", { continued: true });
    doc.font("Times-Roman").text(
        "Company is responsible for payment directly to collector/collection facility for any fees if not using a collection site designated by NDC."
    );

    doc.moveDown(0.5);
    doc.font("Times-Bold").text("5.   ", { continued: true });
    doc.font("Times-Roman").text(
        "Should Company utilize entities for testing that are not affiliated with NDC, e.g., using an outside collection site, it is the Company’s obligation to pay the cost of all fees associated with the collection, testing and reporting directly to that site."
    );

    doc.moveDown(0.5);
    doc.font("Times-Bold").text("6.  ", { continued: true });
    doc.font("Times-Roman").text(
        "All NSF check returns will be subject to an $80 handling fee. Any disputed online fee payments will result in immediate removal from the Consortium and a freeze on the account, no requests will be processed until account has been paid along with any dispute charges and fees."
    );

    doc.moveDown(0.5);
    doc.font("Times-Bold").text("7.  ", { continued: true });
    doc.font("Times-Roman").text(
        "Company agrees to promptly pay all invoices or will be subject to a credit hold and penalty late fee to accrue per month starting 30 days after NDC billing date. Company will be expelled from Consortium."
    );

    doc.addPage();
    doc.moveDown(0.5);
    doc.font("Times-Bold").text("  ", { continued: true });
    doc.font("Times-Roman").text(
        "after 60-days of non-payment and Company’s information will be sent to a collection agency for payment at which time the Company is responsible for all collections fees applied by the collection agency and legal fees incurred. Companies account will be frozen 4 days after the initial payment was due. "
    );

    doc.moveDown(0.5);
    doc.font("Times-Bold").text("8.  ", { continued: true });
    doc.font("Times-Roman").text(
        "Credit Card Charges by Internet & Phone: Payment on-line and by phone with credit card is preferred, and the client agrees not to dispute any non-fraudulent charges once NDC products or services have been received. If payment is disputed without cause, the client will be dropped permanently from our program, their account data will be frozen and they will be sent to collections if the dispute is not resolved to the satisfaction of both parties. "
    );
    doc.moveDown(0.5);
    doc.font("Times-Bold").text("9.  ", { continued: true });
    doc.font("Times-Roman").text(
        "Annual membership fee is due before account is active. Company may opt to enroll online instead of sending in this contract. However, they are still bound to the terms of this contract as agreed upon when enrolling online. Membership will automatically renew 2 weeks prior to expiration unless canceled by Company in writing. Membership renewals are automatically processed and billed to the credit card on file for the Company. If timely payment is not received, the Company’s membership is revoked and their data is frozen."
    );
    doc.moveDown(0.5);
    doc.font("Times-Bold").text("10.  ", { continued: true });
    doc.font("Times-Roman").text(
        "Listed fees are subject to change. Written notice will be given for any rate changes. Changes will take effect upon renewal of Service Agreement."
    );
    doc.moveDown(0.5);
    doc.font("Times-Bold").text("11. Fee Schedule  ", { continued: true });
    doc.moveDown(2);
    const startX = 50;
    let currentY = doc.y;

    const col1Width = 300;
    const col2Width = 200;
    const rowHeight = 25;
    const tableFontSize = 11;

    // Table Header
    // Fee Schedule Table Header
    doc.rect(startX, currentY, col1Width, rowHeight).stroke();
    doc.rect(startX + col1Width, currentY, col2Width, rowHeight).stroke();

    doc.font("Times-BoldItalic").fillColor("blue").fontSize(tableFontSize)
        .text("Description", startX + 5, currentY + 7, { width: col1Width - 10 })
        .text("Amount", startX + col1Width + 5, currentY + 7, { width: col2Width - 10 });

    currentY += rowHeight;

    // Table Body Rows
    const rows = [
        [`${userData.selectedPlanName}`, "$99/Year"],
        ["DOT Panel Drug Test (URINE)", "$79/Test"],
        ["Observed DOT Test", "$79 + $35/Test"],
        ["Breath & Alcohol Test (BAT)", "$79/Test"],
        ["Third Party Testing Location", "$79 + Additional Charges based on Lab."]
    ];

    doc.font("Times-Roman").fillColor("black");

    rows.forEach(([desc, amount]) => {
        doc.rect(startX, currentY, col1Width, rowHeight).stroke();
        doc.rect(startX + col1Width, currentY, col2Width, rowHeight).stroke();

        doc.text(desc, startX + 5, currentY + 7, { width: col1Width - 10 });
        doc.text(amount, startX + col1Width + 5, currentY + 7, { width: col2Width - 10 });

        currentY += rowHeight;
    });

    // Move the y-position for next paragraph content
    doc.y = currentY + 15;

    // Use uniform alignment for 11 and 12
    const indentX = 40;
    const labelWidth = doc.widthOfString("12.  ");

    doc.font("Times-Bold").fontSize(11).text("12.", indentX, doc.y, { continued: true });
    doc.font("Times-Roman").text(
        " Company is responsible for any and all fees incurred when using any service other than those performed by NDC or its affiliated Quest and Alere collection sites.",
        indentX + labelWidth,
        doc.y,
        { width: doc.page.width - indentX - 50, align: "justify" }
    );

    doc.moveDown(0.5);

    doc.font("Times-Bold").text("13.", indentX, doc.y, { continued: true });
    doc.font("Times-Roman").text(
        " Unless otherwise indicated, C/TPA will automatically initiate the subscription fee for new Company employees / members upon receipt of a negative pre-employment drug test, until the maximum number of covered Company employees / members is reached. If a new employee / member is to replace an old employee / member, the new member will take over the remaining subscription.",
        indentX + labelWidth,
        doc.y,
        { width: doc.page.width - indentX - 50, align: "justify" }
    );
    doc.moveDown(2);
    doc.font("Times-Bold").fontSize(12).text("Section - 4", {
        underline: true,
        width: contentWidth,
    });
    doc.moveDown(1);
    doc.font("Times-BoldItalic")
        .fontSize(12)
        .text("Indemnification Obligations of Company & Legal Clause:", {
            underline: false,
            width: contentWidth
        });

    doc.moveDown(1);
    doc.font("Times-Bold").text("", { continued: true });
    doc.font("Times-Roman").text(
        " The Company (Client)shall indemnify, defend, and hold harmless NDC, its parent company Seatech Consulting Inc., affiliates, certified laboratories, medical review officers (MROs), collection sites, and any other service providers (collectively (Service Providers) involved in delivering services pursuant to this Agreement from and against any and all claims, losses, liabilities, damages, penalties, legal fees, or costs, except where such claims or losses arise solely from the willful misconduct or gross negligence of Service Providers."
    );
    // optional spacing before the paragraph

    doc.addPage();
    doc.font("Times-Bold").text("", { continued: true });
    doc.font("Times-Roman").text(
        " The Company agrees that it shall bear sole responsibility for ensuring compliance with all applicable DOT regulations, including but not limited to those outlined in 49 CFR Part 40. Company further agrees to indemnify and hold harmless Service Providers from and against any fines, penalties, lawsuits, or claims that arise due to the Company’s failure to comply with these or any other applicable regulations. This indemnification includes coverage of any legal fees, court costs, or other expenses incurred as a result of any investigation, litigation, or arbitration involving non-compliance by the Company."
    );
    doc.moveDown(1);
    doc.font("Times-Bold").text("", { continued: true });
    doc.font("Times-Roman").text(
        "Should any litigation, arbitration, or administrative proceeding arise between the Company and the Service Providers related to this Agreement, the prevailing party shall be entitled to recover reasonable attorney’s fees, court costs, and any other related legal expenses, including fees incurred during any appeals process. The parties agree that all disputes shall be governed by the laws of United States, and that any such legal proceedings shall be conducted in a court of competent jurisdiction within Washington State. Additionally, in the event that any third-party claim, action, or lawsuit is initiated against Service Providers as a result of the Company's non-compliance with DOT regulations or any other relevant law or regulation, the Company agrees to fully indemnify and hold harmless Service Providers for all costs associated with defending against such claims, including but not limited to settlement amounts, damages, attorney’s fees, and court costs."
    );
    doc.moveDown(2);
    doc.font("Times-Bold").fontSize(12).text("Section - 5", {
        underline: true,
        width: contentWidth,
    });
    doc.moveDown(.5);
    doc.font("Times-BoldItalic").fontSize(12).text("Terms & Conditions:", {
        underline: false,
        width: contentWidth,
    });
    doc.moveDown(2);
    doc.font("Times-Bold").text("", { continued: true });
    doc.font("Times-Roman").text(
        "This Agreement shall be governed in all respects by state law, where applicable, except to the extent specifically preempted by federal regulations, The Department of Transportation regulations governing drug and alcohol testing programs (49 CFR Part 40) make it very clear that the Employer (also referred to as (Company) is responsible for all aspects of compliance with the regulations. That applies even if a company such as NDC has been designated as a service agent."
    );
    // Section 5 paragraph
    doc.moveDown(1);
    doc.font("Times-Roman")
        .fontSize(11)
        .text(
            `In the event of Company non-compliance to 49 CFR Part 40, C/TPA reserves the right to make a decision to ` +
            `move the Company’s employees into a non-conforming random selection pool for a period of up to 180 days. ` +
            `Should the employer continue in failure to comply with 49 CFR Part 40 at the end of this period, C/TPA ` +
            `reserves the right to expel the Company from all random selection pools. If expulsion occurs, it may result in ` +
            `immediate notification to the Department of Transportation (DOT) and any applicable transportation ` +
            `administration falling under the authority and structure of the DOT. Self-employed individuals will be ` +
            `terminated from the program for any positive drug or alcohol test result, or failing to respond to random ` +
            `testing requirements. They may apply for reinstatement after successful completion in a program monitored ` +
            `by a licensed Substance Abuse Professional (SAP).\n\n` +
            `The Company is responsible in adhering to the Consortium Policies that are published annually by the C/TPA ` +
            `and available for download via their website.`,
            {
                align: "justify",
                lineGap: 2,
                width: contentWidth
            }
        );

    // Section - 6 Heading
    doc.moveDown(3);
    doc.font("Times-Bold").fontSize(12).text("Section - 6", {
        underline: false,
        width: contentWidth,
    });
    doc.addPage();

    doc.moveDown(.5);
    doc.font("Times-BoldItalic").fontSize(12).text("Consent & Signature:", {
        underline: false,
        width: contentWidth,
    });

    doc.moveDown(1);

    doc.font("Times-Roman").fontSize(12).text(
        `Company agrees to use NDC for Random Pool Management for the term of the service agreement. The service ` +
        `agreement is for a 12-month period, which commences upon receipt of signed service agreement and payment ` +
        `of membership fee. Company may terminate services at any time in writing. Annual membership fee is non-refundable and renews automatically unless cancelled.\n\n` +

        `As the designated Representative of the Company, I hereby agree to the terms of this Agreement and further ` +
        `acknowledge that I/we must participate with every aspect of this Agreement. I/we do recognize that NDC has ` +
        `the right to terminate our enrollment as a participant should I/we fail to abide by the terms set forth in this ` +
        `Agreement, including those terms outlined on the random test notifications. This agreement shall be extended ` +
        `automatically for successive 12-month terms until Company or Representative gives NDC written notice of ` +
        `your desire to terminate this agreement, or this agreement is cancelled for any reason by NDC.`,
        {
            align: "justify",
            lineGap: 2,
            width: contentWidth
        }
    );


    const signatureTableX = 50;
    let signatureTableY = doc.y + 10;
    const signatureLabelWidth = 200;
    const signatureValueWidth = 300;
    const signatureRowHeight = 30;

    const signatureRows = [
        ["Company Name:", `${userData.companyInfoData.companyName}`],
        ["Mailing Address:", `${userData.companyInfoData.address}`],
        ["City / State / Zip:", `${userData.companyInfoData.city}, ${userData.companyInfoData.state} ${userData.companyInfoData.zip}`],
        ["Name of Designated Employee Rep (DER):", `${userData.contactInfoData.firstName} ${userData.contactInfoData.lastName}`],
        ["DER Phone:", `${userData.contactInfoData.phone}`],
        ["DER Email:", `${userData.contactInfoData.email}`],
        ["Company DOT Number (If Applicable)", `${userData.companyInfoData.usdot}`],
        ["DER Signature:", ""],  // leave space
        ["Date Signed:", `${new Date().toLocaleDateString()}`],
    ];

    // Font setup
    doc.font("Times-Roman").fontSize(11);

    // Draw signature table

    // Example image URL (replace with actual signature URL)
    const signatureImageUrl = userData.submitFormData.signature;

    // Font setup
    doc.font("Times-Roman").fontSize(11);

    for (let index = 0; index < signatureRows.length; index++) {
        const [label, value] = signatureRows[index];
        const rowY = signatureTableY + index * signatureRowHeight;

        // Left cell (label)
        doc.rect(signatureTableX, rowY, signatureLabelWidth, signatureRowHeight).stroke();
        doc.font("Times-Bold")
            .text(label, signatureTableX + 5, rowY + 10, { width: signatureLabelWidth - 10 });

        // Right cell (value or blank)
        doc.rect(signatureTableX + signatureLabelWidth, rowY, signatureValueWidth, signatureRowHeight).stroke();

        if (label === "DER Signature:") {
            try {
                if (signatureImageUrl) {
                    const response = await axios.get(signatureImageUrl, { responseType: "arraybuffer" });
                    const signatureBuffer = Buffer.from(response.data, "binary");

                    const signatureImgWidth = 100;
                    const signatureImgHeight = 20;
                    const imgX = signatureTableX + signatureLabelWidth + 5;
                    const imgY = rowY + (signatureRowHeight - signatureImgHeight) / 2;

                    doc.image(signatureBuffer, imgX, imgY, {
                        width: signatureImgWidth,
                        height: signatureImgHeight
                    });
                } else {
                    doc.font("Times-Roman")
                        .text("No signature provided", signatureTableX + signatureLabelWidth + 5, rowY + 10, {
                            width: signatureValueWidth - 10
                        });
                }
            } catch (error) {
                console.error("Error loading signature image:", error.message);
                doc.font("Times-Roman")
                    .text("Failed to load signature", signatureTableX + signatureLabelWidth + 5, rowY + 10, {
                        width: signatureValueWidth - 10
                    });
            }
        } else {
            // Draw regular value
            doc.font("Times-Roman")
                .text(value, signatureTableX + signatureLabelWidth + 5, rowY + 10, {
                    width: signatureValueWidth - 10
                });
        }
    }

    doc.end();

    stream.on("finish", async () => {
        // Send the PDF via email once it's created
        await sendEmailWithPDF(outputPath, userData.contactInfoData.email, userData.companyInfoData.companyName,id);
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
        subject: `Agreement - ${companyName}`, // Subject line
        text: "Please find attached Agreement.", // Plain text body
        attachments: [
            {
                filename: `${companyName}.pdf`, // Name of the file attached
                path: pdfPath,          // Path to the generated PDF
            },
        ],
    };

    try {
        // Send email
        await transporter.sendMail(mailOptions);

        // Read PDF as buffer
        const fileBuffer = fs.readFileSync(pdfPath);

        // Save to user's documents
        await User.findByIdAndUpdate(userId, {
            $push: {
                documents: {
                    description: `Agreement`,
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




module.exports = {
    createAgreementPDF
};