/**
 * fixDriveApproval.ts
 * ─────────────────────────────────────────────────────────────────
 * Previously drives were created with isApproved = true by default.
 * This script resets all existing drives to isApproved = false
 * so they must be reviewed and approved by a university.
 *
 * Run ONCE after deploying the drive approval fix.
 * ─────────────────────────────────────────────────────────────────
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🔧 Resetting existing drives to pending approval...\n");

  // Show what we are about to change
  const allDrives = await prisma.drive.findMany({
    select: {
      id: true,
      title: true,
      isApproved: true,
      isActive: true,
      company: { select: { companyName: true } },
    },
  });

  console.log(`Found ${allDrives.length} total drives:\n`);
  console.table(
    allDrives.map((d) => ({
      title: d.title,
      company: (d as any).company?.companyName,
      isApproved: d.isApproved,
      isActive: d.isActive,
    }))
  );

  // Reset all drives to isApproved = false
  const result = await prisma.drive.updateMany({
    where: {}, // all drives
    data: { isApproved: false },
  });

  console.log(`\n✅ Reset ${result.count} drives to isApproved = false.`);
  console.log("\nNow log in as each University account and approve the relevant drives:");
  console.log("  → University Dashboard → Drive Requests → Approve");
}

main()
  .catch((e) => {
    console.error("❌ Error:", e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
