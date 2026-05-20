import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');


  console.log('🧠 Seeding AI Vocabulary (Master Skills)...');
  const baseVocabulary =[
    'JavaScript', 'TypeScript', 'HTML5', 'CSS3', 'React', 'Angular', 'Vue.js', 
    'Node.js', 'NestJS', 'Express', 'Python', 'Django', 'FastAPI', 'Java', 'Spring Boot', 
    'PostgreSQL', 'MongoDB', 'MySQL', 'Redis', 'Docker', 'Kubernetes', 'AWS', 
    'Terraform', 'CI/CD', 'Git', 'Figma', 'Redux', 'GraphQL', 'Tailwind', 'Selenium', 
    'Manual Testing', 'Automated Testing', 'Jira', 'SQL', 'Dart', 'Flutter', 'Firebase',
    'Data Cleaning', 'Data Visualization', 'Excel', 'UI Design', 'UX Research', 'Prototyping'
  ];

  for (const skill of baseVocabulary) {
    await prisma.masterSkill.upsert({
      where: { name: skill },
      update: {},
      create: { name: skill },
    });
  }
  console.log(' AI Vocabulary seeded.');

  const techCorpEmployer = await prisma.user.upsert({
    where: { email: 'employer@techcorp.com' },
    update: {},
    create: { email: 'employer@techcorp.com', auth0Id: 'auth0|mock-techcorp-id', role: 'EMPLOYER' },
  });

  const startupXEmployer = await prisma.user.upsert({
    where: { email: 'employer@startupx.com' },
    update: {},
    create: { email: 'employer@startupx.com', auth0Id: 'auth0|mock-startupx-id', role: 'EMPLOYER' },
  });

  const innovateSolutionsEmployer = await prisma.user.upsert({
    where: { email: 'employer@innovate.com' },
    update: {},
    create: { email: 'employer@innovate.com', auth0Id: 'auth0|mock-innovate-id', role: 'EMPLOYER' },
  });

  const cloudSystemsEmployer = await prisma.user.upsert({
    where: { email: 'employer@cloudsys.com' },
    update: {},
    create: { email: 'employer@cloudsys.com', auth0Id: 'auth0|mock-cloudsys-id', role: 'EMPLOYER' },
  });

  const globalConnectEmployer = await prisma.user.upsert({
    where: { email: 'employer@globalconnect.com' },
    update: {},
    create: { email: 'employer@globalconnect.com', auth0Id: 'auth0|mock-globalconnect-id', role: 'EMPLOYER' },
  });

  console.log('👤 Employers created.');

  const vacanciesData =[
    {
      title: 'Senior Frontend Engineer (React/Next.js)',
      company: 'TechCorp Inc.',
      location: 'Remote',
      salary: '5000-7000',
      type: 'Remote',
      description: 'We are seeking a highly skilled Senior Frontend Engineer with extensive experience in React, Next.js, and modern CSS frameworks like Tailwind CSS.',
      skills: ['React', 'TypeScript', 'Tailwind', 'Next.js', 'GraphQL', 'Redux'],
      employerId: techCorpEmployer.id,
      seedQuestions:[
        { text: "This is a fully remote role. Are you comfortable with working 100% from home?", options:["Yes, I am comfortable and equipped for remote work", "No, I prefer an office environment"], correct: "Yes, I am comfortable and equipped for remote work" },
        { text: "Our team's core hours are 10:00 to 16:00 UTC. Can you commit to being available during these hours?", options: ["Yes, these hours work for my schedule", "No, I would require different hours"], correct: "Yes, these hours work for my schedule" },
        { text: "The salary range for this position is $5,000 - $7,000 monthly. Does this align with your expectations?", options:["Yes, it aligns with my expectations", "No, my expectations are different"], correct: "Yes, it aligns with my expectations" }
      ]
    },
    {
      title: 'Lead Backend Developer (Node.js/NestJS)',
      company: 'StartupX',
      location: 'New York, NY',
      salary: '7000-9500',
      type: 'On-site',
      description: 'Join our innovative startup as a Lead Backend Developer to build and scale robust API services using Node.js and NestJS.',
      skills:['Node.js', 'NestJS', 'PostgreSQL', 'Docker', 'Kubernetes', 'AWS'],
      employerId: startupXEmployer.id,
      seedQuestions:[
        { text: "This is a full-time, on-site role in our New York office. Are you able to reliably commute to this location?", options:["Yes, I can commute to the New York office", "No, I am looking for a remote or hybrid role"], correct: "Yes, I can commute to the New York office" },
        { text: "Are you legally authorized to work in the United States?", options:["Yes", "No, I would require sponsorship"], correct: "Yes" },
        { text: "This role requires occasional on-call availability for emergencies. Are you comfortable with this?", options:["Yes, I am available for on-call rotations", "No, I am not available for on-call work"], correct: "Yes, I am available for on-call rotations" }
      ]
    },
    {
      title: 'Senior Full Stack Engineer (MERN)',
      company: 'Innovate Solutions',
      location: 'Berlin, DE',
      salary: '4500-6500',
      type: 'Hybrid',
      description: 'We are looking for a versatile Senior Full Stack Engineer to contribute to both frontend and backend development of our core product.',
      skills:['MongoDB', 'Express', 'React', 'Node.js', 'GraphQL', 'AWS'],
      employerId: innovateSolutionsEmployer.id,
      seedQuestions:[
        { text: "This is a hybrid role requiring 2 days per week in our Berlin office. Does this arrangement work for you?", options: ["Yes, I am happy with a hybrid model in Berlin", "No, I need a fully remote position"], correct: "Yes, I am happy with a hybrid model in Berlin" },
        { text: "Do you have valid work authorization for Germany?", options:["Yes, I am authorized to work in Germany", "No, I would need visa sponsorship"], correct: "Yes, I am authorized to work in Germany" },
        { text: "The salary is stated in EUR, but for consistency, it's €4,500-€6,500. Does this range meet your expectations?", options:["Yes, this range is acceptable", "No, I am seeking a different salary range"], correct: "Yes, this range is acceptable" }
      ]
    },
    {
      title: 'Senior DevOps Engineer',
      company: 'Cloud Systems',
      location: 'Remote',
      salary: '7000-9000',
      type: 'Remote',
      description: 'As a Senior DevOps Engineer, you will be instrumental in maintaining and improving our cloud infrastructure on AWS.',
      skills:['AWS', 'Kubernetes', 'Terraform', 'CI/CD', 'Python', 'Ansible'],
      employerId: cloudSystemsEmployer.id,
      seedQuestions:[
        { text: "Are you equipped with a stable, high-speed internet connection suitable for a demanding remote DevOps role?", options: ["Yes, I have a reliable setup", "No, my internet connection is not suitable"], correct: "Yes, I have a reliable setup" },
        { text: "This senior role may require mentoring junior team members. Do you have an interest in mentorship?", options:["Yes, I enjoy mentoring others", "No, I prefer to focus only on individual tasks"], correct: "Yes, I enjoy mentoring others" },
        { text: "Are you comfortable working in a fast-paced, agile environment with frequent deployments?", options:["Yes, I thrive in agile environments", "No, I prefer a more structured, slower-paced workflow"], correct: "Yes, I thrive in agile environments" }
      ]
    },
    {
      title: 'Middle Java Developer',
      company: 'Global Connect',
      location: 'London, UK',
      salary: '3500-5000',
      type: 'Hybrid',
      description: 'We are seeking an experienced Middle Java Developer to join our growing engineering team.',
      skills:['Java', 'Spring Boot', 'MySQL', 'RESTful APIs', 'Maven'],
      employerId: globalConnectEmployer.id,
      seedQuestions:[
        { text: "Are you currently located in or willing to relocate to the London area for a hybrid role?", options: ["Yes", "No"], correct: "Yes" },
        { text: "Do you have the legal right to work in the United Kingdom?", options:["Yes, I have the right to work in the UK", "No, I would require sponsorship"], correct: "Yes, I have the right to work in the UK" },
        { text: "Our company provides a comprehensive private health insurance plan. Is this a benefit you value?", options:["Yes, health insurance is an important benefit for me", "No, it is not a priority for me"], correct: "Yes, health insurance is an important benefit for me" }
      ]
    },
    {
      title: 'Middle QA Engineer',
      company: 'TechCorp Inc.',
      location: 'On-site, Kyiv, UA',
      salary: '2000-3500',
      type: 'On-site',
      description: 'As a Middle QA Engineer, you will play a crucial role in ensuring the quality of our software products.',
      skills:['Manual Testing', 'Automated Testing', 'Jira', 'SQL', 'Selenium'],
      employerId: techCorpEmployer.id,
      seedQuestions:[
        { text: "This is a full-time role based in our Kyiv office. Are you currently residing in Ukraine and able to work from this location?", options: ["Yes", "No"], correct: "Yes" },
        { text: "The salary is paid in UAH equivalent to $2,000 - $3,500. Does this meet your financial expectations?", options:["Yes, this salary range is acceptable", "No, I am looking for a different salary"], correct: "Yes, this salary range is acceptable" },
        { text: "We offer 24 days of paid vacation per year. Is this an important factor for your work-life balance?", options:["Yes, this is a great benefit", "No, paid time off is not my main consideration"], correct: "Yes, this is a great benefit" }
      ]
    },
    {
      title: 'Middle UI/UX Designer',
      company: 'Innovate Solutions',
      location: 'Berlin, DE',
      salary: '3000-4500',
      type: 'Hybrid',
      description: 'We are looking for a creative Middle UI/UX Designer to enhance the user experience of our web and mobile applications.',
      skills:['Figma', 'UI Design', 'UX Research', 'Prototyping', 'User Flows'],
      employerId: innovateSolutionsEmployer.id,
      seedQuestions:[
        { text: "Are you able to work from our Berlin office at least 3 days a week for this hybrid role?", options:["Yes, I can commit to 3 days in the Berlin office", "No, I require more flexibility"], correct: "Yes, I can commit to 3 days in the Berlin office" },
        { text: "Our design team communicates primarily in English. Are you fluent in English for a professional setting?", options:["Yes, I am fluent in English", "No, my English is not at a professional level"], correct: "Yes, I am fluent in English" },
        { text: "We provide a budget for professional development (courses, conferences). Is this a benefit you would utilize?", options:["Yes, continuous learning is very important to me", "No, I am not interested in that"], correct: "Yes, continuous learning is very important to me" }
      ]
    },
    {
      title: 'Junior Frontend Developer',
      company: 'StartupX',
      location: 'New York, NY',
      salary: '1500-2500',
      type: 'On-site',
      description: 'Kickstart your career as a Junior Frontend Developer at StartupX.',
      skills:['React', 'JavaScript', 'HTML', 'CSS', 'Git'],
      employerId: startupXEmployer.id,
      seedQuestions:[
        { text: "This is an entry-level position located on-site in New York. Are you prepared to work from our office full-time?", options:["Yes, I am excited to work on-site", "No, I am only looking for remote jobs"], correct: "Yes, I am excited to work on-site" },
        { text: "Are you authorized to work for any employer in the United States?", options:["Yes", "No"], correct: "Yes" },
        { text: "This role involves significant mentorship and pair programming. Are you open to this learning style?", options:["Yes, I learn best by collaborating with others", "No, I prefer to learn independently"], correct: "Yes, I learn best by collaborating with others" }
      ]
    },
    {
      title: 'Junior Data Analyst',
      company: 'Global Connect',
      location: 'Remote',
      salary: '1800-3000',
      type: 'Remote',
      description: 'Join our data team as a Junior Data Analyst.',
      skills:['SQL', 'Excel', 'Data Cleaning', 'Python', 'Data Visualization'],
      employerId: globalConnectEmployer.id,
      seedQuestions:[
        { text: "This is a remote position open to candidates in any time zone. Are you self-disciplined enough to manage your own work schedule?", options:["Yes, I am highly organized and self-motivated", "No, I need a structured office environment"], correct: "Yes, I am highly organized and self-motivated" },
        { text: "The salary is set between $1,800 - $3,000 monthly. Does this align with your expectations for a junior role?", options:["Yes, it aligns", "No, it does not align"], correct: "Yes, it aligns" },
        { text: "Are you comfortable with a role that is heavily focused on data cleaning and preparation?", options:["Yes, I understand this is a foundational part of data analysis", "No, I am only interested in building models"], correct: "Yes, I understand this is a foundational part of data analysis" }
      ]
    },
    {
      title: 'Junior Mobile Developer (Flutter)',
      company: 'Cloud Systems',
      location: 'Hybrid, Kyiv, UA',
      salary: '1700-2800',
      type: 'Hybrid',
      description: 'We are looking for a motivated Junior Mobile Developer to work on our cross-platform mobile applications using Flutter.',
      skills: ['Flutter', 'Dart', 'Mobile Development', 'Firebase'],
      employerId: cloudSystemsEmployer.id,
      seedQuestions:[
        { text: "This hybrid role requires you to be in our Kyiv office. Are you currently residing in Ukraine?", options:["Yes, I am in Ukraine", "No, I am located elsewhere"], correct: "Yes, I am in Ukraine" },
        { text: "Do you have a personal portfolio or GitHub profile with Flutter projects you can share?", options:["Yes, I have projects to show", "No, I do not have a public portfolio yet"], correct: "Yes, I have projects to show" },
        { text: "Our company offers full medical insurance coverage. Is this an important benefit for you?", options:["Yes, this is a very valuable benefit", "No, this is not a priority for me"], correct: "Yes, this is a very valuable benefit" }
      ]
    },
  ];

  for (const job of vacanciesData) {
    const { seedQuestions, ...vacancyData } = job;


    for (const skill of vacancyData.skills) {
      await prisma.masterSkill.upsert({
        where: { name: skill },
        update: {},
        create: { name: skill },
      });
    }

    const existingVacancy = await prisma.vacancy.findFirst({
      where: {
        title: vacancyData.title,
        company: vacancyData.company,
      },
    });

    let vacancyId = existingVacancy?.id;

    if (!existingVacancy) {
      const newVacancy = await prisma.vacancy.create({
        data: vacancyData,
      });
      vacancyId = newVacancy.id;
      console.log(`Created vacancy: ${newVacancy.title} (${newVacancy.company})`);
    } else {
      console.log(`Vacancy already exists: ${existingVacancy.title} (${existingVacancy.company})`);
    }

    if (vacancyId && seedQuestions) {
      const questionCount = await prisma.question.count({ where: { vacancyId } });
      if (questionCount === 0) {
        await prisma.question.createMany({
          data: seedQuestions.map(q => ({
            ...q,
            vacancyId: vacancyId!,
          })),
        });
        console.log(`Added ${seedQuestions.length} questions for "${vacancyData.title}"`);
      }
    }
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