export interface ParsedJobDescription {
  title: string;
  company?: string;
  requiredSkills: string[];
  preferredSkills: string[];
  minimumExperience: number;
  maximumExperience?: number;
  qualifications: string;
  location: string;
  employmentType: string;
  isRemote: boolean;
  responsibilities: string[];
  salaryRange?: { min: number; max: number };
}

const COMMON_SKILLS = [
  'React.js', 'TypeScript', 'JavaScript', 'Node.js', 'Python', 'PostgreSQL',
  'MongoDB', 'Redis', 'REST APIs', 'GraphQL', 'Prisma ORM', 'Docker',
  'Kubernetes', 'AWS', 'CI/CD Pipelines', 'Tailwind CSS', 'Next.js',
  'Machine Learning', 'LLM & Generative AI', 'Vector Databases',
  'System Design', 'Technical Leadership', 'Agile / Scrum', 'Go (Golang)'
];

export class JobParserService {
  public static parseJobDescription(text: string): ParsedJobDescription {
    const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);

    // 1. Title detection
    let title = 'Software Engineer';
    const firstFew = lines.slice(0, 4);
    for (const line of firstFew) {
      if (/engineer|developer|architect|lead|manager|analyst|specialist|designer/i.test(line) && line.length < 80) {
        title = line.replace(/^(Job Title|Position|Role):\s*/i, '').trim();
        break;
      }
    }

    // 2. Experience detection
    let minExp = 3.0;
    let maxExp: number | undefined = undefined;
    const expMatch = text.match(/(\d+)(?:\+|-(\d+))?\s*(?:to\s*(\d+))?\s*(?:years?|yrs?)(?:\s*of)?\s*(?:relevant|experience|professional)/i);
    if (expMatch) {
      minExp = parseFloat(expMatch[1]);
      if (expMatch[2]) maxExp = parseFloat(expMatch[2]);
      else if (expMatch[3]) maxExp = parseFloat(expMatch[3]);
      else maxExp = minExp + 3;
    }

    // 3. Required vs Preferred Skills
    const lower = text.toLowerCase();
    const requiredSkills: string[] = [];
    const preferredSkills: string[] = [];

    // Check skills
    for (const skill of COMMON_SKILLS) {
      const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(?:^|[^a-zA-Z0-9])${escaped}(?:$|[^a-zA-Z0-9])`, 'i');
      if (regex.test(lower)) {
        // Classify if in "preferred / nice to have" section
        const prefSectionMatch = lower.indexOf('nice to have') !== -1 || lower.indexOf('preferred') !== -1;
        if (prefSectionMatch && (skill === 'Redis' || skill === 'Docker' || skill === 'CI/CD Pipelines' || skill === 'Tailwind CSS')) {
          preferredSkills.push(skill);
        } else {
          requiredSkills.push(skill);
        }
      }
    }

    // 4. Remote / Location
    const isRemote = /remote|work from home|telecommute/i.test(text);
    let location = isRemote ? 'Remote' : 'San Francisco, CA';
    const locMatch = text.match(/(?:Location|Based in|Office):\s*([^\n\r]+)/i);
    if (locMatch) {
      location = locMatch[1].trim();
    }

    // 5. Employment Type
    let employmentType = 'FULL_TIME';
    if (/part[\s-]time/i.test(text)) employmentType = 'PART_TIME';
    else if (/contract|freelance/i.test(text)) employmentType = 'CONTRACT';
    else if (/intern(?:ship)?/i.test(text)) employmentType = 'INTERNSHIP';

    // 6. Key Responsibilities
    const responsibilities: string[] = [];
    const respRegex = /(?:Responsibilities|What you'll do|Duties|Role Overview)[\s\S]*?(?=(?:Requirements|Qualifications|Skills|Benefits|$))/i;
    const respMatch = text.match(respRegex);
    if (respMatch) {
      const respLines = respMatch[0].split('\n').slice(1);
      for (const rl of respLines) {
        const clean = rl.replace(/^[-•*]\s*/, '').trim();
        if (clean.length > 15 && clean.length < 250) {
          responsibilities.push(clean);
        }
      }
    }

    if (!responsibilities.length) {
      responsibilities.push(
        'Design and implement high-performance, maintainable software systems.',
        'Collaborate closely with product, engineering, and design teams.',
        'Participate in architecture discussions and technical code reviews.'
      );
    }

    return {
      title,
      requiredSkills: requiredSkills.length ? requiredSkills : ['React.js', 'Node.js', 'PostgreSQL', 'TypeScript'],
      preferredSkills: preferredSkills.length ? preferredSkills : ['AWS', 'Docker'],
      minimumExperience: minExp,
      maximumExperience: maxExp,
      qualifications: "Bachelor's degree in Computer Science, Software Engineering, or equivalent experience.",
      location,
      employmentType,
      isRemote,
      responsibilities: responsibilities.slice(0, 6),
      salaryRange: { min: 130000, max: 175000 },
    };
  }
}
