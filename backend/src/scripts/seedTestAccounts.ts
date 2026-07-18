import { PrismaClient, UserRole, VerificationStatus } from "@prisma/client";
import { hashPassword } from "../utils/encryption";
import * as fs from "fs";

const prisma = new PrismaClient();

const candidates = [
  {
    firstName: "Priyanshu",
    lastName: "Makwana",
    email: "priyanshumakwana2003@gmail.com",
    phone: "9316654154",
    prn: "8024058198",
    college: "Parul University",
    collegeCode: "PU",
    companyName: "Priyanshu Tech Labs"
  },
  {
    firstName: "Krish",
    lastName: "Palat",
    email: "krishpalat9@gmail.com",
    phone: "7984302244",
    prn: "8023050788",
    college: "Nirma University",
    collegeCode: "NU",
    companyName: "Krish Systems & AI"
  },
  {
    firstName: "Raviraj",
    lastName: "Dhokiya",
    email: "ravirajdhokiya10@gmail.com",
    phone: "8155978775",
    prn: "8023053977",
    college: "Pandit Deendayal Energy University",
    collegeCode: "PDEU",
    companyName: "Dhokiya energy Solutions"
  },
  {
    firstName: "Bharat",
    lastName: "Dhuva",
    email: "dhuvabharat1705@gmail.com",
    phone: "9624828661",
    prn: "8024060920",
    college: "L.D. College of Engineering",
    collegeCode: "LDCE",
    companyName: "Dhuva Engineering Corp"
  },
  {
    firstName: "Aakash",
    lastName: "Patel",
    email: "aakashpatel20032003@gmail.com",
    phone: "7984943785",
    prn: "8023055061",
    college: "Sardar Vallabhbhai National Institute of Technology",
    collegeCode: "SVNIT",
    companyName: "Aakash Technologies"
  }
];

