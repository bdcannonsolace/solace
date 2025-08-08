import "dotenv/config";
import { seedAdvocates } from "./advocates";

const main = async () => {
  try {
    console.log("Seeding database...");

    // Seed stuff here
    await seedAdvocates();

    console.log("Database seeded successfully");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

main();
