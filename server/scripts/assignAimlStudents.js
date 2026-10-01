const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });
const Student = require('../src/models/Student');

async function assign60ToAiml() {
  try {
    console.log('[Assign] Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('[Assign] Connected successfully.');

    // 1. Convert all existing 'AIML' students (50) to 'AI&ML'
    const resAiml = await Student.updateMany(
      { department: 'AIML' },
      { $set: { department: 'AI&ML' } }
    );
    console.log(`[Assign] Updated ${resAiml.modifiedCount} students from 'AIML' to 'AI&ML'.`);

    // Check how many students now have 'AI&ML'
    let currentAimlCount = await Student.countDocuments({ department: 'AI&ML' });
    console.log(`[Assign] Current 'AI&ML' count: ${currentAimlCount}`);

    // We need 60 total in AI&ML. Need (60 - currentAimlCount) more students.
    const needed = 60 - currentAimlCount;
    if (needed > 0) {
      console.log(`[Assign] Reassigning ${needed} more students from other departments to 'AI&ML'...`);
      // Take 2 from each other branch: CSE, IT, ECE, MECH, CIVIL
      const otherDepts = ['CSE', 'IT', 'ECE', 'MECH', 'CIVIL'];
      let remaining = needed;

      for (const dept of otherDepts) {
        if (remaining <= 0) break;
        const toTake = Math.min(2, remaining);
        // Find students in this dept, sort by rollNumber descending (recent additions)
        const candidates = await Student.find({ department: dept })
          .sort({ rollNumber: -1 })
          .limit(toTake);

        const ids = candidates.map((s) => s._id);
        if (ids.length > 0) {
          await Student.updateMany(
            { _id: { $in: ids } },
            { $set: { department: 'AI&ML' } }
          );
          remaining -= ids.length;
          console.log(`[Assign] Reassigned ${ids.length} students from ${dept} to 'AI&ML'.`);
        }
      }
    }

    // Verify final breakdown
    const depts = await Student.distinct('department');
    console.log('\n--- Final Department Counts ---');
    for (const d of depts) {
      const c = await Student.countDocuments({ department: d });
      console.log(`Department: ${d} -> ${c} students`);
    }

    const totalStudents = await Student.countDocuments();
    console.log(`Total students: ${totalStudents}`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('[Assign Error]:', err);
    process.exit(1);
  }
}

assign60ToAiml();
