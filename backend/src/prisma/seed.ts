import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../utils/encryption";

const prisma = new PrismaClient();

/**
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../utils/encryption";

const prisma = new PrismaClient();

/**
 * Seed database with initial test data
 * Run: npm run prisma:seed
 */
async function main() {
  console.log("🌱 Seeding database...");

  // Create test admin user (idempotent)
  let adminUser = await prisma.user.findUnique({
    where: { email: "admin@uninest.com" },
  });
  if (!adminUser) {
    adminUser = await prisma.user.create({
      data: {
        email: "admin@uninest.com",
        password: await hashPassword("Admin@123"),
        role: "ADMIN",
      },
    });
    console.log("✅ Admin created:", adminUser.email);
  } else {
    console.log("ℹ️ Admin already exists:", adminUser.email);
  }

  // Create test student users
  // Create test student 1 (idempotent)
  let student1 = await prisma.user.findUnique({ where: { email: "student1@college.com" } });
  if (!student1) {
    student1 = await prisma.user.create({
      data: {
        email: "student1@college.com",
        password: await hashPassword("Student@123"),
        role: "STUDENT",
        student: {
          create: {
            firstName: "Rahul",
            lastName: "Kumar",
            rollNumber: "20CSE001",
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
  } else {
    console.log("ℹ️ Student 1 already exists:", student1.email);
  }

  // Create test student 2 (idempotent)
  let student2 = await prisma.user.findUnique({ where: { email: "student2@college.com" } });
  if (!student2) {
    student2 = await prisma.user.create({
      data: {
        email: "student2@college.com",
        password: await hashPassword("Student@123"),
        role: "STUDENT",
        student: {
          create: {
            firstName: "Priya",
            lastName: "Singh",
            rollNumber: "20CSE002",
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
  } else {
    console.log("ℹ️ Student 2 already exists:", student2.email);
  }

  // Create test company user
  // Create test company user (idempotent)
  let company1 = await prisma.user.findUnique({ where: { email: "hr@google.com" }, include: { company: true } });
  if (!company1) {
    company1 = await prisma.user.create({
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
      include: { company: true },
    });
    console.log("✅ Company created:", company1.email);
  } else {
    console.log("ℹ️ Company already exists:", company1.email);
  }

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
      companyId: company1.company?.id ?? company1.id,
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
