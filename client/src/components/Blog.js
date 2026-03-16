import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FULL_CONTENT_SLUGS } from '../data/blogFullContentSlugs';
import { 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  User 
} from 'lucide-react';
import SEO from './SEO';

// Import images directly for better reliability
import blogImg1 from '../assets/blog1.jpg';
import blogImg2 from '../assets/blog2.jpg';
import blogImg3 from '../assets/blog3.jpg';
import blogImg4 from '../assets/blog4.jpg';
import blogImg5 from '../assets/blog5.jpg';
import blogImg6 from '../assets/blog6.jpg';
import blogImg7 from '../assets/blog7.jpg';
import blogImg8 from '../assets/blog8.jpg';
import blogImg9 from '../assets/blog9.jpg';
import blogImg10 from '../assets/blog10.jpg';
import blogImg11 from '../assets/blog11.jpg';
import blogImg12 from '../assets/blog12.jpg';
import blogImg13 from '../assets/blog13.jpg';
import blogImg14 from '../assets/blog14.jpg';
import blogImg15 from '../assets/blog15.jpg';
import blogImg16 from '../assets/blog16.jpg';
import blogImg17 from '../assets/blog17.jpg';
import blogImg18 from '../assets/blog18.jpg';
import blogImg19 from '../assets/blog19.jpg';
import blogImg20 from '../assets/blog20.jpg';
import blogImg21 from '../assets/blog21.jpg';
import blogImg22 from '../assets/blog22.jpg';

// Blog data with SEO-optimized content using imported images
const blogPosts = [
  {
    id: 1,
    slug: "weight-loss-injections-2025-complete-guide",
    title: "Weight Loss Injections 2025: Complete Guide to Semaglutide & Wegovy",
    excerpt: "Discover the latest weight loss injections and medications revolutionizing weight management in 2025. Learn about Semaglutide, Wegovy, and other breakthrough treatments.",
    author: "Gooofit Research Team",
    date: "2025-01-15",
    readTime: "12 min read",
    category: "Weight Loss 2025",
    image: blogImg1,
    tags: ["weight loss injections", "semaglutide", "wegovy", "weight loss shots", "medical weight loss", "2025 trends"],
    seoDescription: "Complete guide to weight loss injections in 2025. Learn about Semaglutide, Wegovy, and breakthrough weight loss medications that are transforming lives.",
    cardTag: "Trending 2025"
  },
  {
    id: 2,
    slug: "intermittent-fasting-weight-loss-2025",
    title: "Intermittent Fasting for Weight Loss 2025: Ultimate Guide",
    excerpt: "Master intermittent fasting for weight loss in 2025. Learn the best fasting protocols, meal timing strategies, and how to maximize fat burning results.",
    author: "Gooofit Research Team",
    date: "2025-01-10",
    readTime: "15 min read",
    category: "Intermittent Fasting",
    image: blogImg2,
    tags: ["intermittent fasting", "fasting weight loss", "16/8 fasting", "meal timing", "fat burning", "2025"],
    seoDescription: "Ultimate guide to intermittent fasting for weight loss in 2025. Learn the best fasting protocols and meal timing strategies for maximum results.",
    cardTag: "Hot 2025"
  },
  {
    id: 3,
    slug: "high-protein-diet-weight-loss-2025",
    title: "High Protein Diet for Weight Loss 2025: Science-Backed Strategies",
    excerpt: "Discover how high protein diets accelerate weight loss in 2025. Learn optimal protein intake, meal planning, and the science behind protein's fat-burning power.",
    author: "Gooofit Research Team",
    date: "2025-01-08",
    readTime: "14 min read",
    category: "High Protein Diet",
    image: blogImg3,
    tags: ["high protein diet", "protein weight loss", "meal planning", "fat burning", "muscle building", "2025"],
    seoDescription: "Science-backed guide to high protein diets for weight loss in 2025. Learn optimal protein intake and meal planning strategies.",
    cardTag: "Popular 2025"
  },
  {
    id: 4,
    slug: "ai-weight-loss-coach-2025",
    title: "AI Weight Loss Coach 2025: How Artificial Intelligence is Revolutionizing Weight Management",
    excerpt: "Explore how AI weight loss coaches are transforming weight management in 2025. Discover personalized plans, real-time tracking, and intelligent insights.",
    author: "Gooofit Research Team",
    date: "2025-01-05",
    readTime: "11 min read",
    category: "AI & Technology",
    image: blogImg4,
    tags: ["AI weight loss coach", "artificial intelligence", "smart weight loss apps", "personalized plans", "2025 technology"],
    seoDescription: "Discover how AI weight loss coaches are revolutionizing weight management in 2025. Learn about personalized plans and intelligent tracking.",
    cardTag: "Innovation 2025"
  },
  {
    id: 5,
    slug: "body-composition-tracking-weight-loss-2025",
    title: "Body Composition Tracking for Weight Loss 2025: Beyond the Scale",
    excerpt: "Learn why body composition tracking is crucial for weight loss success in 2025. Discover advanced methods to measure fat, muscle, and overall progress.",
    author: "Gooofit Research Team",
    date: "2025-01-03",
    readTime: "13 min read",
    category: "Body Composition",
    image: blogImg5,
    tags: ["body composition tracking", "fat percentage", "muscle mass", "weight loss progress", "2025 fitness"],
    seoDescription: "Essential guide to body composition tracking for weight loss in 2025. Learn advanced methods to measure fat, muscle, and progress beyond the scale.",
    cardTag: "Essential 2025"
  },
  {
    id: 6,
    slug: "metabolic-flexibility-training-weight-loss-2025",
    title: "Metabolic Flexibility Training for Weight Loss 2025: Train Your Body to Burn Fat",
    excerpt: "Master metabolic flexibility training to accelerate weight loss in 2025. Learn how to train your body to efficiently switch between fuel sources.",
    author: "Gooofit Research Team",
    date: "2025-01-01",
    readTime: "16 min read",
    category: "Metabolic Training",
    image: blogImg6,
    tags: ["metabolic flexibility training", "fat burning", "energy metabolism", "weight loss", "2025 fitness"],
    seoDescription: "Master metabolic flexibility training for weight loss in 2025. Learn how to train your body to efficiently burn fat and switch fuel sources.",
    cardTag: "Advanced 2025"
  },
  {
    id: 7,
    slug: "personalized-weight-loss-plan-2025",
    title: "Personalized Weight Loss Plan 2025: Custom Strategies for Your Body",
    excerpt: "Create your personalized weight loss plan for 2025. Learn how to customize diet, exercise, and lifestyle strategies based on your unique needs.",
    author: "Gooofit Research Team",
    date: "2024-12-28",
    readTime: "18 min read",
    category: "Personalized Plans",
    image: blogImg7,
    tags: ["personalized weight loss plan", "custom diet", "individual strategies", "weight loss", "2025"],
    seoDescription: "Create your personalized weight loss plan for 2025. Learn how to customize diet, exercise, and lifestyle strategies for optimal results.",
    cardTag: "Custom 2025"
  },
  {
    id: 8,
    slug: "mindful-eating-weight-loss-2025",
    title: "Mindful Eating for Weight Loss 2025: Transform Your Relationship with Food",
    excerpt: "Master mindful eating techniques for sustainable weight loss in 2025. Learn how to develop a healthy relationship with food and overcome emotional eating.",
    author: "Gooofit Research Team",
    date: "2024-12-25",
    readTime: "12 min read",
    category: "Mindful Eating",
    image: blogImg8,
    tags: ["mindful eating", "emotional eating", "food relationship", "weight loss", "2025 wellness"],
    seoDescription: "Master mindful eating for sustainable weight loss in 2025. Learn techniques to develop a healthy relationship with food and overcome emotional eating.",
    cardTag: "Wellness 2025"
  },
  {
    id: 9,
    slug: "rapid-weight-loss-diet-plan-2025",
    title: "Rapid Weight Loss Diet Plan 2025: Safe and Effective Strategies",
    excerpt: "Discover safe and effective rapid weight loss diet plans for 2025. Learn how to achieve quick results while maintaining health and sustainability.",
    author: "Gooofit Research Team",
    date: "2024-12-22",
    readTime: "14 min read",
    category: "Rapid Weight Loss",
    image: blogImg9,
    tags: ["rapid weight loss diet plan", "quick results", "safe weight loss", "diet strategies", "2025"],
    seoDescription: "Safe and effective rapid weight loss diet plans for 2025. Learn how to achieve quick results while maintaining health and sustainability.",
    cardTag: "Fast Results 2025"
  },
  {
    id: 10,
    slug: "holistic-weight-management-2025",
    title: "Holistic Weight Management 2025: Complete Mind-Body Approach",
    excerpt: "Embrace holistic weight management for 2025. Learn how to integrate physical, mental, and emotional wellness for sustainable weight loss success.",
    author: "Gooofit Research Team",
    date: "2024-12-20",
    readTime: "15 min read",
    category: "Holistic Health",
    image: blogImg10,
    tags: ["holistic weight management", "mind-body wellness", "sustainable weight loss", "2025 health"],
    seoDescription: "Embrace holistic weight management for 2025. Learn how to integrate physical, mental, and emotional wellness for sustainable success.",
    cardTag: "Complete 2025"
  },
  {
    id: 11,
    slug: "5-essential-metrics-successful-weight-loss",
    title: "5 Essential Metrics for Successful Weight Loss",
    excerpt: "Discover the key metrics that matter most for achieving sustainable weight loss and maintaining your progress long-term.",
    author: "Gooofit Research Team",
    date: "2024-08-10",
    readTime: "6 min read",
    category: "Weight Loss Tips",
    image: blogImg11,
    tags: ["weight loss", "metrics", "tracking", "progress", "goals", "success"],
    seoDescription: "Learn the 5 essential metrics for successful weight loss. Track the right data to achieve sustainable results and maintain your progress.",
    cardTag: "New"
  },
  {
    id: 12,
    slug: "science-weight-loss-metabolism",
    title: "The Science of Weight Loss: Understanding Your Body's Metabolism",
    excerpt: "Discover how your metabolism works and learn evidence-based strategies to optimize it for sustainable weight loss in 2025.",
    author: "Gooofit Research Team",
    date: "2024-01-15",
    readTime: "8 min read",
    category: "Science & Research",
    image: blogImg12,
    tags: ["metabolism", "weight loss", "BMR", "exercise", "nutrition", "2025 science"],
    seoDescription: "Learn the science behind metabolism and weight loss in 2025. Discover how to optimize your body's energy systems for sustainable weight management results.",
    cardTag: "Most Viewed"
  },
  {
    id: 13,
    slug: "nutrition-fundamentals-sustainable-weight-loss",
    title: "Nutrition Fundamentals for Sustainable Weight Loss 2025",
    excerpt: "Master the basics of nutrition to create a sustainable eating plan that supports your weight loss goals in 2025.",
    author: "Gooofit Research Team",
    date: "2024-01-20",
    readTime: "10 min read",
    category: "Nutrition",
    image: blogImg13,
    tags: ["nutrition", "macronutrients", "weight loss", "healthy eating", "meal planning", "2025"],
    seoDescription: "Master the fundamentals of nutrition for sustainable weight loss in 2025. Learn about macronutrients, meal timing, and optimal food choices.",
    cardTag: "Popular"
  },
  {
    id: 14,
    slug: "exercise-strategies-maximum-fat-burning",
    title: "Exercise Strategies for Maximum Fat Burning 2025",
    excerpt: "Discover the most effective exercise techniques to maximize fat burning and accelerate your weight loss journey in 2025.",
    author: "Gooofit Research Team",
    date: "2024-01-25",
    readTime: "12 min read",
    category: "Fitness & Exercise",
    image: blogImg14,
    tags: ["exercise", "workout", "HIIT", "strength training", "fat burning", "fitness", "2025"],
    seoDescription: "Discover the most effective exercise strategies for maximum fat burning in 2025. Learn about HIIT, strength training, and optimal workout planning.",
    cardTag: "Featured"
  },
  {
    id: 15,
    slug: "mindset-motivation-psychology-weight-loss",
    title: "Mindset and Motivation: The Psychology of Weight Loss 2025",
    excerpt: "Learn how to develop the right mindset and maintain motivation throughout your weight loss journey in 2025.",
    author: "Gooofit Research Team",
    date: "2024-02-01",
    readTime: "7 min read",
    category: "Mindset & Motivation",
    image: blogImg15,
    tags: ["motivation", "mindset", "psychology", "weight loss", "goals", "2025"],
    seoDescription: "Develop the right mindset for successful weight loss in 2025. Learn psychological strategies to maintain motivation and overcome mental barriers."
  },
  {
    id: 16,
    slug: "sleep-weight-loss-hidden-connection",
    title: "Sleep and Weight Loss 2025: The Hidden Connection",
    excerpt: "Discover how sleep quality and duration significantly impact your weight loss efforts and overall health in 2025.",
    author: "Gooofit Research Team",
    date: "2024-02-05",
    readTime: "6 min read",
    category: "Health & Wellness",
    image: blogImg16,
    tags: ["sleep", "weight loss", "hormones", "health", "wellness", "2025"],
    seoDescription: "Learn how sleep affects weight loss in 2025 and discover strategies to optimize your sleep for better health and weight management.",
    cardTag: "New"
  },
  {
    id: 17,
    slug: "plateau-breaking-advanced-strategies-weight-loss",
    title: "Plateau Breaking: Advanced Strategies for Continued Weight Loss 2025",
    excerpt: "When progress stalls, these advanced techniques can help you break through plateaus and continue your weight loss journey in 2025.",
    author: "Gooofit Research Team",
    date: "2024-02-10",
    readTime: "9 min read",
    category: "Advanced Strategies",
    image: blogImg17,
    tags: ["plateau", "weight loss", "advanced strategies", "progress", "motivation", "2025"],
    seoDescription: "Break through weight loss plateaus with advanced strategies in 2025. Learn techniques to restart progress and continue your weight loss journey."
  },
  {
    id: 18,
    slug: "metabolism-weight-loss-science-explained",
    title: "The Science of Weight Loss: Understanding Your Body's Metabolism 2025",
    excerpt: "Discover how your metabolism works and learn evidence-based strategies to optimize it for sustainable weight loss in 2025.",
    author: "Gooofit Research Team",
    date: "2024-02-15",
    readTime: "8 min read",
    category: "Science & Research",
    image: blogImg18,
    tags: ["metabolism", "weight loss", "BMR", "exercise", "nutrition", "2025"],
    seoDescription: "Learn the science behind metabolism and weight loss in 2025. Discover how to optimize your body's energy systems for sustainable weight management results."
  },
  {
    id: 19,
    slug: "nutrition-basics-weight-loss-guide",
    title: "Nutrition Fundamentals for Sustainable Weight Loss 2025",
    excerpt: "Master the basics of nutrition to create a sustainable eating plan that supports your weight loss goals in 2025.",
    author: "Gooofit Research Team",
    date: "2024-02-20",
    readTime: "10 min read",
    category: "Nutrition",
    image: blogImg19,
    tags: ["nutrition", "macronutrients", "weight loss", "healthy eating", "meal planning", "2025"],
    seoDescription: "Master the fundamentals of nutrition for sustainable weight loss in 2025. Learn about macronutrients, meal timing, and optimal food choices."
  },
  {
    id: 20,
    slug: "sunlight-wellness-vitamin-d-mental-health",
    title: "Sunlight for Wellness: Vitamin D & Mental Health",
    excerpt: "Discover the crucial connection between vitamin D, sunlight exposure, and your mental health during weight loss.",
    author: "Gooofit Research Team",
    date: "2024-02-25",
    readTime: "7 min read",
    category: "Health & Wellness",
    image: blogImg20,
    tags: ["vitamin d", "sunlight", "mental health", "wellness", "weight loss"],
    seoDescription: "Learn about the connection between vitamin D, sunlight exposure, and mental health during your weight loss journey.",
    cardTag: "Trending"
  },
  {
    id: 21,
    slug: "intermittent-fasting-weight-loss-complete-guide",
    title: "Intermittent Fasting: A Complete Guide to Weight Loss Success",
    excerpt: "Master the art of intermittent fasting with proven strategies for sustainable weight loss and improved health.",
    author: "Gooofit Research Team",
    date: "2024-03-01",
    readTime: "11 min read",
    category: "Fasting & Nutrition",
    image: blogImg21,
    tags: ["intermittent fasting", "weight loss", "nutrition", "health", "metabolism"],
    seoDescription: "Master intermittent fasting for weight loss success. Learn proven strategies, methods, and tips for sustainable results.",
    cardTag: "Popular"
  },
  {
    id: 22,
    slug: "stress-management-weight-loss-connection",
    title: "Stress Management: The Missing Link in Your Weight Loss Journey",
    excerpt: "Discover how stress affects your weight loss efforts and learn effective strategies to manage it for better results.",
    author: "Gooofit Research Team",
    date: "2024-03-05",
    readTime: "9 min read",
    category: "Mental Health & Wellness",
    image: blogImg22,
    tags: ["stress management", "weight loss", "mental health", "cortisol", "wellness"],
    seoDescription: "Learn how stress affects weight loss and discover effective stress management techniques for better weight loss results."
  },
  {
    id: 23,
    slug: "gut-health-weight-loss-microbiome",
    title: "Gut Health and Weight Loss: The Microbiome Connection",
    excerpt: "Explore the fascinating connection between your gut microbiome and weight loss success.",
    author: "Gooofit Research Team",
    date: "2024-03-10",
    readTime: "10 min read",
    category: "Gut Health & Nutrition",
    image: blogImg12,
    tags: ["gut health", "microbiome", "weight loss", "probiotics", "nutrition"],
    seoDescription: "Discover the connection between gut health and weight loss. Learn how to optimize your microbiome for better weight management."
  },
  {
    id: 24,
    slug: "exercise-daily-boost-body-mind-happiness",
    title: "Exercise Daily: Boost Body & Mind for Happiness",
    excerpt: "Discover how daily exercise transforms not just your body, but your mental well-being and overall happiness.",
    author: "Gooofit Research Team",
    date: "2024-03-15",
    readTime: "8 min read",
    category: "Fitness & Wellness",
    image: blogImg13,
    tags: ["exercise", "daily fitness", "mental health", "happiness", "wellness"]
  },
  {
    id: 25,
    slug: "mindful-eating-fuel-body-lift-mood",
    title: "Mindful Eating: Fuel Your Body, Lift Your Mood",
    excerpt: "Transform your relationship with food through mindful eating practices that nourish both body and soul.",
    author: "Gooofit Research Team",
    date: "2024-03-20",
    readTime: "7 min read",
    category: "Mindful Living",
    image: blogImg14,
    tags: ["mindful eating", "nutrition", "mental health", "mood", "wellness"]
  },
  {
    id: 26,
    slug: "mental-health-matters-stress-less-live-more",
    title: "Mental Health Matters: Stress Less, Live More",
    excerpt: "Prioritize your mental health with proven strategies to reduce stress and enhance your quality of life.",
    author: "Gooofit Research Team",
    date: "2024-03-25",
    readTime: "9 min read",
    category: "Mental Health",
    image: blogImg15,
    tags: ["mental health", "stress reduction", "wellness", "life quality", "self-care"]
  },
  {
    id: 27,
    slug: "sleep-success-rest-enhance-well-being",
    title: "Sleep for Success: Rest to Enhance Well-Being",
    excerpt: "Discover how quality sleep is the foundation for weight loss success and overall health improvement.",
    author: "Gooofit Research Team",
    date: "2024-03-30",
    readTime: "8 min read",
    category: "Sleep & Wellness",
    image: blogImg16,
    tags: ["sleep", "well-being", "weight loss", "health", "recovery"]
  },
  {
    id: 28,
    slug: "sunlight-benefits-brighten-mood-build-health",
    title: "Sunlight Benefits: Brighten Mood & Build Health",
    excerpt: "Harness the power of natural sunlight to boost your mood, energy levels, and overall health.",
    author: "Gooofit Research Team",
    date: "2024-04-05",
    readTime: "7 min read",
    category: "Natural Health",
    image: blogImg17,
    tags: ["sunlight", "vitamin d", "mood", "health", "natural wellness"]
  },
  {
    id: 29,
    slug: "cut-screentime-sharpen-focus-reduce-anxiety",
    title: "Cut Screentime: Sharpen Focus, Reduce Anxiety",
    excerpt: "Learn how reducing screen time can dramatically improve your focus, reduce anxiety, and support your weight loss goals.",
    author: "Gooofit Research Team",
    date: "2024-04-10",
    readTime: "9 min read",
    category: "Digital Wellness",
    image: blogImg18,
    tags: ["screen time", "focus", "anxiety", "digital wellness", "mental health"]
  },
  {
    id: 30,
    slug: "fitness-joy-move-body-feel-alive",
    title: "Fitness for Joy: Move Your Body, Feel Alive",
    excerpt: "Discover how movement and fitness can bring joy, energy, and vitality to your life beyond just weight loss.",
    author: "Gooofit Research Team",
    date: "2024-04-15",
    readTime: "8 min read",
    category: "Fitness & Joy",
    image: blogImg19,
    tags: ["fitness", "joy", "movement", "energy", "vitality", "wellness"],
    cardTag: "Trending"
  },
  {
    id: 31,
    slug: "healthy-diet-hacks-nourish-body-spark-happiness",
    title: "Healthy Diet Hacks: Nourish Body, Spark Happiness",
    excerpt: "Learn simple and effective diet hacks that nourish your body while boosting your mood and happiness levels.",
    author: "Gooofit Research Team",
    date: "2024-04-20",
    readTime: "10 min read",
    category: "Nutrition & Happiness",
    image: blogImg20,
    tags: ["healthy diet", "nutrition hacks", "happiness", "mood", "wellness"]
  },
  {
    id: 32,
    slug: "meditate-peace-calm-mind-stronger-health",
    title: "Meditate for Peace: Calm Mind, Stronger Health",
    excerpt: "Explore the transformative power of meditation for mental peace, stress reduction, and enhanced overall health.",
    author: "Gooofit Research Team",
    date: "2024-04-25",
    readTime: "9 min read",
    category: "Meditation & Wellness",
    image: blogImg21,
    tags: ["meditation", "peace", "mental health", "stress reduction", "wellness"],
    cardTag: "New"
  },
  {
    id: 33,
    slug: "healthy-eating-happier-stronger-you",
    title: "Healthy Eating for a Happier, Stronger You",
    excerpt: "Discover how nutritious eating habits can transform your mood, energy levels, and overall strength.",
    author: "Gooofit Research Team",
    date: "2024-05-25",
    readTime: "8 min read",
    category: "Nutrition & Wellness",
    image: blogImg22,
    tags: ["healthy eating", "nutrition", "mood", "energy", "strength", "wellness"],
    cardTag: "Popular"
  },
  {
    id: 55,
    slug: "glycemic-index-glycemic-load-weight-loss-guide-2025",
    title: "Glycemic Index & Glycemic Load 2025: How Carbs Affect Blood Sugar & Weight Loss",
    excerpt: "What are glycemic index and glycemic load? Learn what GI and GL are, when to care about them, and how to use them to control cravings and support weight loss.",
    author: "GoooFit Research Team",
    date: "2025-03-15",
    readTime: "9 min read",
    category: "Nutrition",
    image: blogImg21,
    tags: ["glycemic index", "glycemic load", "GI", "GL", "carbs", "blood sugar", "diabetes risk", "weight loss"],
    seoDescription: "Glycemic index & glycemic load explained: learn how carb choices affect blood sugar, cravings, and weight loss in 2025.",
    cardTag: "SEO Guide"
  },
  {
    id: 56,
    slug: "habit-stacking-weight-loss-behavior-change-2025",
    title: "Habit Stacking for Weight Loss 2025: Tiny Daily Actions That Compound Into Big Results",
    excerpt: "Discover how habit stacking turns small daily actions into automatic routines that make weight loss feel easier and more consistent.",
    author: "GoooFit Research Team",
    date: "2025-03-20",
    readTime: "9 min read",
    category: "Mindset & Habits",
    image: blogImg22,
    tags: ["habit stacking", "habits", "behavior change", "weight loss habits", "consistency", "routine"],
    seoDescription: "Habit stacking for weight loss: learn how to attach new healthy behaviours to existing routines so results compound over time.",
    cardTag: "SEO Guide"
  },
  {
    id: 57,
    slug: "refeed-days-diet-breaks-weight-loss-2025",
    title: "Refeed Days & Diet Breaks 2025: When to Eat More Calories Without Losing Progress",
    excerpt: "Understand what refeed days and diet breaks are, when to use them, and how they can make long-term weight loss more sustainable.",
    author: "GoooFit Research Team",
    date: "2025-03-25",
    readTime: "9 min read",
    category: "Advanced Strategies",
    image: blogImg22,
    tags: ["refeed day", "diet break", "calorie cycling", "plateau", "weight loss", "metabolism"],
    seoDescription: "Guide to refeed days and diet breaks: structured higher-calorie periods that support adherence and performance during long diets.",
    cardTag: "SEO Guide"
  },
  {
    id: 23,
    slug: "bmi-body-mass-index-complete-guide-2025",
    title: "BMI (Body Mass Index) Complete Guide 2025: Definition, Chart & Calculator",
    excerpt: "What is BMI? Learn the definition of Body Mass Index, when to use it, how to calculate BMI, and why it matters for weight loss and health. Includes BMI chart and categories.",
    author: "GoooFit Research Team",
    date: "2025-02-01",
    readTime: "8 min read",
    category: "Weight Loss Basics",
    image: blogImg12,
    tags: ["BMI", "body mass index", "BMI calculator", "BMI chart", "healthy weight", "weight loss", "obesity", "BMI formula"],
    seoDescription: "Complete guide to BMI (Body Mass Index): definition, formula, BMI chart, when and how to use it, and why BMI matters for weight loss and health in 2025.",
    cardTag: "SEO Guide"
  },
  {
    id: 24,
    slug: "bmr-basal-metabolic-rate-explained-2025",
    title: "BMR (Basal Metabolic Rate) Explained 2025: What It Is, How to Calculate & Why It Matters",
    excerpt: "What is BMR? Learn the definition of Basal Metabolic Rate, when to use it, how to calculate BMR with the formula, and why BMR matters for weight loss and calorie needs.",
    author: "GoooFit Research Team",
    date: "2025-02-05",
    readTime: "9 min read",
    category: "Metabolism & Calories",
    image: blogImg13,
    tags: ["BMR", "basal metabolic rate", "BMR calculator", "metabolism", "calories at rest", "weight loss", "TDEE", "calorie deficit"],
    seoDescription: "Complete guide to BMR (Basal Metabolic Rate): definition, formula, how to calculate BMR, when to use it, and why BMR matters for weight loss in 2025.",
    cardTag: "SEO Guide"
  },
  {
    id: 25,
    slug: "calorie-deficit-weight-loss-science-2025",
    title: "Calorie Deficit for Weight Loss 2025: Definition, How to Create One & Why It Works",
    excerpt: "What is a calorie deficit? Learn the definition, when and how to create a safe calorie deficit for weight loss, and why it is the science behind losing fat. Includes calculator and chart.",
    author: "GoooFit Research Team",
    date: "2025-02-10",
    readTime: "9 min read",
    category: "Weight Loss Science",
    image: blogImg14,
    tags: ["calorie deficit", "weight loss", "calories", "fat loss", "diet", "TDEE", "calorie calculator", "sustainable weight loss"],
    seoDescription: "Complete guide to calorie deficit: definition, how to create a safe deficit, when to use it, and why it is the science behind weight loss in 2025.",
    cardTag: "SEO Guide"
  },
  {
    id: 26,
    slug: "tdee-total-daily-energy-expenditure-guide-2025",
    title: "TDEE (Total Daily Energy Expenditure) Guide 2025: Definition, Calculator & How to Use",
    excerpt: "What is TDEE? Learn the definition of Total Daily Energy Expenditure, how to calculate TDEE from BMR, when to use it, and why TDEE matters for weight loss and calorie targets.",
    author: "GoooFit Research Team",
    date: "2025-02-15",
    readTime: "8 min read",
    category: "Metabolism & Calories",
    image: blogImg15,
    tags: ["TDEE", "total daily energy expenditure", "TDEE calculator", "calories per day", "weight loss", "BMR", "maintenance calories"],
    seoDescription: "Complete guide to TDEE: definition, how to calculate Total Daily Energy Expenditure from BMR, activity levels, and why TDEE matters for weight loss in 2025.",
    cardTag: "SEO Guide"
  },
  {
    id: 27,
    slug: "body-fat-percentage-weight-loss-guide-2025",
    title: "Body Fat Percentage Guide 2025: Definition, How to Measure & Why It Matters",
    excerpt: "What is body fat percentage? Learn the definition, healthy ranges, how to measure body fat, when to track it, and why body fat % matters more than scale weight for health.",
    author: "GoooFit Research Team",
    date: "2025-02-20",
    readTime: "9 min read",
    category: "Body Composition",
    image: blogImg16,
    tags: ["body fat percentage", "body fat", "body composition", "how to measure body fat", "healthy body fat", "weight loss", "fat loss"],
    seoDescription: "Complete guide to body fat percentage: definition, healthy ranges, how to measure body fat, when to track it, and why it matters for weight loss in 2025.",
    cardTag: "SEO Guide"
  },
  {
    id: 28,
    slug: "protein-for-weight-loss-complete-guide-2025",
    title: "Protein for Weight Loss 2025: How Much, When to Eat & Why It Works",
    excerpt: "How much protein for weight loss? Learn the definition of protein needs, what protein does for fat loss, when to eat it, how to hit your target, and why protein is key to losing fat and keeping muscle.",
    author: "GoooFit Research Team",
    date: "2025-02-25",
    readTime: "9 min read",
    category: "Nutrition",
    image: blogImg17,
    tags: ["protein for weight loss", "how much protein", "protein intake", "high protein diet", "muscle preservation", "weight loss", "protein calculator"],
    seoDescription: "Complete guide to protein for weight loss: how much protein per day, when to eat it, best sources, and why protein helps you lose fat and keep muscle in 2025.",
    cardTag: "SEO Guide"
  },
  {
    id: 29,
    slug: "waist-to-hip-ratio-weight-loss-health-2025",
    title: "Waist-to-Hip Ratio (WHR) Guide 2025: Definition, How to Measure & Health Risk",
    excerpt: "What is waist-to-hip ratio? Learn the definition, how to measure WHR, healthy ranges for men and women, when to use it, and why WHR matters for weight loss and heart health.",
    author: "GoooFit Research Team",
    date: "2025-03-01",
    readTime: "7 min read",
    category: "Body Composition",
    image: blogImg18,
    tags: ["waist to hip ratio", "WHR", "waist hip ratio", "body fat distribution", "health risk", "weight loss", "belly fat"],
    seoDescription: "Complete guide to waist-to-hip ratio: definition, how to measure WHR, healthy ranges, and why WHR matters for weight loss and cardiovascular risk in 2025.",
    cardTag: "SEO Guide"
  },
  {
    id: 30,
    slug: "macronutrients-macros-weight-loss-guide-2025",
    title: "Macronutrients (Macros) for Weight Loss 2025: Carbs, Protein, Fat Explained",
    excerpt: "What are macros? Learn the definition of macronutrients, how to split carbs protein and fat for weight loss, when to track macros, and why macro balance matters for fat loss.",
    author: "GoooFit Research Team",
    date: "2025-03-05",
    readTime: "9 min read",
    category: "Nutrition",
    image: blogImg19,
    tags: ["macronutrients", "macros", "carbs protein fat", "macro split", "weight loss", "flexible dieting", "macro calculator"],
    seoDescription: "Complete guide to macronutrients for weight loss: definition of macros, how to split carbs protein and fat, and why macro balance matters in 2025.",
    cardTag: "SEO Guide"
  },
  {
    id: 31,
    slug: "sleep-and-weight-loss-complete-guide-2025",
    title: "Sleep and Weight Loss 2025: How Sleep Affects Fat Loss & What to Do",
    excerpt: "How does sleep affect weight loss? Learn the connection between sleep and weight, why poor sleep makes you gain fat, when to prioritise sleep, and how to improve sleep for better results.",
    author: "GoooFit Research Team",
    date: "2025-03-10",
    readTime: "8 min read",
    category: "Health & Wellness",
    image: blogImg20,
    tags: ["sleep and weight loss", "sleep deprivation", "weight gain", "hormones", "metabolism", "fat loss", "sleep hygiene"],
    seoDescription: "Complete guide to sleep and weight loss: how sleep affects hormones and fat storage, and how to improve sleep for better weight loss in 2025.",
    cardTag: "SEO Guide"
  }
];

