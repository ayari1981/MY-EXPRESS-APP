require('dotenv').config();
console.log('Testing database connection...');

const path = require('path');
const { connectDB } = require('./src/config/database');
const User = require('./src/models/User');

connectDB().then(async () => {
  console.log('✅ Connected to database');
  
  const studentCount = await User.count({ where: { role: 'student' }});
  console.log(`📊 Students found: ${studentCount}`);
  
  process.exit(0);
}).catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});