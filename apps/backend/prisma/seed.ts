import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  const employer = await prisma.user.upsert({
    where: { email: 'employer@techcorp.com' },
    update: {},
    create: {
      email: 'employer@techcorp.com',
      auth0Id: 'auth0|mock-employer-id',
      role: 'EMPLOYER',
    },
  });

  console.log(`Employer created: ${employer.email}`);

  const vacanciesData = [
    {
      title: 'Senior Frontend Engineer',
      company: 'TechCorp Inc.',
      location: 'Remote',
      salary: '5000-7000',
      type: 'Remote',
      description: 'We are looking for a React expert with experience in Next.js and Tailwind.',
      skills: ['React', 'TypeScript', 'Tailwind', 'Next.js'],
      employerId: employer.id,
    },
    {
      title: 'Backend Developer (Node.js)',
      company: 'StartupX',
      location: 'New York, NY',
      salary: '6000-8000',
      type: 'On-site',
      description: 'Join our fast-paced team building scalable APIs with NestJS.',
      skills: ['Node.js', 'NestJS', 'PostgreSQL', 'Docker'],
      employerId: employer.id,
    },
    {
      title: 'Full Stack Engineer',
      company: 'Innovate Solutions',
      location: 'Berlin, DE',
      salary: '4500-6500',
      type: 'Hybrid',
      description: 'Work on both ends of the spectrum using the MERN stack.',
      skills: ['MongoDB', 'Express', 'React', 'Node.js'],
      employerId: employer.id,
    },
    {
      title: 'DevOps Engineer',
      company: 'Cloud Systems',
      location: 'Remote',
      salary: '7000-9000',
      type: 'Remote',
      description: 'Help us manage our AWS infrastructure and CI/CD pipelines.',
      skills: ['AWS', 'Kubernetes', 'Terraform', 'CI/CD'],
      employerId: employer.id,
    },
  ];

  for (const job of vacanciesData) {
    const vacancy = await prisma.vacancy.create({
      data: job,
    });
    console.log(`Created vacancy: ${vacancy.title}`);
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