export { blogPosts as blogListingPosts };

const Blog = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 6; // Show 6 posts per page

  // Show fully written articles first, then "coming soon" posts
  const sortedPosts = useMemo(
    () =>
      [...blogPosts].sort((a, b) => {
        const aFull = FULL_CONTENT_SLUGS.has(a.slug);
        const bFull = FULL_CONTENT_SLUGS.has(b.slug);
        if (aFull && !bFull) return -1;
        if (!aFull && bFull) return 1;
        return 0;
      }),
    []
  );

  // Calculate pagination
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = sortedPosts.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(sortedPosts.length / postsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Function to get tag color based on tag type
  const getTagColor = (tag) => {
    switch (tag) {
      case 'Most Viewed':
        return 'bg-red-500';
      case 'New':
        return 'bg-green-500';
      case 'Popular':
        return 'bg-blue-500';
      case 'Featured':
        return 'bg-purple-500';
      case 'Trending':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <>
      <SEO
        title="Weight Loss Blog - Expert Tips, Strategies & Science-Backed Advice | GoooFit"
        description="Discover expert weight loss insights, proven strategies, and science-backed tips for your journey. Learn about intermittent fasting, high protein diets, AI coaching, and more."
        canonical="https://gooofit.com/blog"
        keywords="weight loss blog, weight loss tips, intermittent fasting, high protein diet, AI weight loss coach, body composition tracking, sustainable weight loss, weight loss strategies, fitness blog, health blog"
        schemaData={{
          "@context": "https://schema.org",
          "@type": "Blog",
          "name": "GoooFit Weight Loss Blog",
          "description": "Expert insights and proven strategies for weight loss success",
          "url": "https://gooofit.com/blog",
          "publisher": {
            "@type": "Organization",
            "name": "GoooFit",
            "logo": {
              "@type": "ImageObject",
              "url": "https://gooofit.com/logo.png"
            }
          },
          "blogPost": blogPosts.map(post => ({
            "@type": "BlogPosting",
            "headline": post.title,
            "description": post.excerpt,
            "author": {
              "@type": "Organization",
              "name": post.author
            },
            "datePublished": post.date,
            "dateModified": post.date,
            "image": post.image,
            "url": `https://gooofit.com/blog/${post.slug}`
          }))
        }}
      />
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-purple-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-bold mb-6"
          >
            Weight Loss Blog
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl md:text-2xl mb-8"
          >
            Expert insights, proven strategies, and science-backed tips for your weight loss journey
          </motion.p>
        </div>
      </div>

      {/* Blog Posts Grid */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {currentPosts.map((post, index) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              <Link to={`/blog/${post.slug}`} className="block">
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={post.image} 
                    alt={post.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      console.error(`Failed to load image for post: ${post.title}`);
                      // Hide the image if it fails to load
                      e.target.style.display = 'none';
                    }}
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      {post.category}
                    </span>
                  </div>
                  {/* Card Tag */}
                  {post.cardTag && (
                    <div className="absolute top-4 right-4">
                      <span className={`${getTagColor(post.cardTag)} text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg`}>
                        {post.cardTag}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 hover:text-orange-600 transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        <span>{post.author}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{post.readTime}</span>
                      </div>
                    </div>
                    <span className="text-orange-600 font-medium">
                      {new Date(post.date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </span>
                  </div>
                </div>
              </Link>
            </motion.article>
          ))}
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-8 mt-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Your Weight Loss Journey?</h2>
          <p className="text-xl mb-8 text-orange-100">
            Join thousands of users who have transformed their lives with GoooFit
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/onboarding"
              className="bg-white text-orange-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200 shadow-lg"
            >
              Start Your Journey
            </Link>
            <Link
              to="/dashboard"
              className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-orange-600 transition-colors duration-200"
            >
              Try Demo
            </Link>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center mt-12 space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  currentPage === page
                    ? 'bg-orange-500 text-white'
                    : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* SEO Footer */}
      <div className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Weight Loss Resources</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-orange-400 transition-colors">Weight Loss Tips</a></li>
                <li><a href="#" className="hover:text-orange-400 transition-colors">Nutrition Guide</a></li>
                <li><a href="#" className="hover:text-orange-400 transition-colors">Exercise Plans</a></li>
                <li><a href="#" className="hover:text-orange-400 transition-colors">Motivation Strategies</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Popular Topics</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-orange-400 transition-colors">Metabolism</a></li>
                <li><a href="#" className="hover:text-orange-400 transition-colors">Intermittent Fasting</a></li>
                <li><a href="#" className="hover:text-orange-400 transition-colors">Gut Health</a></li>
                <li><a href="#" className="hover:text-orange-400 transition-colors">Stress Management</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Expert Insights</h3>
              <p className="text-gray-300 mb-4">
                Get the latest weight loss research, expert advice, and proven strategies to help you achieve your health goals.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-orange-400 hover:text-orange-300 transition-colors">Subscribe</a>
                <a href="#" className="text-orange-400 hover:text-orange-300 transition-colors">Contact</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default Blog; 