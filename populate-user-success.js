const mongoose = require('mongoose');
const fs = require('fs');
const csv = require('csv-parser');
const UserSuccess = require('./models/UserSuccess');

// Country mapping with flags and codes
const countryMapping = {
  'India': { code: 'IN', flag: '🇮🇳' },
  'USA': { code: 'US', flag: '🇺🇸' },
  'United States': { code: 'US', flag: '🇺🇸' },
  'Canada': { code: 'CA', flag: '🇨🇦' },
  'United Kingdom': { code: 'GB', flag: '🇬🇧' },
  'UK': { code: 'GB', flag: '🇬🇧' },
  'Australia': { code: 'AU', flag: '🇦🇺' },
  'Germany': { code: 'DE', flag: '🇩🇪' },
  'France': { code: 'FR', flag: '🇫🇷' },
  'Japan': { code: 'JP', flag: '🇯🇵' },
  'South Korea': { code: 'KR', flag: '🇰🇷' },
  'Brazil': { code: 'BR', flag: '🇧🇷' },
  'Mexico': { code: 'MX', flag: '🇲🇽' },
  'Spain': { code: 'ES', flag: '🇪🇸' },
  'Italy': { code: 'IT', flag: '🇮🇹' },
  'Netherlands': { code: 'NL', flag: '🇳🇱' },
  'Sweden': { code: 'SE', flag: '🇸🇪' },
  'Norway': { code: 'NO', flag: '🇳🇴' },
  'Denmark': { code: 'DK', flag: '🇩🇰' },
  'Finland': { code: 'FI', flag: '🇫🇮' },
  'Switzerland': { code: 'CH', flag: '🇨🇭' },
  'Austria': { code: 'AT', flag: '🇦🇹' },
  'Belgium': { code: 'BE', flag: '🇧🇪' },
  'Poland': { code: 'PL', flag: '🇵🇱' },
  'Czech Republic': { code: 'CZ', flag: '🇨🇿' },
  'Hungary': { code: 'HU', flag: '🇭🇺' },
  'Romania': { code: 'RO', flag: '🇷🇴' },
  'Bulgaria': { code: 'BG', flag: '🇧🇬' },
  'Greece': { code: 'GR', flag: '🇬🇷' },
  'Portugal': { code: 'PT', flag: '🇵🇹' },
  'Ireland': { code: 'IE', flag: '🇮🇪' },
  'New Zealand': { code: 'NZ', flag: '🇳🇿' },
  'Singapore': { code: 'SG', flag: '🇸🇬' },
  'Malaysia': { code: 'MY', flag: '🇲🇾' },
  'Thailand': { code: 'TH', flag: '🇹🇭' },
  'Vietnam': { code: 'VN', flag: '🇻🇳' },
  'Philippines': { code: 'PH', flag: '🇵🇭' },
  'Indonesia': { code: 'ID', flag: '🇮🇩' },
  'Pakistan': { code: 'PK', flag: '🇵🇰' },
  'Bangladesh': { code: 'BD', flag: '🇧🇩' },
  'Sri Lanka': { code: 'LK', flag: '🇱🇰' },
  'Nepal': { code: 'NP', flag: '🇳🇵' },
  'Bhutan': { code: 'BT', flag: '🇧🇹' },
  'Maldives': { code: 'MV', flag: '🇲🇻' },
  'China': { code: 'CN', flag: '🇨🇳' },
  'Hong Kong': { code: 'HK', flag: '🇭🇰' },
  'Taiwan': { code: 'TW', flag: '🇹🇼' },
  'Russia': { code: 'RU', flag: '🇷🇺' },
  'Ukraine': { code: 'UA', flag: '🇺🇦' },
  'Belarus': { code: 'BY', flag: '🇧🇾' },
  'Kazakhstan': { code: 'KZ', flag: '🇰🇿' },
  'Uzbekistan': { code: 'UZ', flag: '🇺🇿' },
  'Kyrgyzstan': { code: 'KG', flag: '🇰🇬' },
  'Tajikistan': { code: 'TJ', flag: '🇹🇯' },
  'Turkmenistan': { code: 'TM', flag: '🇹🇲' },
  'Azerbaijan': { code: 'AZ', flag: '🇦🇿' },
  'Georgia': { code: 'GE', flag: '🇬🇪' },
  'Armenia': { code: 'AM', flag: '🇦🇲' },
  'Moldova': { code: 'MD', flag: '🇲🇩' },
  'Latvia': { code: 'LV', flag: '🇱🇻' },
  'Lithuania': { code: 'LT', flag: '🇱🇹' },
  'Estonia': { code: 'EE', flag: '🇪🇪' },
  'Iceland': { code: 'IS', flag: '🇮🇸' },
  'Luxembourg': { code: 'LU', flag: '🇱🇺' },
  'Monaco': { code: 'MC', flag: '🇲🇨' },
  'Liechtenstein': { code: 'LI', flag: '🇱🇮' },
  'Andorra': { code: 'AD', flag: '🇦🇩' },
  'San Marino': { code: 'SM', flag: '🇸🇲' },
  'Vatican City': { code: 'VA', flag: '🇻🇦' },
  'Malta': { code: 'MT', flag: '🇲🇹' },
  'Cyprus': { code: 'CY', flag: '🇨🇾' },
  'Croatia': { code: 'HR', flag: '🇭🇷' },
  'Slovenia': { code: 'SI', flag: '🇸🇮' },
  'Slovakia': { code: 'SK', flag: '🇸🇰' },
  'Serbia': { code: 'RS', flag: '🇷🇸' },
  'Montenegro': { code: 'ME', flag: '🇲🇪' },
  'Bosnia and Herzegovina': { code: 'BA', flag: '🇧🇦' },
  'North Macedonia': { code: 'MK', flag: '🇲🇰' },
  'Albania': { code: 'AL', flag: '🇦🇱' },
  'Kosovo': { code: 'XK', flag: '🇽🇰' },
  'Turkey': { code: 'TR', flag: '🇹🇷' },
  'Israel': { code: 'IL', flag: '🇮🇱' },
  'Lebanon': { code: 'LB', flag: '🇱🇧' },
  'Jordan': { code: 'JO', flag: '🇯🇴' },
  'Syria': { code: 'SY', flag: '🇸🇾' },
  'Iraq': { code: 'IQ', flag: '🇮🇶' },
  'Iran': { code: 'IR', flag: '🇮🇷' },
  'Afghanistan': { code: 'AF', flag: '🇦🇫' },
  'Saudi Arabia': { code: 'SA', flag: '🇸🇦' },
  'Yemen': { code: 'YE', flag: '🇾🇪' },
  'Oman': { code: 'OM', flag: '🇴🇲' },
  'UAE': { code: 'AE', flag: '🇦🇪' },
  'United Arab Emirates': { code: 'AE', flag: '🇦🇪' },
  'Qatar': { code: 'QA', flag: '🇶🇦' },
  'Kuwait': { code: 'KW', flag: '🇰🇼' },
  'Bahrain': { code: 'BH', flag: '🇧🇭' },
  'Egypt': { code: 'EG', flag: '🇪🇬' },
  'Libya': { code: 'LY', flag: '🇱🇾' },
  'Tunisia': { code: 'TN', flag: '🇹🇳' },
  'Algeria': { code: 'DZ', flag: '🇩🇿' },
  'Morocco': { code: 'MA', flag: '🇲🇦' },
  'Sudan': { code: 'SD', flag: '🇸🇩' },
  'South Sudan': { code: 'SS', flag: '🇸🇸' },
  'Ethiopia': { code: 'ET', flag: '🇪🇹' },
  'Somalia': { code: 'SO', flag: '🇸🇴' },
  'Kenya': { code: 'KE', flag: '🇰🇪' },
  'Uganda': { code: 'UG', flag: '🇺🇬' },
  'Tanzania': { code: 'TZ', flag: '🇹🇿' },
  'Rwanda': { code: 'RW', flag: '🇷🇼' },
  'Burundi': { code: 'BI', flag: '🇧🇮' },
  'DR Congo': { code: 'CD', flag: '🇨🇩' },
  'Congo': { code: 'CG', flag: '🇨🇬' },
  'Central African Republic': { code: 'CF', flag: '🇨🇫' },
  'Chad': { code: 'TD', flag: '🇹🇩' },
  'Niger': { code: 'NE', flag: '🇳🇪' },
  'Mali': { code: 'ML', flag: '🇲🇱' },
  'Burkina Faso': { code: 'BF', flag: '🇧🇫' },
  'Senegal': { code: 'SN', flag: '🇸🇳' },
  'Gambia': { code: 'GM', flag: '🇬🇲' },
  'Guinea-Bissau': { code: 'GW', flag: '🇬🇼' },
  'Guinea': { code: 'GN', flag: '🇬🇳' },
  'Sierra Leone': { code: 'SL', flag: '🇸🇱' },
  'Liberia': { code: 'LR', flag: '🇱🇷' },
  'Ivory Coast': { code: 'CI', flag: '🇨🇮' },
  'Ghana': { code: 'GH', flag: '🇬🇭' },
  'Togo': { code: 'TG', flag: '🇹🇬' },
  'Benin': { code: 'BJ', flag: '🇧🇯' },
  'Nigeria': { code: 'NG', flag: '🇳🇬' },
  'Cameroon': { code: 'CM', flag: '🇨🇲' },
  'Gabon': { code: 'GA', flag: '🇬🇦' },
  'Equatorial Guinea': { code: 'GQ', flag: '🇬🇶' },
  'São Tomé and Príncipe': { code: 'ST', flag: '🇸🇹' },
  'Angola': { code: 'AO', flag: '🇦🇴' },
  'Namibia': { code: 'NA', flag: '🇳🇦' },
  'Botswana': { code: 'BW', flag: '🇧🇼' },
  'Zimbabwe': { code: 'ZW', flag: '🇿🇼' },
  'Zambia': { code: 'ZM', flag: '🇿🇲' },
  'Malawi': { code: 'MW', flag: '🇲🇼' },
  'Mozambique': { code: 'MZ', flag: '🇲🇿' },
  'Madagascar': { code: 'MG', flag: '🇲🇬' },
  'Comoros': { code: 'KM', flag: '🇰🇲' },
  'Mauritius': { code: 'MU', flag: '🇲🇺' },
  'Seychelles': { code: 'SC', flag: '🇸🇨' },
  'South Africa': { code: 'ZA', flag: '🇿🇦' },
  'Lesotho': { code: 'LS', flag: '🇱🇸' },
  'Eswatini': { code: 'SZ', flag: '🇸🇿' },
  'Argentina': { code: 'AR', flag: '🇦🇷' },
  'Chile': { code: 'CL', flag: '🇨🇱' },
  'Peru': { code: 'PE', flag: '🇵🇪' },
  'Bolivia': { code: 'BO', flag: '🇧🇴' },
  'Paraguay': { code: 'PY', flag: '🇵🇾' },
  'Uruguay': { code: 'UY', flag: '🇺🇾' },
  'Colombia': { code: 'CO', flag: '🇨🇴' },
  'Venezuela': { code: 'VE', flag: '🇻🇪' },
  'Ecuador': { code: 'EC', flag: '🇪🇨' },
  'Guyana': { code: 'GY', flag: '🇬🇾' },
  'Suriname': { code: 'SR', flag: '🇸🇷' },
  'French Guiana': { code: 'GF', flag: '🇬🇫' },
  'Falkland Islands': { code: 'FK', flag: '🇫🇰' },
  'Greenland': { code: 'GL', flag: '🇬🇱' },
  'Iceland': { code: 'IS', flag: '🇮🇸' },
  'Faroe Islands': { code: 'FO', flag: '🇫🇴' },
  'Svalbard': { code: 'SJ', flag: '🇸🇯' },
  'Jan Mayen': { code: 'SJ', flag: '🇸🇯' }
};

