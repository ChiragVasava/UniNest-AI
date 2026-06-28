import { isValidRollNumber } from "./validators";

const DEFAULT_DEPARTMENT_CODE = "CSE";

function buildNumericSuffix(seed: string, length: number): string {
  let hash = 0;

  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) % 1000000;
  }

  const numeric = Math.abs(hash % Math.pow(10, length));
  return String(numeric).padStart(length, "0");
}

export function generateStudentRollNumber(seed: string, departmentCode = DEFAULT_DEPARTMENT_CODE): string {
  const yearSuffix = String(new Date().getFullYear()).slice(-2);
  const suffix = buildNumericSuffix(seed, 3);
  const rollNumber = `BT${yearSuffix}${departmentCode}${suffix}`;

  if (!isValidRollNumber(rollNumber)) {
    throw new Error(`Generated invalid roll number: ${rollNumber}`);
  }

  return rollNumber;
}

export function isLegacyRollNumber(value: string): boolean {
  return !isValidRollNumber(value);
}