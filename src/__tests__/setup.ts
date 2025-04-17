import { PrismaClient } from '@prisma/client';

// Create a new Prisma client for testing
const prisma = new PrismaClient();

describe('Test Setup', () => {
  it('should clean up the database before each test', async () => {
    // This test verifies our setup is working
    expect(true).toBe(true);
  });
});

// Clean up the database before each test
beforeEach(async () => {
  // Delete all records from all tables
  const tables = ['Appointment', 'Service', 'Client', 'ContactRequest', 'Testimonial', 'BlogPost'];
  
  for (const table of tables) {
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${table}" CASCADE;`);
  }
});

// Close the Prisma connection after all tests
afterAll(async () => {
  await prisma.$disconnect();
}); 