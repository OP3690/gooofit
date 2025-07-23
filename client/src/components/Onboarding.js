import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { userAPI } from '../services/api';
import toast from 'react-hot-toast';
import { X } from 'lucide-react';
import ForgotPasswordPopup from './ForgotPasswordPopup';

// CSS to remove spinner arrows from number inputs
const numberInputStyles = `
  input[type="number"]::-webkit-outer-spin-button,
  input[type="number"]::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  input[type="number"] {
    -moz-appearance: textfield;
  }
`;

const Onboarding = ({ onSuccess, onClose, initialMode }) => {
  const [mode, setMode] = useState(initialMode || 'register'); // 'register' or 'login'
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: basic info, 2: health info
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState('IN'); // Default to India
  const [countryCode, setCountryCode] = useState('+91'); // Default to India

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm();

  const password = watch('password', '');

  // Country data with codes and dialing codes
  const countries = [
    { name: 'Afghanistan', code: 'AF', dialing: '+93' },
    { name: 'Albania', code: 'AL', dialing: '+355' },
    { name: 'Algeria', code: 'DZ', dialing: '+213' },
    { name: 'American Samoa', code: 'AS', dialing: '+1-684' },
    { name: 'Andorra, Principality of', code: 'AD', dialing: '+376' },
    { name: 'Angola', code: 'AO', dialing: '+244' },
    { name: 'Anguilla', code: 'AI', dialing: '+1-264' },
    { name: 'Antarctica', code: 'AQ', dialing: '+672' },
    { name: 'Antigua and Barbuda', code: 'AG', dialing: '+1-268' },
    { name: 'Argentina', code: 'AR', dialing: '+54' },
    { name: 'Armenia', code: 'AM', dialing: '+374' },
    { name: 'Aruba', code: 'AW', dialing: '+297' },
    { name: 'Australia', code: 'AU', dialing: '+61' },
    { name: 'Austria', code: 'AT', dialing: '+43' },
    { name: 'Azerbaijan', code: 'AZ', dialing: '+994' },
    { name: 'Bahamas, Commonwealth of The', code: 'BS', dialing: '+1-242' },
    { name: 'Bahrain, Kingdom of', code: 'BH', dialing: '+973' },
    { name: 'Bangladesh', code: 'BD', dialing: '+880' },
    { name: 'Barbados', code: 'BB', dialing: '+1-246' },
    { name: 'Belarus', code: 'BY', dialing: '+375' },
    { name: 'Belgium', code: 'BE', dialing: '+32' },
    { name: 'Belize', code: 'BZ', dialing: '+501' },
    { name: 'Benin', code: 'BJ', dialing: '+229' },
    { name: 'Bermuda', code: 'BM', dialing: '+1-441' },
    { name: 'Bhutan, Kingdom of', code: 'BT', dialing: '+975' },
    { name: 'Bolivia', code: 'BO', dialing: '+591' },
    { name: 'Bosnia and Herzegovina', code: 'BA', dialing: '+387' },
    { name: 'Botswana', code: 'BW', dialing: '+267' },
    { name: 'Brazil', code: 'BR', dialing: '+55' },
    { name: 'British Indian Ocean Territory', code: 'IO', dialing: '+246' },
    { name: 'Brunei', code: 'BN', dialing: '+673' },
    { name: 'Bulgaria', code: 'BG', dialing: '+359' },
    { name: 'Burkina Faso', code: 'BF', dialing: '+226' },
    { name: 'Burundi', code: 'BI', dialing: '+257' },
    { name: 'Cambodia, Kingdom of', code: 'KH', dialing: '+855' },
    { name: 'Cameroon', code: 'CM', dialing: '+237' },
    { name: 'Canada', code: 'CA', dialing: '+1' },
    { name: 'Cape Verde', code: 'CV', dialing: '+238' },
    { name: 'Cayman Islands', code: 'KY', dialing: '+1-345' },
    { name: 'Central African Republic', code: 'CF', dialing: '+236' },
    { name: 'Chad', code: 'TD', dialing: '+235' },
    { name: 'Chile', code: 'CL', dialing: '+56' },
    { name: 'China', code: 'CN', dialing: '+86' },
    { name: 'Christmas Island', code: 'CX', dialing: '+53' },
    { name: 'Cocos (Keeling) Islands', code: 'CC', dialing: '+61' },
    { name: 'Colombia', code: 'CO', dialing: '+57' },
    { name: 'Comoros, Union of the', code: 'KM', dialing: '+269' },
    { name: 'Congo, Democratic Republic of the', code: 'CD', dialing: '+243' },
    { name: 'Congo, Republic of the', code: 'CG', dialing: '+242' },
    { name: 'Cook Islands', code: 'CK', dialing: '+682' },
    { name: 'Costa Rica', code: 'CR', dialing: '+506' },
    { name: 'Cote D\'Ivoire', code: 'CI', dialing: '+225' },
    { name: 'Croatia', code: 'HR', dialing: '+385' },
    { name: 'Cuba', code: 'CU', dialing: '+53' },
    { name: 'Cyprus', code: 'CY', dialing: '+357' },
    { name: 'Czech Republic', code: 'CZ', dialing: '+420' },
    { name: 'Denmark', code: 'DK', dialing: '+45' },
    { name: 'Djibouti', code: 'DJ', dialing: '+253' },
    { name: 'Dominica', code: 'DM', dialing: '+1-767' },
    { name: 'Dominican Republic', code: 'DO', dialing: '+1-809' },
    { name: 'East Timor', code: 'TP', dialing: '+670' },
    { name: 'Ecuador', code: 'EC', dialing: '+593' },
    { name: 'Egypt', code: 'EG', dialing: '+20' },
    { name: 'El Salvador', code: 'SV', dialing: '+503' },
    { name: 'Equatorial Guinea', code: 'GQ', dialing: '+240' },
    { name: 'Eritrea', code: 'ER', dialing: '+291' },
    { name: 'Estonia', code: 'EE', dialing: '+372' },
    { name: 'Ethiopia', code: 'ET', dialing: '+251' },
    { name: 'Falkland Islands', code: 'FK', dialing: '+500' },
    { name: 'Faroe Islands', code: 'FO', dialing: '+298' },
    { name: 'Fiji', code: 'FJ', dialing: '+679' },
    { name: 'Finland', code: 'FI', dialing: '+358' },
    { name: 'France', code: 'FR', dialing: '+33' },
    { name: 'French Guiana', code: 'GF', dialing: '+594' },
    { name: 'French Polynesia', code: 'PF', dialing: '+689' },
    { name: 'French Southern Territories', code: 'TF', dialing: '+262' },
    { name: 'Gabon', code: 'GA', dialing: '+241' },
    { name: 'Gambia, The', code: 'GM', dialing: '+220' },
    { name: 'Georgia', code: 'GE', dialing: '+995' },
    { name: 'Germany', code: 'DE', dialing: '+49' },
    { name: 'Ghana', code: 'GH', dialing: '+233' },
    { name: 'Gibraltar', code: 'GI', dialing: '+350' },
    { name: 'Great Britain (United Kingdom)', code: 'GB', dialing: '+44' },
    { name: 'Greece', code: 'GR', dialing: '+30' },
    { name: 'Greenland', code: 'GL', dialing: '+299' },
    { name: 'Grenada', code: 'GD', dialing: '+1-473' },
    { name: 'Guadeloupe', code: 'GP', dialing: '+590' },
    { name: 'Guam', code: 'GU', dialing: '+1-671' },
    { name: 'Guatemala', code: 'GT', dialing: '+502' },
    { name: 'Guinea', code: 'GN', dialing: '+224' },
    { name: 'Guinea-Bissau', code: 'GW', dialing: '+245' },
    { name: 'Guyana', code: 'GY', dialing: '+592' },
    { name: 'Haiti', code: 'HT', dialing: '+509' },
    { name: 'Heard Island and McDonald Islands', code: 'HM', dialing: '+672' },
    { name: 'Holy See (Vatican City State)', code: 'VA', dialing: '+39' },
    { name: 'Honduras', code: 'HN', dialing: '+504' },
    { name: 'Hong Kong', code: 'HK', dialing: '+852' },
    { name: 'Hungary', code: 'HU', dialing: '+36' },
    { name: 'Iceland', code: 'IS', dialing: '+354' },
    { name: 'India', code: 'IN', dialing: '+91' },
    { name: 'Indonesia', code: 'ID', dialing: '+62' },
    { name: 'Iran, Islamic Republic of', code: 'IR', dialing: '+98' },
    { name: 'Iraq', code: 'IQ', dialing: '+964' },
    { name: 'Ireland', code: 'IE', dialing: '+353' },
    { name: 'Israel', code: 'IL', dialing: '+972' },
    { name: 'Italy', code: 'IT', dialing: '+39' },
    { name: 'Jamaica', code: 'JM', dialing: '+1-876' },
    { name: 'Japan', code: 'JP', dialing: '+81' },
    { name: 'Jordan', code: 'JO', dialing: '+962' },
    { name: 'Kazakhstan', code: 'KZ', dialing: '+7' },
    { name: 'Kenya', code: 'KE', dialing: '+254' },
    { name: 'Kiribati', code: 'KI', dialing: '+686' },
    { name: 'Korea, Democratic People\'s Republic of', code: 'KP', dialing: '+850' },
    { name: 'Korea, Republic of', code: 'KR', dialing: '+82' },
    { name: 'Kuwait', code: 'KW', dialing: '+965' },
    { name: 'Kyrgyzstan', code: 'KG', dialing: '+996' },
    { name: 'Lao People\'s Democratic Republic', code: 'LA', dialing: '+856' },
    { name: 'Latvia', code: 'LV', dialing: '+371' },
    { name: 'Lebanon', code: 'LB', dialing: '+961' },
    { name: 'Lesotho', code: 'LS', dialing: '+266' },
    { name: 'Liberia', code: 'LR', dialing: '+231' },
    { name: 'Libya', code: 'LY', dialing: '+218' },
    { name: 'Liechtenstein', code: 'LI', dialing: '+423' },
    { name: 'Lithuania', code: 'LT', dialing: '+370' },
    { name: 'Luxembourg', code: 'LU', dialing: '+352' },
    { name: 'Macau', code: 'MO', dialing: '+853' },
    { name: 'Macedonia, The Former Yugoslav Republic of', code: 'MK', dialing: '+389' },
    { name: 'Madagascar', code: 'MG', dialing: '+261' },
    { name: 'Malawi', code: 'MW', dialing: '+265' },
    { name: 'Malaysia', code: 'MY', dialing: '+60' },
    { name: 'Maldives', code: 'MV', dialing: '+960' },
    { name: 'Mali', code: 'ML', dialing: '+223' },
    { name: 'Malta', code: 'MT', dialing: '+356' },
    { name: 'Marshall Islands', code: 'MH', dialing: '+692' },
    { name: 'Martinique', code: 'MQ', dialing: '+596' },
    { name: 'Mauritania', code: 'MR', dialing: '+222' },
    { name: 'Mauritius', code: 'MU', dialing: '+230' },
    { name: 'Mayotte', code: 'YT', dialing: '+269' },
    { name: 'Mexico', code: 'MX', dialing: '+52' },
    { name: 'Micronesia, Federated States of', code: 'FM', dialing: '+691' },
    { name: 'Moldova, Republic of', code: 'MD', dialing: '+373' },
    { name: 'Monaco, Principality of', code: 'MC', dialing: '+377' },
    { name: 'Mongolia', code: 'MN', dialing: '+976' },
    { name: 'Montserrat', code: 'MS', dialing: '+1-664' },
    { name: 'Morocco', code: 'MA', dialing: '+212' },
    { name: 'Mozambique', code: 'MZ', dialing: '+258' },
    { name: 'Myanmar, Union of', code: 'MM', dialing: '+95' },
    { name: 'Namibia', code: 'NA', dialing: '+264' },
    { name: 'Nauru', code: 'NR', dialing: '+674' },
    { name: 'Nepal', code: 'NP', dialing: '+977' },
    { name: 'Netherlands', code: 'NL', dialing: '+31' },
    { name: 'Netherlands Antilles', code: 'AN', dialing: '+599' },
    { name: 'New Caledonia', code: 'NC', dialing: '+687' },
    { name: 'New Zealand', code: 'NZ', dialing: '+64' },
    { name: 'Nicaragua', code: 'NI', dialing: '+505' },
    { name: 'Niger', code: 'NE', dialing: '+227' },
    { name: 'Nigeria', code: 'NG', dialing: '+234' },
    { name: 'Niue', code: 'NU', dialing: '+683' },
    { name: 'Norfolk Island', code: 'NF', dialing: '+672' },
    { name: 'Northern Mariana Islands', code: 'MP', dialing: '+1-670' },
    { name: 'Norway', code: 'NO', dialing: '+47' },
    { name: 'Oman, Sultanate of', code: 'OM', dialing: '+968' },
    { name: 'Pakistan', code: 'PK', dialing: '+92' },
    { name: 'Palau', code: 'PW', dialing: '+680' },
    { name: 'Palestinian State', code: 'PS', dialing: '+970' },
    { name: 'Panama', code: 'PA', dialing: '+507' },
    { name: 'Papua New Guinea', code: 'PG', dialing: '+675' },
    { name: 'Paraguay', code: 'PY', dialing: '+595' },
    { name: 'Peru', code: 'PE', dialing: '+51' },
    { name: 'Philippines', code: 'PH', dialing: '+63' },
    { name: 'Pitcairn Island', code: 'PN', dialing: '+64' },
    { name: 'Poland', code: 'PL', dialing: '+48' },
    { name: 'Portugal', code: 'PT', dialing: '+351' },
    { name: 'Puerto Rico', code: 'PR', dialing: '+1-787' },
    { name: 'Qatar, State of', code: 'QA', dialing: '+974' },
    { name: 'Reunion', code: 'RE', dialing: '+262' },
    { name: 'Romania', code: 'RO', dialing: '+40' },
    { name: 'Russian Federation', code: 'RU', dialing: '+7' },
    { name: 'Rwanda', code: 'RW', dialing: '+250' },
    { name: 'Saint Helena', code: 'SH', dialing: '+290' },
    { name: 'Saint Kitts and Nevis', code: 'KN', dialing: '+1-869' },
    { name: 'Saint Lucia', code: 'LC', dialing: '+1-758' },
    { name: 'Saint Pierre and Miquelon', code: 'PM', dialing: '+508' },
    { name: 'Saint Vincent and the Grenadines', code: 'VC', dialing: '+1-784' },
    { name: 'Samoa', code: 'WS', dialing: '+685' },
    { name: 'San Marino', code: 'SM', dialing: '+378' },
    { name: 'Sao Tome and Principe', code: 'ST', dialing: '+239' },
    { name: 'Saudi Arabia', code: 'SA', dialing: '+966' },
    { name: 'Serbia, Republic of', code: 'RS', dialing: '+381' },
    { name: 'Senegal', code: 'SN', dialing: '+221' },
    { name: 'Seychelles', code: 'SC', dialing: '+248' },
    { name: 'Sierra Leone', code: 'SL', dialing: '+232' },
    { name: 'Singapore', code: 'SG', dialing: '+65' },
    { name: 'Slovakia', code: 'SK', dialing: '+421' },
    { name: 'Slovenia', code: 'SI', dialing: '+386' },
    { name: 'Solomon Islands', code: 'SB', dialing: '+677' },
    { name: 'Somalia', code: 'SO', dialing: '+252' },
    { name: 'South Africa', code: 'ZA', dialing: '+27' },
    { name: 'South Georgia and the South Sandwich Islands', code: 'GS', dialing: '+500' },
    { name: 'Spain', code: 'ES', dialing: '+34' },
    { name: 'Sri Lanka', code: 'LK', dialing: '+94' },
    { name: 'Sudan', code: 'SD', dialing: '+249' },
    { name: 'Suriname', code: 'SR', dialing: '+597' },
    { name: 'Svalbard and Jan Mayen Islands', code: 'SJ', dialing: '+47' },
    { name: 'Swaziland, Kingdom of', code: 'SZ', dialing: '+268' },
    { name: 'Sweden', code: 'SE', dialing: '+46' },
    { name: 'Switzerland', code: 'CH', dialing: '+41' },
    { name: 'Syria', code: 'SY', dialing: '+963' },
    { name: 'Taiwan', code: 'TW', dialing: '+886' },
    { name: 'Tajikistan', code: 'TJ', dialing: '+992' },
    { name: 'Tanzania, United Republic of', code: 'TZ', dialing: '+255' },
    { name: 'Thailand', code: 'TH', dialing: '+66' },
    { name: 'Togo', code: 'TG', dialing: '+228' },
    { name: 'Tokelau', code: 'TK', dialing: '+690' },
    { name: 'Tonga, Kingdom of', code: 'TO', dialing: '+676' },
    { name: 'Trinidad and Tobago', code: 'TT', dialing: '+1-868' },
    { name: 'Tunisia', code: 'TN', dialing: '+216' },
    { name: 'Turkey', code: 'TR', dialing: '+90' },
    { name: 'Turkmenistan', code: 'TM', dialing: '+993' },
    { name: 'Turks and Caicos Islands', code: 'TC', dialing: '+1-649' },
    { name: 'Tuvalu', code: 'TV', dialing: '+688' },
    { name: 'Uganda, Republic of', code: 'UG', dialing: '+256' },
    { name: 'Ukraine', code: 'UA', dialing: '+380' },
    { name: 'United Arab Emirates', code: 'AE', dialing: '+971' },
    { name: 'United States', code: 'US', dialing: '+1' },
    { name: 'United States Minor Outlying Islands', code: 'UM', dialing: '+246' },
    { name: 'Uruguay, Oriental Republic of', code: 'UY', dialing: '+598' },
    { name: 'Uzbekistan', code: 'UZ', dialing: '+998' },
    { name: 'Vanuatu', code: 'VU', dialing: '+678' },
    { name: 'Venezuela', code: 'VE', dialing: '+58' },
    { name: 'Vietnam', code: 'VN', dialing: '+84' },
    { name: 'Virgin Islands, British', code: 'VI', dialing: '+1-284' },
    { name: 'Virgin Islands, United States', code: 'VQ', dialing: '+1-340' },
    { name: 'Wallis and Futuna Islands', code: 'WF', dialing: '+681' },
    { name: 'Western Sahara', code: 'EH', dialing: '+212' },
    { name: 'Yemen', code: 'YE', dialing: '+967' },
    { name: 'Zambia, Republic of', code: 'ZM', dialing: '+260' },
    { name: 'Zimbabwe, Republic of', code: 'ZW', dialing: '+263' }
  ];

  useEffect(() => {
    if (initialMode) {
      setMode(initialMode);
    }
  }, [initialMode]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [onClose]);

  // Handle country selection
  const handleCountryChange = (countryCode) => {
    setSelectedCountry(countryCode);
    const country = countries.find(c => c.code === countryCode);
    if (country) {
      setCountryCode(country.dialing);
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      if (mode === 'register') {
        if (step === 1) {
          setStep(2);
          setLoading(false);
          return;
        }
        
        // Calculate target date and create goal automatically
        const targetDate = new Date(data.targetDate);
        const today = new Date();
        const daysToTarget = Math.ceil((targetDate - today) / (1000 * 60 * 60 * 24));
        
        const response = await userAPI.register({
          name: data.name,
          email: data.email,
          password: data.password,
          mobileNumber: `${countryCode}${data.mobileNumber}`,
          country: selectedCountry,
          goalWeight: parseFloat(data.goalWeight),
          currentWeight: parseFloat(data.currentWeight),
          height: parseFloat(data.height),
          age: parseInt(data.age),
          gender: data.gender,
          targetDate: data.targetDate,
          daysToTarget: daysToTarget
        });
        
        toast.success('Registration successful! Welcome to GoooFit!');
        onSuccess(response.user);
      } else {
        const response = await userAPI.login({
        email: data.email,
        password: data.password
      });
      
        toast.success('Login successful! Welcome back to GoooFit!');
        onSuccess(response.user);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (showPasswordReset) {
    return (
      <ForgotPasswordPopup
        isOpen={showPasswordReset}
        onClose={() => setShowPasswordReset(false)}
        onBackToLogin={() => setShowPasswordReset(false)}
      />
    );
  }

  return (
    <>
      <style>{numberInputStyles}</style>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        onClick={onClose} // Close modal when clicking outside
      >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[95vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex-shrink-0 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="relative">
                {/* Goal Achieved Logo */}
                <div className="w-10 h-10 relative">
                  {/* Background circle with gradient */}
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 rounded-full flex items-center justify-center shadow-lg border-2 border-green-600 relative overflow-hidden">
                    {/* Success sparkle effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                    
                    {/* Goal target design */}
                    <div className="w-6 h-6 flex items-center justify-center relative">
                      {/* Target rings */}
                      <div className="w-5 h-5 relative">
                        {/* Outer ring */}
                        <div className="absolute inset-0 w-5 h-5 border-2 border-white rounded-full"></div>
                        {/* Middle ring */}
                        <div className="absolute inset-0.5 w-3.5 h-3.5 border-2 border-white rounded-full"></div>
                        {/* Inner ring */}
                        <div className="absolute inset-1.5 w-1.5 h-1.5 bg-white rounded-full"></div>
                      </div>
                      
                      {/* Checkmark for achievement */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-3 h-3 relative">
                          {/* Checkmark stroke */}
                          <div className="absolute top-0 left-0 w-0.5 h-0.5 bg-green-600 rounded-full transform rotate-45"></div>
                          <div className="absolute top-0.5 left-0.5 w-0.5 h-0.5 bg-green-600 rounded-full transform rotate-45"></div>
                          <div className="absolute top-1 left-1 w-0.5 h-0.5 bg-green-600 rounded-full transform rotate-45"></div>
                          <div className="absolute top-1.5 left-1.5 w-0.5 h-0.5 bg-green-600 rounded-full transform rotate-45"></div>
                          <div className="absolute top-2 left-2 w-0.5 h-0.5 bg-green-600 rounded-full transform rotate-45"></div>
                        </div>
                      </div>
                      
                      {/* Success sparkles */}
                      <div className="absolute -top-0.5 -right-0.5 w-0.5 h-0.5 bg-yellow-300 rounded-full animate-ping"></div>
                      <div className="absolute -bottom-0.5 -left-0.5 w-0.5 h-0.5 bg-yellow-300 rounded-full animate-ping" style={{animationDelay: '0.3s'}}></div>
                      <div className="absolute -top-0.25 -left-0.25 w-0.25 h-0.25 bg-yellow-300 rounded-full animate-ping" style={{animationDelay: '0.6s'}}></div>
                    </div>
                  </div>
                </div>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                GoooFit
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors duration-200"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 flex-1 overflow-y-auto">
          {/* Mode Toggle */}
          <div className="flex bg-gray-100 rounded-xl p-1.5 mb-4">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 py-2.5 px-6 rounded-lg text-sm font-semibold transition-all duration-200 ${
                mode === 'login'
                  ? 'bg-white text-orange-600 shadow-md'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setMode('register')}
              className={`flex-1 py-2.5 px-6 rounded-lg text-sm font-semibold transition-all duration-200 ${
                mode === 'register'
                  ? 'bg-white text-orange-600 shadow-md'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Register
            </button>
          </div>

          {/* Progress Steps for Registration */}
          {mode === 'register' && (
            <div className="flex items-center justify-center mb-4">
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-200 ${
                  step >= 1 ? 'bg-orange-600 text-white shadow-lg' : 'bg-gray-200 text-gray-500'
                }`}>
                  1
                </div>
                <div className={`w-12 h-1 rounded-full transition-all duration-200 ${
                  step >= 2 ? 'bg-orange-600' : 'bg-gray-200'
                }`}></div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-200 ${
                  step >= 2 ? 'bg-orange-600 text-white shadow-lg' : 'bg-gray-200 text-gray-500'
                }`}>
                  2
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            {mode === 'register' && step === 1 && (
    <>
      <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Full Name
                  </label>
        <input
          type="text"
                    {...register('name', { required: 'Name is required' })}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-base transition-all duration-200 hover:border-gray-400"
                    placeholder="Enter your full name"
        />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                  )}
      </div>

      <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Email
                  </label>
        <input
          type="email"
                    {...register('email', { 
                      required: 'Email is required',
                      validate: {
                        hasAtSymbol: (value) => value.includes('@') || 'Email must contain @ symbol',
                        hasDotAfterAt: (value) => {
                          const atIndex = value.indexOf('@');
                          return atIndex !== -1 && value.indexOf('.', atIndex) !== -1 || 'Email must contain a domain (e.g., .com, .org)';
                        },
                        validFormat: (value) => {
                          const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
                          return emailRegex.test(value) || 'Please enter a valid email address';
                        }
                      }
                    })}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-base transition-all duration-200 hover:border-gray-400"
                    placeholder="Enter your email"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                  )}
                </div>

                {/* Country Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Country
                  </label>
                  <select
                    value={selectedCountry}
                    onChange={(e) => handleCountryChange(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-base transition-all duration-200 hover:border-gray-400"
                  >
                    {countries.map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.name} ({country.dialing})
                      </option>
                    ))}
                  </select>
      </div>

                {/* Mobile Number */}
      <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Mobile Number
                  </label>
                  <div className="flex">
                    <div className="flex-shrink-0 px-3 py-2.5 bg-gray-100 border border-r-0 border-gray-300 rounded-l-xl text-base font-semibold text-gray-700 min-w-[80px] flex items-center justify-center">
                      {countryCode}
                    </div>
        <input
          type="tel"
                      {...register('mobileNumber', { 
                        required: 'Mobile number is required',
                        pattern: {
                          value: /^\d{10}$/,
                          message: 'Mobile number must be exactly 10 digits'
                        }
                      })}
                      className="flex-1 px-3 py-2.5 border border-gray-300 rounded-r-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-base transition-all duration-200 hover:border-gray-400"
                      placeholder="Enter 10-digit mobile number"
                      maxLength="10"
                    />
      </div>
                  {errors.mobileNumber && (
                    <p className="text-red-500 text-sm mt-1">{errors.mobileNumber.message}</p>
                  )}
      </div>

        <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Password
                  </label>
          <input
            type="password"
                    {...register('password', { 
                      required: 'Password is required',
                      minLength: {
                        value: 6,
                        message: 'Password must be at least 6 characters'
                      }
                    })}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-base transition-all duration-200 hover:border-gray-400"
                    placeholder="Create a password (min 6 characters)"
                  />
                  {errors.password && (
                    <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
                  )}
        </div>
              </>
            )}

            {mode === 'register' && step === 2 && (
              <>
                <div className="grid grid-cols-2 gap-4">
        <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Current Weight (kg)
                    </label>
          <input
                      type="number"
                      step="0.1"
                      {...register('currentWeight', { 
                        required: 'Current weight is required',
                        min: { value: 20, message: 'Weight must be at least 20kg' },
                        max: { value: 300, message: 'Weight must be less than 300kg' }
                      })}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-base transition-all duration-200 hover:border-gray-400"
                      placeholder="70.5"
                    />
                    {errors.currentWeight && (
                      <p className="text-red-500 text-sm mt-1">{errors.currentWeight.message}</p>
                    )}
      </div>

        <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Goal Weight (kg)
                    </label>
          <input
            type="number"
                      step="0.1"
                      {...register('goalWeight', { 
                        required: 'Goal weight is required',
                        min: { value: 20, message: 'Weight must be at least 20kg' },
                        max: { value: 300, message: 'Weight must be less than 300kg' }
                      })}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-base transition-all duration-200 hover:border-gray-400"
                      placeholder="65.0"
                    />
                    {errors.goalWeight && (
                      <p className="text-red-500 text-sm mt-1">{errors.goalWeight.message}</p>
                    )}
        </div>
      </div>

                <div className="grid grid-cols-2 gap-4">
        <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Height (cm)
                    </label>
          <input
            type="number"
                      {...register('height', { 
                        required: 'Height is required',
                        min: { value: 100, message: 'Height must be at least 100cm' },
                        max: { value: 250, message: 'Height must be less than 250cm' }
                      })}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-base transition-all duration-200 hover:border-gray-400"
                      placeholder="170"
                    />
                    {errors.height && (
                      <p className="text-red-500 text-sm mt-1">{errors.height.message}</p>
                    )}
        </div>

        <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Age
                    </label>
          <input
            type="number"
                      {...register('age', { 
                        required: 'Age is required',
                        min: { value: 13, message: 'Age must be at least 13' },
                        max: { value: 120, message: 'Age must be less than 120' }
                      })}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-base transition-all duration-200 hover:border-gray-400"
                      placeholder="25"
                    />
                    {errors.age && (
                      <p className="text-red-500 text-sm mt-1">{errors.age.message}</p>
                    )}
        </div>
      </div>

      <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Gender
                  </label>
                  <select
                    {...register('gender', { required: 'Gender is required' })}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-base transition-all duration-200 hover:border-gray-400"
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                  {errors.gender && (
                    <p className="text-red-500 text-sm mt-1">{errors.gender.message}</p>
                  )}
      </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Target Date
                  </label>
                  <p className="text-xs text-gray-500 mb-2">
                    Choose the date by when you want to achieve your weight loss goal
                  </p>
                  <input
                    type="date"
                    {...register('targetDate', { 
                      required: 'Target date is required',
                      validate: {
                        futureDate: (value) => {
                          const selectedDate = new Date(value);
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          return selectedDate > today || 'Target date must be in the future';
                        }
                      }
                    })}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-base transition-all duration-200 hover:border-gray-400"
                    min={new Date().toISOString().split('T')[0]}
                  />
                  {errors.targetDate && (
                    <p className="text-red-500 text-sm mt-1">{errors.targetDate.message}</p>
                  )}
      </div>
    </>
            )}

          {mode === 'login' && (
            <>
              <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Email
                  </label>
                <input
                  type="email"
                    {...register('email', { 
                      required: 'Email is required',
                      validate: {
                        hasAtSymbol: (value) => value.includes('@') || 'Email must contain @ symbol',
                        hasDotAfterAt: (value) => {
                          const atIndex = value.indexOf('@');
                          return atIndex !== -1 && value.indexOf('.', atIndex) !== -1 || 'Email must contain a domain (e.g., .com, .org)';
                        },
                        validFormat: (value) => {
                          const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
                          return emailRegex.test(value) || 'Please enter a valid email address';
                        }
                      }
                    })}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-base transition-all duration-200 hover:border-gray-400"
                    placeholder="Enter your email"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                  )}
              </div>

              <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Password
                  </label>
                <input
                  type="password"
                  {...register('password', { required: 'Password is required' })}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-base transition-all duration-200 hover:border-gray-400"
                    placeholder="Enter your password"
                  />
                  {errors.password && (
                    <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
                  )}
                </div>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setShowPasswordReset(true)}
                    className="text-sm text-orange-600 hover:text-orange-700 hover:underline font-medium transition-colors duration-200"
                  >
                    Forgot Password?
                  </button>
              </div>
              </>
            )}

              <button
                type="submit"
                disabled={loading}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 px-6 rounded-xl font-semibold hover:from-orange-600 hover:to-red-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-base shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  {mode === 'register' ? 'Creating Account...' : 'Logging in...'}
                </div>
              ) : (
                mode === 'register' ? (step === 1 ? 'Next' : 'Create Account') : 'Login'
              )}
              </button>
        </form>

          {/* Back button for registration step 2 */}
          {mode === 'register' && step === 2 && (
              <button
              onClick={() => setStep(1)}
              className="w-full mt-3 text-gray-600 hover:text-gray-800 text-sm font-medium py-2 hover:bg-gray-50 rounded-lg transition-all duration-200"
            >
              ← Back to basic info
              </button>
          )}
        </div>
      </motion.div>
    </motion.div>
    </>
  );
};

export default Onboarding; 