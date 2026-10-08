export interface DistrictData {
  id: string;
  name: string;
  nameHi: string;
  nameMr: string;
  division: string;
  primaryApmc: string;
  isConnected: boolean;
  centroid: { x: number; y: number };
  path: string;
  pulseAcreageCategory?: 'High' | 'Moderate' | 'Low' | 'Terminal';
  // Actual data fields when connected
  data?: {
    modalPrice?: number;
    priceUnit?: string;
    volatility14d?: number;
    riskLevel?: 'Low' | 'Moderate' | 'High';
    forecast14dVol?: number;
    rainfallMm?: number;
    arrivalsQuintals?: number;
    source?: string;
  };
}

// 900 x 680 coordinate grid representing Maharashtra's geographic shape:
// West to East: Arabian Sea coast (Konkan) ~ x: 60-170, Western Ghats/Desh (Nashik, Pune, Satara, Kolhapur) ~ x: 170-340,
// Marathwada ~ x: 330-520, Vidarbha ~ x: 500-880.
// North to South: Nandurbar/Dhule/Amravati/Nagpur ~ y: 50-180,
// Central (Aurangabad, Jalna, Akola, Wardha) ~ y: 180-360,
// South (Solapur, Latur, Nanded, Chandrapur, Gadchiroli, Sindhudurg) ~ y: 360-600.

