import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Devora database on Neon Singapore...");

  // 1. Create Main Users
  const userAcel = await prisma.user.upsert({
    where: { email: "marchelinokurniawan@gmail.com" },
    update: {},
    create: {
      name: "Marchelino Kurniawan",
      email: "marchelinokurniawan@gmail.com",
      emailVerified: true,
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      title: "Founder & Fullstack Web Developer | Frontend Specialist",
      bio: "Membangun produk web berkelas dunia dengan UI/UX interaktif, performa ultra-cepat, dan arsitektur modern.",
      location: "Jakarta, Indonesia",
      timezone: "Asia/Jakarta",
      githubUsername: "acelino",
      githubUrl: "https://github.com/acelino",
      onboarded: true,
      tags: ["Next.js", "React", "TypeScript", "Tailwind CSS", "PostgreSQL", "UI/UX Design"],
      primaryStack: ["Next.js", "TypeScript", "Tailwind CSS", "Prisma"],
      availabilityHrs: 20,
      workStyle: "Async-First & Agile Collaboration",
      projectGoal: "Membangun SaaS AI & Startup Kolaboratif",
      experienceYears: 3.5,
      experienceLevel: "SENIOR",
      workPreference: "REMOTE",
      flexibleHours: true,
      availableDays: ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"],
      websiteUrl: "https://devora.id",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  const userSarah = await prisma.user.upsert({
    where: { email: "sarah.dev@example.com" },
    update: {},
    create: {
      name: "Sarah Wijaya",
      email: "sarah.dev@example.com",
      emailVerified: true,
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
      title: "Senior Backend Architect & DevOps",
      bio: "Spesialis arsitektur sistem skala besar, Go microservices, Kubernetes, dan optimasi PostgreSQL.",
      location: "Bandung, Indonesia",
      timezone: "Asia/Jakarta",
      githubUsername: "sarahwijaya",
      githubUrl: "https://github.com/sarahwijaya",
      onboarded: true,
      tags: ["Go", "Kubernetes", "PostgreSQL", "Docker", "Redis", "Kafka"],
      primaryStack: ["Go", "PostgreSQL", "Docker"],
      availabilityHrs: 15,
      workStyle: "Async-First",
      projectGoal: "High-throughput Microservices",
      experienceYears: 5,
      experienceLevel: "SENIOR",
      workPreference: "REMOTE",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  const userBudi = await prisma.user.upsert({
    where: { email: "budi.ai@example.com" },
    update: {},
    create: {
      name: "Budi Pratama",
      email: "budi.ai@example.com",
      emailVerified: true,
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      title: "AI Engineer & LLM Specialist",
      bio: "Membangun sistem RAG, AI Agent workflows, dan integrasi multi-modal models dengan Python & LangChain.",
      location: "Yogyakarta, Indonesia",
      timezone: "Asia/Jakarta",
      githubUsername: "budipratama",
      githubUrl: "https://github.com/budipratama",
      onboarded: true,
      tags: ["Python", "PyTorch", "LangChain", "FastAPI", "OpenAI", "Pinecone"],
      primaryStack: ["Python", "FastAPI", "LangChain"],
      availabilityHrs: 12,
      workStyle: "Collaborative",
      projectGoal: "Membangun AI Coding Assistant",
      experienceYears: 4,
      experienceLevel: "SENIOR",
      workPreference: "REMOTE",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  // 2. Create Follows
  await prisma.follow.upsert({
    where: { followerId_followingId: { followerId: userSarah.id, followingId: userAcel.id } },
    update: {},
    create: { followerId: userSarah.id, followingId: userAcel.id },
  });

  await prisma.follow.upsert({
    where: { followerId_followingId: { followerId: userBudi.id, followingId: userAcel.id } },
    update: {},
    create: { followerId: userBudi.id, followingId: userAcel.id },
  });

  // 3. Create Collaborative Projects
  const proj1 = await prisma.project.create({
    data: {
      title: "Devora - Platform Kolaborasi Pengembang",
      description: "Tinder & Instagram untuk Web Developer & Software Engineer di Indonesia dan Global. Membantu menemukan co-founder dan rekan project.",
      stage: "MVP",
      tags: ["Next.js", "TypeScript", "Tailwind CSS", "Neon PostgreSQL", "Prisma"],
      lookingFor: ["Backend Engineer", "DevOps Specialist", "UI/UX Designer"],
      authorId: userAcel.id,
      roles: {
        create: [
          {
            roleTitle: "Backend Microservices Architect",
            requiredSkills: ["Go", "PostgreSQL", "Redis", "Docker"],
            hoursPerWeek: 12,
            responsibilityLevel: "CORE_BUILDER",
            urgency: "IMMEDIATE",
            description: "Mendesain arsitektur database dan real-time WebSocket layer berkecepatan tinggi.",
          },
          {
            roleTitle: "AI Agent Engineer",
            requiredSkills: ["Python", "FastAPI", "OpenAI", "LangChain"],
            hoursPerWeek: 10,
            responsibilityLevel: "CORE_BUILDER",
            urgency: "NEXT_SPRINT",
            description: "Mengembangkan algoritma AI matchmaking kecocokan skill antar developer.",
          }
        ],
      },
      roadmap: {
        create: [
          { title: "Alpha Launch & Social Feeds", targetQuarter: "Q1 2026", status: "COMPLETED" },
          { title: "AI Matchmaking & Video Chat", targetQuarter: "Q2 2026", status: "IN_PROGRESS" },
          { title: "Global Team Marketplace", targetQuarter: "Q3 2026", status: "UPCOMING" },
        ],
      },
    },
  });

  const proj2 = await prisma.project.create({
    data: {
      title: "OmniAgent AI - Autonomous Code Reviewer",
      description: "AI Agent yang secara otomatis menganalisis pull request di GitHub, mendeteksi bug, security vulnerability, dan optimasi performa.",
      stage: "Ideation",
      tags: ["Python", "FastAPI", "TypeScript", "Next.js", "GitHub API"],
      lookingFor: ["Frontend Engineer", "Fullstack Developer"],
      authorId: userBudi.id,
      roles: {
        create: [
          {
            roleTitle: "Lead Frontend Engineer",
            requiredSkills: ["Next.js", "React", "TypeScript", "Tailwind CSS"],
            hoursPerWeek: 10,
            responsibilityLevel: "LEAD",
            urgency: "IMMEDIATE",
            description: "Membangun dashboard review kode yang futuristik dan interaktif.",
          }
        ],
      },
    },
  });

  // 4. Create Community Posts
  const post1 = await prisma.post.create({
    data: {
      authorId: userAcel.id,
      content: "Baru saja mengoptimalkan arsitektur rendering data di Devora! Menggunakan Neon PostgreSQL Singapore dengan parallel query execution. Latensi query turun dari 1.8 detik ke hanya ~40 milidetik! ⚡🚀 #BuildInPublic #Nextjs #PostgreSQL",
      tags: ["#BuildInPublic", "#Nextjs", "#PostgreSQL", "#Performance"],
      category: "BUILD_IN_PUBLIC",
      codeSnippet: `// Eksekusi paralel 10+ query dalam satu round-trip
const [feed, notifs, user] = await Promise.all([
  prisma.post.findMany({ take: 10 }),
  prisma.notification.findMany({ take: 10 }),
  prisma.user.findUnique({ where: { id: userId } })
]);`,
      codeLanguage: "typescript",
      projectId: proj1.id,
      likes: {
        create: [
          { userId: userSarah.id },
          { userId: userBudi.id },
        ],
      },
      comments: {
        create: [
          {
            authorId: userSarah.id,
            content: "Keren banget Acel! Latensi 40ms dari Singapore ke Jakarta sangat impresif untuk real-time apps. Mantap!",
          },
          {
            authorId: userBudi.id,
            content: "Gokil performanya! Nanti integrasikan juga dengan AI Matchmaking agent ya bro 👍",
          },
        ],
      },
    },
  });

  const post2 = await prisma.post.create({
    data: {
      authorId: userSarah.id,
      content: "Tips arsitektur database: Selalu tambahkan indeks relasional (@@index) pada foreign keys (authorId, createdAt, status). Tanpa indeks, PostgreSQL harus melakukan full-table scan yang lambat saat data membesar. #TechTips #Database",
      tags: ["#TechTips", "#Database", "#Go", "#PostgreSQL"],
      category: "TECH_TIPS",
      likes: {
        create: [{ userId: userAcel.id }],
      },
    },
  });

  // 5. Create 24-Hour Stories
  const now = new Date();
  const expires = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  await prisma.story.create({
    data: {
      authorId: userAcel.id,
      caption: "Deploying Devora with Neon Singapore 🚀 Ultra fast rendering!",
      expiresAt: expires,
    },
  });

  await prisma.story.create({
    data: {
      authorId: userSarah.id,
      caption: "Reviewing Go microservices PRs today 💻",
      expiresAt: expires,
    },
  });

  await prisma.story.create({
    data: {
      authorId: userBudi.id,
      caption: "Experimenting with multi-agent RAG pipelines 🤖",
      expiresAt: expires,
    },
  });

  // 6. Create Matches
  await prisma.match.create({
    data: {
      user1Id: userAcel.id,
      user2Id: userSarah.id,
    },
  });

  console.log("✅ Seed completed successfully! Neon database is fully populated and ready.");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