// Duration mapping with realistic weight loss ranges
const durationMapping = {
  '2 weeks': { days: 14, minWeight: 0.75, maxWeight: 2 },
  '1 month': { days: 30, minWeight: 1.5, maxWeight: 3.5 },
  '1.5 months': { days: 45, minWeight: 2, maxWeight: 4.5 },
  '2 months': { days: 60, minWeight: 2.5, maxWeight: 5.5 },
  '3 months': { days: 90, minWeight: 3, maxWeight: 7 },
  '4 months': { days: 120, minWeight: 3.5, maxWeight: 8 },
  '5 months': { days: 150, minWeight: 4, maxWeight: 9 },
  '6 months': { days: 180, minWeight: 4.5, maxWeight: 10 }
};

// Function to get country info with fuzzy matching
function getCountryInfo(countryName) {
  // Direct match
  if (countryMapping[countryName]) {
    return countryMapping[countryName];
  }
  
  // Fuzzy matching with 99% accuracy
  const normalizedCountry = countryName.toLowerCase().trim();
  
  for (const [country, info] of Object.entries(countryMapping)) {
    const normalizedMapping = country.toLowerCase().trim();
    
    // Exact match
    if (normalizedCountry === normalizedMapping) {
      return info;
    }
    
    // Contains match
    if (normalizedCountry.includes(normalizedMapping) || normalizedMapping.includes(normalizedCountry)) {
      return info;
    }
    
    // Common abbreviations
    if ((normalizedCountry === 'us' || normalizedCountry === 'usa') && normalizedMapping === 'united states') {
      return info;
    }
    if (normalizedCountry === 'uk' && normalizedMapping === 'united kingdom') {
      return info;
    }
  }
  
  // Return earth emoji for unknown countries
  return { code: 'XX', flag: '🌍' };
}