export const MAHARASHTRA_DISTRICTS: DistrictData[] = [
  // 1. Mumbai APMC (Terminal Hub - Connected)
  {
    id: 'mumbai',
    name: 'Mumbai & Suburban (APMC)',
    nameHi: 'मुंबई एवं उपनगर (एपीएमसी)',
    nameMr: 'मुंबई व उपनगर (एपीएमसी)',
    division: 'Konkan',
    primaryApmc: 'Mumbai APMC (Vashi Terminal)',
    isConnected: true,
    centroid: { x: 104, y: 320 },
    pulseAcreageCategory: 'Terminal',
    path: 'M 95 304 C 98 296, 108 296, 114 308 C 117 318, 115 332, 107 338 C 98 335, 93 325, 95 304 Z'
  },
  // 2. Thane
  {
    id: 'thane',
    name: 'Thane',
    nameHi: 'ठाणे',
    nameMr: 'ठाणे',
    division: 'Konkan',
    primaryApmc: 'Kalyan / Thane APMC',
    isConnected: false,
    centroid: { x: 122, y: 288 },
    pulseAcreageCategory: 'Low',
    path: 'M 108 274 L 132 270 L 140 292 L 126 312 L 114 308 L 108 288 Z'
  },
  // 3. Palghar
  {
    id: 'palghar',
    name: 'Palghar',
    nameHi: 'पालघर',
    nameMr: 'पालघर',
    division: 'Konkan',
    primaryApmc: 'Palghar APMC',
    isConnected: false,
    centroid: { x: 110, y: 220 },
    pulseAcreageCategory: 'Low',
    path: 'M 96 170 L 126 174 L 134 235 L 126 270 L 104 274 L 92 230 Z'
  },
  // 4. Raigad
  {
    id: 'raigad',
    name: 'Raigad',
    nameHi: 'रायगढ़',
    nameMr: 'रायगड',
    division: 'Konkan',
    primaryApmc: 'Panvel / Roha APMC',
    isConnected: false,
    centroid: { x: 120, y: 375 },
    pulseAcreageCategory: 'Low',
    path: 'M 107 338 L 136 325 L 148 360 L 142 415 L 118 420 L 102 380 Z'
  },
  // 5. Ratnagiri
  {
    id: 'ratnagiri',
    name: 'Ratnagiri',
    nameHi: 'रत्नागिरी',
    nameMr: 'रत्नागिरी',
    division: 'Konkan',
    primaryApmc: 'Ratnagiri APMC',
    isConnected: false,
    centroid: { x: 130, y: 480 },
    pulseAcreageCategory: 'Low',
    path: 'M 118 420 L 144 415 L 152 485 L 145 540 L 120 545 L 114 470 Z'
  },
  // 6. Sindhudurg
  {
    id: 'sindhudurg',
    name: 'Sindhudurg',
    nameHi: 'सिंधुदुर्ग',
    nameMr: 'सिंधुदुर्ग',
    division: 'Konkan',
    primaryApmc: 'Kudal APMC',
    isConnected: false,
    centroid: { x: 142, y: 585 },
    pulseAcreageCategory: 'Low',
    path: 'M 120 545 L 146 540 L 164 580 L 160 635 L 138 630 L 128 580 Z'
  },
  // 7. Nashik
  {
    id: 'nashik',
    name: 'Nashik',
    nameHi: 'नाशिक',
    nameMr: 'नाशिक',
    division: 'Nashik',
    primaryApmc: 'Nashik / Lasalgaon APMC',
    isConnected: false,
    centroid: { x: 180, y: 225 },
    pulseAcreageCategory: 'Moderate',
    path: 'M 134 175 L 185 160 L 225 185 L 235 240 L 195 275 L 140 290 L 132 245 Z'
  },
  // 8. Nandurbar
  {
    id: 'nandurbar',
    name: 'Nandurbar',
    nameHi: 'नंदुरबार',
    nameMr: 'नंदुरबार',
    division: 'Nashik',
    primaryApmc: 'Nandurbar APMC',
    isConnected: false,
    centroid: { x: 175, y: 100 },
    pulseAcreageCategory: 'Moderate',
    path: 'M 145 80 L 190 70 L 210 115 L 185 145 L 145 130 Z'
  },
  // 9. Dhule
  {
    id: 'dhule',
    name: 'Dhule',
    nameHi: 'धुले',
    nameMr: 'धुळे',
    division: 'Nashik',
    primaryApmc: 'Dhule APMC',
    isConnected: false,
    centroid: { x: 230, y: 140 },
    pulseAcreageCategory: 'Moderate',
    path: 'M 190 70 L 245 78 L 265 145 L 225 185 L 185 145 L 210 115 Z'
  },
  // 10. Jalgaon
  {
    id: 'jalgaon',
    name: 'Jalgaon',
    nameHi: 'जलगांव',
    nameMr: 'जळगाव',
    division: 'Nashik',
    primaryApmc: 'Jalgaon APMC',
    isConnected: false,
    centroid: { x: 310, y: 145 },
    pulseAcreageCategory: 'High',
    path: 'M 245 78 L 335 85 L 365 140 L 335 185 L 265 175 L 265 145 Z'
  },
  // 11. Ahmednagar (Ahilyanagar)
  {
    id: 'ahmednagar',
    name: 'Ahilyanagar (Ahmednagar)',
    nameHi: 'अहिल्यानगर (अहमदनगर)',
    nameMr: 'अहिल्यानगर (अहमदनगर)',
    division: 'Nashik',
    primaryApmc: 'Ahmednagar APMC',
    isConnected: false,
    centroid: { x: 245, y: 315 },
    pulseAcreageCategory: 'Moderate',
    path: 'M 195 275 L 235 240 L 285 260 L 305 330 L 265 385 L 205 365 L 195 320 Z'
  },
  // 12. Pune
  {
    id: 'pune',
    name: 'Pune',
    nameHi: 'पुणे',
    nameMr: 'पुणे',
    division: 'Pune',
    primaryApmc: 'Pune Gultekdi APMC',
    isConnected: false,
    centroid: { x: 195, y: 400 },
    pulseAcreageCategory: 'Moderate',
    path: 'M 148 360 L 205 365 L 245 395 L 255 460 L 195 460 L 152 430 Z'
  },
  // 13. Satara
  {
    id: 'satara',
    name: 'Satara',
    nameHi: 'सतारा',
    nameMr: 'सातारा',
    division: 'Pune',
    primaryApmc: 'Karad / Satara APMC',
    isConnected: false,
    centroid: { x: 185, y: 485 },
    pulseAcreageCategory: 'Moderate',
    path: 'M 152 430 L 195 460 L 230 480 L 225 535 L 175 540 L 152 485 Z'
  },
  // 14. Kolhapur
  {
    id: 'kolhapur',
    name: 'Kolhapur',
    nameHi: 'कोल्हापुर',
    nameMr: 'कोल्हापूर',
    division: 'Pune',
    primaryApmc: 'Kolhapur Shahu Market Yard',
    isConnected: false,
    centroid: { x: 180, y: 575 },
    pulseAcreageCategory: 'Moderate',
    path: 'M 152 540 L 175 540 L 210 565 L 205 625 L 164 630 L 148 565 Z'
  },
  // 15. Sangli
  {
    id: 'sangli',
    name: 'Sangli',
    nameHi: 'सांगली',
    nameMr: 'सांगली',
    division: 'Pune',
    primaryApmc: 'Sangli APMC',
    isConnected: false,
    centroid: { x: 235, y: 545 },
    pulseAcreageCategory: 'Moderate',
    path: 'M 210 520 L 265 515 L 285 565 L 245 605 L 205 590 L 210 540 Z'
  },
  // 16. Solapur
  {
    id: 'solapur',
    name: 'Solapur',
    nameHi: 'सोलापुर',
    nameMr: 'सोलापूर',
    division: 'Pune',
    primaryApmc: 'Solapur APMC',
    isConnected: false,
    centroid: { x: 300, y: 470 },
    pulseAcreageCategory: 'High',
    path: 'M 255 425 L 320 405 L 365 470 L 335 545 L 275 530 L 245 465 Z'
  },
  // 17. Chhatrapati Sambhajinagar (Aurangabad)
  {
    id: 'chhatrapati_sambhajinagar',
    name: 'Chhatrapati Sambhajinagar',
    nameHi: 'छत्रपति संभाजीनगर (औरंगाबाद)',
    nameMr: 'छत्रपती संभाजीनगर (औरंगाबाद)',
    division: 'Chhatrapati Sambhajinagar',
    primaryApmc: 'Jadhavwadi APMC',
    isConnected: false,
    centroid: { x: 310, y: 230 },
    pulseAcreageCategory: 'High',
    path: 'M 265 175 L 335 185 L 355 245 L 315 285 L 275 260 L 260 215 Z'
  },
  // 18. Jalna
  {
    id: 'jalna',
    name: 'Jalna',
    nameHi: 'जालना',
    nameMr: 'जालना',
    division: 'Chhatrapati Sambhajinagar',
    primaryApmc: 'Jalna APMC',
    isConnected: false,
    centroid: { x: 375, y: 245 },
    pulseAcreageCategory: 'High',
    path: 'M 335 185 L 405 195 L 420 255 L 375 295 L 345 270 L 355 240 Z'
  },
  // 19. Beed
  {
    id: 'beed',
    name: 'Beed',
    nameHi: 'बीड',
    nameMr: 'बीड',
    division: 'Chhatrapati Sambhajinagar',
    primaryApmc: 'Beed / Majalgaon APMC',
    isConnected: false,
    centroid: { x: 345, y: 340 },
    pulseAcreageCategory: 'High',
    path: 'M 295 300 L 360 285 L 405 340 L 375 395 L 310 380 L 290 340 Z'
  },
  // 20. Latur (Heart of Pulses)
  {
    id: 'latur',
    name: 'Latur',
    nameHi: 'लातूर',
    nameMr: 'लातूर',
    division: 'Chhatrapati Sambhajinagar',
    primaryApmc: 'Latur APMC (Pulse Capital)',
    isConnected: false,
    centroid: { x: 405, y: 425 },
    pulseAcreageCategory: 'High',
    path: 'M 365 385 L 435 375 L 460 435 L 415 480 L 365 450 L 365 395 Z'
  },
  // 21. Dharashiv (Osmanabad)
  {
    id: 'dharashiv',
    name: 'Dharashiv (Osmanabad)',
    nameHi: 'धाराशिव (उस्मानाबाद)',
    nameMr: 'धाराशिव (उस्मानाबाद)',
    division: 'Chhatrapati Sambhajinagar',
    primaryApmc: 'Dharashiv APMC',
    isConnected: false,
    centroid: { x: 345, y: 440 },
    pulseAcreageCategory: 'High',
    path: 'M 320 405 L 365 385 L 385 450 L 365 485 L 325 465 Z'
  },
  // 22. Parbhani
  {
    id: 'parbhani',
    name: 'Parbhani',
    nameHi: 'परभणी',
    nameMr: 'परभणी',
    division: 'Chhatrapati Sambhajinagar',
    primaryApmc: 'Parbhani APMC',
    isConnected: false,
    centroid: { x: 430, y: 295 },
    pulseAcreageCategory: 'High',
    path: 'M 390 260 L 455 255 L 475 320 L 425 345 L 395 315 Z'
  },
  // 23. Hingoli
  {
    id: 'hingoli',
    name: 'Hingoli',
    nameHi: 'हिंगोली',
    nameMr: 'हिंगोली',
    division: 'Chhatrapati Sambhajinagar',
    primaryApmc: 'Hingoli APMC',
    isConnected: false,
    centroid: { x: 460, y: 235 },
    pulseAcreageCategory: 'High',
    path: 'M 425 200 L 485 200 L 495 260 L 450 265 L 430 230 Z'
  },
  // 24. Nanded
  {
    id: 'nanded',
    name: 'Nanded',
    nameHi: 'नांदेड़',
    nameMr: 'नांदेड',
    division: 'Chhatrapati Sambhajinagar',
    primaryApmc: 'Nanded APMC',
    isConnected: false,
    centroid: { x: 485, y: 335 },
    pulseAcreageCategory: 'High',
    path: 'M 455 285 L 530 290 L 535 375 L 465 385 L 450 330 Z'
  },
  // 25. Buldhana
  {
    id: 'buldhana',
    name: 'Buldhana',
    nameHi: 'बुलढाणा',
    nameMr: 'बुलढाणा',
    division: 'Amravati',
    primaryApmc: 'Khamgaon APMC',
    isConnected: false,
    centroid: { x: 395, y: 155 },
    pulseAcreageCategory: 'High',
    path: 'M 355 110 L 420 115 L 440 185 L 385 200 L 355 155 Z'
  },
  // 26. Akola
  {
    id: 'akola',
    name: 'Akola',
    nameHi: 'अकोला',
    nameMr: 'अकोला',
    division: 'Amravati',
    primaryApmc: 'Akola APMC',
    isConnected: false,
    centroid: { x: 450, y: 150 },
    pulseAcreageCategory: 'High',
    path: 'M 420 115 L 480 120 L 490 185 L 435 190 L 425 150 Z'
  },
  // 27. Washim
  {
    id: 'washim',
    name: 'Washim',
    nameHi: 'वाशिम',
    nameMr: 'वाशिम',
    division: 'Amravati',
    primaryApmc: 'Washim / Risod APMC',
    isConnected: false,
    centroid: { x: 465, y: 200 },
    pulseAcreageCategory: 'High',
    path: 'M 435 185 L 495 185 L 505 240 L 455 245 L 440 210 Z'
  },
  // 28. Amravati
  {
    id: 'amravati',
    name: 'Amravati',
    nameHi: 'अमरावती',
    nameMr: 'अमरावती',
    division: 'Amravati',
    primaryApmc: 'Amravati APMC',
    isConnected: false,
    centroid: { x: 515, y: 120 },
    pulseAcreageCategory: 'High',
    path: 'M 475 75 L 555 75 L 565 155 L 495 160 L 480 115 Z'
  },
  // 29. Yavatmal
  {
    id: 'yavatmal',
    name: 'Yavatmal',
    nameHi: 'यवतमाल',
    nameMr: 'यवतमाळ',
    division: 'Amravati',
    primaryApmc: 'Yavatmal APMC',
    isConnected: false,
    centroid: { x: 535, y: 220 },
    pulseAcreageCategory: 'High',
    path: 'M 495 175 L 575 180 L 595 265 L 525 285 L 490 230 Z'
  },
  // 30. Wardha
  {
    id: 'wardha',
    name: 'Wardha',
    nameHi: 'वर्धा',
    nameMr: 'वर्धा',
    division: 'Nagpur',
    primaryApmc: 'Wardha / Hinganghat APMC',
    isConnected: false,
    centroid: { x: 585, y: 155 },
    pulseAcreageCategory: 'High',
    path: 'M 555 120 L 610 115 L 625 185 L 575 195 L 555 155 Z'
  },
  // 31. Nagpur
  {
    id: 'nagpur',
    name: 'Nagpur',
    nameHi: 'नागपुर',
    nameMr: 'नागपूर',
    division: 'Nagpur',
    primaryApmc: 'Kalamna / Nagpur APMC',
    isConnected: false,
    centroid: { x: 645, y: 115 },
    pulseAcreageCategory: 'High',
    path: 'M 605 70 L 685 65 L 695 145 L 625 155 L 610 110 Z'
  },
  // 32. Bhandara
  {
    id: 'bhandara',
    name: 'Bhandara',
    nameHi: 'भंडारा',
    nameMr: 'भंडारा',
    division: 'Nagpur',
    primaryApmc: 'Bhandara APMC',
    isConnected: false,
    centroid: { x: 710, y: 110 },
    pulseAcreageCategory: 'Moderate',
    path: 'M 685 70 L 745 75 L 755 150 L 695 150 L 685 110 Z'
  },
  // 33. Gondia
  {
    id: 'gondia',
    name: 'Gondia',
    nameHi: 'गोंदिया',
    nameMr: 'गोंदिया',
    division: 'Nagpur',
    primaryApmc: 'Gondia APMC',
    isConnected: false,
    centroid: { x: 775, y: 105 },
    pulseAcreageCategory: 'Moderate',
    path: 'M 745 75 L 815 70 L 825 155 L 755 155 L 745 115 Z'
  },
  // 34. Chandrapur
  {
    id: 'chandrapur',
    name: 'Chandrapur',
    nameHi: 'चंद्रपुर',
    nameMr: 'चंद्रपूर',
    division: 'Nagpur',
    primaryApmc: 'Chandrapur APMC',
    isConnected: false,
    centroid: { x: 650, y: 250 },
    pulseAcreageCategory: 'Moderate',
    path: 'M 610 195 L 685 190 L 705 290 L 635 320 L 595 260 Z'
  },
  // 35. Gadchiroli
  {
    id: 'gadchiroli',
    name: 'Gadchiroli',
    nameHi: 'गढ़चिरौली',
    nameMr: 'गडचिरोली',
    division: 'Nagpur',
    primaryApmc: 'Gadchiroli APMC',
    isConnected: false,
    centroid: { x: 750, y: 260 },
    pulseAcreageCategory: 'Low',
    path: 'M 695 155 L 815 160 L 835 330 L 735 385 L 695 300 L 685 220 Z'
  },
  // 36. Jalna / Vidarbha Border Adjustments (Ensure complete coverage)
  {
    id: 'parbhani_south',
    name: 'Kinwat / Border Belt',
    nameHi: 'किनवट / सीमावर्ती क्षेत्र',
    nameMr: 'किनवट / सीमावर्ती पट्टा',
    division: 'Chhatrapati Sambhajinagar',
    primaryApmc: 'Kinwat APMC',
    isConnected: false,
    centroid: { x: 525, y: 320 },
    pulseAcreageCategory: 'Moderate',
    path: 'M 505 295 L 555 300 L 555 350 L 515 355 Z'
  }
];
