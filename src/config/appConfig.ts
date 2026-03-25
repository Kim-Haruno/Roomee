/**
 * ============================================
 * APP CONFIGURATION FILE
 * ============================================
 * 
 * This file contains all configurable settings for the app.
 * Edit these values to customize your application.
 * 
 * To change the app name, logo, or branding:
 * 1. Update APP_NAME below
 * 2. Update APP_TAGLINE for the subtitle
 * 3. Replace the logo icon in Navbar.tsx if needed
 * 4. Update index.html for SEO meta tags
 */

// ============================================
// APP BRANDING - Edit these to rebrand the app
// ============================================

/** The main name of your application (displayed in navbar and throughout the app) */
export const APP_NAME = 'roomee';

/** Short tagline for the app (used in auth pages and headers) */
export const APP_TAGLINE = 'Find Your Perfect Student Home';

/** Description for SEO and meta tags */
export const APP_DESCRIPTION = 'Connect with verified landlords and find the perfect accommodation near your university.';

// ============================================
// SOUTH AFRICAN INSTITUTIONS
// ============================================
// Add or remove institutions from these lists as needed

/** 
 * Public Universities in South Africa
 * These are government-funded universities
 */
export const SA_UNIVERSITIES = [
  // Gauteng
  'University of the Witwatersrand (Wits)',
  'University of Johannesburg (UJ)',
  'University of Pretoria (UP)',
  'Tshwane University of Technology (TUT)',
  'Sefako Makgatho Health Sciences University (SMU)',
  'Vaal University of Technology (VUT)',
  
  // Western Cape
  'University of Cape Town (UCT)',
  'Stellenbosch University (SU)',
  'University of the Western Cape (UWC)',
  'Cape Peninsula University of Technology (CPUT)',
  
  // KwaZulu-Natal
  'University of KwaZulu-Natal (UKZN)',
  'Durban University of Technology (DUT)',
  'University of Zululand (UniZulu)',
  'Mangosuthu University of Technology (MUT)',
  
  // Eastern Cape
  'Rhodes University',
  'Nelson Mandela University (NMU)',
  'University of Fort Hare (UFH)',
  'Walter Sisulu University (WSU)',
  
  // Free State
  'University of the Free State (UFS)',
  'Central University of Technology (CUT)',
  
  // Limpopo
  'University of Limpopo (UL)',
  'University of Venda (Univen)',
  
  // North West
  'North-West University (NWU)',
  
  // Mpumalanga
  'University of Mpumalanga (UMP)',
  
  // Northern Cape
  'Sol Plaatje University (SPU)',
];

/**
 * TVET Colleges (Technical and Vocational Education and Training)
 * Public colleges offering N-courses and NCV programmes
 */
export const SA_TVET_COLLEGES = [
  // Gauteng
  'Central Johannesburg TVET College',
  'Ekurhuleni East TVET College',
  'Ekurhuleni West TVET College',
  'Sedibeng TVET College',
  'South West Gauteng TVET College',
  'Tshwane North TVET College',
  'Tshwane South TVET College',
  'Western TVET College',
  
  // Western Cape
  'Boland TVET College',
  'College of Cape Town for TVET',
  'False Bay TVET College',
  'Northlink TVET College',
  'South Cape TVET College',
  'West Coast TVET College',
  
  // KwaZulu-Natal
  'Coastal TVET College',
  'Elangeni TVET College',
  'Esayidi TVET College',
  'Majuba TVET College',
  'Mnambithi TVET College',
  'Mthashana TVET College',
  'Thekwini TVET College',
  'Umfolozi TVET College',
  'Umgungundlovu TVET College',
  
  // Eastern Cape
  'Buffalo City TVET College',
  'Eastcape Midlands TVET College',
  'Ikhala TVET College',
  'Ingwe TVET College',
  'King Hintsa TVET College',
  'King Sabata Dalindyebo TVET College',
  'Lovedale TVET College',
  'Port Elizabeth TVET College',
  
  // Free State
  'Flavius Mareka TVET College',
  'Goldfields TVET College',
  'Maluti TVET College',
  'Motheo TVET College',
  
  // Limpopo
  'Capricorn TVET College',
  'Lephalale TVET College',
  'Letaba TVET College',
  'Mopani South East TVET College',
  'Sekhukhune TVET College',
  'Vhembe TVET College',
  'Waterberg TVET College',
  
  // Mpumalanga
  'Ehlanzeni TVET College',
  'Gert Sibande TVET College',
  'Nkangala TVET College',
  
  // North West
  'Orbit TVET College',
  'Taletso TVET College',
  'Vuselela TVET College',
  
  // Northern Cape
  'Northern Cape Rural TVET College',
  'Northern Cape Urban TVET College',
];

/**
 * Popular Private Colleges in South Africa
 * Add more private colleges here as needed
 */
export const SA_PRIVATE_COLLEGES = [
  // Major Private Higher Education Institutions
  'Eduvos (formerly Pearson Institute)',
  'Rosebank College',
  'Boston City Campus & Business College',
  'Damelin',
  'Varsity College',
  'AFDA (The South African School of Motion Picture Medium and Live Performance)',
  'Vega School',
  'IIE MSA (Monash South Africa)',
  'Richfield Graduate Institute of Technology',
  'CTU Training Solutions',
  'Academy of Sound Engineering',
  'STADIO Higher Education',
  'Regent Business School',
  'Mancosa (Management College of Southern Africa)',
  'IMM Graduate School',
  'AAA School of Advertising',
  'Red & Yellow Creative School of Business',
  'The Design School Southern Africa',
  'The Open Window',
  'CGS (City and Guilds South Africa)',
];

/**
 * Get all institutions grouped by category
 * Used for the institution selector dropdown
 */
export const getInstitutionsByCategory = () => [
  {
    category: 'Universities',
    institutions: SA_UNIVERSITIES,
  },
  {
    category: 'TVET Colleges',
    institutions: SA_TVET_COLLEGES,
  },
  {
    category: 'Private Colleges',
    institutions: SA_PRIVATE_COLLEGES,
  },
];

/**
 * Get all institutions as a flat array
 * Used for search/filter functionality
 */
export const getAllInstitutions = () => [
  ...SA_UNIVERSITIES,
  ...SA_TVET_COLLEGES,
  ...SA_PRIVATE_COLLEGES,
];

// ============================================
// SOUTH AFRICAN CITIES
// ============================================
// Major cities for location selection

export const SA_CITIES = [
  'Johannesburg',
  'Cape Town',
  'Durban',
  'Pretoria',
  'Port Elizabeth',
  'Bloemfontein',
  'East London',
  'Polokwane',
  'Nelspruit',
  'Kimberley',
  'Pietermaritzburg',
  'Rustenburg',
  'Potchefstroom',
  'Stellenbosch',
  'Mthatha',
];

// ============================================
// CURRENCY SETTINGS
// ============================================

/** Currency symbol (R for South African Rand) */
export const CURRENCY_SYMBOL = 'R';

/** Currency code for formatting */
export const CURRENCY_CODE = 'ZAR';