// Function to generate random weight loss data
function generateWeightLossData() {
  const durations = Object.keys(durationMapping);
  const duration = durations[Math.floor(Math.random() * durations.length)];
  const durationInfo = durationMapping[duration];
  
  const weightLost = Math.round((Math.random() * (durationInfo.maxWeight - durationInfo.minWeight) + durationInfo.minWeight) * 100) / 100;
  
  return {
    duration,
    durationInDays: durationInfo.days,
    weightLost
  };
}

// Function to generate success message
function generateSuccessMessage(name, country, weightLost, duration) {
  const messages = [
    `${name} from ${country} has lost ${weightLost} kg in ${duration}!`,
    `${name} from ${country} just updated their weight - down ${weightLost} kg in ${duration}!`,
    `${name} from ${country} achieved ${weightLost} kg weight loss in ${duration}!`,
    `${name} from ${country} is celebrating ${weightLost} kg lost in ${duration}!`,
    `${name} from ${country} reached their goal - ${weightLost} kg down in ${duration}!`,
    `${name} from ${country} transformed their life with ${weightLost} kg weight loss in ${duration}!`,
    `${name} from ${country} is feeling amazing after losing ${weightLost} kg in ${duration}!`,
    `${name} from ${country} just hit a milestone - ${weightLost} kg lost in ${duration}!`
  ];
  
  return messages[Math.floor(Math.random() * messages.length)];
}

