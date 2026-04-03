import 'dotenv/config';
import { v2 as cloudinary } from 'cloudinary';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import Product from './models/Product.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ASSETS_DIR = path.join(__dirname, '../client/src/assets');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Connect to MongoDB
await mongoose.connect(process.env.MONGODB_URI, { dbName: 'greencart' });
console.log('✅ MongoDB Connected to greencart');

// Helper: upload a local image to Cloudinary with retry logic
async function uploadImage(filename, retries = 3) {
  const filePath = path.join(ASSETS_DIR, filename);
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const result = await cloudinary.uploader.upload(filePath, {
        folder: 'grocery_products',
        timeout: 120000, // 2 minute timeout
      });
      console.log(`  ↑ Uploaded ${filename} → ${result.secure_url}`);
      return result.secure_url;
    } catch (err) {
      if (attempt < retries) {
        console.log(`  ⚠️  Attempt ${attempt} failed for ${filename}, retrying in ${attempt * 2}s...`);
        await new Promise(r => setTimeout(r, attempt * 2000));
      } else {
        throw err;
      }
    }
  }
}

// Product definitions (images as local filenames)
const productData = [
  // Vegetables
  {
    name: 'Potato 500g',
    category: 'Vegetables',
    price: 25,
    offerPrice: 20,
    images: ['potato_image_1.png', 'potato_image_2.png', 'potato_image_3.png', 'potato_image_4.png'],
    description: ['Fresh and organic', 'Rich in carbohydrates', 'Ideal for curries and fries'],
    inStock: true,
  },
  {
    name: 'Tomato 1 kg',
    category: 'Vegetables',
    price: 40,
    offerPrice: 35,
    images: ['tomato_image.png'],
    description: ['Juicy and ripe', 'Rich in Vitamin C', 'Perfect for salads and sauces', 'Farm fresh quality'],
    inStock: true,
  },
  {
    name: 'Carrot 500g',
    category: 'Vegetables',
    price: 30,
    offerPrice: 28,
    images: ['carrot_image.png'],
    description: ['Sweet and crunchy', 'Good for eyesight', 'Ideal for juices and salads'],
    inStock: true,
  },
  {
    name: 'Spinach 500g',
    category: 'Vegetables',
    price: 18,
    offerPrice: 15,
    images: ['spinach_image_1.png'],
    description: ['Rich in iron', 'High in vitamins', 'Perfect for soups and salads'],
    inStock: true,
  },
  {
    name: 'Onion 500g',
    category: 'Vegetables',
    price: 22,
    offerPrice: 19,
    images: ['onion_image_1.png'],
    description: ['Fresh and pungent', 'Perfect for cooking', 'A kitchen staple'],
    inStock: true,
  },

  // Fruits
  {
    name: 'Apple 1 kg',
    category: 'Fruits',
    price: 120,
    offerPrice: 110,
    images: ['apple_image.png'],
    description: ['Crisp and juicy', 'Rich in fiber', 'Boosts immunity', 'Perfect for snacking and desserts', 'Organic and farm fresh'],
    inStock: true,
  },
  {
    name: 'Orange 1 kg',
    category: 'Fruits',
    price: 80,
    offerPrice: 75,
    images: ['orange_image.png'],
    description: ['Juicy and sweet', 'Rich in Vitamin C', 'Perfect for juices and salads'],
    inStock: true,
  },
  {
    name: 'Banana 1 kg',
    category: 'Fruits',
    price: 50,
    offerPrice: 45,
    images: ['banana_image_1.png'],
    description: ['Sweet and ripe', 'High in potassium', 'Great for smoothies and snacking'],
    inStock: true,
  },
  {
    name: 'Mango 1 kg',
    category: 'Fruits',
    price: 150,
    offerPrice: 140,
    images: ['mango_image_1.png'],
    description: ['Sweet and flavorful', 'Perfect for smoothies and desserts', 'Rich in Vitamin A'],
    inStock: true,
  },
  {
    name: 'Grapes 500g',
    category: 'Fruits',
    price: 70,
    offerPrice: 65,
    images: ['grapes_image_1.png'],
    description: ['Fresh and juicy', 'Rich in antioxidants', 'Perfect for snacking and fruit salads'],
    inStock: true,
  },

  // Dairy
  {
    name: 'Amul Milk 1L',
    category: 'Dairy',
    price: 60,
    offerPrice: 55,
    images: ['amul_milk_image.png'],
    description: ['Pure and fresh', 'Rich in calcium', 'Ideal for tea, coffee, and desserts', 'Trusted brand quality'],
    inStock: true,
  },
  {
    name: 'Paneer 200g',
    category: 'Dairy',
    price: 90,
    offerPrice: 85,
    images: ['paneer_image.png', 'paneer_image_2.png'],
    description: ['Soft and fresh', 'Rich in protein', 'Ideal for curries and snacks'],
    inStock: true,
  },
  {
    name: 'Eggs 12 pcs',
    category: 'Dairy',
    price: 90,
    offerPrice: 85,
    images: ['eggs_image.png'],
    description: ['Farm fresh', 'Rich in protein', 'Ideal for breakfast and baking'],
    inStock: true,
  },
  {
    name: 'Cheese 200g',
    category: 'Dairy',
    price: 140,
    offerPrice: 130,
    images: ['cheese_image.png'],
    description: ['Creamy and delicious', 'Perfect for pizzas and sandwiches', 'Rich in calcium'],
    inStock: true,
  },

  // Drinks
  {
    name: 'Coca-Cola 1.5L',
    category: 'Drinks',
    price: 80,
    offerPrice: 75,
    images: ['coca_cola_image.png'],
    description: ['Refreshing and fizzy', 'Perfect for parties and gatherings', 'Best served chilled'],
    inStock: true,
  },
  {
    name: 'Pepsi 1.5L',
    category: 'Drinks',
    price: 78,
    offerPrice: 73,
    images: ['pepsi_image.png'],
    description: ['Chilled and refreshing', 'Perfect for celebrations', 'Best served cold'],
    inStock: true,
  },
  {
    name: 'Sprite 1.5L',
    category: 'Drinks',
    price: 79,
    offerPrice: 74,
    images: ['sprite_image_1.png'],
    description: ['Refreshing citrus taste', 'Perfect for hot days', 'Best served chilled'],
    inStock: true,
  },
  {
    name: 'Fanta 1.5L',
    category: 'Drinks',
    price: 77,
    offerPrice: 72,
    images: ['fanta_image_1.png'],
    description: ['Sweet and fizzy', 'Great for parties and gatherings', 'Best served cold'],
    inStock: true,
  },
  {
    name: '7 Up 1.5L',
    category: 'Drinks',
    price: 76,
    offerPrice: 71,
    images: ['seven_up_image_1.png'],
    description: ['Refreshing lemon-lime flavor', 'Perfect for refreshing', 'Best served chilled'],
    inStock: true,
  },

  // Grains
  {
    name: 'Basmati Rice 5kg',
    category: 'Grains',
    price: 550,
    offerPrice: 520,
    images: ['basmati_rice_image.png'],
    description: ['Long grain and aromatic', 'Perfect for biryani and pulao', 'Premium quality'],
    inStock: true,
  },
  {
    name: 'Wheat Flour 5kg',
    category: 'Grains',
    price: 250,
    offerPrice: 230,
    images: ['wheat_flour_image.png'],
    description: ['High-quality whole wheat', 'Soft and fluffy rotis', 'Rich in nutrients'],
    inStock: true,
  },
  {
    name: 'Organic Quinoa 500g',
    category: 'Grains',
    price: 450,
    offerPrice: 420,
    images: ['quinoa_image.png'],
    description: ['High in protein and fiber', 'Gluten-free', 'Rich in vitamins and minerals'],
    inStock: true,
  },
  {
    name: 'Brown Rice 1kg',
    category: 'Grains',
    price: 120,
    offerPrice: 110,
    images: ['brown_rice_image.png'],
    description: ['Whole grain and nutritious', 'Helps in weight management', 'Good source of magnesium'],
    inStock: true,
  },
  {
    name: 'Barley 1kg',
    category: 'Grains',
    price: 150,
    offerPrice: 140,
    images: ['barley_image.png'],
    description: ['Rich in fiber', 'Helps improve digestion', 'Low in fat and cholesterol'],
    inStock: true,
  },

  // Bakery
  {
    name: 'Brown Bread 400g',
    category: 'Bakery',
    price: 40,
    offerPrice: 35,
    images: ['brown_bread_image.png'],
    description: ['Soft and healthy', 'Made from whole wheat', 'Ideal for breakfast and sandwiches'],
    inStock: true,
  },
  {
    name: 'Butter Croissant 100g',
    category: 'Bakery',
    price: 50,
    offerPrice: 45,
    images: ['butter_croissant_image.png'],
    description: ['Flaky and buttery', 'Freshly baked', 'Perfect for breakfast or snacks'],
    inStock: true,
  },
  {
    name: 'Chocolate Cake 500g',
    category: 'Bakery',
    price: 350,
    offerPrice: 325,
    images: ['chocolate_cake_image.png'],
    description: ['Rich and moist', 'Made with premium cocoa', 'Ideal for celebrations and parties'],
    inStock: true,
  },
  {
    name: 'Whole Wheat Bread 400g',
    category: 'Bakery',
    price: 45,
    offerPrice: 40,
    images: ['whole_wheat_bread_image.png'],
    description: ['Healthy and nutritious', 'Made with whole wheat flour', 'Ideal for sandwiches and toast'],
    inStock: true,
  },
  {
    name: 'Vanilla Muffins 6 pcs',
    category: 'Bakery',
    price: 100,
    offerPrice: 90,
    images: ['vanilla_muffins_image.png'],
    description: ['Soft and fluffy', 'Perfect for a quick snack', 'Made with real vanilla'],
    inStock: true,
  },

  // Instant
  {
    name: 'Maggi Noodles 280g',
    category: 'Instant',
    price: 55,
    offerPrice: 50,
    images: ['maggi_image.png'],
    description: ['Instant and easy to cook', 'Delicious taste', 'Popular among kids and adults'],
    inStock: true,
  },
  {
    name: 'Top Ramen 270g',
    category: 'Instant',
    price: 45,
    offerPrice: 40,
    images: ['top_ramen_image.png'],
    description: ['Quick and easy to prepare', 'Spicy and flavorful', 'Loved by college students and families'],
    inStock: true,
  },
  {
    name: 'Knorr Cup Soup 70g',
    category: 'Instant',
    price: 35,
    offerPrice: 30,
    images: ['knorr_soup_image.png'],
    description: ['Convenient for on-the-go', 'Healthy and nutritious', 'Variety of flavors'],
    inStock: true,
  },
  {
    name: 'Yippee Noodles 260g',
    category: 'Instant',
    price: 50,
    offerPrice: 45,
    images: ['yippee_image.png'],
    description: ['Non-fried noodles for healthier choice', 'Tasty and filling', 'Convenient for busy schedules'],
    inStock: true,
  },
  {
    name: 'Oats Noodles 72g',
    category: 'Instant',
    price: 40,
    offerPrice: 35,
    images: ['maggi_oats_image.png'],
    description: ['Healthy alternative with oats', 'Good for digestion', 'Perfect for breakfast or snacks'],
    inStock: true,
  },
];

// Seed function
async function seed() {
  console.log(`\n🌱 Starting product seed (${productData.length} products)...\n`);

  // Get existing product names to allow resuming
  const existing = await Product.find({}, 'name');
  const existingNames = new Set(existing.map(p => p.name));
  const toSeed = productData.filter(p => !existingNames.has(p.name));

  if (existingNames.size > 0) {
    console.log(`⏭️  Skipping ${existingNames.size} already-seeded products`);
    console.log(`📋 Remaining: ${toSeed.length} products to seed\n`);
  }

  for (const p of toSeed) {
    console.log(`📦 Processing: ${p.name}`);
    const imageUrls = [];
    for (const img of p.images) {
      const url = await uploadImage(img);
      imageUrls.push(url);
    }

    await Product.create({
      name: p.name,
      category: p.category,
      price: p.price,
      offerPrice: p.offerPrice,
      image: imageUrls,
      description: p.description,
      inStock: p.inStock,
    });

    console.log(`  ✅ Saved: ${p.name}\n`);
  }

  const total = await Product.countDocuments();
  console.log(`\n🎉 Seeding complete! ${total} products now in MongoDB.`);
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
