import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const client = await prisma.client.create({
    data: {
      name: "Website Owner",
      aboutMe: "I provide top-quality services to my clients.",
      email: "test@example.com",
      services: {
        create: [
          {
            title: "Consultation",
            description: "A one-hour consultation to discuss your needs.",
            price: 100.0,
          },
          {
            title: "Full Service",
            description: "A complete package including consultation and execution.",
            price: 500.0,
          },
        ],
      },
      testimonials: {
        create: [
          {
            title: "Fantastic Service!",
            author: "John Doe",
            content: "I had an amazing experience. Highly recommend!",
          },
          {
            title: "Great Experience",
            author: "Jane Smith",
            content: "Very professional and easy to work with!",
          },
        ],
      },
      blogPosts: {
        create: [
          {
            title: "How to Choose the Right Service",
            content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit...",
          },
          {
            title: "Maximizing Your Investment",
            content: "Here are some tips to get the most value from our services...",
          },
        ],
      },
    },
    include: {
      services: true,
      testimonials: true,
      blogPosts: true,
    }
  });

  // Create an Appointment (linked to the first service)
  const appointment = await prisma.appointment.create({
    data: {
      clientFirstName: "Alice",
      clientLastName: "Johnson",
      email: "alice@example.com",
      phone: "555-1234",
      date: new Date("2025-04-01T10:00:00Z"),
      serviceId: client.services[0].id, // Link to first service
      states: "pending",
    },
  });

  console.log("Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });