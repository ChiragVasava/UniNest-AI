/**
 * fixStudentData.ts
 * ─────────────────────────────────────────────────────────────────
 * 1. Assigns Chirag Vasava & Sanjay Vasava to MSU (The Maharaja
 *    Sayajirao University Of Baroda)
 * 2. Fixes department ("Computer Science" → "Computer Science And
 *    Engineering") and batch (2026 → 2027) for all 7 students
 *    listed in the user's issue table.
 * ─────────────────────────────────────────────────────────────────
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Students whose data needs fixing
// email → what the corrected record should look like
const fixes: Array<{
  email: string;
  department: string;
  batch: number;
  cgpa?: number;
  college?: string;           // human-readable college name (kept in the college field)
  assignToMSU?: boolean;      // if true, look up MSU university and link
}> = [
  // ── Unassigned → MSU ──────────────────────────────────────────
  {
    email: "chirag@gmail.com",
    department: "Computer Science And Engineering",
    batch: 2027,
    cgpa: 9,
    college: "The Maharaja Sayajirao University Of Baroda",
    assignToMSU: true,
  },
  {
    email: "sv690649@gmail.com",
    department: "Computer Science And Engineering",
    batch: 2027,
    cgpa: 8,
    college: "The Maharaja Sayajirao University Of Baroda",
    assignToMSU: true,
  },

  // ── Seeded students: fix department + batch ───────────────────
  {
    email: "priyanshumakwana2003+student@gmail.com",
    department: "Computer Science And Engineering",
    batch: 2027,
    cgpa: 8.5,
  },
  {
    email: "krishpalat9+student@gmail.com",
    department: "Computer Science And Engineering",
    batch: 2027,
    cgpa: 8.5,
  },
  {
    email: "ravirajdhokiya10+student@gmail.com",
    department: "Computer Science And Engineering",
    batch: 2027,
    cgpa: 8.5,
  },
  {
    email: "dhuvabharat1705+student@gmail.com",
    department: "Computer Science And Engineering",
    batch: 2027,
    cgpa: 8.5,
  },
  {
    email: "aakashpatel20032003+student@gmail.com",
    department: "Computer Science And Engineering",
    batch: 2027,
    cgpa: 8.5,
  },
];

async function main() {
  console.log("🔧 Starting student data fix script...\n");

  // Fetch MSU university record once
  const msuUniversity = await prisma.university.findFirst({
    where: { code: "MSU" },
  });

  if (!msuUniversity) {
    throw new Error(
      '❌ MSU university not found in database. Make sure it is created with code "MSU" before running this script.'
    );
  }

  console.log(`✅ Found MSU: ${msuUniversity.name} (ID: ${msuUniversity.id})\n`);

  for (const fix of fixes) {
    // Look up the User record by email
    const user = await prisma.user.findUnique({ where: { email: fix.email } });

    if (!user) {
      console.warn(`⚠️  User not found for email: ${fix.email} — skipping`);
      continue;
    }

    // Look up the Student profile linked to that User
    const student = await prisma.student.findUnique({
      where: { userId: user.id },
    });

    if (!student) {
      console.warn(`⚠️  Student profile not found for email: ${fix.email} — skipping`);
      continue;
    }

    const updateData: Record<string, unknown> = {
      department: fix.department,
      batch: fix.batch,
    };

    if (fix.cgpa !== undefined) {
      updateData.cgpa = fix.cgpa;
    }

    if (fix.assignToMSU) {
      updateData.universityId = msuUniversity.id;
      updateData.college = fix.college ?? msuUniversity.name;
    }

    await prisma.student.update({
      where: { id: student.id },
      data: updateData,
    });

    const flags = [];
    flags.push(`dept → "${fix.department}"`);
    flags.push(`batch → ${fix.batch}`);
    if (fix.cgpa !== undefined) flags.push(`cgpa → ${fix.cgpa}`);
    if (fix.assignToMSU) flags.push(`university → MSU ✓`);

    console.log(`✅  ${fix.email}`);
    console.log(`   ${flags.join(" | ")}\n`);
  }

  console.log("🎉 All fixes applied successfully.");
}

main()
  .catch((e) => {
    console.error("❌ Error:", e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
