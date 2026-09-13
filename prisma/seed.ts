/**
 * Prisma seed script for the job-board schema
 * (User, SeekerProfile, RecruiterProfile, Company, Job, Application, Post)
 *
 * Setup:
 *   npm install -D @faker-js/faker tsx
 *   npm install @prisma/adapter-mariadb dotenv   (Prisma 7+ requires a driver adapter)
 *   npx prisma generate
 *
 * Run directly:
 *   npx tsx prisma/seed.ts
 *
 * Or wire it up to `npx prisma db seed` via prisma.config.ts:
 *   migrations: {
 *     path: "prisma/migrations",
 *     seed: "tsx prisma/seed.ts",
 *   }
 *
 * Tweak the COUNTS object below to change how much data gets created.
 * Re-running this script wipes and re-seeds all tables it manages.
 */

import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { faker } from "@faker-js/faker";

// Prisma 7+ requires an explicit driver adapter instead of connecting
// automatically from the schema's datasource url.
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL is not set");
}
const adapter = new PrismaMariaDb(databaseUrl);
const prisma = new PrismaClient({ adapter });

// ---------------------------------------------------------------------------
// Enum literal types — must match schema.prisma exactly
// ---------------------------------------------------------------------------
type JobStatusValue = "DRAFT" | "OPEN" | "CLOSED";
type JobTypeValue =
  | "FULL_TIME"
  | "PART_TIME"
  | "CONTRACT"
  | "INTERNSHIP"
  | "TEMPORARY";
type ApplicationStatusValue =
  | "PENDING"
  | "REVIEW"
  | "SHORTLISTED"
  | "REJECTED"
  | "HIRED";

// ---------------------------------------------------------------------------
// Config — change these numbers to control how much dummy data gets created
// ---------------------------------------------------------------------------
const COUNTS = {
  companies: 15,
  seekers: 30,
  recruiters: 15,
  admins: 5,
  unassigned: 5, // users mid-onboarding: role: null, isOnboarded: false
  posts: 40,
  jobs: 30,
  applications: 70,
};

