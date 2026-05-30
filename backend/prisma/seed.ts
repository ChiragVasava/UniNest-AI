import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/utils/encryption";

const prisma = new PrismaClient();

/**
 * Seed database with initial test data
 * Run: npm run prisma:seed
 */
async function main() {
  console.log("🌱 Seeding database...");

  // Create test admin user
  const adminUser = await prisma.user.create({
    data: {
      email: "admin@uninest.com",
      password: await hashPassword("Admin@123"),
      role: "ADMIN",
    },
  });
  console.log("✅ Admin created:", adminUser.email);

  // Create test student users
  const student1 = await prisma.user.create({
    data: {
      email: "student1@college.com",
      password: await hashPassword("Student@123"),
      role: "STUDENT",
      student: {
        create: {
          firstName: "Rahul",
          lastName: "Kumar",
          rollNumber: "BT24CSE001",
          phone: "9876543210",
          cgpa: 8.5,
          department: "CSE",
          batch: 2024,
          college: "XYZ Institute",
          verificationStatus: "VERIFIED",
          isProfileVerified: true,
        },
      },
    },
  });
  console.log("✅ Student 1 created:", student1.email);

  const student2 = await prisma.user.create({
    data: {
      email: "student2@college.com",
      password: await hashPassword("Student@123"),
      role: "STUDENT",
      student: {
        create: {
          firstName: "Priya",
          lastName: "Singh",
          rollNumber: "BT24CSE002",
          phone: "9876543211",
          cgpa: 7.8,
          department: "CSE",
          batch: 2024,
          college: "XYZ Institute",
        },
      },
    },
  });
  console.log("✅ Student 2 created:", student2.email);

  // Create test company user
  const company1 = await prisma.user.create({
    data: {
      email: "hr@google.com",
      password: await hashPassword("Company@123"),
      role: "COMPANY",
      company: {
        create: {
          companyName: "Google India",
          registrationId: "REG123456",
          sector: "Technology",
          website: "www.google.com",
          contactPerson: "John Doe",
          contactEmail: "john@google.com",
          isProfileComplete: true,
          isApproved: true,
        },
      },
    },
  });
  console.log("✅ Company created:", company1.email);

  // Create a placement drive
  const drive = await prisma.drive.create({
    data: {
      title: "Software Engineer - Backend",
      description: "Join our backend engineering team",
      jobDescription: "Looking for experienced backend developers with Node.js expertise",
      salary: 15,
      cgpaCutoff: 7.0,
      eligibleDepartments: ["CSE", "IT"],
      eligibleBatches: [2024],
      requiredSkills: ["Node.js", "PostgreSQL", "REST APIs"],
      interviewFormat: "Online",
      isActive: true,
      companyId: company1.id,
    },
  });
  console.log("✅ Drive created:", drive.title);

  console.log("✨ Database seeding completed!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
