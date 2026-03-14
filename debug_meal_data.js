const mongoose = require('mongoose');
const MealEntry = require('./models/MealEntry');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://global5665:test123@cluster0.wigbba7.mongodb.net/weight-management?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const debugMealData = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connection.asPromise();
    console.log('Connected to MongoDB');

    // Get all meal entries
    const meals = await MealEntry.find({}).sort({ date: -1 }).limit(10);
    
    console.log(`Found ${meals.length} recent meals`);
    console.log('\nSample meal entries:');
    
    meals.forEach((meal, index) => {
      console.log(`\nMeal ${index + 1}:`);
      console.log(`  Date: ${meal.date}`);
      console.log(`  Food: ${meal.foodName}`);
      console.log(`  Meal Time: ${meal.mealTime || 'NOT SET'}`);
      console.log(`  Meal Type: ${meal.mealType}`);
      console.log(`  Calories: ${meal.calories}`);
      console.log(`  Fat: ${meal.fat}`);
      console.log(`  Cholesterol: ${meal.cholesterol}`);
      console.log(`  Quantity: ${meal.quantity} ${meal.unit}`);
    });

    // Check for meals with mealTime
    const mealsWithTime = await MealEntry.countDocuments({ mealTime: { $exists: true, $ne: null } });
    const totalMeals = await MealEntry.countDocuments({});
    
    console.log(`\nMeals with mealTime: ${mealsWithTime}/${totalMeals}`);
    
    // Check recent 90 days
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    
    const recentMeals = await MealEntry.countDocuments({ 
      date: { $gte: ninetyDaysAgo.toISOString().split('T')[0] },
      mealTime: { $exists: true, $ne: null }
    });
    
    console.log(`Meals in last 90 days with mealTime: ${recentMeals}`);

    process.exit(0);
  } catch (error) {
    console.error('Error debugging meal data:', error);
    process.exit(1);
  }
};

debugMealData(); 