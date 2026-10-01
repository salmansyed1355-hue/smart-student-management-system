const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });
const Student = require('../src/models/Student');

// 50 student names for AIML
const aimlNames = [
  'Aryan Kulkarni', 'Ananya Deshpande', 'Rohan Mukherjee', 'Sanya Malhotra', 'Tanmay Joshi',
  'Riddhi Shah', 'Harshwardhan Patil', 'Ishaan Chawla', 'Megha Natarajan', 'Kabir Saxena',
  'Devika Sundaram', 'Pranav Singhal', 'Avani Pillai', 'Varun Kashyap', 'Shreya Bhardwaj',
  'Yash Singhania', 'Neha Nambiar', 'Siddhant Bhatt', 'Tara Srinivasan', 'Aayush Goyal',
  'Kritika Mahajan', 'Dhruv Acharya', 'Simran Kaur', 'Reyansh Mittal', 'Palak Aggarwal',
  'Vedant Mishra', 'Ira Goswami', 'Madhav Somani', 'Diya Sengupta', 'Tejas Kulkarni',
  'Anvi Varma', 'Parth Trivedi', 'Rhea Bansal', 'Samar Kapoor', 'Janhavi Hegde',
  'Neil Sengupta', 'Lavanya Pillai', 'Advait Rastogi', 'Sanjana Reddy', 'Manav Mathur',
  'Anika Nair', 'Kunal Bhasin', 'Myra Jain', 'Shaurya Dewan', 'Navya Bhatia',
  'Darsh Kaushik', 'Tanya Ahluwalia', 'Vihaan Sethi', 'Eshita Roy', 'Atharva Dixit'
];

// 60 student names for mix of other departments (12 CSE, 12 IT, 12 ECE, 12 MECH, 12 CIVIL)
const mixedDepartmentNames = [
  // 12 for CSE
  { name: 'Aarush Tyagi', dept: 'CSE' },
  { name: 'Bhavya Pandey', dept: 'CSE' },
  { name: 'Chirag Oberoi', dept: 'CSE' },
  { name: 'Disha Vohra', dept: 'CSE' },
  { name: 'Eklavya Chauhan', dept: 'CSE' },
  { name: 'Gauri Shankar', dept: 'CSE' },
  { name: 'Hridhaan Dutta', dept: 'CSE' },
  { name: 'Juhi Chawla', dept: 'CSE' },
  { name: 'Kairav Lal', dept: 'CSE' },
  { name: 'Mallika Sarabhai', dept: 'CSE' },
  { name: 'Nakul Grover', dept: 'CSE' },
  { name: 'Ojaswini Sen', dept: 'CSE' },

  // 12 for IT
  { name: 'Omkar Dalvi', dept: 'IT' },
  { name: 'Pari Parikh', dept: 'IT' },
  { name: 'Raghav Chadha', dept: 'IT' },
  { name: 'Saumya Swaminathan', dept: 'IT' },
  { name: 'Tanishq Bagga', dept: 'IT' },
  { name: 'Urvashi Rautela', dept: 'IT' },
  { name: 'Vivaan Sondhi', dept: 'IT' },
  { name: 'Yamini Krishnamurthy', dept: 'IT' },
  { name: 'Zaid Mansoori', dept: 'IT' },
  { name: 'Charvi Bhat', dept: 'IT' },
  { name: 'Devanshu Tomar', dept: 'IT' },
  { name: 'Gargi Roy', dept: 'IT' },

  // 12 for ECE
  { name: 'Hardik Pandya', dept: 'ECE' },
  { name: 'Inaya Qureshi', dept: 'ECE' },
  { name: 'Jayant Sinha', dept: 'ECE' },
  { name: 'Kanika Kapoor', dept: 'ECE' },
  { name: 'Lakshya Sen', dept: 'ECE' },
  { name: 'Mihika Verma', dept: 'ECE' },
  { name: 'Naman Ojha', dept: 'ECE' },
  { name: 'Prisha Madan', dept: 'ECE' },
  { name: 'Rishit Narang', dept: 'ECE' },
  { name: 'Saanvi Goel', dept: 'ECE' },
  { name: 'Tushar Kalia', dept: 'ECE' },
  { name: 'Utkarsh Gupta', dept: 'ECE' },

  // 12 for MECH
  { name: 'Vaibhav Suryavanshi', dept: 'MECH' },
  { name: 'Warina Hussain', dept: 'MECH' },
  { name: 'Yashasvi Jaiswal', dept: 'MECH' },
  { name: 'Zoya Akhtar', dept: 'MECH' },
  { name: 'Aravind Swamy', dept: 'MECH' },
  { name: 'Barkha Bisht', dept: 'MECH' },
  { name: 'Chetan Bhagat', dept: 'MECH' },
  { name: 'Damini Chopra', dept: 'MECH' },
  { name: 'Farhan Akhtar', dept: 'MECH' },
  { name: 'Gunjan Saxena', dept: 'MECH' },
  { name: 'Hemant Soren', dept: 'MECH' },
  { name: 'Indrani Mukerjea', dept: 'MECH' },

  // 12 for CIVIL
  { name: 'Jaideep Ahlawat', dept: 'CIVIL' },
  { name: 'Kirti Kulhari', dept: 'CIVIL' },
  { name: 'Lokesh Rahul', dept: 'CIVIL' },
  { name: 'Mithila Palkar', dept: 'CIVIL' },
  { name: 'Niharika Konidela', dept: 'CIVIL' },
  { name: 'Om Puri', dept: 'CIVIL' },
  { name: 'Pankaj Tripathi', dept: 'CIVIL' },
  { name: 'Radhika Madan', dept: 'CIVIL' },
  { name: 'Sharad Kelkar', dept: 'CIVIL' },
  { name: 'Trisha Krishnan', dept: 'CIVIL' },
  { name: 'Unmukt Chand', dept: 'CIVIL' },
  { name: 'Vaani Kapoor', dept: 'CIVIL' }
];

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

