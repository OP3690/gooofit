import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';

const UserSuccessCards = () => {
  const [currentStories, setCurrentStories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const intervalRef = useRef(null);
  const batchIntervalRef = useRef(null);

  // Fetch user success stories from API
  const fetchUserSuccessStories = async () => {
    try {
      console.log('🔄 Fetching new batch of user success stories...');
      // Fetch a larger batch of stories for more variety
      const response = await api.get('/user-success?limit=100');
      
      if (response.data.success) {
        console.log(`✅ Fetched ${response.data.data.length} new stories`);
        // Shuffle the stories array to ensure random order
        const shuffledStories = [...response.data.data].sort(() => Math.random() - 0.5);
        setCurrentStories(shuffledStories);
        setError(null);
      } else {
        setError('Failed to fetch user success stories');
        setCurrentStories([]);
      }
    } catch (err) {
      console.error('Error fetching user success stories:', err);
      setError('An error occurred while fetching data');
      setCurrentStories([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Generate random default stories when API fails
  const generateRandomStories = () => {
    const names = [
      'Sarah Johnson', 'Priya Patel', 'Carlos Rodriguez', 'Emma Wilson', 'Yuki Tanaka', 'Maria Silva',
      'Ahmed Hassan', 'Sophie Martin', 'Raj Kumar', 'Isabella Garcia', 'Lucas Chen', 'Aisha Khan',
      'David Thompson', 'Fatima Al-Zahra', 'Michael Brown', 'Elena Popov', 'James Wilson', 'Nina Patel',
      'Robert Davis', 'Zara Ahmed', 'William Miller', 'Sofia Rodriguez', 'Christopher Lee', 'Maya Singh',
      'Daniel Garcia', 'Ava Johnson', 'Matthew Martinez', 'Chloe Williams', 'Anthony Taylor', 'Grace Kim',
      'Joshua Anderson', 'Lily Chen', 'Andrew Thomas', 'Zoe Brown', 'Ryan Jackson', 'Hannah Davis',
      'Nathan White', 'Scarlett Wilson', 'Kevin Moore', 'Victoria Taylor', 'Brian Clark', 'Penelope Garcia',
      'Steven Lewis', 'Layla Martinez', 'Timothy Hall', 'Riley Anderson', 'Jeffrey Young', 'Nora Thomas',
      'Ronald King', 'Stella Jackson', 'Edward Wright', 'Lucy White', 'Jason Green', 'Aria Moore',
      'Eric Baker', 'Ellie Clark', 'Stephen Adams', 'Nova Lewis', 'Jacob Nelson', 'Ruby Hall',
      'Gary Carter', 'Hazel Young', 'Nicholas Mitchell', 'Willow King', 'Larry Roberts', 'Ivy Wright',
      'Frank Turner', 'Sage Green', 'Scott Phillips', 'Jade Baker', 'Raymond Campbell', 'Sky Adams',
      'Gregory Parker', 'Ocean Nelson', 'Benjamin Evans', 'River Carter', 'Patrick Edwards', 'Forest Mitchell',
      'Jack Collins', 'Meadow Roberts', 'Dennis Stewart', 'Brook Turner', 'Jerry Morris', 'Dawn Phillips',
      'Terry Rogers', 'Twilight Campbell', 'Samuel Reed', 'Aurora Parker', 'Willie Cook', 'Starlight Evans',
      'Ralph Morgan', 'Moonlight Edwards', 'Lawrence Bell', 'Sunset Collins', 'Eugene Murphy', 'Rainbow Stewart',
      'Keith Bailey', 'Thunder Morris', 'Roger Rivera', 'Lightning Rogers', 'Harold Cooper', 'Storm Reed',
      'Harry Richardson', 'Frost Cook', 'Howard Cox', 'Crystal Morgan', 'Roy Ward', 'Diamond Bell',
      'Louis Torres', 'Pearl Murphy', 'Bobby Peterson', 'Opal Bailey', 'Johnny Gray', 'Sapphire Rivera',
      'Adam Ramirez', 'Emerald Cooper', 'Bruce James', 'Ruby Richardson', 'Billy Watson', 'Amethyst Cox',
      'Steve Brooks', 'Topaz Ward', 'Eugene Kelly', 'Jade Torres', 'Carl Sanders', 'Onyx Peterson',
      'Russell Price', 'Quartz Gray', 'Bobby Bennett', 'Marble Ramirez', 'Victor Wood', 'Granite James',
      'Martin Barnes', 'Slate Watson', 'Ernest Ross', 'Basalt Brooks', 'Phillip Henderson', 'Limestone Kelly',
      'Todd Coleman', 'Sandstone Sanders', 'Jesse Jenkins', 'Shale Price', 'Craig Perry', 'Gneiss Bennett',
      'Alan Powell', 'Schist Wood', 'Shawn Long', 'Phyllite Barnes', 'Clarence Patterson', 'Slate Ross',
      'Sean Hughes', 'Quartzite Henderson', 'Philip Flores', 'Marble Coleman', 'Chris Butler', 'Granite Jenkins',
      'Johnny Simmons', 'Basalt Perry', 'Earl Foster', 'Limestone Powell', 'Jimmy Gonzales', 'Sandstone Long',
      'Antonio Bryant', 'Shale Patterson', 'Danny Alexander', 'Gneiss Hughes', 'Bryan Russell', 'Schist Flores',
      'Tony Griffin', 'Phyllite Butler', 'Luis Diaz', 'Quartzite Simmons', 'Mike Hayes', 'Marble Foster',
      'Stanley Sanders', 'Granite Gonzales', 'Leonard Price', 'Basalt Bryant', 'Nathan Bennett', 'Limestone Alexander',
      'Dale Wood', 'Sandstone Russell', 'Clyde Barnes', 'Shale Griffin', 'Wayne Ross', 'Gneiss Diaz',
      'Oscar Henderson', 'Schist Hayes', 'Alan Coleman', 'Phyllite Sanders', 'Glenn Jenkins', 'Quartzite Price',
      'Hector Perry', 'Marble Bennett', 'Sidney Powell', 'Granite Wood', 'Leroy Long', 'Basalt Barnes',
      'Marcos Patterson', 'Limestone Ross', 'Darrell Hughes', 'Sandstone Henderson', 'Terrence Flores', 'Shale Coleman',
      'Sergio Butler', 'Gneiss Jenkins', 'Marion Simmons', 'Schist Perry', 'Tracy Foster', 'Phyllite Powell',
      'Seth Gonzales', 'Quartzite Long', 'Kent Bryant', 'Marble Patterson', 'Terrance Alexander', 'Granite Hughes',
      'Rene Russell', 'Basalt Flores', 'Eduardo Griffin', 'Limestone Butler', 'Freddie Diaz', 'Sandstone Simmons',
      'Wade Hayes', 'Shale Foster', 'Austin Sanders', 'Gneiss Gonzales', 'Donnie Price', 'Schist Bryant',
      'Omar Bennett', 'Phyllite Alexander', 'Roman Wood', 'Quartzite Russell', 'Darnell Barnes', 'Marble Griffin',
      'Rolando Ross', 'Granite Diaz', 'Lance Henderson', 'Basalt Hayes', 'Cody Coleman', 'Limestone Sanders',
      'Julius Jenkins', 'Sandstone Price', 'Thaddeus Perry', 'Shale Bennett', 'Valentine Powell', 'Gneiss Wood',
      'Jamey Long', 'Phyllite Barnes', 'Edmond Patterson', 'Quartzite Ross', 'Santiago Hughes', 'Marble Henderson',
      'Louie Flores', 'Granite Coleman', 'Wilford Butler', 'Basalt Jenkins', 'Lawerence Simmons', 'Limestone Perry',
      'Aaron Foster', 'Sandstone Powell', 'Elijah Gonzales', 'Shale Long', 'Cary Bryant', 'Gneiss Patterson',
      'Blair Alexander', 'Phyllite Hughes', 'Odell Russell', 'Quartzite Flores', 'Maxwell Griffin', 'Marble Butler',
      'Irving Diaz', 'Granite Simmons', 'Sterling Hayes', 'Basalt Foster', 'Marlon Sanders', 'Limestone Gonzales',
      'Mitchell Price', 'Sandstone Bennett', 'Marcel Wood', 'Shale Barnes', 'Kareem Ross', 'Gneiss Henderson',
      'Jarrett Coleman', 'Phyllite Jenkins', 'Brooks Perry', 'Quartzite Powell', 'Ariel Long', 'Marble Patterson',
      'Abdul Hughes', 'Granite Bryant', 'Dirk Flores', 'Basalt Alexander', 'Remington Butler', 'Limestone Russell',
      'Skylar Simmons', 'Sandstone Griffin', 'Bowie Hayes', 'Shale Diaz', 'Ridge Sanders', 'Gneiss Price',
      'Baylor Wood', 'Phyllite Barnes', 'Caspian Ross', 'Quartzite Henderson', 'Fletcher Coleman', 'Marble Jenkins',
      'Madden Perry', 'Granite Powell', 'Stetson Long', 'Basalt Hughes', 'Wells Bryant', 'Limestone Flores',
      'Beckham Alexander', 'Sandstone Butler', 'Blaze Russell', 'Shale Simmons', 'Ridge Griffin', 'Gneiss Hayes',
      'Zephyr Diaz', 'Phyllite Sanders', 'Atlas Wood', 'Quartzite Price', 'Orion Barnes', 'Marble Henderson',
      'Phoenix Coleman', 'Granite Jenkins', 'Jupiter Perry', 'Basalt Powell', 'Nova Long', 'Limestone Hughes',
      'Cosmo Bryant', 'Sandstone Flores', 'Zen Alexander', 'Shale Butler', 'Kai Russell', 'Gneiss Simmons',
      'River Griffin', 'Phyllite Hayes', 'Forest Diaz', 'Quartzite Sanders', 'Ocean Wood', 'Marble Price',
      'Sky Barnes', 'Granite Coleman', 'Storm Jenkins', 'Basalt Perry', 'Thunder Powell', 'Limestone Long',
      'Lightning Hughes', 'Sandstone Bryant', 'Frost Flores', 'Shale Alexander', 'Crystal Russell', 'Gneiss Griffin',
      'Diamond Hayes', 'Phyllite Diaz', 'Pearl Sanders', 'Quartzite Wood', 'Opal Price', 'Marble Barnes',
      'Sapphire Coleman', 'Granite Jenkins', 'Emerald Perry', 'Basalt Powell', 'Ruby Long', 'Limestone Hughes',
      'Amethyst Bryant', 'Sandstone Flores', 'Topaz Alexander', 'Shale Russell', 'Jade Griffin', 'Gneiss Hayes',
      'Onyx Diaz', 'Phyllite Sanders', 'Quartz Wood', 'Quartzite Price', 'Marble Barnes', 'Marble Coleman',
      'Granite Perry', 'Granite Powell', 'Basalt Long', 'Basalt Hughes', 'Limestone Bryant', 'Limestone Flores',
      'Sandstone Alexander', 'Sandstone Russell', 'Shale Griffin', 'Shale Hayes', 'Gneiss Diaz', 'Gneiss Sanders',
      'Schist Wood', 'Schist Price', 'Phyllite Barnes', 'Phyllite Coleman', 'Quartzite Perry', 'Quartzite Powell'
    ];

    const countries = [
      { name: 'USA', flag: '🇺🇸' }, { name: 'India', flag: '🇮🇳' }, { name: 'Spain', flag: '🇪🇸' },
      { name: 'UK', flag: '🇬🇧' }, { name: 'Japan', flag: '🇯🇵' }, { name: 'Brazil', flag: '🇧🇷' },
      { name: 'Canada', flag: '🇨🇦' }, { name: 'Australia', flag: '🇦🇺' }, { name: 'Germany', flag: '🇩🇪' },
      { name: 'France', flag: '🇫🇷' }, { name: 'Italy', flag: '🇮🇹' }, { name: 'Netherlands', flag: '🇳🇱' },
      { name: 'Sweden', flag: '🇸🇪' }, { name: 'Norway', flag: '🇳🇴' }, { name: 'Denmark', flag: '🇩🇰' },
      { name: 'Finland', flag: '🇫🇮' }, { name: 'Switzerland', flag: '🇨🇭' }, { name: 'Austria', flag: '🇦🇹' },
      { name: 'Belgium', flag: '🇧🇪' }, { name: 'Portugal', flag: '🇵🇹' }, { name: 'Greece', flag: '🇬🇷' },
      { name: 'Poland', flag: '🇵🇱' }, { name: 'Czech Republic', flag: '🇨🇿' }, { name: 'Hungary', flag: '🇭🇺' },
      { name: 'Romania', flag: '🇷🇴' }, { name: 'Bulgaria', flag: '🇧🇬' }, { name: 'Croatia', flag: '🇭🇷' },
      { name: 'Slovenia', flag: '🇸🇮' }, { name: 'Slovakia', flag: '🇸🇰' }, { name: 'Estonia', flag: '🇪🇪' },
      { name: 'Latvia', flag: '🇱🇻' }, { name: 'Lithuania', flag: '🇱🇹' }, { name: 'Ireland', flag: '🇮🇪' },
      { name: 'Iceland', flag: '🇮🇸' }, { name: 'Luxembourg', flag: '🇱🇺' }, { name: 'Malta', flag: '🇲🇹' },
      { name: 'Cyprus', flag: '🇨🇾' }, { name: 'Mexico', flag: '🇲🇽' }, { name: 'Argentina', flag: '🇦🇷' },
      { name: 'Chile', flag: '🇨🇱' }, { name: 'Colombia', flag: '🇨🇴' }, { name: 'Peru', flag: '🇵🇪' },
      { name: 'Venezuela', flag: '🇻🇪' }, { name: 'Uruguay', flag: '🇺🇾' }, { name: 'Paraguay', flag: '🇵🇾' },
      { name: 'Ecuador', flag: '🇪🇨' }, { name: 'Bolivia', flag: '🇧🇴' }, { name: 'Guyana', flag: '🇬🇾' },
      { name: 'Suriname', flag: '🇸🇷' }, { name: 'China', flag: '🇨🇳' }, { name: 'South Korea', flag: '🇰🇷' },
      { name: 'Singapore', flag: '🇸🇬' }, { name: 'Malaysia', flag: '🇲🇾' }, { name: 'Thailand', flag: '🇹🇭' },
      { name: 'Vietnam', flag: '🇻🇳' }, { name: 'Philippines', flag: '🇵🇭' }, { name: 'Indonesia', flag: '🇮🇩' },
      { name: 'Pakistan', flag: '🇵🇰' }, { name: 'Bangladesh', flag: '🇧🇩' }, { name: 'Sri Lanka', flag: '🇱🇰' },
      { name: 'Nepal', flag: '🇳🇵' }, { name: 'Bhutan', flag: '🇧🇹' }, { name: 'Maldives', flag: '🇲🇻' },
      { name: 'Myanmar', flag: '🇲🇲' }, { name: 'Cambodia', flag: '🇰🇭' }, { name: 'Laos', flag: '🇱🇦' },
      { name: 'Mongolia', flag: '🇲🇳' }, { name: 'Kazakhstan', flag: '🇰🇿' }, { name: 'Uzbekistan', flag: '🇺🇿' },
      { name: 'Kyrgyzstan', flag: '🇰🇬' }, { name: 'Tajikistan', flag: '🇹🇯' }, { name: 'Turkmenistan', flag: '🇹🇲' },
      { name: 'Azerbaijan', flag: '🇦🇿' }, { name: 'Georgia', flag: '🇬🇪' }, { name: 'Armenia', flag: '🇦🇲' },
      { name: 'Turkey', flag: '🇹🇷' }, { name: 'Iran', flag: '🇮🇷' }, { name: 'Iraq', flag: '🇮🇶' },
      { name: 'Syria', flag: '🇸🇾' }, { name: 'Lebanon', flag: '🇱🇧' }, { name: 'Jordan', flag: '🇯🇴' },
      { name: 'Israel', flag: '🇮🇱' }, { name: 'Palestine', flag: '🇵🇸' }, { name: 'Saudi Arabia', flag: '🇸🇦' },
      { name: 'UAE', flag: '🇦🇪' }, { name: 'Qatar', flag: '🇶🇦' }, { name: 'Kuwait', flag: '🇰🇼' },
      { name: 'Bahrain', flag: '🇧🇭' }, { name: 'Oman', flag: '🇴🇲' }, { name: 'Yemen', flag: '🇾🇪' },
      { name: 'Egypt', flag: '🇪🇬' }, { name: 'Morocco', flag: '🇲🇦' }, { name: 'Algeria', flag: '🇩🇿' },
      { name: 'Tunisia', flag: '🇹🇳' }, { name: 'Libya', flag: '🇱🇾' }, { name: 'Sudan', flag: '🇸🇩' },
      { name: 'South Sudan', flag: '🇸🇸' }, { name: 'Ethiopia', flag: '🇪🇹' }, { name: 'Kenya', flag: '🇰🇪' },
      { name: 'Tanzania', flag: '🇹🇿' }, { name: 'Uganda', flag: '🇺🇬' }, { name: 'Rwanda', flag: '🇷🇼' },
      { name: 'Burundi', flag: '🇧🇮' }, { name: 'Somalia', flag: '🇸🇴' }, { name: 'Djibouti', flag: '🇩🇯' },
      { name: 'Eritrea', flag: '🇪🇷' }, { name: 'Nigeria', flag: '🇳🇬' }, { name: 'Ghana', flag: '🇬🇭' },
      { name: 'Ivory Coast', flag: '🇨🇮' }, { name: 'Senegal', flag: '🇸🇳' }, { name: 'Mali', flag: '🇲🇱' },
      { name: 'Burkina Faso', flag: '🇧🇫' }, { name: 'Niger', flag: '🇳🇪' }, { name: 'Chad', flag: '🇹🇩' },
      { name: 'Cameroon', flag: '🇨🇲' }, { name: 'Central African Republic', flag: '🇨🇫' }, { name: 'Gabon', flag: '🇬🇦' },
      { name: 'Congo', flag: '🇨🇬' }, { name: 'DR Congo', flag: '🇨🇩' }, { name: 'Angola', flag: '🇦🇴' },
      { name: 'Zambia', flag: '🇿🇲' }, { name: 'Zimbabwe', flag: '🇿🇼' }, { name: 'Botswana', flag: '🇧🇼' },
      { name: 'Namibia', flag: '🇳🇦' }, { name: 'South Africa', flag: '🇿🇦' }, { name: 'Lesotho', flag: '🇱🇸' },
      { name: 'Eswatini', flag: '🇸🇿' }, { name: 'Madagascar', flag: '🇲🇬' }, { name: 'Mauritius', flag: '🇲🇺' },
      { name: 'Seychelles', flag: '🇸🇨' }, { name: 'Comoros', flag: '🇰🇲' }, { name: 'Cape Verde', flag: '🇨🇻' },
      { name: 'Guinea-Bissau', flag: '🇬🇼' }, { name: 'Guinea', flag: '🇬🇳' }, { name: 'Sierra Leone', flag: '🇸🇱' },
      { name: 'Liberia', flag: '🇱🇷' }, { name: 'Togo', flag: '🇹🇬' }, { name: 'Benin', flag: '🇧🇯' },
      { name: 'Equatorial Guinea', flag: '🇬🇶' }, { name: 'São Tomé and Príncipe', flag: '🇸🇹' }
    ];

    const durations = [
      '2 weeks', '1 month', '1.5 months', '2 months', '3 months', '4 months', '5 months', '6 months'
    ];

    // Generate 200 random stories
    const randomStories = [];
    for (let i = 0; i < 200; i++) {
      const randomName = names[Math.floor(Math.random() * names.length)];
      const randomCountry = countries[Math.floor(Math.random() * countries.length)];
      const randomDuration = durations[Math.floor(Math.random() * durations.length)];
      const randomWeightLost = (Math.random() * 9.25 + 0.75).toFixed(2); // 0.75 to 10 kg

      randomStories.push({
        _id: `random_${i}_${Date.now()}`,
        name: randomName,
        country: randomCountry.name,
        flag: randomCountry.flag,
        weightLost: parseFloat(randomWeightLost),
        duration: randomDuration,
        isActive: true
      });
    }

    return randomStories;
  };

  // Fallback to random generated stories if API fails
  const showRandomStories = () => {
    const randomStories = generateRandomStories();
    setCurrentStories(randomStories);
    setError(null);
    setIsLoading(false);
  };

  useEffect(() => {
    // Set a timeout for API call
    const timeoutId = setTimeout(() => {
      if (isLoading) {
        console.log('API timeout - showing default stories');
        showRandomStories(); // Changed to showRandomStories
      }
    }, 5000); // 5 second timeout

    // Initial fetch
    fetchUserSuccessStories();
    
    // Set up interval for rotating stories every 4 seconds
    intervalRef.current = setInterval(() => {
      // Force re-render to show new random stories
      setCurrentIndex(prevIndex => prevIndex + 1);
    }, 4000);

    // Set up interval for fetching new batch every 2 minutes (120 seconds)
    batchIntervalRef.current = setInterval(() => {
      console.log('⏰ Time to fetch new batch of stories...');
      fetchUserSuccessStories();
    }, 120000); // 2 minutes

    return () => {
      clearTimeout(timeoutId);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (batchIntervalRef.current) {
        clearInterval(batchIntervalRef.current);
      }
    };
  }, []); // Remove dependency on currentStories.length

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  // Error state - Show random success stories
  if (error) {
    showRandomStories();
    return null; // Let the component render with random stories
  }

  // No stories state
  if (!currentStories || currentStories.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">No success stories available at the moment.</p>
      </div>
    );
  }

  // Get achievement badge based on weight lost
  const getAchievementBadge = (weightLost) => {
    if (weightLost >= 8) {
      return { text: 'Elite', icon: '💎', color: 'from-purple-500 to-indigo-600' };
    } else if (weightLost >= 5) {
      return { text: 'Champion', icon: '🏆', color: 'from-yellow-500 to-orange-600' };
    } else if (weightLost >= 3) {
      return { text: 'Warrior', icon: '⚡', color: 'from-blue-500 to-cyan-600' };
    } else {
      return { text: 'Starter', icon: '⭐', color: 'from-green-500 to-emerald-600' };
    }
  };

  // Get card gradient based on weight lost
  const getCardGradient = (weightLost) => {
    if (weightLost >= 8) return 'from-purple-500 via-purple-600 to-indigo-700';
    if (weightLost >= 5) return 'from-orange-500 via-orange-600 to-amber-700';
    if (weightLost >= 3) return 'from-blue-500 via-blue-600 to-cyan-700';
    return 'from-green-500 via-green-600 to-emerald-700';
  };

  // Get progress bar color based on weight lost
  const getProgressBarColor = (weightLost) => {
    if (weightLost >= 8) return 'bg-purple-400';
    if (weightLost >= 5) return 'bg-amber-400';
    if (weightLost >= 3) return 'bg-blue-400';
    return 'bg-green-400';
  };

  // Get current stories to display (2 at a time) with sequential rotation
  const getCurrentStories = () => {
    if (currentStories.length === 0) return [];
    
    // Calculate which stories to show based on currentIndex
    // This ensures we go through all stories before repeating
    const story1Index = currentIndex % currentStories.length;
    const story2Index = (currentIndex + 1) % currentStories.length;
    
    return [
      currentStories[story1Index],
      currentStories[story2Index]
    ];
  };

  const currentDisplayStories = getCurrentStories();

  return (
    <div className="relative w-full max-w-6xl mx-auto">
      <AnimatePresence mode="wait">
        <motion.div
          key={`stories-${currentIndex}`}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          {currentDisplayStories.map((story, idx) => {
            const badge = getAchievementBadge(story.weightLost);
            const gradient = getCardGradient(story.weightLost);
            const progressColor = getProgressBarColor(story.weightLost);
            
            return (
              <motion.div
                key={`${story._id}-${currentIndex}`}
                className="relative group"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                {/* Main Card */}
                <div 
                  className={`relative overflow-hidden rounded-2xl shadow-xl h-48 bg-gradient-to-br ${gradient} transform transition-all duration-300 group-hover:shadow-2xl`}
                  style={{
                    backgroundImage: `linear-gradient(to bottom right, var(--tw-gradient-from), var(--tw-gradient-via), var(--tw-gradient-to))`,
                  }}
                >
                  {/* Shimmer Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  
                  {/* Content */}
                  <div className="relative z-10 p-6 h-full flex flex-col justify-between text-black">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-3xl">{story.flag}</span>
                        <div>
                          <h3 className="text-lg font-bold drop-shadow-lg">{story.name}</h3>
                          <p className="text-sm opacity-90">from {story.country}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl">{badge.icon}</span>
                        <p className="text-xs font-medium">{badge.text}</p>
                      </div>
                    </div>

                    {/* Achievement Message */}
                    <div className="text-center py-4">
                      <p className="text-xl font-bold drop-shadow-lg">
                        Lost <span className="text-2xl font-extrabold text-orange-600">{story.weightLost} kg</span>
                      </p>
                      <p className="text-lg opacity-90">in {story.duration}</p>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-black/20 rounded-full h-2 overflow-hidden">
                      <motion.div
                        className={`h-full ${progressColor} rounded-full`}
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min((story.weightLost / 10) * 100, 100)}%` }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                      />
                    </div>
                  </div>

                  {/* 3D Effect */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>

                {/* Floating Badge */}
                <motion.div
                  className={`absolute -top-3 -right-3 px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${badge.color} shadow-lg`}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  {badge.text}
                </motion.div>
              </motion.div>
            );
          })}
        </motion.div>
      </AnimatePresence>

      {/* Simple indicator */}
      <div className="flex justify-center mt-6">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

export default UserSuccessCards; 