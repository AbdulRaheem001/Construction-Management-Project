import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import Expense from '../src/models/Expense.model';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function checkExpenseData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('✅ Connected to database\n');

    const expenses = await Expense.find().limit(5).select('expenseNumber description images');
    
    console.log('📊 Checking first 5 expenses:\n');
    expenses.forEach((expense, index) => {
      console.log(`${index + 1}. ${expense.expenseNumber} - ${expense.description}`);
      console.log(`   Images field: ${expense.images ? `✓ Exists (${expense.images.length} images)` : '✗ Not present or empty'}`);
      if (expense.images && expense.images.length > 0) {
        console.log(`   Image URLs: ${expense.images.join(', ')}`);
      }
      console.log('');
    });

    await mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkExpenseData();
