import { prisma } from "./lib/prisma.js";

async function main() {
  // Task templates (minimal, add more whenever)
  await prisma.taskTemplate.createMany({
    data: [
      {
        title: "Register with a GP (NHS)",
        description: "Find a local GP practice and complete NHS registration.",
        category: "HEALTHCARE",
        defaultPriority: "HIGH",
        officialUrl: "https://www.nhs.uk/nhs-services/gps/how-to-register-with-a-gp-surgery/",
        sortOrder: 10
      },
      {
        title: "Apply for a National Insurance Number (NIN)",
        description: "If eligible, apply for a National Insurance number to work and pay tax.",
        category: "LEGAL",
        defaultPriority: "HIGH",
        officialUrl: "https://www.gov.uk/apply-national-insurance-number",
        sortOrder: 20
      },
      {
        title: "Open a UK bank account",
        description: "Choose a bank and prepare documents (ID, proof of address, etc.).",
        category: "FINANCIAL",
        defaultPriority: "MEDIUM",
        sortOrder: 30
      },
      {
        title: "Check your visa conditions",
        description: "Understand your visa responsibilities and any work/study limits.",
        category: "LEGAL",
        defaultPriority: "URGENT",
        sortOrder: 5
      },
      {
        title: "Get a UK SIM / mobile plan",
        description: "Compare providers and pick pay-as-you-go or contract.",
        category: "CONNECTIVITY",
        defaultPriority: "LOW",
        sortOrder: 40
      },
      {
        title: "Student: Collect BRP / check eVisa (if applicable)",
        description: "Confirm your immigration status documentation and deadlines.",
        category: "LEGAL",
        defaultPriority: "HIGH",
        visaTypeMatch: "Student",
        sortOrder: 15
      }
    ]
  });

  // Local services sample
  await prisma.localService.createMany({
    data: [
      { name: "NHS GP Finder", category: "GP", city: "London", website: "https://www.nhs.uk/service-search/find-a-gp", description: "Find GP practices near you." },
      { name: "HSBC UK", category: "BANK", city: "London", website: "https://www.hsbc.co.uk/", description: "Bank accounts and student options." },
      { name: "Giffgaff", category: "MOBILE", city: "London", website: "https://www.giffgaff.com/", description: "Flexible SIM plans." }
    ]
  });

  // FAQ entries
  await prisma.faqEntry.createMany({
    data: [
      {
        topic: "NIN",
        question: "Do all newcomers need a National Insurance Number?",
        answer: "Not everyone needs one immediately. It’s generally needed for working and tax/benefits. If you plan to work, check eligibility and apply via GOV.UK.",
        officialUrl: "https://www.gov.uk/apply-national-insurance-number"
      },
      {
        topic: "GP",
        question: "How do I register with a GP in the UK?",
        answer: "Use the NHS service search to find a GP practice near your address and follow their registration process. Requirements vary slightly by practice.",
        officialUrl: "https://www.nhs.uk/nhs-services/gps/how-to-register-with-a-gp-surgery/"
      }
    ]
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
