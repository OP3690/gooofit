const mongoose = require('mongoose');
const User = require('./models/User');
const MealEntry = require('./models/MealEntry');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://global5665:test123@cluster0.wigbba7.mongodb.net/weight-management?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const add36DaysData = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connection.asPromise();
    console.log('Connected to MongoDB');

    // Find the user
    const user = await User.findOne({ email: 'omprakashutaha@gmail.com' });
    if (!user) {
      console.error('User not found');
      return;
    }

    console.log(`Found user: ${user.name} (${user.email})`);

    // Clear existing meal entries for this user
    await MealEntry.deleteMany({ userId: user._id });
    console.log('Cleared existing meal entries');

    // Calculate TDEE and macronutrient goals
    const weight = user.currentWeight || 78.3;
    const height = user.height || 165;
    const age = user.age || 32;
    const gender = user.gender || 'male';
    const activityLevel = user.activityLevel || 'moderate';

    // Mifflin-St Jeor Equation
    let bmr;
    if (gender === 'male') {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }

    // Activity multipliers
    const activityMultipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9
    };

    const tdee = Math.round(bmr * activityMultipliers[activityLevel] || 1.55);

    // Macronutrient goals
    const fatGrams = Math.round((tdee * 0.25) / 9);
    const proteinGrams = Math.max(Math.round((tdee * 0.20) / 4), Math.round(weight * 1.2));
    const carbGrams = Math.round((tdee * 0.55) / 4);

    console.log(`TDEE: ${tdee} kcal`);
    console.log(`Macronutrient goals - Fat: ${fatGrams}g, Protein: ${proteinGrams}g, Carbs: ${carbGrams}g`);

    // Food database for variety
    const foodItems = [
      { name: 'Brown rice', calories: 111, fat: 0.9, cholesterol: 0, category: 'Grains' },
      { name: 'Chicken breast', calories: 165, fat: 3.6, cholesterol: 85, category: 'Meat' },
      { name: 'Salmon', calories: 208, fat: 12, cholesterol: 63, category: 'Fish' },
      { name: 'Greek yogurt', calories: 59, fat: 0.4, cholesterol: 5, category: 'Dairy' },
      { name: 'Broccoli', calories: 34, fat: 0.4, cholesterol: 0, category: 'Vegetables' },
      { name: 'Sweet potato', calories: 86, fat: 0.1, cholesterol: 0, category: 'Vegetables' },
      { name: 'Quinoa', calories: 120, fat: 1.9, cholesterol: 0, category: 'Grains' },
      { name: 'Eggs', calories: 155, fat: 11, cholesterol: 373, category: 'Eggs' },
      { name: 'Almonds', calories: 164, fat: 14, cholesterol: 0, category: 'Nuts' },
      { name: 'Banana', calories: 89, fat: 0.3, cholesterol: 0, category: 'Fruits' },
      { name: 'Oatmeal', calories: 68, fat: 1.4, cholesterol: 0, category: 'Grains' },
      { name: 'Spinach', calories: 23, fat: 0.4, cholesterol: 0, category: 'Vegetables' },
      { name: 'Tuna', calories: 144, fat: 0.5, cholesterol: 60, category: 'Fish' },
      { name: 'Avocado', calories: 160, fat: 15, cholesterol: 0, category: 'Fruits' },
      { name: 'Cottage cheese', calories: 98, fat: 4.3, cholesterol: 17, category: 'Dairy' }
    ];

    const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];
    const units = ['grams', 'cups', 'pieces', 'slices'];
    
    const mealEntries = [];

    // Generate 36 days of data
    for (let day = 35; day >= 0; day--) {
      const date = new Date();
      date.setDate(date.getDate() - day);
      const dateString = date.toISOString().split('T')[0];

      // Generate 2-4 meals per day
      const mealsPerDay = Math.floor(Math.random() * 3) + 2; // 2-4 meals
      const mealTimes = ['08:00', '12:00', '18:00', '15:00', '10:00', '20:00'];
      
      for (let meal = 0; meal < mealsPerDay; meal++) {
        const food = foodItems[Math.floor(Math.random() * foodItems.length)];
        const mealType = mealTypes[Math.floor(Math.random() * mealTypes.length)];
        const unit = units[Math.floor(Math.random() * units.length)];
        
        // Generate realistic quantities
        let quantity, calories, fat, cholesterol;
        
        if (unit === 'grams') {
          quantity = Math.floor(Math.random() * 200) + 50; // 50-250g
        } else if (unit === 'cups') {
          quantity = Math.random() * 2 + 0.5; // 0.5-2.5 cups
        } else if (unit === 'pieces') {
          quantity = Math.floor(Math.random() * 3) + 1; // 1-3 pieces
        } else {
          quantity = Math.floor(Math.random() * 4) + 1; // 1-4 slices
        }

        // Calculate nutrition based on unit
        let gramsEquivalent = quantity;
        if (unit === 'cups') gramsEquivalent = quantity * 240;
        else if (unit === 'pieces') gramsEquivalent = quantity * 50;
        else if (unit === 'slices') gramsEquivalent = quantity * 30;

        calories = Math.round(food.calories * gramsEquivalent / 100);
        fat = (food.fat * gramsEquivalent / 100).toFixed(1);
        cholesterol = Math.round(food.cholesterol * gramsEquivalent / 100);

        // Add some variation to meal times
        const baseTime = mealTimes[meal] || mealTimes[Math.floor(Math.random() * mealTimes.length)];
        const hourVariation = Math.floor(Math.random() * 2) - 1; // -1 to +1 hour
        const [hour, minute] = baseTime.split(':');
        const adjustedHour = Math.max(0, Math.min(23, parseInt(hour) + hourVariation));
        const mealTime = `${adjustedHour.toString().padStart(2, '0')}:${minute}`;

        mealEntries.push({
          userId: user._id,
          foodName: food.name,
          quantity: quantity,
          unit: unit,
          calories: calories,
          fat: parseFloat(fat),
          cholesterol: cholesterol,
          mealType: mealType,
          mealTime: mealTime,
          date: dateString,
          notes: `Dummy ${mealType} meal - ${food.category}`
        });
      }
    }

    // Insert all meal entries
    await MealEntry.insertMany(mealEntries);
    console.log(`Successfully added ${mealEntries.length} meal entries for the last 36 days`);

    // Show summary
    const totalCalories = mealEntries.reduce((sum, meal) => sum + meal.calories, 0);
    const avgCaloriesPerDay = Math.round(totalCalories / 36);
    console.log(`Total calories over 36 days: ${totalCalories}`);
    console.log(`Average calories per day: ${avgCaloriesPerDay}`);
    console.log(`Target TDEE: ${tdee} kcal`);

    console.log('Data generation completed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('Error adding 36 days data:', error);
    process.exit(1);
  }
};

add36DaysData(); 