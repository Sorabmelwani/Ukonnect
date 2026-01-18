import { prisma } from "./lib/prisma.js";

async function main() {
  // Task templates (minimal, add more whenever)
  await prisma.taskTemplate.createMany({
    data: [
      {
        visaTypeMatch: "Student",
        category: "Immigration",
        title: "Check your eVisa and immigration status",
        description:
          "Sign in to your UKVI account to view your digital immigration status and generate a share code when required.",
        officialUrl:
          "https://www.gov.uk/evisa/view-evisa-get-share-code-prove-immigration-status",
        defaultPriority: "High",
      },
      {
        visaTypeMatch: "Student",
        category: "Healthcare",
        title: "Register with a GP",
        description:
          "Register with a local NHS GP surgery to access healthcare services in the UK.",
        officialUrl:
          "https://www.nhs.uk/nhs-services/gps/how-to-register-with-a-gp-surgery/",
        defaultPriority: "High",
      },
      {
        visaTypeMatch: "Student",
        category: "Work & Tax",
        title: "Apply for a National Insurance number",
        description:
          "Apply for a National Insurance number if you plan to work part-time during your studies.",
        officialUrl: "https://www.gov.uk/apply-national-insurance-number",
        defaultPriority: "High",
      },
      {
        visaTypeMatch: "Student",
        category: "Connectivity",
        title: "Get a UK SIM or eSIM",
        description:
          "Buy a UK SIM or eSIM to access mobile data and receive important calls and messages.",
        officialUrl:
          "https://www.ofcom.org.uk/phones-telecoms-and-internet/advice-for-consumers/advice/mobile-phones",
        defaultPriority: "High",
      },
      {
        visaTypeMatch: "Student",
        category: "Banking",
        title: "Open a UK bank account",
        description:
          "Open a UK bank account using your passport.",
        officialUrl: "https://www.gov.uk/bank-accounts",
        defaultPriority: "High",
      },

      // ======================
      // SKILLED WORKER VISA TASKS
      // ======================
      {
        visaTypeMatch: "Skilled Worker",
        category: "Immigration",
        title: "Check your eVisa and immigration status",
        description:
          "Sign in to your UKVI account to view your digital immigration status and generate share codes when required.",
        officialUrl:
          "https://www.gov.uk/evisa/view-evisa-get-share-code-prove-immigration-status",
        defaultPriority: "High",
      },
      {
        visaTypeMatch: "Skilled Worker",
        category: "Work & Tax",
        title: "Prove your right to work",
        description:
          "Generate a right-to-work share code and provide it to your employer.",
        officialUrl:
          "https://www.gov.uk/prove-right-to-work/get-a-share-code-online",
        defaultPriority: "High",
      },
      {
        visaTypeMatch: "Skilled Worker",
        category: "Work & Tax",
        title: "Apply for a National Insurance number",
        description:
          "Apply for a National Insurance number if you do not already have one.",
        officialUrl: "https://www.gov.uk/apply-national-insurance-number",
        defaultPriority: "High",
      },
      {
        visaTypeMatch: "Skilled Worker",
        category: "Healthcare",
        title: "Register with a GP",
        description:
          "Register with a local NHS GP surgery to access healthcare services.",
        officialUrl:
          "https://www.nhs.uk/nhs-services/gps/how-to-register-with-a-gp-surgery/",
        defaultPriority: "High",
      },
      {
        visaTypeMatch: "Skilled Worker",
        category: "Connectivity",
        title: "Get a UK SIM or eSIM",
        description:
          "Purchase a UK SIM or eSIM to stay connected and receive official communications.",
        officialUrl:
          "https://www.ofcom.org.uk/phones-telecoms-and-internet/advice-for-consumers/advice/mobile-phones",
        defaultPriority: "High",
      },
      {
        visaTypeMatch: "Skilled Worker",
        category: "Banking",
        title: "Open a UK bank account",
        description:
          "Open a UK bank account using your passport.",
        officialUrl: "https://www.gov.uk/bank-accounts",
        defaultPriority: "High",
      },
      {
        visaTypeMatch: "Skilled Worker",
        category: "Housing & Council Tax",
        title: "Register for council tax",
        description:
          "Register with your local council and set up council tax payments.",
        officialUrl: "https://www.gov.uk/council-tax",
        defaultPriority: "Medium",
      },
      {
        visaTypeMatch: "Skilled Worker",
        category: "Emergency",
        title: "Know emergency and NHS contacts",
        description:
          "Save emergency number 999 and NHS 111 for urgent medical advice.",
        officialUrl:
          "https://www.nhs.uk/using-the-nhs/nhs-services/urgent-and-emergency-care/when-to-call-999/",
        defaultPriority: "Low",
      },

    ]
  });

  // Local services sample
  await prisma.localService.createMany({
    data: [
      {
        name: 'Kingston University London',
        category: 'EDUCATION',
        city: 'Kingston upon Thames',
        address: 'Penrhyn Road, Kingston upon Thames, Surrey KT1 2EE',
        phone: '+44 20 8417 9000',
        website: 'https://www.kingston.ac.uk',
        description: 'Main campus area used as the Kingston example location.',
        postcode: 'KT1 2EE',
      },
      {
        name: 'Health Centre Kingston University',
        category: 'GP',
        city: 'Kingston upon Thames',
        address: 'Kingston University, Penrhyn Road, Kingston upon Thames KT1 2EE',
        phone: '',
        website: 'https://www.nhs.uk/services/gp-surgery/health-centre-kingston-university/H84020002',
        description: 'Local GP surgery located at the Penrhyn Road campus.',
        postcode: 'KT1 2EE',
      },
      {
        name: 'Kingston Hospital',
        category: 'HOSPITAL',
        city: 'Kingston upon Thames',
        address: 'Galsworthy Road, Kingston upon Thames, Surrey KT2 7QB',
        phone: '+44 20 8546 7711',
        website: 'https://www.nhs.uk/services/hospital/kingston-hospital/RAX01',
        description: 'Nearest major NHS hospital for urgent and specialist care.',
        postcode: 'KT1 2EE',
      },
      {
        name: 'HSBC UK Kingston Clarence Street',
        category: 'BANK',
        city: 'Kingston upon Thames',
        address: '54 Clarence Street, Kingston upon Thames, Surrey KT1 1NP',
        phone: '',
        website: 'https://www.hsbc.co.uk/branch-list/kingston-clarence-street-counter-service-available-monday-friday/',
        description: 'Local HSBC branch for in-person banking support.',
        postcode: 'KT1 2EE',
      },
      {
        name: 'O2 Store Kingston Upon Thames',
        category: 'MOBILE',
        city: 'Kingston upon Thames',
        address: 'Ground Floor Bentall Centre, Kingston Upon Thames, Surrey KT1 1TP',
        phone: '',
        website: 'https://stores.o2.co.uk/o2-store-kingston-upon-thames',
        description: 'Mobile SIM/contracts and device support.',
        postcode: 'KT1 2EE',
      },
      {
        name: 'Kingston Station',
        category: 'TRANSPORT',
        city: 'Kingston upon Thames',
        address: 'Wood Street, Kingston, Greater London KT1 1UJ',
        phone: '',
        website: 'https://www.southwesternrailway.com/travelling-with-us/at-the-station/kingston',
        description: 'Rail access for commuting into central London.',
        postcode: 'KT1 2EE',
      },
      {
        name: 'University College London (UCL)',
        category: 'EDUCATION',
        city: 'London',
        address: 'Gower Street, London WC1E 6BT',
        phone: '',
        website: 'https://www.ucl.ac.uk/about/contact-us',
        description: 'Central London university location (example area).',
        postcode: 'WC1E 6BT',
      },
      {
        name: 'The Bloomsbury Surgery',
        category: 'GP',
        city: 'London',
        address: '1 Handel Street, London WC1N 1PD',
        phone: '',
        website: 'https://www.nhs.uk/services/gp-surgery/the-bloomsbury-surgery/F83044',
        description: 'Nearby GP registration option for WC1 area.',
        postcode: 'WC1E 6BT',
      },
      {
        name: 'University College Hospital',
        category: 'HOSPITAL',
        city: 'London',
        address: '235 Euston Road, London NW1 2BU',
        phone: '+44 20 3456 7890',
        website: 'https://www.uclh.nhs.uk/our-services/our-hospitals/university-college-hospital',
        description: 'Major NHS hospital close to Euston Road.',
        postcode: 'WC1E 6BT',
      },
      {
        name: 'O2 Store London Tottenham Court Road',
        category: 'MOBILE',
        city: 'London',
        address: '229 Tottenham Court Road, London W1T 7QG',
        phone: '+44 20 8057 4602',
        website: 'https://stores.o2.co.uk/o2-store-london-tottenham-court-road',
        description: 'Mobile connectivity support near the UCL area.',
        postcode: 'WC1E 6BT',
      },
      {
        name: 'Camden Council (5 Pancras Square)',
        category: 'LOCAL COUNCIL',
        city: 'London',
        address: '5 Pancras Square, London N1C 4AG',
        phone: '+44 20 7974 4444',
        website: 'https://www.camden.gov.uk/5-pancras-square',
        description: 'Local council services for Camden residents.',
        postcode: 'WC1E 6BT',
      },
      {
        name: 'King\'s Cross St Pancras Underground Station',
        category: 'TRANSPORT',
        city: 'London',
        address: 'Euston Road, London N1 9AL',
        phone: '',
        website: 'https://tfl.gov.uk/tube/stop/940GZZLUKSX/kings-cross-st-pancras-underground-station',
        description: 'Major interchange station for Tube connections.',
        postcode: 'WC1E 6BT',
      },
      {
        name: 'HSBC UK Kings Cross',
        category: 'BANK',
        city: 'London',
        address: '31 Euston Road, London NW1 2ST',
        phone: '',
        website: 'https://www.hsbc.co.uk/branch-list/kings-cross-cash-withdrawals-and-note-deposits-through-self-service/',
        description: 'Nearby HSBC branch/services around Kings Cross.',
        postcode: 'NW1 2ST',
      },
      {
        name: 'London King\'s Cross Station',
        category: 'TRANSPORT',
        city: 'London',
        address: 'Euston Road, London N1C 4AP',
        phone: '',
        website: 'https://www.networkrail.co.uk/rail-travel/our-stations/london-kings-cross/',
        description: 'National Rail hub for travel across the UK.',
        postcode: 'NW1 2ST',
      },
      {
        name: 'King\'s Cross St Pancras Underground Station',
        category: 'TRANSPORT',
        city: 'London',
        address: 'Euston Road, London N1 9AL',
        phone: '',
        website: 'https://tfl.gov.uk/tube/stop/940GZZLUKSX/kings-cross-st-pancras-underground-station',
        description: 'Tube interchange (Circle, H&C, Met, Northern, Piccadilly, Victoria).',
        postcode: 'NW1 2ST',
      },
      {
        name: 'University College Hospital',
        category: 'HOSPITAL',
        city: 'London',
        address: '235 Euston Road, London NW1 2BU',
        phone: '+44 20 3456 7890',
        website: 'https://www.uclh.nhs.uk/our-services/our-hospitals/university-college-hospital',
        description: 'NHS hospital close to Kings Cross/Euston Road.',
        postcode: 'NW1 2ST',
      },
      {
        name: 'Camden Council (5 Pancras Square)',
        category: 'LOCAL COUNCIL',
        city: 'London',
        address: '5 Pancras Square, London N1C 4AG',
        phone: '',
        website: 'https://www.camden.gov.uk/5-pancras-square',
        description: 'Council access point near Kings Cross.',
        postcode: 'NW1 2ST',
      },
      {
        name: 'O2 Store London Tottenham Court Road',
        category: 'MOBILE',
        city: 'London',
        address: '229 Tottenham Court Road, London W1T 7QG',
        phone: '+44 20 8057 4602',
        website: 'https://stores.o2.co.uk/o2-store-london-tottenham-court-road',
        description: 'Convenient mobile store option near central north London.',
        postcode: 'NW1 2ST',
      },
      {
        name: 'Imperial College London (South Kensington)',
        category: 'EDUCATION',
        city: 'London',
        address: 'Exhibition Road, London SW7 2AZ',
        phone: '+44 20 7589 5111',
        website: 'https://www.imperial.ac.uk/visit/campuses/south-kensington/',
        description: 'Central London university campus location (example area).',
        postcode: 'SW7 2AZ',
      },
      {
        name: 'South Kensington Underground Station',
        category: 'TRANSPORT',
        city: 'London',
        address: 'Pelham St, London SW7 2NB',
        phone: '',
        website: 'https://tfl.gov.uk/tube/stop/940GZZLUSKS/south-kensington-underground-station',
        description: 'Nearest Tube station serving the campus area.',
        postcode: 'SW7 2AZ',
      },
      {
        name: 'HSBC Gloucester Road (South Kensington)',
        category: 'BANK',
        city: 'London',
        address: '95 Gloucester Road, London SW7 4SX',
        phone: '',
        website: 'https://hsbc.banklocationmaps.com/en/branch/681673-hsbc-branch-95-gloucester-road-south-kensington-london-sw7-4sx',
        description: 'Local branch option for banking support.',
        postcode: 'SW7 2AZ',
      },
      {
        name: 'O2 Store London Kensington High St',
        category: 'MOBILE',
        city: 'London',
        address: '145 Kensington High Street, London W8 6SU',
        phone: '+44 20 7938 3887',
        website: 'https://stores.o2.co.uk/o2-store-london-kensington-high-st',
        description: 'Mobile SIM/contracts and device support nearby.',
        postcode: 'SW7 2AZ',
      },
      {
        name: 'Royal Brompton Hospital',
        category: 'HOSPITAL',
        city: 'London',
        address: 'Sydney Street, London SW3 6NP',
        phone: '+44 20 7352 8121',
        website: 'https://www.rbht.nhs.uk/our-hospitals/royal-brompton-hospital/directions',
        description: 'Specialist NHS hospital in the nearby area.',
        postcode: 'SW7 2AZ',
      },
      {
        name: 'RBKC Customer Service Centre (Town Hall)',
        category: 'LOCAL COUNCIL',
        city: 'London',
        address: 'Town Hall, Hornton Street, London W8 7NX',
        phone: '',
        website: 'https://www.rbkc.gov.uk/contact-us/visit-us',
        description: 'Local council services for Kensington & Chelsea.',
        postcode: 'SW7 2AZ',
      },
      {
        name: 'London Bridge Station',
        category: 'TRANSPORT',
        city: 'London',
        address: 'Tooley Street / St Thomas Street, London SE1 3QX',
        phone: '',
        website: 'https://www.southeasternrailway.co.uk/travel-information/station-information/stations/london-bridge',
        description: 'Major rail hub close to the SE1 9SG area.',
        postcode: 'SE1 9SG',
      },
      {
        name: 'London Bridge Underground Station',
        category: 'TRANSPORT',
        city: 'London',
        address: '21 Duke St Hill, London SE1 2SW',
        phone: '',
        website: 'https://tfl.gov.uk/tube/stop/940gzzlulnb/london-bridge-underground-station/',
        description: 'Tube access (Jubilee/Northern) and onward travel.',
        postcode: 'SE1 9SG',
      },
      {
        name: 'Guy\'s Hospital',
        category: 'HOSPITAL',
        city: 'London',
        address: 'Great Maze Pond, London SE1 9RT',
        phone: '+44 20 7188 7188',
        website: 'https://www.guysandstthomas.nhs.uk/guys-hospital',
        description: 'Major NHS hospital next to London Bridge.',
        postcode: 'SE1 9SG',
      },
      {
        name: 'Southwark Council (Main Office)',
        category: 'LOCAL COUNCIL',
        city: 'London',
        address: '160 Tooley Street, London SE1 2QH',
        phone: '+44 20 7525 5000',
        website: 'https://www.southwark.gov.uk/about-council/contact-us',
        description: 'Local council services for Southwark residents.',
        postcode: 'SE1 9SG',
      },
      {
        name: 'HSBC UK London Bridge',
        category: 'BANK',
        city: 'London',
        address: '28 Borough High Street, London SE1 1YB',
        phone: '',
        website: 'https://www.hsbc.co.uk/branch-list/london-bridge-counter-service-available-monday-friday/',
        description: 'In-person banking near London Bridge/Borough.',
        postcode: 'SE1 9SG',
      },
      {
        name: 'O2 Store Locator',
        category: 'MOBILE',
        city: 'London',
        address: '',
        phone: '',
        website: 'https://stores.o2.co.uk/',
        description: 'Use the official locator to find the nearest O2 store around London Bridge.',
        postcode: 'SE1 9SG',
      },
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
