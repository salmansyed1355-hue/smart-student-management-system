const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const Student = require('./models/Student');

// 100 realistic student names
const studentList = [
  { name: 'Aarav Sharma', gender: 'M' },
  { name: 'Aditi Patel', gender: 'F' },
  { name: 'Rohan Verma', gender: 'M' },
  { name: 'Ananya Iyer', gender: 'F' },
  { name: 'Kavya Nair', gender: 'F' },
  { name: 'Vikram Malhotra', gender: 'M' },
  { name: 'Neha Gupta', gender: 'F' },
  { name: 'Rahul Reddy', gender: 'M' },
  { name: 'Pooja Choudhury', gender: 'F' },
  { name: 'Siddharth Rao', gender: 'M' },
  { name: 'Sneha Deshmukh', gender: 'F' },
  { name: 'Arjun Mehta', gender: 'M' },
  { name: 'Diya Sen', gender: 'F' },
  { name: 'Varun Joshi', gender: 'M' },
  { name: 'Tanvi Kulkarni', gender: 'F' },
  { name: 'Karthik Swaminathan', gender: 'M' },
  { name: 'Riya Chatterjee', gender: 'F' },
  { name: 'Aditya Bhattacharya', gender: 'M' },
  { name: 'Ishita Saxena', gender: 'F' },
  { name: 'Gaurav Tiwari', gender: 'M' },
  { name: 'Meera Menon', gender: 'F' },
  { name: 'Nikhil Agarwal', gender: 'M' },
  { name: 'Shreya Kapoor', gender: 'F' },
  { name: 'Harsh Vardhan', gender: 'M' },
  { name: 'Anushka Pillai', gender: 'F' },
  { name: 'Karan Singhania', gender: 'M' },
  { name: 'Ritika Roy', gender: 'F' },
  { name: 'Manish Pandey', gender: 'M' },
  { name: 'Divya Nambiar', gender: 'F' },
  { name: 'Ayush Srivastava', gender: 'M' },
  { name: 'Pooja Hegde', gender: 'F' },
  { name: 'Devendra Yadav', gender: 'M' },
  { name: 'Sunita Chauhan', gender: 'F' },
  { name: 'Pranav Murthy', gender: 'M' },
  { name: 'Shruti Mishra', gender: 'F' },
  { name: 'Alok Kumar', gender: 'M' },
  { name: 'Geetika Bansal', gender: 'F' },
  { name: 'Suresh Raina', gender: 'M' },
  { name: 'Kalyani Sunder', gender: 'F' },
  { name: 'Abhishek Jha', gender: 'M' },
  { name: 'Deepika Padukone', gender: 'F' },
  { name: 'Yashwardhan Dixit', gender: 'M' },
  { name: 'Smriti Mandhana', gender: 'F' },
  { name: 'Kunal Nayyar', gender: 'M' },
  { name: 'Swati Kaushik', gender: 'F' },
  { name: 'Rohit Balakrishnan', gender: 'M' },
  { name: 'Bhavna Rawat', gender: 'F' },
  { name: 'Deepak Chahar', gender: 'M' },
  { name: 'Monika Tripathi', gender: 'F' },
  { name: 'Chirag Sethi', gender: 'M' },
  { name: 'Pallavi Gowda', gender: 'F' },
  { name: 'Aakash Chopra', gender: 'M' },
  { name: 'Preeti Shenoy', gender: 'F' },
  { name: 'Mohit Suri', gender: 'M' },
  { name: 'Anjali Bhagwat', gender: 'F' },
  { name: 'Vikas Dubey', gender: 'M' },
  { name: 'Komal Pandey', gender: 'F' },
  { name: 'Rajesh Koothrappali', gender: 'M' },
  { name: 'Nandini Das', gender: 'F' },
  { name: 'Mayank Agarwal', gender: 'M' },
  { name: 'Payal Rohatgi', gender: 'F' },
  { name: 'Tushar Deshpande', gender: 'M' },
  { name: 'Shweta Tiwari', gender: 'F' },
  { name: 'Samir Soni', gender: 'M' },
  { name: 'Radhika Apte', gender: 'F' },
  { name: 'Lalit Yadav', gender: 'M' },
  { name: 'Malini Sharma', gender: 'F' },
  { name: 'Naveen Jindal', gender: 'M' },
  { name: 'Aparna Sen', gender: 'F' },
  { name: 'Sachin Tendulkar', gender: 'M' },
  { name: 'Rashmika Mandanna', gender: 'F' },
  { name: 'Dinesh Karthik', gender: 'M' },
  { name: 'Sakshi Dhoni', gender: 'F' },
  { name: 'Rishabh Pant', gender: 'M' },
  { name: 'Vidya Balan', gender: 'F' },
  { name: 'Shubman Gill', gender: 'M' },
  { name: 'Harmanpreet Kaur', gender: 'F' },
  { name: 'Ishan Kishan', gender: 'M' },
  { name: 'Jemimah Rodrigues', gender: 'F' },
  { name: 'Axar Patel', gender: 'M' },
  { name: 'Poonam Yadav', gender: 'F' },
  { name: 'Kuldeep Yadav', gender: 'M' },
  { name: 'Deeksha Seth', gender: 'F' },
  { name: 'Mohammed Siraj', gender: 'M' },
  { name: 'Shafali Verma', gender: 'F' },
  { name: 'Shardul Thakur', gender: 'M' },
  { name: 'Richa Ghosh', gender: 'F' },
  { name: 'Prithvi Shaw', gender: 'M' },
  { name: 'Yastika Bhatia', gender: 'F' },
  { name: 'Devdutt Padikkal', gender: 'M' },
  { name: 'Renuka Singh', gender: 'F' },
  { name: 'Chetan Sakariya', gender: 'M' },
  { name: 'Sneh Rana', gender: 'F' },
  { name: 'Shivam Dube', gender: 'M' },
  { name: 'Taniya Bhatia', gender: 'F' },
  { name: 'Washington Sundar', gender: 'M' },
  { name: 'Harleen Deol', gender: 'F' },
  { name: 'Rinku Singh', gender: 'M' },
  { name: 'Veda Krishnamurthy', gender: 'F' },
  { name: 'Tilak Varma', gender: 'M' }
];

