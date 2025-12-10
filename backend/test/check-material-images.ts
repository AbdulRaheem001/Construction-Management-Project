import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import Material from '../src/models/Material.model';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function checkMaterialImages() {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('✅ Connected to database\n');

    const materials = await Material.find().limit(10).select('sku name images');
    
    console.log('📊 Checking first 10 materials:\n');
    materials.forEach((material, index) => {
      console.log(`${index + 1}. ${material.sku} - ${material.name}`);
      console.log(`   Images field: ${material.images ? `✓ Exists (${material.images.length} images)` : '✗ Not present or empty'}`);
      if (material.images && material.images.length > 0) {
        material.images.forEach((url, i) => {
          console.log(`   Image ${i + 1}: ${url.substring(0, 60)}...`);
        });
      }
      console.log('');
    });

    const materialsWithImages = materials.filter(m => m.images && m.images.length > 0);
    console.log(`\n📸 Total materials with images: ${materialsWithImages.length} out of ${materials.length}`);

    await mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkMaterialImages();
