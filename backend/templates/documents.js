export const templates = {
  complaint_letter: `
[Your Name]
[Your Address]
[Date]

To,
[Authority Name / Recipient Name]
[Recipient Address]

Subject: Formal Complaint regarding [Brief Summary of Issue]

Dear Sir/Madam,

I am writing to formally lodge a complaint regarding an issue I have been facing. My details and the particulars of the incident are as follows:

Situation Summary:
[Detailed Situation Description filled by LLM based on user details]

I believe that my rights under the relevant laws are being violated in this situation. I request your prompt intervention to resolve this matter as soon as possible. I am willing to provide any further documentation required.

Thank you for your time and assistance.

Sincerely,
[Your Name]
`,
  legal_notice: `
LEGAL NOTICE

Date: [Date]

From:
[Your Name]
[Your Address]

To:
[Recipient Name]
[Recipient Address]

Subject: Legal Notice for [Brief Summary of Issue]

Under instructions from and on behalf of my client / representing myself, [Your Name], I hereby serve you with the following Legal Notice:

1. That I have been associated with you / residing at the property / purchased a product as follows: [Brief context of relationship].
2. That recently, the following issue occurred:
[Detailed Situation Description]

3. This action is a clear violation of my rights and the terms of our agreement/the law. 

I hereby call upon you to rectify this situation within [e.g., 15 Days] of receipt of this notice, failing which I shall be constrained to initiate appropriate legal proceedings against you in a competent court of law/forum at your cost, risk, and responsibility.

Signature:
[Your Name]
`,
  consumer_forum_complaint: `
BEFORE THE DISTRICT CONSUMER DISPUTES REDRESSAL COMMISSION
AT [City/District Name]

Complaint No. _______ of [Year]

BETWEEN:
[Your Name]
[Your Address]
... Complainant

AND
[Opposite Party Name / Company]
[Opposite Party Address]
... Opposite Party

SUBJECT: COMPLAINT UNDER SECTION 35 OF THE CONSUMER PROTECTION ACT, 2019

Most Respectfully Showeth:
1. That the Complainant is a consumer as defined under the Consumer Protection Act, 2019, having purchased [Product/Service details] from the Opposite Party.
2. That the Opposite Party is engaged in the business of [Business Type].
3. That the Complainant has suffered the following grievance due to deficiency in service / defective product:
[Detailed Situation Description]

4. The Complainant has already requested the Opposite Party to resolve the issue, but no satisfactory action was taken.

PRAYER
In view of the above facts, the Complainant prays that this Hon'ble Commission may be pleased to direct the Opposite Party to:
a) Refund/Replace the product or rectify the service.
b) Pay compensation for mental agony and harassment.
c) Pay the cost of litigation.

Complainant
[Your Name]
`,
  cyber_crime_complaint: `
FORMAL COMPLAINT: CYBER CRIME & FINANCIAL FRAUD
To,
The Station House Officer / Cyber Crime Police Station,
[City / District Name]

Subject: Complaint regarding Cyber Crime / Financial Fraud / [Brief Summary of Issue]

Respected Sir/Madam,

I, [Your Name], residing at [Your Address], wish to lodge a formal complaint regarding a cyber offence committed against me on [Date]. The details are as follows:

1. VICTIM DETAILS:
- Name: [Your Name]
- Contact Address: [Your Address]
- Date & Time of Incident: [Date]

2. INCIDENT PARTICULARS:
[Detailed Situation Description]

3. FRAUD / TRANSACTION DETAILS:
- Modus Operandi: [Brief Summary of Issue]
- Suspect Contact / UPI ID / Website / Mobile (if known): Details attached in supporting evidence.
- Acknowledgment from National Cyber Crime Portal (1930 / cybercrime.gov.in): Ref ID if filed.

PRAYER:
I request you to kindly register an FIR / Complaint against the unknown perpetrator(s), take steps with the concerned financial intermediaries / banks to trace and freeze the defrauded amounts, and bring the culprits to book under the Information Technology Act, 2000 and the Bharatiya Nyaya Sanhita (BNS).

Yours faithfully,
[Your Name]
Date: [Date]
`,
  police_complaint: `
TO THE STATION HOUSE OFFICER (SHO) / ZERO FIR COMPLAINT
Police Station: [Authority Name / Recipient Name]
[City / District Name]

Subject: Written Complaint under Section 173 BNSS (Filing of FIR / Zero FIR) regarding [Brief Summary of Issue]

Sir/Madam,

I, [Your Name], residing at [Your Address], am submitting this written complaint for urgent police action regarding an offence committed on [Date].

Particulars of Incident:
[Detailed Situation Description]

In view of the serious nature of this offence and infringement of my legal rights and safety, I request you to register a formal FIR / Zero FIR under the relevant sections of the Bharatiya Nyaya Sanhita (BNS) and initiate an immediate investigation.

Complainant:
[Your Name]
[Your Address]
Date: [Date]
`
};

export function fillTemplate(documentType, userDetails) {
  const template = templates[documentType];
  if (!template) {
    return "Template not found for: " + documentType;
  }
  
  // A naive replacement for placeholders, the LLM usually passes userDetails 
  // with these fields, or we can just ask the LLM to format the userDetails 
  // as the full text block to inject. For robustness, if userDetails has a "content" field, we can use that,
  // otherwise we just dump the JSON if the LLM couldn't structure it well.
  
  let filled = template;
  filled = filled.replace(/\[Your Name\]/g, userDetails.name || "[Your Name]");
  filled = filled.replace(/\[Your Address\]/g, userDetails.address || "[Your Address]");
  filled = filled.replace(/\[Date\]/g, userDetails.date || new Date().toLocaleDateString());
  filled = filled.replace(/\[Brief Summary of Issue\]/g, userDetails.issue_summary || "[Brief Summary of Issue]");
  filled = filled.replace(/\[Detailed Situation Description.*\]/g, userDetails.situation_description || "[Situation Description]");
  
  return filled;
}