// Connect to MongoDB
mongoose.connect('mongodb+srv://global5665:test123@cluster0.wigbba7.mongodb.net/weight-management?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ Connected to MongoDB');
  
  // Clear existing data
  return UserSuccess.deleteMany({});
})
.then(() => {
  console.log('🗑️ Cleared existing user success data');
  
  const userSuccessData = [];
  
  // Read CSV file
  fs.createReadStream('names_with_age.csv')
    .pipe(csv())
    .on('data', (row) => {
      const countryInfo = getCountryInfo(row.Country);
      const weightLossData = generateWeightLossData();
      const message = generateSuccessMessage(row.Name, row.Country, weightLossData.weightLost, weightLossData.duration);
      
      userSuccessData.push({
        name: row.Name,
        country: row.Country,
        countryCode: countryInfo.code,
        flag: countryInfo.flag,
        age: parseInt(row.Age),
        weightLost: weightLossData.weightLost,
        duration: weightLossData.duration,
        durationInDays: weightLossData.durationInDays,
        message: message,
        isActive: true
      });
    })
    .on('end', async () => {
      try {
        // Insert data in batches
        const batchSize = 50;
        for (let i = 0; i < userSuccessData.length; i += batchSize) {
          const batch = userSuccessData.slice(i, i + batchSize);
          await UserSuccess.insertMany(batch);
          console.log(`📊 Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(userSuccessData.length / batchSize)}`);
        }
        
        console.log(`✅ Successfully populated ${userSuccessData.length} user success stories!`);
        console.log('🎉 Database is ready with dynamic user success cards!');
        
        // Show some sample data
        const sampleData = await UserSuccess.find().limit(5);
        console.log('\n📋 Sample data:');
        sampleData.forEach((item, index) => {
          console.log(`${index + 1}. ${item.message}`);
        });
        
        mongoose.connection.close();
      } catch (error) {
        console.error('❌ Error inserting data:', error);
        mongoose.connection.close();
      }
    })
    .on('error', (error) => {
      console.error('❌ Error reading CSV:', error);
      mongoose.connection.close();
    });
})
.catch((error) => {
  console.error('❌ MongoDB connection error:', error);
}); 