async function seedAimlAndMixed() {
  try {
    console.log('[Seed] Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('[Seed] Connected.');

    const existing = await Student.find({}, 'rollNumber email');
    const existingRolls = new Set(existing.map((s) => s.rollNumber));
    const existingEmails = new Set(existing.map((s) => s.email.toLowerCase()));

    let rollNumberIndex = 1;

    const getNextRollNumber = () => {
      while (existingRolls.has(`SMS${String(rollNumberIndex).padStart(3, '0')}`)) {
        rollNumberIndex++;
      }
      const roll = `SMS${String(rollNumberIndex).padStart(3, '0')}`;
      existingRolls.add(roll);
      rollNumberIndex++;
      return roll;
    };

    const getUniqueEmail = (name) => {
      const parts = name.toLowerCase().replace(/[^a-z ]/g, '').split(' ').filter(Boolean);
      const base = `${parts[0]}.${parts[1] || 'student'}`;
      let email = `${base}${rollNumberIndex}@example.com`;
      let counter = 1;
      while (existingEmails.has(email)) {
        email = `${base}${rollNumberIndex}_${counter}@example.com`;
        counter++;
      }
      existingEmails.add(email);
      return email;
    };

    const phonePrefixes = ['98', '97', '96', '95', '94', '91', '89', '88', '87', '70'];
    let phoneCounter = 100;

    const getPhone = () => {
      phoneCounter++;
      const prefix = phonePrefixes[phoneCounter % phonePrefixes.length];
      const suffix = String(20000000 + (phoneCounter * 64721) % 80000000).slice(0, 8);
      return `${prefix}${suffix}`;
    };

    const studentsToInsert = [];

    // 1. Generate 50 AIML students
    for (let i = 0; i < aimlNames.length; i++) {
      const name = aimlNames[i];
      const sem = (i % 8) + 1;
      const batchYear = semToBatch[sem];
      const rollNumber = getNextRollNumber();
      const email = getUniqueEmail(name);
      const phone = getPhone();
      
      let status = 'Active';
      if (sem === 8 && i % 8 === 0) status = 'Graduated';
      else if (i % 24 === 0) status = 'Suspended';

      studentsToInsert.push({
        rollNumber,
        fullName: name,
        email,
        phone,
        department: 'AI&ML',
        semester: sem,
        batchYear,
        status
      });
    }

    // 2. Generate 60 students from mix of all other departments (12 CSE, 12 IT, 12 ECE, 12 MECH, 12 CIVIL)
    for (let i = 0; i < mixedDepartmentNames.length; i++) {
      const { name, dept } = mixedDepartmentNames[i];
      const sem = (i % 8) + 1;
      const batchYear = semToBatch[sem];
      const rollNumber = getNextRollNumber();
      const email = getUniqueEmail(name);
      const phone = getPhone();

      let status = 'Active';
      if (sem === 8 && i % 8 === 0) status = 'Graduated';
      else if (i % 24 === 0) status = 'Suspended';

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

    console.log(`[Seed] Inserting ${studentsToInsert.length} students (50 AIML + 60 other departments)...`);
    const inserted = await Student.insertMany(studentsToInsert);
    console.log(`[Seed] Successfully inserted ${inserted.length} students!`);

    const summary = await Student.aggregate([
      { $group: { _id: '$department', count: { $sum: 1 } } }
    ]);
    const total = await Student.countDocuments();
    console.log('[Seed] New database department summary:', summary);
    console.log(`[Seed] Total students now in database: ${total}`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]:', error);
    process.exit(1);
  }
}

seedAimlAndMixed();
