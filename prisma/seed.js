/**
 * Prisma seed script for the job-board schema
 * (User, SeekerProfile, RecruiterProfile, Company, Job, Application, Post)
 *
 * Setup:
 *   npm install -D @faker-js/faker
 *   npm install @prisma/adapter-mariadb dotenv   (Prisma 7+ requires a driver adapter)
 *   npx prisma generate
 *
 * Run directly:
 *   node prisma/seed.js
 *
 * Or wire it up to `npx prisma db seed` by adding this to package.json:
 *   "prisma": { "seed": "node prisma/seed.js" }
 *
 * Tweak the COUNTS object below to change how much data gets created.
 * Re-running this script wipes and re-seeds all tables it manages.
 */

require('dotenv').config();

const { PrismaClient } = require('@prisma/client');
const { PrismaMariaDb } = require('@prisma/adapter-mariadb');
const { faker } = require('@faker-js/faker');

// Prisma 7+ requires an explicit driver adapter instead of connecting
// automatically from the schema's datasource url.
const adapter = new PrismaMariaDb(process.env.DATABASE_URL);
const prisma = new PrismaClient({ adapter });

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
function chance(probability) {
  return Math.random() < probability;
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function weightedPick(pairs) {
  const total = pairs.reduce((sum, [, weight]) => sum + weight, 0);
  let r = Math.random() * total;
  for (const [value, weight] of pairs) {
    if (r < weight) return value;
    r -= weight;
  }
  return pairs[pairs.length - 1][0];
}

function makeEmail(fullName, index) {
  const parts = fullName
    .toLowerCase()
    .replace(/[^a-z\s]/g, '')
    .trim()
    .split(/\s+/);
  const first = parts[0] || 'user';
  const last = parts[parts.length - 1] || 'test';
  return `${first}.${last}.${index}@example.com`;
}

function makeUsername(fullName, index) {
  const clean = fullName.toLowerCase().replace(/[^a-z\s]/g, '').replace(/\s+/g, '');
  return `${clean}${index}`;
}

function makeSlug(name, used) {
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
  'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Java', 'SQL',
  'MySQL', 'PostgreSQL', 'AWS', 'Docker', 'Kubernetes', 'GraphQL',
  'REST APIs', 'Git', 'Next.js', 'Vue.js', 'Angular', 'Go', 'Rust', 'C#',
  '.NET', 'PHP', 'Laravel', 'HTML/CSS', 'Tailwind CSS', 'Redis', 'MongoDB',
  'CI/CD', 'Agile', 'Figma', 'Product Strategy',
];

const JOB_TITLES = [
  'Frontend Engineer', 'Backend Engineer', 'Full Stack Developer',
  'DevOps Engineer', 'Data Analyst', 'Data Scientist', 'Product Manager',
  'UI/UX Designer', 'QA Engineer', 'Mobile Developer (iOS)',
  'Mobile Developer (Android)', 'Software Engineering Intern',
  'Engineering Manager', 'Site Reliability Engineer',
  'Machine Learning Engineer', 'Marketing Specialist',
  'Sales Representative', 'Customer Success Manager', 'Business Analyst',
  'Project Manager',
];

const RECRUITER_POSITIONS = [
  'Technical Recruiter', 'Talent Acquisition Specialist', 'HR Manager',
  'People Operations Lead', 'Recruiting Coordinator', 'Head of Talent',
  'HR Business Partner', 'Talent Acquisition Manager',
];

function pickSkills() {
  const count = Math.floor(Math.random() * 6) + 3; // 3-8 skills
  const shuffled = [...SKILL_POOL].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function jobDescription(title) {
  return [
    `We are looking for a talented ${title} to join our growing team.`,
    faker.lorem.paragraphs(2, '\n\n'),
    "What you'll do:",
    `- ${faker.lorem.sentence()}`,
    `- ${faker.lorem.sentence()}`,
    `- ${faker.lorem.sentence()}`,
    '',
    "What we're looking for:",
    `- ${faker.lorem.sentence()}`,
    `- ${faker.lorem.sentence()}`,
  ].join('\n');
}

let userIndex = 0;

async function main() {
  console.log('Cleaning existing data...');
  // Delete in FK-safe order (children before parents)
  await prisma.application.deleteMany();
  await prisma.post.deleteMany();
  await prisma.seekerProfile.deleteMany();
  await prisma.recruiterProfile.deleteMany();
  await prisma.job.deleteMany();
  await prisma.user.deleteMany();
  await prisma.company.deleteMany();

  // ---------------------------------------------------------------------
  // Companies
  // ---------------------------------------------------------------------
  console.log('Creating companies...');
  const usedSlugs = new Set();
  const companies = [];
  for (let i = 0; i < COUNTS.companies; i++) {
    const name = faker.company.name();
    const slug = makeSlug(name, usedSlugs);
    const company = await prisma.company.create({
      data: {
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
  console.log('Creating seeker users...');
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
        role: 'SEEKER',
        isOnboarded: chance(0.85),
        seekerProfile: {
          create: {
            headline: faker.person.jobTitle(),
            bio: faker.lorem.paragraph(),
            location: `${faker.location.city()}, ${faker.location.country()}`,
            resumeUrl: chance(0.8) ? `${faker.internet.url()}/resume.pdf` : null,
            skills: pickSkills(),
          },
        },
      },
      include: { seekerProfile: true },
    });
    seekers.push(user);
  }

  // ---------------------------------------------------------------------
  // Users: Recruiters (+ RecruiterProfile)
  // ---------------------------------------------------------------------
  console.log('Creating recruiter users...');
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
        role: 'RECRUITER',
        isOnboarded: chance(0.9),
        recruiterProfile: {
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
  console.log('Creating admin users...');
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
        role: 'ADMIN',
        isOnboarded: true,
      },
    });
    admins.push(user);
  }

  // ---------------------------------------------------------------------
  // Users: mid-onboarding (no role picked yet)
  // ---------------------------------------------------------------------
  console.log('Creating unassigned users...');
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
  console.log('Creating posts...');
  for (let i = 0; i < COUNTS.posts; i++) {
    const author = pick(allUsers);
    await prisma.post.create({
      data: {
        authorId: author.id,
        content: faker.lorem.paragraph(),
        imageUrl: chance(0.4) ? `https://picsum.photos/seed/post-${i}/600/400` : null,
      },
    });
  }

  // ---------------------------------------------------------------------
  // Jobs
  // ---------------------------------------------------------------------
  console.log('Creating jobs...');
  const jobs = [];
  for (let i = 0; i < COUNTS.jobs; i++) {
    const company = pick(companies);
    const title = pick(JOB_TITLES);
    const hasSalary = chance(0.85);
    const salaryMin = hasSalary ? faker.number.int({ min: 40, max: 120 }) * 1000 : null;
    const salaryMax = hasSalary
      ? salaryMin + faker.number.int({ min: 10, max: 60 }) * 1000
      : null;
    const job = await prisma.job.create({
      data: {
        companyId: company.id,
        title,
        description: jobDescription(title),
        location: chance(0.7)
          ? `${faker.location.city()}, ${faker.location.country()}`
          : 'Remote',
        salaryMin,
        salaryMax,
        status: weightedPick([
          ['OPEN', 0.6],
          ['DRAFT', 0.15],
          ['CLOSED', 0.25],
        ]),
      },
    });
    jobs.push(job);
  }

  // ---------------------------------------------------------------------
  // Applications (unique seeker+job pairs)
  // ---------------------------------------------------------------------
  console.log('Creating applications...');
  const usedPairs = new Set();
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
        status: weightedPick([
          ['PENDING', 0.35],
          ['REVIEW', 0.25],
          ['SHORTLISTED', 0.15],
          ['REJECTED', 0.15],
          ['HIRED', 0.1],
        ]),
        coverLetter: chance(0.7) ? faker.lorem.paragraphs(2, '\n\n') : null,
        resumeUrl:
          seeker.seekerProfile && seeker.seekerProfile.resumeUrl
            ? seeker.seekerProfile.resumeUrl
            : chance(0.5)
            ? `${faker.internet.url()}/resume.pdf`
            : null,
      },
    });
    created++;
  }

  console.log('\nSeed complete:');
  console.log(`  Companies:        ${await prisma.company.count()}`);
  console.log(`  Users:            ${await prisma.user.count()}`);
  console.log(`  SeekerProfiles:   ${await prisma.seekerProfile.count()}`);
  console.log(`  RecruiterProfiles:${await prisma.recruiterProfile.count()}`);
  console.log(`  Posts:            ${await prisma.post.count()}`);
  console.log(`  Jobs:             ${await prisma.job.count()}`);
  console.log(`  Applications:     ${created}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });