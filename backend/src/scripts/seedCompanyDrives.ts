/**
 * seedCompanyDrives.ts
 * ─────────────────────────────────────────────────────────────────
 * Creates realistic placement drives for ALL company accounts,
 * linked to ALL universities so each university placement officer
 * can approve them. Covers TEST 6.6 requirement.
 *
 * Companies seeded:
 *   - Priyanshu Tech Labs       (priyanshumakwana2003+company@gmail.com)
 *   - Krish Systems & AI        (krishpalat9+company@gmail.com)
 *   - Dhokiya Energy Solutions  (ravirajdhokiya10+company@gmail.com)
 *   - Dhuva Engineering Corp    (dhuvabharat1705+company@gmail.com)
 *   - Aakash Technologies       (aakashpatel20032003+company@gmail.com)
 *   - CodeCraft Studios         (v.chira.007@gmail.com)   ← already has drives, skip
 *   + existing seeded: TechNova, FinEdge, CloudSphere, DataMind, SecureNet, Google India
 * ─────────────────────────────────────────────────────────────────
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ── Drive templates per company ──────────────────────────────────
const DRIVES_BY_COMPANY: Record<
  string,
  Array<{
    title: string;
    description: string;
    jobDescription: string;
    salary: number;
    cgpaCutoff: number;
    eligibleDepartments: string[];
    eligibleBatches: number[];
    requiredSkills: string[];
    interviewFormat: string;
  }>
> = {
  "Priyanshu Tech Labs": [
    {
      title: "Full Stack Developer – React & Node.js",
      description: "Build and ship production features for our SaaS platform.",
      jobDescription:
        "We are looking for a passionate full-stack developer with experience in React.js and Node.js. You will work directly with the founding team to build new product features, integrate third-party APIs, and maintain code quality standards.",
      salary: 10,
      cgpaCutoff: 6.5,
      eligibleDepartments: ["CSE", "IT"],
      eligibleBatches: [2025, 2026, 2027],
      requiredSkills: ["React", "Node.js", "PostgreSQL", "REST APIs"],
      interviewFormat: "Online",
    },
    {
      title: "DevOps Engineer Intern",
      description: "Manage CI/CD pipelines and AWS infrastructure.",
      jobDescription:
        "You will be responsible for setting up and maintaining our AWS infrastructure, building robust CI/CD pipelines using GitHub Actions, and ensuring our deployments are stable and secure.",
      salary: 6,
      cgpaCutoff: 7.0,
      eligibleDepartments: ["CSE", "IT", "EC"],
      eligibleBatches: [2026, 2027],
      requiredSkills: ["AWS", "Docker", "GitHub Actions", "Linux"],
      interviewFormat: "Online",
    },
  ],

  "Krish Systems & AI": [
    {
      title: "Machine Learning Engineer",
      description: "Build and deploy ML models for real-world business problems.",
      jobDescription:
        "Krish Systems & AI is looking for an ML Engineer who can take models from research to production. You will work on NLP, computer vision, and recommendation systems projects using Python, PyTorch, and GCP.",
      salary: 14,
      cgpaCutoff: 7.5,
      eligibleDepartments: ["CSE", "IT", "AI/ML"],
      eligibleBatches: [2025, 2026, 2027],
      requiredSkills: ["Python", "PyTorch", "scikit-learn", "GCP", "MLflow"],
      interviewFormat: "Online",
    },
    {
      title: "Data Science Analyst",
      description: "Transform raw data into actionable business insights.",
      jobDescription:
        "You will design and execute data analysis pipelines, build dashboards, and work with stakeholders to translate data findings into business strategy.",
      salary: 9,
      cgpaCutoff: 6.0,
      eligibleDepartments: ["CSE", "IT", "Mathematics"],
      eligibleBatches: [2026, 2027],
      requiredSkills: ["Python", "SQL", "Tableau", "Statistics"],
      interviewFormat: "Hybrid",
    },
  ],

  "Dhokiya Energy Solutions": [
    {
      title: "Embedded Systems Engineer",
      description: "Design firmware for IoT energy monitoring devices.",
      jobDescription:
        "You will develop low-level firmware for our smart energy meters and IoT gateways using C/C++ and FreeRTOS. Experience with UART, SPI, I2C communication protocols is required.",
      salary: 8,
      cgpaCutoff: 6.5,
      eligibleDepartments: ["EC", "EE", "CSE"],
      eligibleBatches: [2025, 2026, 2027],
      requiredSkills: ["C", "C++", "FreeRTOS", "UART", "SPI", "IoT"],
      interviewFormat: "Offline",
    },
    {
      title: "Software Engineer – Energy Analytics Platform",
      description: "Build backend APIs for energy data analytics.",
      jobDescription:
        "Join our platform team to build scalable APIs that power our energy analytics dashboard. You will work with time-series databases, data streaming pipelines, and REST/GraphQL APIs.",
      salary: 11,
      cgpaCutoff: 7.0,
      eligibleDepartments: ["CSE", "IT"],
      eligibleBatches: [2026, 2027],
      requiredSkills: ["Python", "TimescaleDB", "Kafka", "REST API", "Docker"],
      interviewFormat: "Online",
    },
  ],

  "Dhuva Engineering Corp": [
    {
      title: "Mechanical Design Engineer – CAD",
      description: "Design precision mechanical components using SolidWorks.",
      jobDescription:
        "You will create detailed 3D models and technical drawings of mechanical assemblies. Collaborate with the manufacturing team to ensure designs are production-ready.",
      salary: 7,
      cgpaCutoff: 6.0,
      eligibleDepartments: ["Mechanical", "Production", "Civil"],
      eligibleBatches: [2025, 2026, 2027],
      requiredSkills: ["SolidWorks", "AutoCAD", "GD&T", "Manufacturing Processes"],
      interviewFormat: "Offline",
    },
    {
      title: "Software Engineer – Industrial Automation",
      description: "Develop SCADA and PLC automation software.",
      jobDescription:
        "Design, develop, and maintain industrial automation software. You will work on SCADA systems, PLC programming, and integration with enterprise systems.",
      salary: 9,
      cgpaCutoff: 6.5,
      eligibleDepartments: ["CSE", "EC", "EE"],
      eligibleBatches: [2026, 2027],
      requiredSkills: ["PLC Programming", "SCADA", "Python", "Industrial IoT"],
      interviewFormat: "Hybrid",
    },
  ],

  "Aakash Technologies": [
    {
      title: "Cloud Solutions Architect – Associate",
      description: "Design and implement AWS/GCP cloud architectures.",
      jobDescription:
        "You will assist senior architects in designing cloud infrastructure for enterprise clients. Responsibilities include cost optimization, security hardening, and multi-region deployments.",
      salary: 13,
      cgpaCutoff: 7.0,
      eligibleDepartments: ["CSE", "IT"],
      eligibleBatches: [2025, 2026, 2027],
      requiredSkills: ["AWS", "GCP", "Terraform", "Kubernetes", "Security"],
      interviewFormat: "Online",
    },
    {
      title: "Mobile App Developer – Flutter",
      description: "Build cross-platform mobile apps for Android and iOS.",
      jobDescription:
        "Develop, test, and publish Flutter-based mobile applications. You will collaborate with UI/UX designers and backend engineers to deliver seamless user experiences.",
      salary: 8,
      cgpaCutoff: 6.0,
      eligibleDepartments: ["CSE", "IT"],
      eligibleBatches: [2026, 2027],
      requiredSkills: ["Flutter", "Dart", "Firebase", "REST APIs", "Git"],
      interviewFormat: "Online",
    },
  ],
};

// ── Main ─────────────────────────────────────────────────────────
async function main() {
  console.log("🚀 Seeding drives for all company accounts...\n");

  // Fetch all approved universities
  const universities = await prisma.university.findMany({
    where: { isApproved: true },
    select: { id: true, name: true, code: true },
  });

  if (universities.length === 0) {
    throw new Error("No approved universities found. Approve at least one first.");
  }

  console.log(`Found ${universities.length} universities:\n`);
  universities.forEach((u) => console.log(`  ${u.code} — ${u.name}`));
  console.log("");

  // Fetch all companies
  const companies = await prisma.company.findMany({
    select: { id: true, companyName: true, userId: true },
  });

  console.log(`Found ${companies.length} companies:\n`);
  companies.forEach((c) => console.log(`  ${c.companyName} [${c.id}]`));
  console.log("");

  let totalCreated = 0;
  let totalSkipped = 0;

  for (const company of companies) {
    const templates = DRIVES_BY_COMPANY[company.companyName];

    if (!templates || templates.length === 0) {
      console.log(`  ⏩  No templates defined for "${company.companyName}" — skipping`);
      totalSkipped++;
      continue;
    }

    console.log(`\n📌 Company: ${company.companyName}`);

    for (const template of templates) {
      for (const university of universities) {
        // Check if this drive already exists for this company+university
        const existing = await prisma.drive.findFirst({
          where: {
            companyId: company.id,
            universityId: university.id,
            title: template.title,
          },
        });

        if (existing) {
          console.log(
            `   ⚠️  "${template.title}" → ${university.code} — already exists, skipping`
          );
          totalSkipped++;
          continue;
        }

        await prisma.drive.create({
          data: {
            companyId: company.id,
            universityId: university.id,
            title: template.title,
            description: template.description,
            jobDescription: template.jobDescription,
            salary: template.salary,
            cgpaCutoff: template.cgpaCutoff,
            eligibleDepartments: template.eligibleDepartments,
            eligibleBatches: template.eligibleBatches,
            requiredSkills: template.requiredSkills,
            interviewFormat: template.interviewFormat,
            isActive: true,
            isApproved: false, // must be approved by university
          },
        });

        console.log(`   ✅  "${template.title}" → ${university.code}`);
        totalCreated++;
      }
    }
  }

  console.log(`\n${"─".repeat(60)}`);
  console.log(`✅ Created: ${totalCreated} drives`);
  console.log(`⏩ Skipped: ${totalSkipped} (already exist or no template)`);
  console.log(`\nNext: Log in as each University and approve relevant drives.`);
  console.log(`  → University Dashboard → Drive Requests → Approve`);
}

main()
  .catch((e) => {
    console.error("❌ Error:", e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
