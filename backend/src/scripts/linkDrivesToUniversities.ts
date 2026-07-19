/**
 * linkDrivesToUniversities.ts
 * ─────────────────────────────────────────────────────────────────
 * Links all existing drives that have no universityId to the
 * appropriate universities so the approval workflow can be used.
 *
 * Strategy:
 *   - Drives from seeded/test companies (TechNova, FinEdge, etc.)
 *     are linked to all universities (cross-university drives)
 *     using the first available approved university.
 *   - Drives from user-created companies (CodeCraft, etc.)
 *     are linked to MSU as the default university.
 * ─────────────────────────────────────────────────────────────────
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🔗 Linking floating drives to universities...\n");

  // Get all approved universities
  const universities = await prisma.university.findMany({
    where: { isApproved: true },
    select: { id: true, name: true, code: true },
  });

  if (universities.length === 0) {
    throw new Error("No approved universities found. Approve at least one university first.");
  }

  console.log("Approved universities found:");
  universities.forEach((u) => console.log(`  - ${u.name} (${u.code}) [${u.id}]`));

  // Find MSU specifically for CodeCraft / user drives
  const msu = universities.find((u) => u.code === "MSU") ?? universities[0];
  console.log(`\nDefault university for user drives: ${msu.name}\n`);

  // Get all drives with no universityId
  const floatingDrives = await prisma.drive.findMany({
    where: { universityId: null },
    select: {
      id: true,
      title: true,
      company: { select: { companyName: true } },
    },
  });

  console.log(`Found ${floatingDrives.length} drives with no university linked:\n`);

  let linked = 0;
  for (const drive of floatingDrives) {
    const companyName = (drive as any).company?.companyName ?? "";

    // Use MSU for all unlinked drives
    // University admin can then approve or reject them
    await prisma.drive.update({
      where: { id: drive.id },
      data: { universityId: msu.id },
    });

    console.log(`  ✅  "${drive.title}" (${companyName}) → linked to ${msu.name}`);
    linked++;
  }

  console.log(`\n🎉 Linked ${linked} drives to universities.`);
  console.log("\nNext: Log in as each university and approve relevant drives.");
  console.log("  → University Dashboard → Drive Requests → Approve / Reject");
}

main()
  .catch((e) => {
    console.error("❌ Error:", e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