async function main() {
  console.log("🚀 Starting generation of test accounts...");

  const credentialsLog: Array<{
    role: string;
    name: string;
    email: string;
    pass: string;
    phone: string;
    details: string;
  }> = [];

  for (const c of candidates) {
    const baseEmailName = c.email.split("@")[0];
    const emailDomain = c.email.split("@")[1];
    
    // Compute aliases
    const studentEmail = `${baseEmailName}+student@${emailDomain}`;
    const uniEmail = `${baseEmailName}+uni@${emailDomain}`;
    const companyEmail = `${baseEmailName}+company@${emailDomain}`;

    // Passwords based on firstName (lowercase)
    const namePrefix = c.firstName.toLowerCase();
    const studentPass = `${namePrefix}student@123`;
    const uniPass = `${namePrefix}university@123`;
    const companyPass = `${namePrefix}company@123`;

    console.log(`\n--------------------------------------------`);
    console.log(`Processing candidate: ${c.firstName} ${c.lastName}`);
    console.log(`--------------------------------------------`);

    // 1. UNIVERSITY USER, TENANT, & FACULTY ADMIN
    const hashedUniPass = await hashPassword(uniPass);
    let uniUser = await prisma.user.findUnique({ where: { email: uniEmail } });
    if (!uniUser) {
      uniUser = await prisma.user.create({
        data: {
          email: uniEmail,
          password: hashedUniPass,
          role: UserRole.UNIVERSITY
        }
      });
      console.log(`  Created User: ${uniEmail}`);
    } else {
      await prisma.user.update({
        where: { id: uniUser.id },
        data: { password: hashedUniPass }
      });
      console.log(`  Updated password for: ${uniEmail}`);
    }

    let university = await prisma.university.findUnique({
      where: { userId: uniUser.id }
    });
    if (!university) {
      university = await prisma.university.create({
        data: {
          userId: uniUser.id,
          name: c.college,
          code: c.collegeCode,
          address: `${c.college} Campus, Gujarat`,
          website: `https://www.${c.collegeCode.toLowerCase()}.edu.in`,
          isApproved: true,
          subscriptionPlan: "ENTERPRISE"
        }
      });
      console.log(`  Created University: ${c.college}`);
    }

    // Check/create Faculty Admin linking
    const faculty = await prisma.facultyAdmin.findUnique({
      where: { userId: uniUser.id }
    });
    if (!faculty) {
      await prisma.facultyAdmin.create({
        data: {
          userId: uniUser.id,
          universityId: university.id,
          name: `${c.firstName} (Placement Officer)`,
          role: "SUPER_ADMIN",
          department: "Placement Cell"
        }
      });
      console.log(`  Created Faculty Admin linking`);
    }
    credentialsLog.push({
      role: "University",
      name: c.college,
      email: uniEmail,
      pass: uniPass,
      phone: c.phone,
      details: `Code: ${c.collegeCode} | Plan: Enterprise`
    });

    // 2. STUDENT USER & PROFILE
    const hashedStudentPass = await hashPassword(studentPass);
    let studentUser = await prisma.user.findUnique({ where: { email: studentEmail } });
    if (!studentUser) {
      studentUser = await prisma.user.create({
        data: {
          email: studentEmail,
          password: hashedStudentPass,
          role: UserRole.STUDENT
        }
      });
      console.log(`  Created User: ${studentEmail}`);
    } else {
      await prisma.user.update({
        where: { id: studentUser.id },
        data: { password: hashedStudentPass }
      });
      console.log(`  Updated password for: ${studentEmail}`);
    }

    let studentProfile = await prisma.student.findUnique({
      where: { userId: studentUser.id }
    });
    if (!studentProfile) {
      studentProfile = await prisma.student.create({
        data: {
          userId: studentUser.id,
          firstName: c.firstName,
          lastName: c.lastName,
          rollNumber: c.prn,
          phone: c.phone,
          department: "Computer Science",
          batch: 2026,
          cgpa: 8.5,
          college: c.college,
          universityId: university.id,
          verificationStatus: VerificationStatus.VERIFIED,
          isProfileVerified: true
        }
      });
      console.log(`  Created Student Profile for ${c.firstName}`);
    } else {
      // Update details and verify
      await prisma.student.update({
        where: { id: studentProfile.id },
        data: {
          firstName: c.firstName,
          lastName: c.lastName,
          rollNumber: c.prn,
          phone: c.phone,
          college: c.college,
          universityId: university.id,
          verificationStatus: VerificationStatus.VERIFIED,
          isProfileVerified: true
        }
      });
      console.log(`  Updated Student Profile for ${c.firstName}`);
    }
    credentialsLog.push({
      role: "Student",
      name: `${c.firstName} ${c.lastName}`,
      email: studentEmail,
      pass: studentPass,
      phone: c.phone,
      details: `PRN: ${c.prn} | College: ${c.college}`
    });

    // 3. COMPANY USER & PROFILE
    const hashedCompanyPass = await hashPassword(companyPass);
    let companyUser = await prisma.user.findUnique({ where: { email: companyEmail } });
    if (!companyUser) {
      companyUser = await prisma.user.create({
        data: {
          email: companyEmail,
          password: hashedCompanyPass,
          role: UserRole.COMPANY
        }
      });
      console.log(`  Created User: ${companyEmail}`);
    } else {
      await prisma.user.update({
        where: { id: companyUser.id },
        data: { password: hashedCompanyPass }
      });
      console.log(`  Updated password for: ${companyEmail}`);
    }

    const companyProfile = await prisma.company.findUnique({
      where: { userId: companyUser.id }
    });
    if (!companyProfile) {
      await prisma.company.create({
        data: {
          userId: companyUser.id,
          companyName: c.companyName,
          registrationId: `REG-${Date.now().toString().slice(-6)}-${c.firstName.toUpperCase()}`,
          sector: "Technology",
          address: "GIDC Electronic Zone, Gandhinagar, Gujarat",
          website: `https://www.${c.firstName.toLowerCase()}tech.io`,
          contactPerson: `${c.firstName} ${c.lastName}`,
          contactEmail: companyEmail,
          contactPhone: c.phone,
          isApproved: true,
          isProfileComplete: true
        }
      });
      console.log(`  Created Company: ${c.companyName}`);
    } else {
      await prisma.company.update({
        where: { id: companyProfile.id },
        data: {
          companyName: c.companyName,
          contactPerson: `${c.firstName} ${c.lastName}`,
          contactPhone: c.phone,
          isApproved: true,
          isProfileComplete: true
        }
      });
      console.log(`  Updated Company: ${c.companyName}`);
    }
    credentialsLog.push({
      role: "Company",
      name: c.companyName,
      email: companyEmail,
      pass: companyPass,
      phone: c.phone,
      details: `Sector: Technology | Contact: ${c.firstName}`
    });
  }

  // Also include the existing verified accounts in the CSV/report
  credentialsLog.push(
    {
      role: "University",
      name: "The Maharaja Sayajirao University Of Baroda",
      email: "sowino010@gmail.com",
      pass: "[Already Created / Kept]",
      phone: "N/A",
      details: "Code: MSU | Status: Verified"
    },
    {
      role: "Student",
      name: "Sanjay Vasava",
      email: "sv690649@gmail.com",
      pass: "[Already Created / Kept]",
      phone: "9687566713",
      details: "Roll: BT26CSE951 | Status: Verified"
    },
    {
      role: "Company",
      name: "CodeCraft Studios",
      email: "v.chira.007@gmail.com",
      pass: "[Already Created / Kept]",
      phone: "9875115061",
      details: "Sector: Technology | Status: Verified"
    },
    {
      role: "Admin",
      name: "UniNest Core Admin",
      email: "admin@uninest.com",
      pass: "Admin@123",
      phone: "N/A",
      details: "System SaaS Super Administrator"
    }
  );

  console.log("\n✅ Seeding and account generation finished successfully.");

  // Output CSV File
  const csvHeaders = "Role,Name / Institution,Email,Password,Phone Number,Details\n";
  const csvRows = credentialsLog.map(row => 
    `"${row.role}","${row.name}","${row.email}","${row.pass}","${row.phone}","${row.details.replace(/"/g, '""')}"`
  ).join("\n");
  
  // Save in local workspace
  const workspaceCsvPath = "C:/Users/Chirag Vasava/Downloads/Personal/Final Projects/UniNest-AI-main/UniNest-AI-main/test_credentials.csv";
  fs.writeFileSync(workspaceCsvPath, csvHeaders + csvRows, "utf-8");
  console.log(`📊 Exported credentials table to: ${workspaceCsvPath}`);

  // Display Table in console
  console.log("\n=== GENERATED TEST CREDENTIALS TABLE ===");
  console.table(credentialsLog);
}

main()
  .catch((e) => {
    console.error("❌ Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
