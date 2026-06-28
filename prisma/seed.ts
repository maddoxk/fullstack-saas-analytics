// Seeds Postgres with a realistic analytics dataset for full-stack mode.
//   npm run seed   (after: docker compose up -d && npm run prisma:migrate)
import { PrismaClient } from "@prisma/client";
import { generateEvents } from "../lib/mock-data";

const prisma = new PrismaClient();

async function main() {
  const project = await prisma.project.upsert({
    where: { apiKey: "demo-key" },
    update: {},
    create: { name: "Demo Project", apiKey: "demo-key" },
  });

  const events = generateEvents({ days: 60, users: 800, seed: 42 });
  console.log(`Seeding ${events.length} events...`);

  // Batch insert.
  const BATCH = 1000;
  for (let i = 0; i < events.length; i += BATCH) {
    const slice = events.slice(i, i + BATCH);
    await prisma.event.createMany({
      data: slice.map((e) => ({
        projectId: project.id,
        name: e.name,
        userId: e.userId,
        timestamp: new Date(e.timestamp),
        properties: e.properties ?? {},
      })),
    });
  }
  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