const departments = ['CSE', 'AI&ML', 'IT', 'ECE', 'MECH', 'CIVIL'];

// Map semester to batch year
const semToBatch = {
  1: 2026,
  2: 2026,
  3: 2025,
  4: 2025,
  5: 2024,
  6: 2024,
  7: 2023,
  8: 2023
};

async function seedStudents() {
  try {
    console.log('[Seed] Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('[Seed] Connected successfully.');

    // Fetch highest existing rollNumber to avoid any collision
    const existing = await Student.find({}, 'rollNumber email');
    const existingRolls = new Set(existing.map((s) => s.rollNumber));
    const existingEmails = new Set(existing.map((s) => s.email.toLowerCase()));

    let rollIndex = 4; // Start right after SMS003
    const studentsToInsert = [];

    for (let i = 0; i < studentList.length; i++) {
      const { name } = studentList[i];
      const dept = departments[i % departments.length];
      const sem = (i % 8) + 1;
      const batchYear = semToBatch[sem];

      // Find next available roll number
      while (existingRolls.has(`SMS${String(rollIndex).padStart(3, '0')}`)) {
        rollIndex++;
      }
      const rollNumber = `SMS${String(rollIndex).padStart(3, '0')}`;
      rollIndex++;

      // Create clean email
      const nameParts = name.toLowerCase().split(' ');
      const baseEmail = `${nameParts[0]}.${nameParts[1] || 'student'}`;
      let email = `${baseEmail}${rollIndex}@example.com`;
      let emailCounter = 1;
      while (existingEmails.has(email)) {
        email = `${baseEmail}${rollIndex}_${emailCounter}@example.com`;
        emailCounter++;
      }
      existingEmails.add(email);

      // Generate realistic 10-digit phone
      const phonePrefixes = ['98', '97', '96', '95', '94', '91', '89', '88', '87', '70'];
      const prefix = phonePrefixes[i % phonePrefixes.length];
      const suffix = String(10000000 + (i * 73931) % 90000000).slice(0, 8);
      const phone = `${prefix}${suffix}`;

      // Status: 95% Active, 3% Graduated (if sem 8), 2% Suspended
      let status = 'Active';
      if (sem === 8 && i % 15 === 0) {
        status = 'Graduated';
      } else if (i % 35 === 0) {
        status = 'Suspended';
      }

      studentsToInsert.push({
        rollNumber,
        fullName: name,
        email,
        phone,
        department: dept,
        semester: sem,
        batchYear,
        status
      });
    }

    console.log(`[Seed] Inserting ${studentsToInsert.length} students...`);
    const inserted = await Student.insertMany(studentsToInsert);
    console.log(`[Seed] Successfully inserted ${inserted.length} students!`);

    const totalCount = await Student.countDocuments();
    console.log(`[Seed] Total students now in database: ${totalCount}`);

    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]:', error);
    process.exit(1);
  }
}

seedStudents();
