import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting JOBZY database seeding...');

  // 1. Clean existing records
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.interview.deleteMany();
  await prisma.applicationStatusHistory.deleteMany();
  await prisma.application.deleteMany();
  await prisma.shortlist.deleteMany();
  await prisma.candidateMatch.deleteMany();
  await prisma.analysis.deleteMany();
  await prisma.aIRecommendation.deleteMany();
  await prisma.project.deleteMany();
  await prisma.candidateSkill.deleteMany();
  await prisma.jobRequirement.deleteMany();
  await prisma.resumeVersion.deleteMany();
  await prisma.resume.deleteMany();
  await prisma.job.deleteMany();
  await prisma.skill.deleteMany();
  await prisma.recruiterProfile.deleteMany();
  await prisma.candidateProfile.deleteMany();
  await prisma.company.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('password123', 10);

  // 2. Create Skills Taxonomy
  const skillsData = [
    // Technical - Frontend
    { name: 'React.js', category: 'TECHNICAL', synonyms: JSON.stringify(['React', 'ReactJS', 'React 18']) },
    { name: 'TypeScript', category: 'TECHNICAL', synonyms: JSON.stringify(['TS', 'TypeScript 5']) },
    { name: 'JavaScript', category: 'TECHNICAL', synonyms: JSON.stringify(['JS', 'ES6', 'ECMAScript']) },
    { name: 'Next.js', category: 'TECHNICAL', synonyms: JSON.stringify(['NextJS', 'Next.js 14']) },
    { name: 'Tailwind CSS', category: 'TECHNICAL', synonyms: JSON.stringify(['Tailwind', 'TailwindCSS']) },
    { name: 'HTML5/CSS3', category: 'TECHNICAL', synonyms: JSON.stringify(['HTML', 'CSS', 'Semantic HTML']) },
    { name: 'Redux', category: 'TECHNICAL', synonyms: JSON.stringify(['Redux Toolkit', 'RTK']) },
    { name: 'Vue.js', category: 'TECHNICAL', synonyms: JSON.stringify(['Vue', 'VueJS', 'Vue 3']) },

    // Technical - Backend
    { name: 'Node.js', category: 'TECHNICAL', synonyms: JSON.stringify(['Node', 'NodeJS', 'Express.js', 'Express']) },
    { name: 'Python', category: 'TECHNICAL', synonyms: JSON.stringify(['Python 3', 'FastAPI', 'Django']) },
    { name: 'PostgreSQL', category: 'TECHNICAL', synonyms: JSON.stringify(['Postgres', 'PSQL', 'PostgreSql']) },
    { name: 'REST APIs', category: 'TECHNICAL', synonyms: JSON.stringify(['REST', 'RESTful', 'Web APIs', 'API Design']) },
    { name: 'GraphQL', category: 'TECHNICAL', synonyms: JSON.stringify(['GQL', 'Apollo GraphQL']) },
    { name: 'Redis', category: 'TECHNICAL', synonyms: JSON.stringify(['Redis Cache', 'In-memory Cache']) },
    { name: 'MongoDB', category: 'TECHNICAL', synonyms: JSON.stringify(['Mongo', 'NoSQL']) },
    { name: 'Prisma ORM', category: 'TECHNICAL', synonyms: JSON.stringify(['Prisma', 'ORM']) },
    { name: 'Go (Golang)', category: 'TECHNICAL', synonyms: JSON.stringify(['Golang', 'Go']) },
    { name: 'Microservices', category: 'TECHNICAL', synonyms: JSON.stringify(['Microservices Architecture', 'Distributed Systems']) },

    // Technical - Cloud & DevOps
    { name: 'Docker', category: 'TECHNICAL', synonyms: JSON.stringify(['Containerization', 'Docker Compose']) },
    { name: 'Kubernetes', category: 'TECHNICAL', synonyms: JSON.stringify(['K8s', 'Container Orchestration']) },
    { name: 'AWS', category: 'TECHNICAL', synonyms: JSON.stringify(['Amazon Web Services', 'S3', 'EC2', 'Lambda', 'ECS']) },
    { name: 'CI/CD Pipelines', category: 'TECHNICAL', synonyms: JSON.stringify(['GitHub Actions', 'GitLab CI', 'Jenkins']) },
    { name: 'Terraform', category: 'TECHNICAL', synonyms: JSON.stringify(['IaC', 'Infrastructure as Code']) },

    // Technical - AI & Data
    { name: 'Machine Learning', category: 'TECHNICAL', synonyms: JSON.stringify(['ML', 'Deep Learning', 'PyTorch', 'TensorFlow']) },
    { name: 'LLM & Generative AI', category: 'TECHNICAL', synonyms: JSON.stringify(['OpenAI', 'Gemini', 'LangChain', 'RAG', 'Prompt Engineering']) },
    { name: 'Vector Databases', category: 'TECHNICAL', synonyms: JSON.stringify(['Pinecone', 'pgvector', 'Weaviate', 'ChromaDB']) },

    // Soft Skills
    { name: 'System Design', category: 'SOFT', synonyms: JSON.stringify(['Software Architecture', 'High-Level Design']) },
    { name: 'Technical Leadership', category: 'SOFT', synonyms: JSON.stringify(['Mentorship', 'Team Lead', 'Code Review']) },
    { name: 'Agile / Scrum', category: 'SOFT', synonyms: JSON.stringify(['Scrum', 'Sprint Planning', 'Kanban']) },
    { name: 'Problem Solving', category: 'SOFT', synonyms: JSON.stringify(['Analytical Thinking', 'Debugging']) },
    { name: 'Cross-functional Collaboration', category: 'SOFT', synonyms: JSON.stringify(['Product Collaboration', 'Stakeholder Communication']) },

    // Domain
    { name: 'SaaS Architecture', category: 'DOMAIN', synonyms: JSON.stringify(['Multi-tenancy', 'SaaS']) },
    { name: 'FinTech', category: 'DOMAIN', synonyms: JSON.stringify(['Payment Gateways', 'Financial Software', 'PCI-DSS']) },
  ];

  const skillMap: Record<string, string> = {};
  for (const s of skillsData) {
    const created = await prisma.skill.create({ data: s });
    skillMap[s.name] = created.id;
  }

  // 3. Companies
  const company1 = await prisma.company.create({
    data: {
      name: 'TechVanguard Innovations',
      website: 'https://techvanguard.io',
      industry: 'Enterprise SaaS & Cloud Infrastructure',
      description: 'Building next-generation distributed intelligence systems for high-growth tech teams.',
      location: 'San Francisco, CA / Remote',
      size: '100-250 employees',
    },
  });

  const company2 = await prisma.company.create({
    data: {
      name: 'FinPulse Systems',
      website: 'https://finpulse.co',
      industry: 'FinTech & Real-time Analytics',
      description: 'Modern infrastructure powering real-time global treasury and asset management.',
      location: 'New York, NY / Hybrid',
      size: '250-500 employees',
    },
  });

  // 4. Admin User
  await prisma.user.create({
    data: {
      email: 'admin@jobzy.ai',
      name: 'Elena Vance (Admin)',
      passwordHash,
      role: 'ADMIN',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    },
  });

  // 5. Recruiter User
  const recruiterUser = await prisma.user.create({
    data: {
      email: 'recruiter@jobzy.ai',
      name: 'Sarah Chen',
      passwordHash,
      role: 'RECRUITER',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    },
  });

  const recruiterProfile = await prisma.recruiterProfile.create({
    data: {
      userId: recruiterUser.id,
      companyId: company1.id,
      designation: 'Head of Talent Intelligence',
      department: 'Engineering Recruitment',
    },
  });

  // 6. Primary Candidate User (Alex Rivera)
  const candidateUser = await prisma.user.create({
    data: {
      email: 'candidate@jobzy.ai',
      name: 'Alex Rivera',
      passwordHash,
      role: 'CANDIDATE',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    },
  });

  const candidateProfile = await prisma.candidateProfile.create({
    data: {
      userId: candidateUser.id,
      phone: '+1 (415) 890-4421',
      location: 'San Francisco, CA',
      title: 'Senior Full Stack & Cloud Engineer',
      bio: 'High-impact engineer with 5+ years specializing in TypeScript, React, Node.js, and cloud native architectures. Experienced in building high-scale distributed systems and real-time platforms.',
      linkedinUrl: 'https://linkedin.com/in/alex-rivera-demo',
      githubUrl: 'https://github.com/alexrivera-demo',
      portfolioUrl: 'https://alexrivera.dev',
      experienceYears: 5.5,
      education: JSON.stringify([
        {
          degree: 'B.S. in Computer Science',
          institution: 'University of California, Berkeley',
          graduationYear: '2020',
          cgpa: '3.85 / 4.0',
        },
      ]),
      extractedProfile: JSON.stringify({
        summary: 'Experienced Full Stack Engineer passionate about building scalable web applications and distributed architectures.',
        strengths: ['React & Node.js mastery', 'PostgreSQL database indexing & query optimization', 'Cloud architecture with AWS & Docker'],
      }),
    },
  });

  // Candidate Skills
  const candidateSkillsToAdd = [
    { name: 'React.js', prof: 'ADVANCED', months: 48, evidence: 'Built micro-frontends serving 200k DAU' },
    { name: 'TypeScript', prof: 'ADVANCED', months: 48, evidence: 'Architected end-to-end typed mono-repos' },
    { name: 'Node.js', prof: 'ADVANCED', months: 40, evidence: 'Engineered high-throughput REST & GraphQL backends' },
    { name: 'PostgreSQL', prof: 'ADVANCED', months: 36, evidence: 'Optimized complex SQL queries reducing P99 latency by 45%' },
    { name: 'REST APIs', prof: 'ADVANCED', months: 48, evidence: 'Designed enterprise RESTful APIs' },
    { name: 'Docker', prof: 'INTERMEDIATE', months: 24, evidence: 'Containerized production services for ECS' },
    { name: 'AWS', prof: 'INTERMEDIATE', months: 30, evidence: 'Managed S3, CloudFront, Lambda, and RDS' },
    { name: 'CI/CD Pipelines', prof: 'INTERMEDIATE', months: 24, evidence: 'Configured automated testing workflows with GitHub Actions' },
    { name: 'System Design', prof: 'ADVANCED', months: 36, evidence: 'Led architecture reviews for core billing microservice' },
    { name: 'Tailwind CSS', prof: 'ADVANCED', months: 36, evidence: 'Crafted design system component libraries' },
  ];

  for (const cs of candidateSkillsToAdd) {
    if (skillMap[cs.name]) {
      await prisma.candidateSkill.create({
        data: {
          candidateId: candidateProfile.id,
          skillId: skillMap[cs.name],
          proficiencyEstimate: cs.prof,
          experienceMonths: cs.months,
          evidence: cs.evidence,
        },
      });
    }
  }

  // Candidate Projects
  await prisma.project.create({
    data: {
      candidateId: candidateProfile.id,
      name: 'OmniStream Real-Time Analytics Platform',
      description: 'Distributed streaming dashboard handling 10k events/sec with WebSocket subscriptions and sub-second aggregation.',
      technologies: JSON.stringify(['React.js', 'TypeScript', 'Node.js', 'PostgreSQL', 'Redis', 'Docker']),
      architecture: 'Event-driven pub/sub architecture with Redis cache and horizontal worker nodes.',
      complexityAssessment: 'HIGH',
      url: 'https://github.com/alexrivera-demo/omnistream',
    },
  });

  await prisma.project.create({
    data: {
      candidateId: candidateProfile.id,
      name: 'CloudSync Multi-Tenant Billing Engine',
      description: 'Integrated Stripe billing service with usage-based metering, webhook idempotency, and automated tax calculation.',
      technologies: JSON.stringify(['TypeScript', 'Node.js', 'Prisma ORM', 'PostgreSQL', 'AWS']),
      architecture: 'Modular service with database row-level isolation and strict audit logs.',
      complexityAssessment: 'ENTERPRISE',
      url: 'https://github.com/alexrivera-demo/cloudsync-billing',
    },
  });

  // Candidate Sample Resume Record
  const sampleResume = await prisma.resume.create({
    data: {
      candidateId: candidateProfile.id,
      originalFileName: 'Alex_Rivera_Senior_FullStack_2026.pdf',
      filePath: '/uploads/resumes/alex_rivera_sample.pdf',
      fileType: 'application/pdf',
      extractedText: `ALEX RIVERA
San Francisco, CA | (415) 890-4421 | alex@jobzy.ai | linkedin.com/in/alex-rivera-demo | github.com/alexrivera-demo

SUMMARY
Senior Full Stack Engineer with 5+ years of production experience building high-scale distributed web applications. Strong track record in React.js, TypeScript, Node.js, and PostgreSQL. Passionate about clean code, robust system design, and developer velocity.

TECHNICAL SKILLS
Languages & Frameworks: TypeScript, JavaScript, React.js, Next.js, Node.js, Express.js, Tailwind CSS, HTML5/CSS3
Databases & Cloud: PostgreSQL, Prisma ORM, Redis, AWS (S3, CloudFront, RDS, ECS), Docker, CI/CD Pipelines
Core Competencies: REST APIs, System Design, Microservices, Agile/Scrum, Automated Testing

PROFESSIONAL EXPERIENCE
Senior Software Engineer | CloudVenture Labs (2022 - Present)
- Architected and delivered customer-facing dashboard in React 18 & TypeScript used by 180,000 monthly active users.
- Designed high-throughput Node.js microservices processing 12M events daily with 99.98% uptime.
- Optimized PostgreSQL database schema and indexing strategies, reducing median API latency from 320ms to 85ms.
- Mentored 4 junior and mid-level engineers, leading weekly design reviews and pair-programming sessions.

Software Engineer | NextGen Digital (2020 - 2022)
- Built responsive UI components with React and Tailwind CSS, increasing conversion rate by 22%.
- Created RESTful API endpoints in Node.js and Express connected to PostgreSQL.
- Implemented CI/CD pipelines using GitHub Actions, cutting release deployment time by 60%.

EDUCATION
B.S. in Computer Science | University of California, Berkeley (2016 - 2020)
GPA: 3.85 / 4.0`,
      parsedData: JSON.stringify({
        personal: {
          name: 'Alex Rivera',
          email: 'alex@jobzy.ai',
          phone: '(415) 890-4421',
          location: 'San Francisco, CA',
          linkedin: 'https://linkedin.com/in/alex-rivera-demo',
          github: 'https://github.com/alexrivera-demo',
        },
        skills: ['React.js', 'TypeScript', 'Node.js', 'PostgreSQL', 'REST APIs', 'Docker', 'AWS', 'Tailwind CSS', 'System Design'],
        experienceYears: 5.5,
        education: [{ degree: 'B.S. in Computer Science', school: 'UC Berkeley', year: '2020' }],
      }),
      atsScore: 92,
      isPrimary: true,
    },
  });

  // Additional Candidates for Recruiter Screening & Ranking
  const candidatesRaw = [
    {
      name: 'Jordan Lee',
      email: 'jordan.lee@test.com',
      title: 'Full Stack Developer',
      years: 4.0,
      skills: ['React.js', 'TypeScript', 'Node.js', 'REST APIs', 'PostgreSQL', 'Docker'],
      summary: 'Product-focused full-stack engineer with 4 years building reactive web platforms.',
      ats: 88,
    },
    {
      name: 'Marcus Vance',
      email: 'marcus.vance@test.com',
      title: 'Senior Backend Architect',
      years: 7.0,
      skills: ['Node.js', 'Go (Golang)', 'PostgreSQL', 'Redis', 'AWS', 'Docker', 'Kubernetes', 'Microservices', 'System Design'],
      summary: 'Backend specialist with 7 years architecting distributed systems and cloud infrastructure.',
      ats: 94,
    },
    {
      name: 'Elena Rostova',
      email: 'elena.rostova@test.com',
      title: 'Cloud DevOps & Platform Engineer',
      years: 5.0,
      skills: ['AWS', 'Docker', 'Kubernetes', 'CI/CD Pipelines', 'Terraform', 'Python', 'Node.js'],
      summary: 'DevOps engineer focused on automated deployment pipelines and Kubernetes cluster reliability.',
      ats: 86,
    },
    {
      name: 'Priya Sharma',
      email: 'priya.sharma@test.com',
      title: 'Junior Frontend Developer',
      years: 1.8,
      skills: ['React.js', 'JavaScript', 'HTML5/CSS3', 'Tailwind CSS'],
      summary: 'Enthusiastic frontend developer with 1.8 years building pixel-perfect web interfaces.',
      ats: 79,
    },
  ];

  const candidateProfileList: any[] = [candidateProfile];

  for (const cand of candidatesRaw) {
    const user = await prisma.user.create({
      data: {
        email: cand.email,
        name: cand.name,
        passwordHash,
        role: 'CANDIDATE',
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(cand.name)}&backgroundColor=111111&textColor=c4f167`,
      },
    });

    const prof = await prisma.candidateProfile.create({
      data: {
        userId: user.id,
        title: cand.title,
        experienceYears: cand.years,
        location: 'Remote, US',
        bio: cand.summary,
        extractedProfile: JSON.stringify({ summary: cand.summary, skills: cand.skills }),
      },
    });

    candidateProfileList.push(prof);

    // Add skills
    for (const sk of cand.skills) {
      if (skillMap[sk]) {
        await prisma.candidateSkill.create({
          data: {
            candidateId: prof.id,
            skillId: skillMap[sk],
            proficiencyEstimate: cand.years > 4 ? 'ADVANCED' : 'INTERMEDIATE',
            experienceMonths: Math.round(cand.years * 10),
            evidence: `Documented commercial usage at ${cand.title}`,
          },
        });
      }
    }

    // Add resume record
    await prisma.resume.create({
      data: {
        candidateId: prof.id,
        originalFileName: `${cand.name.replace(' ', '_')}_Resume.pdf`,
        filePath: `/uploads/resumes/${cand.name.toLowerCase().replace(' ', '_')}.pdf`,
        atsScore: cand.ats,
        extractedText: `${cand.name} - ${cand.title}\nSkills: ${cand.skills.join(', ')}\nExperience: ${cand.years} years`,
        parsedData: JSON.stringify({ skills: cand.skills, experienceYears: cand.years }),
        isPrimary: true,
      },
    });
  }

  // 7. Create Job Openings
  const job1 = await prisma.job.create({
    data: {
      recruiterId: recruiterProfile.id,
      companyId: company1.id,
      title: 'Senior Full Stack Engineer (React / Node / Cloud)',
      description: `TechVanguard is seeking an experienced Senior Full Stack Engineer to build next-generation cloud analytics platforms. You will be instrumental in architecting scalable client interfaces and backend microservices that handle millions of operations daily.

Key Responsibilities:
- Lead the end-to-end development of customer-facing dashboards using React 18, TypeScript, and modern state architectures.
- Design, build, and optimize scalable REST and GraphQL microservices in Node.js.
- Ensure high database performance and reliability with PostgreSQL and Redis caching.
- Partner with product managers and designers to translate ambitious product roadmaps into rock-solid software.
- Drive engineering excellence through code reviews, test automation, and infrastructure best practices.`,
      responsibilities: JSON.stringify([
        'Architect and deploy high-volume React/TypeScript applications',
        'Build scalable microservices with Node.js and PostgreSQL',
        'Configure and maintain AWS cloud infrastructure and CI/CD pipelines',
        'Drive code quality, test coverage, and performance optimization',
      ]),
      requiredSkills: JSON.stringify(['React.js', 'TypeScript', 'Node.js', 'PostgreSQL', 'REST APIs', 'AWS']),
      preferredSkills: JSON.stringify(['Docker', 'Redis', 'CI/CD Pipelines', 'Tailwind CSS', 'System Design']),
      minimumExperience: 4.0,
      maximumExperience: 8.0,
      qualifications: "Bachelor's degree in Computer Science or equivalent software engineering experience",
      location: 'San Francisco, CA / Remote',
      employmentType: 'FULL_TIME',
      isRemote: true,
      salaryMin: 145000,
      salaryMax: 185000,
      currency: 'USD',
      status: 'PUBLISHED',
      weightsConfig: JSON.stringify({
        requiredSkills: 30,
        experience: 20,
        technicalDepth: 15,
        projects: 15,
        education: 10,
        preferredSkills: 10,
      }),
    },
  });

  const job2 = await prisma.job.create({
    data: {
      recruiterId: recruiterProfile.id,
      companyId: company1.id,
      title: 'Principal Backend & Distributed Systems Architect',
      description: 'Architect mission-critical distributed data pipelines and high-throughput microservices using Node.js, Go, Redis, and Kubernetes.',
      responsibilities: JSON.stringify([
        'Define technical standards for distributed microservices',
        'Optimize high-concurrency database queries and caching layers',
        'Ensure 99.99% system availability and disaster recovery',
      ]),
      requiredSkills: JSON.stringify(['Node.js', 'PostgreSQL', 'Redis', 'Docker', 'Kubernetes', 'System Design']),
      preferredSkills: JSON.stringify(['Go (Golang)', 'AWS', 'CI/CD Pipelines']),
      minimumExperience: 6.0,
      maximumExperience: 12.0,
      qualifications: "Master's or Bachelor's in CS / Distributed Systems",
      location: 'San Francisco, CA / Hybrid',
      employmentType: 'FULL_TIME',
      isRemote: false,
      salaryMin: 185000,
      salaryMax: 230000,
      currency: 'USD',
      status: 'PUBLISHED',
    },
  });

  const job3 = await prisma.job.create({
    data: {
      recruiterId: recruiterProfile.id,
      companyId: company2.id,
      title: 'AI Platform & LLM Systems Engineer',
      description: 'Build enterprise RAG pipelines, model inference caching, and vector search systems using Python, Gemini/OpenAI, and pgvector.',
      responsibilities: JSON.stringify([
        'Build scalable LLM inference pipelines with vector indexing',
        'Implement hybrid keyword and semantic retrieval workflows',
        'Measure and optimize hallucination reduction and prompt latency',
      ]),
      requiredSkills: JSON.stringify(['Python', 'Machine Learning', 'LLM & Generative AI', 'Vector Databases', 'REST APIs']),
      preferredSkills: JSON.stringify(['PostgreSQL', 'Docker', 'AWS']),
      minimumExperience: 3.0,
      maximumExperience: 7.0,
      qualifications: 'Degree in Computer Science, Data Science, or related quantitative field',
      location: 'New York, NY / Remote',
      employmentType: 'FULL_TIME',
      isRemote: true,
      salaryMin: 160000,
      salaryMax: 210000,
      currency: 'USD',
      status: 'PUBLISHED',
    },
  });

  // Attach Job Requirements
  const job1Reqs = [
    { skill: 'React.js', imp: 'MANDATORY', lvl: 'ADVANCED' },
    { skill: 'TypeScript', imp: 'MANDATORY', lvl: 'ADVANCED' },
    { skill: 'Node.js', imp: 'MANDATORY', lvl: 'ADVANCED' },
    { skill: 'PostgreSQL', imp: 'MANDATORY', lvl: 'INTERMEDIATE' },
    { skill: 'REST APIs', imp: 'MANDATORY', lvl: 'ADVANCED' },
    { skill: 'AWS', imp: 'MANDATORY', lvl: 'INTERMEDIATE' },
    { skill: 'Docker', imp: 'PREFERRED', lvl: 'INTERMEDIATE' },
    { skill: 'Redis', imp: 'PREFERRED', lvl: 'INTERMEDIATE' },
  ];

  for (const r of job1Reqs) {
    if (skillMap[r.skill]) {
      await prisma.jobRequirement.create({
        data: {
          jobId: job1.id,
          skillId: skillMap[r.skill],
          importance: r.imp,
          requiredLevel: r.lvl,
        },
      });
    }
  }

  // 8. Create Realistic Candidate Matches & Analysis for Job 1
  // Alex Rivera (Match Score: 94%)
  const alexMatch = await prisma.candidateMatch.create({
    data: {
      candidateId: candidateProfile.id,
      jobId: job1.id,
      overallScore: 94.2,
      skillScore: 96.0,
      experienceScore: 95.0,
      projectScore: 92.5,
      educationScore: 90.0,
      confidence: 0.96,
      evidence: JSON.stringify({
        summary: 'Exceptional alignment across all 6 mandatory skills with 5.5 years of verifiable experience and high-complexity full-stack projects.',
        mandatorySkillsMatched: 6,
        mandatorySkillsTotal: 6,
        preferredSkillsMatched: 4,
        preferredSkillsTotal: 5,
        experienceDepth: '5.5 years verified vs 4.0 required (exceeds threshold)',
        keyStrengths: [
          'Direct production experience in React 18, TypeScript, and high-throughput Node.js microservices',
          'Demonstrated database optimization in PostgreSQL, cutting P99 latency by 45%',
          'Full-stack architecture verified in OmniStream & CloudSync billing projects',
        ],
      }),
      missingRequirements: JSON.stringify(['Redis (Preferred only)']),
    },
  });

  // Comprehensive Analysis Record for Alex Rivera on Job 1
  await prisma.analysis.create({
    data: {
      candidateId: candidateProfile.id,
      resumeId: sampleResume.id,
      jobId: job1.id,
      overallScore: 94.2,
      atsReadabilityScore: 92.0,
      matchScore: 94.2,
      skillScore: 96.0,
      experienceScore: 95.0,
      projectScore: 92.5,
      educationScore: 90.0,
      matchedSkills: JSON.stringify(['React.js', 'TypeScript', 'Node.js', 'PostgreSQL', 'REST APIs', 'AWS', 'Docker', 'CI/CD Pipelines', 'Tailwind CSS']),
      missingSkills: JSON.stringify(['Redis']),
      detailedBreakdown: JSON.stringify({
        weights: { requiredSkills: 30, experience: 20, technicalDepth: 15, projects: 15, education: 10, preferredSkills: 10 },
        scores: { requiredSkills: 96.0, experience: 95.0, technicalDepth: 94.0, projects: 92.5, education: 90.0, preferredSkills: 88.0 },
      }),
      formattingWarnings: JSON.stringify([
        'Ensure phone number includes standard international formatting (+1 prefix).',
        'Header section uses clean text; standard ATS font size detected.',
        'No multi-column tables or nested text boxes detected (clean ATS compliance).',
      ]),
      recommendations: JSON.stringify([
        {
          type: 'SKILL_ENHANCEMENT',
          title: 'Highlight Redis Caching Exposure',
          description: 'The job strongly prefers Redis for caching and session state. Adding specific mention of Redis key-value stores will push compatibility to 98%.',
        },
        {
          type: 'IMPACT_METRICS',
          title: 'Quantify AWS Cloud Cost Reductions',
          description: 'Mention specific AWS infrastructure savings or auto-scaling thresholds in your Senior Software Engineer role.',
        },
      ]),
    },
  });

  // Matches for other candidates for Job 1 to populate Recruiter Ranking
  // Marcus Vance: 87.5%
  await prisma.candidateMatch.create({
    data: {
      candidateId: candidateProfileList[2].id,
      jobId: job1.id,
      overallScore: 87.5,
      skillScore: 84.0,
      experienceScore: 98.0,
      projectScore: 90.0,
      educationScore: 85.0,
      confidence: 0.94,
      evidence: JSON.stringify({
        summary: 'Outstanding backend and system architecture depth with 7 years experience. Partial gap in dedicated frontend React micro-frontend focus.',
        keyStrengths: ['Deep Node.js, PostgreSQL, Redis, and Kubernetes architecture', 'Extensive 7-year track record'],
      }),
      missingRequirements: JSON.stringify(['React.js (Extensive client UI)']),
    },
  });

  // Jordan Lee: 84.0%
  await prisma.candidateMatch.create({
    data: {
      candidateId: candidateProfileList[1].id,
      jobId: job1.id,
      overallScore: 84.0,
      skillScore: 88.0,
      experienceScore: 82.0,
      projectScore: 80.0,
      educationScore: 85.0,
      confidence: 0.92,
      evidence: JSON.stringify({
        summary: 'Solid full-stack developer with 4 years matching React, Node, and PostgreSQL requirements.',
        keyStrengths: ['Great full-stack foundation with React and Node.js'],
      }),
      missingRequirements: JSON.stringify(['AWS Cloud infrastructure depth']),
    },
  });

  // Elena Rostova: 74.5%
  await prisma.candidateMatch.create({
    data: {
      candidateId: candidateProfileList[3].id,
      jobId: job1.id,
      overallScore: 74.5,
      skillScore: 70.0,
      experienceScore: 85.0,
      projectScore: 75.0,
      educationScore: 80.0,
      confidence: 0.90,
      evidence: JSON.stringify({
        summary: 'Excellent cloud and DevOps capabilities, but lacks core React.js and modern client-side frontend evidence.',
      }),
      missingRequirements: JSON.stringify(['React.js', 'Frontend state management']),
    },
  });

  // Priya Sharma: 58.2%
  await prisma.candidateMatch.create({
    data: {
      candidateId: candidateProfileList[4].id,
      jobId: job1.id,
      overallScore: 58.2,
      skillScore: 55.0,
      experienceScore: 45.0,
      projectScore: 50.0,
      educationScore: 80.0,
      confidence: 0.92,
      evidence: JSON.stringify({
        summary: 'Promising junior engineer but does not yet satisfy the 4-year minimum professional seniority requirement or backend AWS architecture needs.',
      }),
      missingRequirements: JSON.stringify(['Minimum 4 Years Professional Experience', 'AWS', 'PostgreSQL', 'Docker']),
    },
  });

  // 9. Applications
  const app1 = await prisma.application.create({
    data: {
      candidateId: candidateProfile.id,
      jobId: job1.id,
      resumeId: sampleResume.id,
      status: 'SHORTLISTED',
      coverLetter: "I have followed TechVanguard's engineering work on distributed systems and would love to bring my 5+ years of full-stack TypeScript, React, and cloud scaling experience to the team.",
    },
  });

  await prisma.applicationStatusHistory.create({
    data: {
      applicationId: app1.id,
      previousStatus: 'APPLIED',
      newStatus: 'UNDER_REVIEW',
      changedBy: 'Sarah Chen (Recruiter)',
      note: 'Profile matched top 5% compatibility criteria. Forwarded to technical hiring manager.',
    },
  });

  await prisma.applicationStatusHistory.create({
    data: {
      applicationId: app1.id,
      previousStatus: 'UNDER_REVIEW',
      newStatus: 'SHORTLISTED',
      changedBy: 'Sarah Chen (Recruiter)',
      note: 'Shortlisted for Round 1 Technical Architecture interview.',
    },
  });

  // Recruiter Shortlist record
  await prisma.shortlist.create({
    data: {
      recruiterId: recruiterProfile.id,
      jobId: job1.id,
      candidateId: candidateProfile.id,
      notes: 'Rank #1 candidate. Excellent project evidence and high ATS/compatibility score (94.2%). Scheduled for technical interview.',
    },
  });

  // Interview Scheduled
  const interviewDate = new Date();
  interviewDate.setDate(interviewDate.getDate() + 3);
  interviewDate.setHours(14, 0, 0, 0);

  await prisma.interview.create({
    data: {
      applicationId: app1.id,
      scheduledAt: interviewDate,
      interviewType: 'TECHNICAL',
      meetingLink: 'https://meet.google.com/chh-mkmp-cqn',
      location: 'Google Meet / Online',
      status: 'SCHEDULED',
      interviewer: 'David Kim (VP of Engineering)',
    },
  });

  // Notifications
  await prisma.notification.create({
    data: {
      userId: candidateUser.id,
      title: 'Application Shortlisted!',
      message: 'TechVanguard Innovations shortlisted your application for Senior Full Stack Engineer.',
      type: 'SHORTLIST',
      link: '/candidate/applications',
    },
  });

  await prisma.notification.create({
    data: {
      userId: candidateUser.id,
      title: 'Interview Scheduled',
      message: 'Technical Architecture interview scheduled for Thursday at 2:00 PM PST with TechVanguard Innovations.',
      type: 'INTERVIEW',
      link: '/candidate/applications',
    },
  });

  await prisma.notification.create({
    data: {
      userId: recruiterUser.id,
      title: 'New High-Score Applicant',
      message: 'Alex Rivera applied for Senior Full Stack Engineer with a 94.2% compatibility score.',
      type: 'MATCH',
      link: `/recruiter/jobs/${job1.id}/applicants`,
    },
  });

  // AI Optimizer Recommendations
  await prisma.aIRecommendation.create({
    data: {
      resumeId: sampleResume.id,
      category: 'EXPERIENCE',
      priority: 'HIGH',
      originalText: 'Created RESTful API endpoints in Node.js and Express connected to PostgreSQL.',
      suggestedText: 'Architected high-throughput RESTful microservices in Node.js/Express, orchestrating PostgreSQL connection pools and automated pagination to achieve sub-100ms response latencies.',
      explanation: 'Transforming passive duty into an action-oriented achievement directly highlights your backend engineering depth and aligns with the job requirement for REST API architecture.',
      requirementRef: 'Design, build, and optimize scalable REST and GraphQL microservices in Node.js',
      status: 'PENDING',
    },
  });

  await prisma.aIRecommendation.create({
    data: {
      resumeId: sampleResume.id,
      category: 'SUMMARY',
      priority: 'MEDIUM',
      originalText: 'Senior Full Stack Engineer with 5+ years of production experience building high-scale distributed web applications.',
      suggestedText: 'Senior Full-Stack & Cloud Engineer with 5+ years architecting enterprise-grade React, TypeScript, and Node.js solutions, scaling distributed cloud services to 180K+ monthly active users.',
      explanation: 'Infuses target keywords (Cloud Engineer, enterprise-grade) and immediate scale metrics right in the opening summary statement.',
      requirementRef: 'Lead end-to-end development of customer-facing dashboards',
      status: 'PENDING',
    },
  });

  console.log('✅ JOBZY database seeded successfully with rich real-world test data!');
  console.log('--------------------------------------------------');
  console.log('Candidate Login: candidate@jobzy.ai / password123');
  console.log('Recruiter Login: recruiter@jobzy.ai / password123');
  console.log('Admin Login:     admin@jobzy.ai     / password123');
  console.log('--------------------------------------------------');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
