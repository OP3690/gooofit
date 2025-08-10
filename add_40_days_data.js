const mongoose = require('mongoose');
const User = require('./models/User');
const MealEntry = require('./models/MealEntry');

// Usage: node add_40_days_data.js <userId> [days=40] [--clear]
const [, , userIdArg, daysArg] = process.argv;
const shouldClear = process.argv.includes('--clear');
const DAYS = Number.isFinite(Number(daysArg)) ? Number(daysArg) : 40;

if (!userIdArg || userIdArg.length < 10) {
  console.error('Usage: node add_40_days_data.js <userId> [days=40] [--clear]');
  process.exit(1);
}

// Connect to MongoDB
mongoose.connect(
  process.env.MONGODB_URI ||
    'mongodb+srv://global5665:test123@cluster0.wigbba7.mongodb.net/weight-management?retryWrites=true&w=majority&appName=Cluster0',
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

const addDaysData = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connection.asPromise();
    console.log('Connected to MongoDB');

    // Find the user by ID
    const user = await User.findById(userIdArg);
    if (!user) {
      console.error('User not found:', userIdArg);
      return process.exit(1);
    }

    console.log(`Found user: ${user.name} (${user.email || 'no-email'}) [${user._id}]`);

    if (shouldClear) {
      await MealEntry.deleteMany({ userId: user._id });
      console.log('Cleared existing meal entries for this user');
    }

    // Calculate TDEE and macronutrient goals from user
    const weight = user.currentWeight || 78.3;
    const height = user.height || 165;
    const age = user.age || 32;
    const gender = (user.gender || 'male').toLowerCase();
    const activityLevel = (user.activityLevel || 'moderate').toLowerCase();

    // Mifflin-St Jeor Equation
    let bmr;
    if (gender === 'male') {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }

    const activityMultipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9,
    };
    const tdee = Math.round(bmr * (activityMultipliers[activityLevel] || 1.55));
    console.log('TDEE (kcal):', tdee);

    // Food items (mix of common foods)
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
      { name: 'Cottage cheese', calories: 98, fat: 4.3, cholesterol: 17, category: 'Dairy' },
      { name: 'Tea 1 cup (2tsp cream & 2tsp sugar)', calories: 70, fat: 2.9, cholesterol: 10, category: 'Beverages' },
      { name: 'Coffee 1 cup (2tsp cream & 2tsp sugar)', calories: 70, fat: 2.9, cholesterol: 10, category: 'Beverages' },
      { name: 'Milk', calories: 42, fat: 1, cholesterol: 5, category: 'Dairy' },
      { name: 'Bread', calories: 265, fat: 3.2, cholesterol: 0, category: 'Grains' },
      { name: 'Apple', calories: 52, fat: 0.2, cholesterol: 0, category: 'Fruits' },
    ];

    const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];
    const units = ['grams', 'cups', 'pieces', 'slices'];

    // Time windows per meal type
    const mealTimeRanges = {
      breakfast: { start: 6, end: 10 },
      lunch: { start: 11, end: 15 },
      dinner: { start: 17, end: 21 },
      snack: { start: 9, end: 22 },
    };

    const mealEntries = [];

    for (let day = DAYS - 1; day >= 0; day--) {
      const date = new Date();
      date.setDate(date.getDate() - day);
      const dateString = date.toISOString().split('T')[0];

      // 3-4 meals per day typical
      const mealsPerDay = Math.floor(Math.random() * 2) + 3; // 3 or 4
      const dayMeals = ['breakfast', 'lunch', 'dinner'];
      if (mealsPerDay === 4) dayMeals.push('snack');

      // shuffle
      for (let i = dayMeals.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [dayMeals[i], dayMeals[j]] = [dayMeals[j], dayMeals[i]];
      }

      for (let i = 0; i < dayMeals.length; i++) {
        const mealType = dayMeals[i];
        const food = foodItems[Math.floor(Math.random() * foodItems.length)];
        const unit = units[Math.floor(Math.random() * units.length)];

        let quantity;
        if (unit === 'grams') quantity = Math.floor(Math.random() * 200) + 50; // 50–250g
        else if (unit === 'cups') quantity = Math.round((Math.random() * 2 + 0.5) * 10) / 10; // 0.5–2.5 cups
        else if (unit === 'pieces') quantity = Math.floor(Math.random() * 3) + 1; // 1–3 pieces
        else quantity = Math.floor(Math.random() * 4) + 1; // slices 1–4

        let gramsEquivalent = quantity;
        if (unit === 'cups') gramsEquivalent = quantity * 240;
        else if (unit === 'pieces') gramsEquivalent = quantity * 50;
        else if (unit === 'slices') gramsEquivalent = quantity * 30;

        const calories = Math.round((food.calories || 0) * gramsEquivalent / 100);
        const fat = Math.round((food.fat || 0) * gramsEquivalent) / 100;
        const cholesterol = Math.round((food.cholesterol || 0) * gramsEquivalent / 100);

        const tr = mealTimeRanges[mealType];
        const hour = Math.floor(Math.random() * (tr.end - tr.start + 1)) + tr.start;
        const minute = Math.floor(Math.random() * 60);
        const mealTime = `${hour.toString().padStart(2, '0')}:${minute
          .toString()
          .padStart(2, '0')}`;

        mealEntries.push({
          userId: user._id,
          foodName: food.name,
          quantity,
          unit,
          calories,
          fat: Number(fat.toFixed(1)),
          cholesterol,
          mealType,
          mealTime,
          date: dateString,
          notes: `Auto-generated ${mealType} - ${food.category}`,
        });
      }
    }

    await MealEntry.insertMany(mealEntries);
    console.log(`Inserted ${mealEntries.length} meals for last ${DAYS} days for user ${user._id}`);

    const totalCalories = mealEntries.reduce((s, m) => s + (m.calories || 0), 0);
    console.log('Total calories:', totalCalories);
    console.log('Average calories/day:', Math.round(totalCalories / DAYS));

    console.log('Done!');
    process.exit(0);
  } catch (err) {
    console.error('Error generating data:', err);
    process.exit(1);
  }
};

addDaysData();