// ---------------------------------------------------------------------------
// Small helpers (kept dependency-light so this doesn't break across faker versions)
// ---------------------------------------------------------------------------
function chance(probability: number): boolean {
  return Math.random() < probability;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function weightedPick<T>(pairs: Array<[T, number]>): T {
  const total = pairs.reduce((sum, [, weight]) => sum + weight, 0);
  let r = Math.random() * total;
  for (const [value, weight] of pairs) {
    if (r < weight) return value;
    r -= weight;
  }
  return pairs[pairs.length - 1][0];
}

function makeEmail(fullName: string, index: number): string {
  const parts = fullName
    .toLowerCase()
    .replace(/[^a-z\s]/g, "")
    .trim()
    .split(/\s+/);
  const first = parts[0] || "user";
  const last = parts[parts.length - 1] || "test";
  return `${first}.${last}.${index}@example.com`;
}

function makeUsername(fullName: string, index: number): string {
  const clean = fullName
    .toLowerCase()
    .replace(/[^a-z\s]/g, "")
    .replace(/\s+/g, "");
  return `${clean}${index}`;
}

function makeSlug(name: string, used: Set<string>): string {
  const base = faker.helpers.slugify(name).toLowerCase();
  let slug = base;
  let i = 1;
  while (used.has(slug)) {
    slug = `${base}-${i++}`;
  }
  used.add(slug);
  return slug;
}

const SKILL_POOL = [
  "JavaScript",
  "TypeScript",
  "React",
  "Node.js",
  "Python",
  "Java",
  "SQL",
  "MySQL",
  "PostgreSQL",
  "AWS",
  "Docker",
  "Kubernetes",
  "GraphQL",
  "REST APIs",
  "Git",
  "Next.js",
  "Vue.js",
  "Angular",
  "Go",
  "Rust",
  "C#",
  ".NET",
  "PHP",
  "Laravel",
  "HTML/CSS",
  "Tailwind CSS",
  "Redis",
  "MongoDB",
  "CI/CD",
  "Agile",
  "Figma",
  "Product Strategy",
];

const JOB_TITLES = [
  "Frontend Engineer",
  "Backend Engineer",
  "Full Stack Developer",
  "DevOps Engineer",
  "Data Analyst",
  "Data Scientist",
  "Product Manager",
  "UI/UX Designer",
  "QA Engineer",
  "Mobile Developer (iOS)",
  "Mobile Developer (Android)",
  "Software Engineering Intern",
  "Engineering Manager",
  "Site Reliability Engineer",
  "Machine Learning Engineer",
  "Marketing Specialist",
  "Sales Representative",
  "Customer Success Manager",
  "Business Analyst",
  "Project Manager",
];

const RECRUITER_POSITIONS = [
  "Technical Recruiter",
  "Talent Acquisition Specialist",
  "HR Manager",
  "People Operations Lead",
  "Recruiting Coordinator",
  "Head of Talent",
  "HR Business Partner",
  "Talent Acquisition Manager",
];

function pickSkills(): string[] {
  const count = Math.floor(Math.random() * 6) + 3; // 3-8 skills
  const shuffled = [...SKILL_POOL].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function jobDescription(title: string): string {
  return [
    `We are looking for a talented ${title} to join our growing team.`,
    faker.lorem.paragraphs(2, "\n\n"),
    "What you'll do:",
    `- ${faker.lorem.sentence()}`,
    `- ${faker.lorem.sentence()}`,
    `- ${faker.lorem.sentence()}`,
    "",
    "What we're looking for:",
    `- ${faker.lorem.sentence()}`,
    `- ${faker.lorem.sentence()}`,
  ].join("\n");
}

function pickJobType(): JobTypeValue {
  return weightedPick<JobTypeValue>([
    ["FULL_TIME", 0.6],
    ["PART_TIME", 0.15],
    ["CONTRACT", 0.15],
    ["INTERNSHIP", 0.07],
    ["TEMPORARY", 0.03],
  ]);
}

function pickRequirements(): string[] {
  const count = Math.floor(Math.random() * 4) + 3; // 3-6 items
  const experienceLines = [
    `${faker.number.int({ min: 1, max: 8 })}+ years of professional experience`,
    "Strong communication and collaboration skills",
    "Comfortable working in a fast-paced, cross-functional team",
    "Bachelor's degree in a related field or equivalent experience",
  ];
  const skillLines = pickSkills().map((skill) => `Proficiency in ${skill}`);
  const pool = [...experienceLines, ...skillLines];
  return pool.sort(() => 0.5 - Math.random()).slice(0, count);
}

let userIndex = 0;

async function main(): Promise<void> {
  console.log("Cleaning existing data...");
  // Delete in FK-safe order (children before parents)
  await prisma.application.deleteMany();
  await prisma.post.deleteMany();
  await prisma.seekerprofile.deleteMany();
  await prisma.recruiterprofile.deleteMany();
  await prisma.job.deleteMany();
  await prisma.user.deleteMany();
  await prisma.company.deleteMany();

  // ---------------------------------------------------------------------
  // Companies
  // ---------------------------------------------------------------------
  console.log("Creating companies...");
  const usedSlugs = new Set<string>();
  const companies = [];
  for (let i = 0; i < COUNTS.companies; i++) {
    const name = faker.company.name();
    const slug = makeSlug(name, usedSlugs);
    const company = await prisma.company.create({
      data: {
        id: faker.string.uuid(),
        name,
        slug,
        logoUrl: `https://picsum.photos/seed/${slug}/300/300`,
        website: faker.internet.url(),
        location: `${faker.location.city()}, ${faker.location.country()}`,
        description: `${faker.company.catchPhrase()}. ${faker.lorem.paragraph()}`,
      },
    });
    companies.push(company);
  }

  // ---------------------------------------------------------------------
  // Users: Seekers (+ SeekerProfile)
  // ---------------------------------------------------------------------
  console.log("Creating seeker users...");
  const seekers = [];
  for (let i = 0; i < COUNTS.seekers; i++) {
    const name = faker.person.fullName();
    userIndex++;
    const email = makeEmail(name, userIndex);
    const user = await prisma.user.create({
      data: {
        email,
        googleId: faker.string.uuid(),
        username: chance(0.9) ? makeUsername(name, userIndex) : null,
        name,
        avatarUrl: `https://i.pravatar.cc/300?u=${encodeURIComponent(email)}`,
        role: "SEEKER",
        isOnboarded: chance(0.85),
        seekerprofile: {
          create: {
            headline: faker.person.jobTitle(),
            bio: faker.lorem.paragraph(),
            location: `${faker.location.city()}, ${faker.location.country()}`,
            resumeUrl: chance(0.8)
              ? `${faker.internet.url()}/resume.pdf`
              : null,
            skills: pickSkills(),
          },
        },
      },
      include: { seekerprofile: true },
    });
    seekers.push(user);
  }

  // ---------------------------------------------------------------------
  // Users: Recruiters (+ RecruiterProfile)
  // ---------------------------------------------------------------------
  console.log("Creating recruiter users...");
  const recruiters = [];
  for (let i = 0; i < COUNTS.recruiters; i++) {
    const name = faker.person.fullName();
    userIndex++;
    const email = makeEmail(name, userIndex);
    const company = chance(0.85) ? pick(companies) : null;
    const user = await prisma.user.create({
      data: {
        email,
        googleId: faker.string.uuid(),
        username: chance(0.9) ? makeUsername(name, userIndex) : null,
        name,
        avatarUrl: `https://i.pravatar.cc/300?u=${encodeURIComponent(email)}`,
        role: "RECRUITER",
        isOnboarded: chance(0.9),
        recruiterprofile: {
          create: {
            companyId: company ? company.id : undefined,
            position: pick(RECRUITER_POSITIONS),
          },
        },
      },
    });
    recruiters.push(user);
  }

  // ---------------------------------------------------------------------
  // Users: Admins
  // ---------------------------------------------------------------------
  console.log("Creating admin users...");
  const admins = [];
  for (let i = 0; i < COUNTS.admins; i++) {
    const name = faker.person.fullName();
    userIndex++;
    const email = makeEmail(name, userIndex);
    const user = await prisma.user.create({
      data: {
        email,
        googleId: faker.string.uuid(),
        username: makeUsername(name, userIndex),
        name,
        avatarUrl: `https://i.pravatar.cc/300?u=${encodeURIComponent(email)}`,
        role: "ADMIN",
        isOnboarded: true,
      },
    });
    admins.push(user);
  }

  // ---------------------------------------------------------------------
  // Users: mid-onboarding (no role picked yet)
  // ---------------------------------------------------------------------
  console.log("Creating unassigned users...");
  const unassigned = [];
  for (let i = 0; i < COUNTS.unassigned; i++) {
    const name = faker.person.fullName();
    userIndex++;
    const email = makeEmail(name, userIndex);
    const user = await prisma.user.create({
      data: {
        email,
        googleId: faker.string.uuid(),
        username: null,
        name,
        avatarUrl: `https://i.pravatar.cc/300?u=${encodeURIComponent(email)}`,
        role: null,
        isOnboarded: false,
      },
    });
    unassigned.push(user);
  }

  const allUsers = [...seekers, ...recruiters, ...admins, ...unassigned];

  // ---------------------------------------------------------------------
  // Posts (any user can author a post)
  // ---------------------------------------------------------------------
  console.log("Creating posts...");
  for (let i = 0; i < COUNTS.posts; i++) {
    const author = pick(allUsers);
    await prisma.post.create({
      data: {
        authorId: author.id,
        content: faker.lorem.paragraph(),
        imageUrl: chance(0.4)
          ? `https://picsum.photos/seed/post-${i}/600/400`
          : null,
      },
    });
  }

  // ---------------------------------------------------------------------
  // Jobs
  // ---------------------------------------------------------------------
  console.log("Creating jobs...");
  const jobs = [];
  for (let i = 0; i < COUNTS.jobs; i++) {
    const company = pick(companies);
    const title = pick(JOB_TITLES);
    const hasSalary = chance(0.85);
    const salaryMin = hasSalary
      ? faker.number.int({ min: 40, max: 120 }) * 1000
      : null;
    const salaryMax =
      hasSalary && salaryMin !== null
        ? salaryMin + faker.number.int({ min: 10, max: 60 }) * 1000
        : null;

    const job = await prisma.job.create({
      data: {
        companyId: company.id,
        title,
        description: jobDescription(title),
        location: chance(0.7)
          ? `${faker.location.city()}, ${faker.location.country()}`
          : "Remote",
        salaryMin,
        salaryMax,
        status: weightedPick<JobStatusValue>([
          ["OPEN", 0.6],
          ["DRAFT", 0.15],
          ["CLOSED", 0.25],
        ]),
        type: pickJobType(),
        requirements: pickRequirements(),
      },
    });
    jobs.push(job);
  }

  // ---------------------------------------------------------------------
  // Applications (unique seeker+job pairs)
  // ---------------------------------------------------------------------
  console.log("Creating applications...");
  const usedPairs = new Set<string>();
  let created = 0;
  let attempts = 0;
  const maxAttempts = COUNTS.applications * 20;
  while (created < COUNTS.applications && attempts < maxAttempts) {
    attempts++;
    const seeker = pick(seekers);
    const job = pick(jobs);
    const key = `${seeker.id}:${job.id}`;
    if (usedPairs.has(key)) continue;
    usedPairs.add(key);

    await prisma.application.create({
      data: {
        seekerId: seeker.id,
        jobId: job.id,
        status: weightedPick<ApplicationStatusValue>([
          ["PENDING", 0.35],
          ["REVIEW", 0.25],
          ["SHORTLISTED", 0.15],
          ["REJECTED", 0.15],
          ["HIRED", 0.1],
        ]),
        coverLetter: chance(0.7) ? faker.lorem.paragraphs(2, "\n\n") : null,
        resumeUrl:
          seeker.seekerprofile && seeker.seekerprofile.resumeUrl
            ? seeker.seekerprofile.resumeUrl
            : chance(0.5)
              ? `${faker.internet.url()}/resume.pdf`
              : null,
      },
    });
    created++;
  }

  console.log("\nSeed complete:");
  console.log(`  Companies:        ${await prisma.company.count()}`);
  console.log(`  Users:            ${await prisma.user.count()}`);
  console.log(`  SeekerProfiles:   ${await prisma.seekerprofile.count()}`);
  console.log(`  RecruiterProfiles:${await prisma.recruiterprofile.count()}`);
  console.log(`  Posts:            ${await prisma.post.count()}`);
  console.log(`  Jobs:             ${await prisma.job.count()}`);
  console.log(`  Applications:     ${created}`);
}

main()
  .catch((e: unknown) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
