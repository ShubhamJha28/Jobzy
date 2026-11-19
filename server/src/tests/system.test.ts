import prisma from '../config/prisma';
import bcrypt from 'bcryptjs';
import { ResumeParserService } from '../services/resumeParser';
import { MatchingEngineService } from '../services/matchingEngine';
import { JobParserService } from '../services/jobParser';
import { AIService } from '../services/aiService';

async function runTestSuite() {
  console.log('🧪 Running JOBZY Core Intelligence & Architecture Test Suite...\n');
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName}`);
      failed++;
    }
  }

  try {
    // Test 1: User & RBAC Persistence
    const candidateUser = await prisma.user.findUnique({
      where: { email: 'candidate@jobzy.ai' },
      include: { candidateProfile: true },
    });
    assert(!!candidateUser && candidateUser.role === 'CANDIDATE', 'Candidate user exists with correct role');

    const recruiterUser = await prisma.user.findUnique({
      where: { email: 'recruiter@jobzy.ai' },
      include: { recruiterProfile: true },
    });
    assert(!!recruiterUser && recruiterUser.role === 'RECRUITER', 'Recruiter user exists with correct role');

    // Test 2: Resume Parser NLP extraction & Overlap calculation
    const sampleResumeText = `
ALEX RIVERA
alex@jobzy.ai | +1 (415) 890-4421 | San Francisco, CA | linkedin.com/in/alex-rivera-demo | github.com/alexrivera-demo

SUMMARY
Experienced Senior Full-Stack and Cloud Engineer with 5+ years of demonstrable production experience architecting high-scale distributed systems, web applications, and real-time platforms using React.js, TypeScript, Node.js, and PostgreSQL. Proven ability to optimize database performance, configure continuous integration pipelines, and lead technical architecture initiatives.

TECHNICAL SKILLS
Languages & Frameworks: React.js, TypeScript, JavaScript, Node.js, Express.js, Tailwind CSS, HTML5/CSS3
Databases & Cloud: PostgreSQL, Prisma ORM, Redis, AWS, Docker, CI/CD Pipelines
Architectural Competencies: REST APIs, System Design, Microservices, Agile/Scrum, Automated Testing

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
GPA: 3.85 / 4.0
`;

    const parsedResume = await ResumeParserService.parseResume(sampleResumeText);
    assert(parsedResume.personal.name.includes('ALEX RIVERA'), 'Parser correctly extracts candidate name');
    assert(parsedResume.personal.email === 'alex@jobzy.ai', 'Parser correctly extracts contact email');
    assert(parsedResume.skills.includes('React.js'), 'Parser correctly extracts React.js');
    assert(parsedResume.skills.includes('TypeScript'), 'Parser correctly extracts TypeScript');
    assert(parsedResume.skills.includes('PostgreSQL'), 'Parser correctly extracts PostgreSQL');
    assert(parsedResume.totalExperienceYears >= 4, 'Timeline calculator computes non-overlapping experience');
    assert(parsedResume.atsScore >= 80, 'ATS Readability engine scores clean formatting above 80%');

    // Test 3: Job Description Parser
    const rawJd = `
Role: Senior Cloud Infrastructure Engineer
Company: CloudSync
Requirements:
- 4+ years of professional backend experience
- Must know Node.js, TypeScript, PostgreSQL, and AWS
- Preferred: Docker, Redis, CI/CD Pipelines
Location: Remote
`;
    const parsedJd = JobParserService.parseJobDescription(rawJd);
    assert(parsedJd.title.toLowerCase().includes('cloud') || parsedJd.title.toLowerCase().includes('engineer'), 'JD Parser extracts role title');
    assert(parsedJd.requiredSkills.includes('Node.js') || parsedJd.requiredSkills.includes('PostgreSQL'), 'JD Parser extracts required skills');
    assert(parsedJd.isRemote === true, 'JD Parser detects remote eligibility');

    // Test 4: Weighted Hybrid Matching Engine
    const matchResult = MatchingEngineService.evaluateMatch(parsedResume, {
      requiredSkills: ['React.js', 'TypeScript', 'Node.js', 'PostgreSQL'],
      preferredSkills: ['Docker', 'AWS'],
      minimumExperience: 4.0,
      title: 'Senior Full Stack Engineer',
    });

    assert(matchResult.overallScore >= 88, `Weighted matching score accurately calculated (Actual: ${matchResult.overallScore}%)`);
    assert(matchResult.matchedSkills.length >= 4, 'All required skills properly identified as matches');
    assert(matchResult.confidence >= 0.85, 'Confidence level indicator calibrated above 0.85');
    assert(!!matchResult.evidence.summary, 'Explainable evidence narrative successfully generated');

    // Test 5: AI Resume Bullet Point Rewriter
    const rawBullet = 'Built REST API endpoints for user authentication.';
    const rewrite = await AIService.rewriteExperienceBullet(rawBullet, 'REST APIs');
    assert(rewrite.suggestedText.length > rawBullet.length, 'AI Rewriter expands responsibility into high-impact statement');
    assert(!!rewrite.explanation, 'AI Rewriter produces clear recruiter-oriented rationale');

    // Test 6: Database Application Workflow
    const job = await prisma.job.findFirst({ where: { status: 'PUBLISHED' } });
    assert(!!job, 'Database contains active published job requisition');

    const matchesCount = await prisma.candidateMatch.count();
    assert(matchesCount >= 4, `Leaderboard database holds candidate ranking records (Count: ${matchesCount})`);

    const shortlistCount = await prisma.shortlist.count();
    assert(shortlistCount >= 1, 'Database contains active recruiter shortlists');

    const interviewCount = await prisma.interview.count();
    assert(interviewCount >= 1, 'Database contains scheduled technical interviews');

    console.log(`\n===========================================`);
    console.log(`🎉 TEST SUITE COMPLETE: ${passed} Passed, ${failed} Failed`);
    console.log(`===========================================\n`);
  } catch (err) {
    console.error('Test suite error:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runTestSuite();
