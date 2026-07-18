import { prisma } from "../config/database";
import { generateStudentRollNumber, isLegacyRollNumber } from "../utils/rollNumber";

async function main() {
  console.log('🔧 Backfilling missing student/company profiles...');

  // Backfill students
  const studentUsers = await prisma.user.findMany({ where: { role: 'STUDENT' } });
  for (const u of studentUsers) {
    const existing = await prisma.student.findUnique({ where: { userId: u.id } });
    if (!existing) {
      const roll = generateStudentRollNumber(u.id);
      await prisma.student.create({
        data: {
          userId: u.id,
          firstName: '',
          lastName: '',
          rollNumber: roll,
          phone: '',
          department: 'CSE',
          batch: new Date().getFullYear(),
          cgpa: 0,
          college: 'Not Specified',
        },
      });
      console.log('Created student for', u.email);
    } else if (existing.rollNumber && isLegacyRollNumber(existing.rollNumber)) {
      const roll = generateStudentRollNumber(u.id + existing.rollNumber);
      await prisma.student.update({
        where: { id: existing.id },
        data: { rollNumber: roll },
      });
      console.log('Updated legacy roll number for', u.email);
    }
  }

  // Backfill companies
  const companyUsers = await prisma.user.findMany({ where: { role: 'COMPANY' } });
  for (const u of companyUsers) {
    const existing = await prisma.company.findFirst({ where: { userId: u.id } });
    if (!existing) {
      const reg = `REG-BACKFILL-${Date.now()}-${u.id.slice(0,6)}`;
      const cname = `Company-${u.email.split('@')[0]}`;
      await prisma.company.create({
        data: {
          userId: u.id,
          companyName: cname,
          registrationId: reg,
          sector: 'Other',
          website: '',
          isProfileComplete: false,
          isApproved: false,
        },
      });
      console.log('Created company for', u.email);
    }
  }

  console.log('🔧 Backfill complete');
}

main()
  .catch((e) => {
    console.error('Backfill failed', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
