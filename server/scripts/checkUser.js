require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

async function checkUser(email) {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    console.log(`\nChecking user with email: ${email}`);
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }

    console.log('\nUser details:');
    console.log('-------------');
    console.log(`ID: ${user._id}`);
    console.log(`Name: ${user.name}`);
    console.log(`Email: ${user.email}`);
    console.log(`Account Type: ${user.accountType}`);
    console.log(`Has Password: ${!!user.password}`);
    console.log(`Created At: ${user.createdAt}`);
    console.log(`Last Login: ${user.lastLogin}`);

    // Check if password is hashed
    if (user.password) {
      const isHashed = user.password.startsWith('$2');
      console.log(`\nPassword Status:`);
      console.log(`Is Hashed: ${isHashed}`);
      console.log(`Hash Length: ${user.password.length}`);
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

// Get email from command line argument
const email = process.argv[2];
if (!email) {
  console.error('Please provide an email address');
  process.exit(1);
}

checkUser(email); 
checkUser('v@gmail.com'); 