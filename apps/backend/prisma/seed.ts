import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  const techCorpEmployer = await prisma.user.upsert({
    where: { email: 'employer@techcorp.com' },
    update: {},
    create: {
      email: 'employer@techcorp.com',
      auth0Id: 'auth0|mock-techcorp-id',
      role: 'EMPLOYER',
    },
  });

  const startupXEmployer = await prisma.user.upsert({
    where: { email: 'employer@startupx.com' },
    update: {},
    create: {
      email: 'employer@startupx.com',
      auth0Id: 'auth0|mock-startupx-id',
      role: 'EMPLOYER',
    },
  });

  const innovateSolutionsEmployer = await prisma.user.upsert({
    where: { email: 'employer@innovate.com' },
    update: {},
    create: {
      email: 'employer@innovate.com',
      auth0Id: 'auth0|mock-innovate-id',
      role: 'EMPLOYER',
    },
  });

  const cloudSystemsEmployer = await prisma.user.upsert({
    where: { email: 'employer@cloudsys.com' },
    update: {},
    create: {
      email: 'employer@cloudsys.com',
      auth0Id: 'auth0|mock-cloudsys-id',
      role: 'EMPLOYER',
    },
  });

  const globalConnectEmployer = await prisma.user.upsert({
    where: { email: 'employer@globalconnect.com' },
    update: {},
    create: {
      email: 'employer@globalconnect.com',
      auth0Id: 'auth0|mock-globalconnect-id',
      role: 'EMPLOYER',
    },
  });

  console.log('👤 Employers created.');

  const vacanciesData = [
    {
      title: 'Senior Frontend Engineer (React/Next.js)',
      company: 'TechCorp Inc.',
      location: 'Remote',
      salary: '5000-7000',
      type: 'Remote',
      description: 'We are seeking a highly skilled Senior Frontend Engineer with extensive experience in React, Next.js, and modern CSS frameworks like Tailwind CSS. You will be responsible for designing and implementing scalable, high-performance web applications, contributing to architectural decisions, and mentoring junior team members. A strong understanding of UI/UX principles and state management is essential.',
      skills: ['React', 'TypeScript', 'Tailwind', 'Next.js', 'GraphQL', 'Redux'],
      employerId: techCorpEmployer.id,
    },
    {
      title: 'Lead Backend Developer (Node.js/NestJS)',
      company: 'StartupX',
      location: 'New York, NY',
      salary: '7000-9500',
      type: 'On-site',
      description: 'Join our innovative startup as a Lead Backend Developer to build and scale robust API services using Node.js and NestJS. You will lead a small team, define best practices, and work closely with product and frontend teams to deliver cutting-edge solutions. Expertise in PostgreSQL, Docker, and microservices architecture is required.',
      skills: ['Node.js', 'NestJS', 'PostgreSQL', 'Docker', 'Kubernetes', 'AWS'],
      employerId: startupXEmployer.id,
    },
    {
      title: 'Senior Full Stack Engineer (MERN)',
      company: 'Innovate Solutions',
      location: 'Berlin, DE',
      salary: '4500-6500',
      type: 'Hybrid',
      description: 'We are looking for a versatile Senior Full Stack Engineer to contribute to both frontend and backend development of our core product. You will work with MongoDB, Express, React, and Node.js to create seamless user experiences and powerful server-side logic. Experience with agile methodologies and a passion for new technologies are highly valued.',
      skills: ['MongoDB', 'Express', 'React', 'Node.js', 'GraphQL', 'AWS'],
      employerId: innovateSolutionsEmployer.id,
    },
    {
      title: 'Senior DevOps Engineer',
      company: 'Cloud Systems',
      location: 'Remote',
      salary: '7000-9000',
      type: 'Remote',
      description: 'As a Senior DevOps Engineer, you will be instrumental in maintaining and improving our cloud infrastructure on AWS. Responsibilities include managing CI/CD pipelines, automating deployments with Terraform, and orchestrating containerized applications with Kubernetes. Strong scripting skills and a commitment to infrastructure-as-code are a must.',
      skills: ['AWS', 'Kubernetes', 'Terraform', 'CI/CD', 'Python', 'Ansible'],
      employerId: cloudSystemsEmployer.id,
    },

    {
      title: 'Middle Java Developer',
      company: 'Global Connect',
      location: 'London, UK',
      salary: '3500-5000',
      type: 'Hybrid',
      description: 'We are seeking an experienced Middle Java Developer to join our growing engineering team. You will be responsible for developing and maintaining high-performance backend services. Proficiency in Spring Boot, RESTful APIs, and database technologies like MySQL is expected. Experience with microservices architecture is a plus.',
      skills: ['Java', 'Spring Boot', 'MySQL', 'RESTful APIs', 'Maven'],
      employerId: globalConnectEmployer.id,
    },
    {
      title: 'Middle QA Engineer',
      company: 'TechCorp Inc.',
      location: 'On-site, Kyiv, UA',
      salary: '2000-3500',
      type: 'On-site',
      description: 'As a Middle QA Engineer, you will play a crucial role in ensuring the quality of our software products. You will design and execute test plans, identify and report bugs, and work closely with development teams to ensure timely delivery of high-quality features. Experience with automated testing frameworks (e.g., Selenium, Cypress) is highly desirable.',
      skills: ['Manual Testing', 'Automated Testing', 'Jira', 'SQL', 'Selenium'],
      employerId: techCorpEmployer.id,
    },
    {
      title: 'Middle UI/UX Designer',
      company: 'Innovate Solutions',
      location: 'Berlin, DE',
      salary: '3000-4500',
      type: 'Hybrid',
      description: 'We are looking for a creative Middle UI/UX Designer to enhance the user experience of our web and mobile applications. You will be involved in the entire design process, from user research and wireframing to prototyping and high-fidelity mockups. Proficiency in Figma, Adobe XD, or Sketch is required.',
      skills: ['Figma', 'UI Design', 'UX Research', 'Prototyping', 'User Flows'],
      employerId: innovateSolutionsEmployer.id,
    },

    {
      title: 'Junior Frontend Developer',
      company: 'StartupX',
      location: 'New York, NY',
      salary: '1500-2500',
      type: 'On-site',
      description: 'Kickstart your career as a Junior Frontend Developer at StartupX. You will work on building user interfaces using React and modern web technologies under the guidance of senior developers. A basic understanding of HTML, CSS, JavaScript, and React is essential. This is a great opportunity to learn and grow in a dynamic environment.',
      skills: ['React', 'JavaScript', 'HTML', 'CSS', 'Git'],
      employerId: startupXEmployer.id,
    },
    {
      title: 'Junior Data Analyst',
      company: 'Global Connect',
      location: 'Remote',
      salary: '1800-3000',
      type: 'Remote',
      description: 'Join our data team as a Junior Data Analyst. You will assist in collecting, cleaning, and analyzing large datasets to derive actionable insights. Basic proficiency in SQL and Excel is required, and any experience with Python or R is a plus. Strong analytical skills and attention to detail are key.',
      skills: ['SQL', 'Excel', 'Data Cleaning', 'Python', 'Data Visualization'],
      employerId: globalConnectEmployer.id,
    },
    {
      title: 'Junior Mobile Developer (Flutter)',
      company: 'Cloud Systems',
      location: 'Hybrid, Kyiv, UA',
      salary: '1700-2800',
      type: 'Hybrid',
      description: 'We are looking for a motivated Junior Mobile Developer to work on our cross-platform mobile applications using Flutter. You will be involved in developing new features, debugging, and improving application performance. A foundational understanding of Dart and Flutter framework is necessary.',
      skills: ['Flutter', 'Dart', 'Mobile Development', 'Firebase'],
      employerId: cloudSystemsEmployer.id,
    },
  ];

  for (const job of vacanciesData) {
    const existingVacancy = await prisma.vacancy.findFirst({
      where: {
        title: job.title,
        company: job.company,
      },
    });

    if (!existingVacancy) {
      const vacancy = await prisma.vacancy.create({
        data: job,
      });
      console.log(`📝 Created vacancy: ${vacancy.title} (${vacancy.company})`);
    } else {
      console.log(`➡️ Vacancy already exists: ${existingVacancy.title} (${existingVacancy.company})`);
    }
  }

  console.log('✅ Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });