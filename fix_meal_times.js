const mongoose = require('mongoose');
const MealEntry = require('./models/MealEntry');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://global5665:test123@cluster0.wigbba7.mongodb.net/weight-management?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const fixMealTimes = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connection.asPromise();
    console.log('Connected to MongoDB');

    // Get all meal entries without mealTime
    const meals = await MealEntry.find({ mealTime: { $exists: false } });
    console.log(`Found ${meals.length} meals without mealTime`);

    if (meals.length === 0) {
      console.log('All meals already have mealTime');
      process.exit(0);
    }

    // Define meal time ranges for each meal type
    const mealTimeRanges = {
      breakfast: { start: 6, end: 10 }, // 6 AM to 10 AM
      lunch: { start: 11, end: 15 },    // 11 AM to 3 PM
      dinner: { start: 17, end: 21 },   // 5 PM to 9 PM
      snack: { start: 9, end: 22 }      // 9 AM to 10 PM
    };

    let updatedCount = 0;

    for (const meal of meals) {
      // Generate realistic meal time based on meal type
      const mealType = meal.mealType || 'breakfast';
      const timeRange = mealTimeRanges[mealType] || mealTimeRanges.breakfast;
      
      const hour = Math.floor(Math.random() * (timeRange.end - timeRange.start + 1)) + timeRange.start;
      const minute = Math.floor(Math.random() * 60);
      const mealTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

      // Update the meal entry
      await MealEntry.updateOne(
        { _id: meal._id },
        { $set: { mealTime: mealTime } }
      );

      updatedCount++;
      
      if (updatedCount % 50 === 0) {
        console.log(`Updated ${updatedCount} meals...`);
      }
    }

    console.log(`Successfully updated ${updatedCount} meals with mealTime`);

    // Verify the update
    const mealsWithTime = await MealEntry.countDocuments({ mealTime: { $exists: true, $ne: null } });
    const totalMeals = await MealEntry.countDocuments({});
    
    console.log(`\nVerification:`);
    console.log(`Meals with mealTime: ${mealsWithTime}/${totalMeals}`);

    // Show sample updated meals
    const sampleMeals = await MealEntry.find({ mealTime: { $exists: true } }).limit(5);
    console.log('\nSample updated meals:');
    sampleMeals.forEach((meal, index) => {
      console.log(`${index + 1}. ${meal.foodName} - ${meal.mealType} at ${meal.mealTime}`);
    });

    console.log('\nMeal time data fixed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('Error fixing meal times:', error);
    process.exit(1);
  }
};

fixMealTimes(); 