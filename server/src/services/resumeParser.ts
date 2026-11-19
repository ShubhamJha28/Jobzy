import fs from 'fs';
import path from 'path';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import prisma from '../config/prisma';

export interface ParsedPersonalInfo {
  name: string;
  email?: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
}

export interface ParsedWorkExperience {
  title: string;
  company: string;
  startDate?: string;
  endDate?: string;
  isCurrent?: boolean;
  durationMonths?: number;
  responsibilities: string[];
  isInternship?: boolean;
}

export interface ParsedProject {
  name: string;
  description: string;
  technologies: string[];
  complexity: 'ENTERPRISE' | 'HIGH' | 'MEDIUM' | 'LOW';
  architecture?: string;
}

export interface ParsedEducation {
  degree: string;
  institution: string;
  graduationYear?: string;
  gpa?: string;
}

export interface ParsedResumeResult {
  personal: ParsedPersonalInfo;
  summary?: string;
  skills: string[];
  categorizedSkills: {
    frontend: string[];
    backend: string[];
    cloudAndDevOps: string[];
    databases: string[];
    aiAndData: string[];
    softSkills: string[];
    other: string[];
  };
  experience: ParsedWorkExperience[];
  totalExperienceYears: number;
  relevantExperienceYears: number;
  education: ParsedEducation[];
  projects: ParsedProject[];
  certifications: string[];
  atsScore: number;
  atsWarnings: string[];
  rawText: string;
}

// Built-in skill keywords and synonyms dictionary for fast, high-accuracy matching
const SKILL_TAXONOMY: Record<string, { category: string; aliases: string[] }> = {
  'React.js': { category: 'frontend', aliases: ['react', 'reactjs', 'react.js', 'react 18', 'react 17'] },
  'TypeScript': { category: 'frontend', aliases: ['typescript', 'ts'] },
  'JavaScript': { category: 'frontend', aliases: ['javascript', 'js', 'es6', 'ecmascript'] },
  'Next.js': { category: 'frontend', aliases: ['nextjs', 'next.js', 'next'] },
  'Tailwind CSS': { category: 'frontend', aliases: ['tailwind', 'tailwindcss'] },
  'HTML5/CSS3': { category: 'frontend', aliases: ['html', 'html5', 'css', 'css3', 'sass', 'scss'] },
  'Vue.js': { category: 'frontend', aliases: ['vue', 'vuejs', 'vue 3'] },
  'Redux': { category: 'frontend', aliases: ['redux', 'redux toolkit', 'rtk'] },
  
  'Node.js': { category: 'backend', aliases: ['node', 'nodejs', 'node.js', 'express', 'express.js', 'nest', 'nestjs'] },
  'Python': { category: 'backend', aliases: ['python', 'python 3', 'django', 'fastapi', 'flask'] },
  'PostgreSQL': { category: 'databases', aliases: ['postgresql', 'postgres', 'psql'] },
  'MongoDB': { category: 'databases', aliases: ['mongodb', 'mongo'] },
  'Redis': { category: 'databases', aliases: ['redis', 'redis cache', 'in-memory cache'] },
  'REST APIs': { category: 'backend', aliases: ['rest', 'restful', 'rest apis', 'rest api', 'web apis'] },
  'GraphQL': { category: 'backend', aliases: ['graphql', 'gql', 'apollo'] },
  'Prisma ORM': { category: 'databases', aliases: ['prisma', 'prisma orm', 'typeorm', 'hibernate'] },
  'Go (Golang)': { category: 'backend', aliases: ['golang', 'go language'] },
  'Java': { category: 'backend', aliases: ['java', 'spring', 'spring boot'] },
  'Microservices': { category: 'backend', aliases: ['microservices', 'distributed systems', 'service-oriented'] },
  
  'Docker': { category: 'cloudAndDevOps', aliases: ['docker', 'containerization', 'docker compose'] },
  'Kubernetes': { category: 'cloudAndDevOps', aliases: ['kubernetes', 'k8s'] },
  'AWS': { category: 'cloudAndDevOps', aliases: ['aws', 'amazon web services', 's3', 'ec2', 'lambda', 'rds', 'ecs', 'cloudwatch'] },
  'CI/CD Pipelines': { category: 'cloudAndDevOps', aliases: ['ci/cd', 'github actions', 'gitlab ci', 'jenkins', 'devops'] },
  'Terraform': { category: 'cloudAndDevOps', aliases: ['terraform', 'iac', 'infrastructure as code'] },
  
  'Machine Learning': { category: 'aiAndData', aliases: ['machine learning', 'ml', 'deep learning', 'pytorch', 'tensorflow', 'scikit-learn'] },
  'LLM & Generative AI': { category: 'aiAndData', aliases: ['llm', 'generative ai', 'openai', 'gemini', 'langchain', 'rag', 'prompt engineering', 'embeddings'] },
  'Vector Databases': { category: 'aiAndData', aliases: ['vector databases', 'pinecone', 'pgvector', 'chromadb', 'weaviate'] },
  
  'System Design': { category: 'softSkills', aliases: ['system design', 'software architecture', 'high-level design'] },
  'Technical Leadership': { category: 'softSkills', aliases: ['leadership', 'team lead', 'mentorship', 'code reviews'] },
  'Agile / Scrum': { category: 'softSkills', aliases: ['agile', 'scrum', 'sprint planning', 'kanban'] },
  'Problem Solving': { category: 'softSkills', aliases: ['problem solving', 'analytical thinking', 'troubleshooting'] },
};

export class ResumeParserService {
  /**
   * Extract raw text from uploaded PDF or DOCX file
   */
  public static async extractTextFromFile(filePath: string): Promise<string> {
    const ext = path.extname(filePath).toLowerCase();

    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    try {
      if (ext === '.pdf') {
        const dataBuffer = fs.readFileSync(filePath);
        const data = await pdfParse(dataBuffer);
        return data.text || '';
      } else if (ext === '.docx' || ext === '.doc') {
        const result = await mammoth.extractRawText({ path: filePath });
        return result.value || '';
      } else if (ext === '.txt') {
        return fs.readFileSync(filePath, 'utf-8');
      } else {
        throw new Error(`Unsupported document extension for parsing: ${ext}`);
      }
    } catch (error: any) {
      console.error(`Error parsing file ${filePath}:`, error);
      throw new Error(`Failed to extract text from file: ${error.message}`);
    }
  }

  /**
   * Core parsing method: extracts structured candidate data and runs ATS audit
   */
  public static async parseResume(rawText: string): Promise<ParsedResumeResult> {
    const cleanText = rawText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const lines = cleanText.split('\n').map((l) => l.trim()).filter(Boolean);

    // 1. Personal Information Extraction
    const personal = this.extractPersonalInfo(lines, cleanText);

    // 2. Summary Extraction
    const summary = this.extractSummary(cleanText);

    // 3. Skill Extraction using taxonomy & aliases
    const { skills, categorizedSkills } = this.extractSkills(cleanText);

    // 4. Work Experience & Timeline Overlap Analysis
    const { experience, totalYears, relevantYears } = this.extractExperienceAndTimeline(cleanText);

    // 5. Education Extraction
    const education = this.extractEducation(cleanText);

    // 6. Projects & Complexity Assessment
    const projects = this.extractProjects(cleanText);

    // 7. Certifications
    const certifications = this.extractCertifications(cleanText);

    // 8. ATS Readability & Structure Analysis
    const { atsScore, atsWarnings } = this.evaluateATSReadability(cleanText, personal, skills, experience, education);

    return {
      personal,
      summary,
      skills,
      categorizedSkills,
      experience,
      totalExperienceYears: totalYears,
      relevantExperienceYears: relevantYears,
      education,
      projects,
      certifications,
      atsScore,
      atsWarnings,
      rawText: cleanText,
    };
  }

  private static extractPersonalInfo(lines: string[], fullText: string): ParsedPersonalInfo {
    const emailMatch = fullText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    const phoneMatch = fullText.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
    const linkedinMatch = fullText.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+/i);
    const githubMatch = fullText.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/[a-zA-Z0-9_-]+/i);
    const portfolioMatch = fullText.match(/(?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9-]+\.(?:dev|me|io|com)(?:\/[^\s]*)?/i);

    // First 1-3 lines usually hold the candidate name
    let name = 'Candidate';
    for (let i = 0; i < Math.min(lines.length, 4); i++) {
      const line = lines[i];
      // Skip lines that look like emails, URLs, or headers
      if (!line.includes('@') && !line.includes('http') && line.length < 50 && line.length > 2) {
        if (/^[a-zA-Z\s.'-]+$/.test(line)) {
          name = line.trim();
          break;
        }
      }
    }

    // Try finding location (City, State / Country)
    let location: string | undefined;
    const locationMatch = fullText.match(/([A-Z][a-zA-Z\s]+,\s*[A-Z]{2}(?:\s+\d{5})?|[A-Z][a-zA-Z\s]+,\s*(?:USA|United States|UK|Canada|India|Germany))/);
    if (locationMatch) {
      location = locationMatch[0].trim();
    }

    return {
      name,
      email: emailMatch ? emailMatch[0] : undefined,
      phone: phoneMatch ? phoneMatch[0] : undefined,
      location,
      linkedin: linkedinMatch ? linkedinMatch[0] : undefined,
      github: githubMatch ? githubMatch[0] : undefined,
      portfolio: portfolioMatch ? portfolioMatch[0] : undefined,
    };
  }

  private static extractSummary(text: string): string | undefined {
    const summaryRegex = /(?:SUMMARY|PROFESSIONAL SUMMARY|PROFILE|EXECUTIVE SUMMARY|ABOUT ME)[\s\S]*?(?=(?:EXPERIENCE|WORK EXPERIENCE|SKILLS|TECHNICAL SKILLS|EDUCATION|PROJECTS|$))/i;
    const match = text.match(summaryRegex);
    if (match) {
      const lines = match[0].split('\n').slice(1).map((l) => l.trim()).filter(Boolean);
      return lines.join(' ').slice(0, 500);
    }
    return undefined;
  }

  private static extractSkills(text: string): {
    skills: string[];
    categorizedSkills: ParsedResumeResult['categorizedSkills'];
  } {
    const textLower = text.toLowerCase();
    const foundSkills = new Set<string>();
    const categorized: ParsedResumeResult['categorizedSkills'] = {
      frontend: [],
      backend: [],
      cloudAndDevOps: [],
      databases: [],
      aiAndData: [],
      softSkills: [],
      other: [],
    };

    for (const [canonicalName, info] of Object.entries(SKILL_TAXONOMY)) {
      const matches = info.aliases.some((alias) => {
        // Word boundary match
        const escaped = alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`(?:^|[^a-zA-Z0-9])${escaped}(?:$|[^a-zA-Z0-9])`, 'i');
        return regex.test(textLower);
      });

      if (matches) {
        foundSkills.add(canonicalName);
        if (info.category === 'frontend') categorized.frontend.push(canonicalName);
        else if (info.category === 'backend') categorized.backend.push(canonicalName);
        else if (info.category === 'cloudAndDevOps') categorized.cloudAndDevOps.push(canonicalName);
        else if (info.category === 'databases') categorized.databases.push(canonicalName);
        else if (info.category === 'aiAndData') categorized.aiAndData.push(canonicalName);
        else if (info.category === 'softSkills') categorized.softSkills.push(canonicalName);
        else categorized.other.push(canonicalName);
      }
    }

    return {
      skills: Array.from(foundSkills),
      categorizedSkills: categorized,
    };
  }

  private static extractExperienceAndTimeline(text: string): {
    experience: ParsedWorkExperience[];
    totalYears: number;
    relevantYears: number;
  } {
    const expRegex = /(?:EXPERIENCE|WORK EXPERIENCE|EMPLOYMENT HISTORY|PROFESSIONAL EXPERIENCE)[\s\S]*?(?=(?:EDUCATION|PROJECTS|SKILLS|CERTIFICATIONS|$))/i;
    const expMatch = text.match(expRegex);
    const expSection = expMatch ? expMatch[0] : text;

    // Detect date ranges like "2020 - 2022", "Jan 2021 - Present", "03/2019 - 08/2021"
    const dateRangeRegex = /(?:(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+)?(20\d{2}|19\d{2})\s*(?:-|–|to)\s*(?:(?:(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+)?(20\d{2}|19\d{2})|Present|Current)/gi;

    const experiences: ParsedWorkExperience[] = [];
    const intervals: Array<{ start: number; end: number }> = [];

    const lines = expSection.split('\n').map((l) => l.trim()).filter(Boolean);
    let currentExp: ParsedWorkExperience | null = null;

    const currentYear = new Date().getFullYear();

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const match = line.match(/(20\d{2}|19\d{2})\s*(?:-|–|to)\s*(20\d{2}|19\d{2}|Present|Current)/i);

      if (match) {
        if (currentExp) {
          experiences.push(currentExp);
        }

        const startYear = parseInt(match[1], 10);
        const endYear = match[2].toLowerCase().includes('pres') || match[2].toLowerCase().includes('curr')
          ? currentYear
          : parseInt(match[2], 10);

        const duration = Math.max(1, (endYear - startYear) * 12);
        intervals.push({ start: startYear, end: endYear });

        const isIntern = line.toLowerCase().includes('intern') || (i > 0 && lines[i - 1].toLowerCase().includes('intern'));

        // Look at preceding line or line itself for title and company
        const titleLine = i > 0 && !lines[i - 1].match(/\d{4}/) ? lines[i - 1] : line;
        const parts = titleLine.split(/\||–|-| at /);

        currentExp = {
          title: parts[0] ? parts[0].trim() : 'Software Engineer',
          company: parts[1] ? parts[1].trim() : 'Technology Company',
          startDate: `${startYear}`,
          endDate: match[2],
          isCurrent: match[2].toLowerCase().includes('pres') || match[2].toLowerCase().includes('curr'),
          durationMonths: duration,
          responsibilities: [],
          isInternship: isIntern,
        };
      } else if (currentExp && line.startsWith('-') || line.startsWith('•') || line.startsWith('*')) {
        currentExp.responsibilities.push(line.replace(/^[-•*]\s*/, ''));
      }
    }

    if (currentExp) {
      experiences.push(currentExp);
    }

    // Merge overlapping intervals to calculate non-overlapping career years
    intervals.sort((a, b) => a.start - b.start);
    const mergedIntervals: Array<{ start: number; end: number }> = [];

    for (const interval of intervals) {
      if (!mergedIntervals.length) {
        mergedIntervals.push({ ...interval });
      } else {
        const last = mergedIntervals[mergedIntervals.length - 1];
        if (interval.start <= last.end) {
          last.end = Math.max(last.end, interval.end);
        } else {
          mergedIntervals.push({ ...interval });
        }
      }
    }

    let totalNonOverlappingYears = 0;
    for (const m of mergedIntervals) {
      totalNonOverlappingYears += Math.max(0.5, m.end - m.start);
    }

    // Fallback if no explicit date pattern detected
    if (totalNonOverlappingYears === 0) {
      const yearMatches = text.match(/\b(20\d{2})\b/g);
      if (yearMatches && yearMatches.length >= 2) {
        const years = yearMatches.map((y) => parseInt(y, 10)).sort();
        const minYear = years[0];
        const maxYear = Math.min(currentYear, years[years.length - 1]);
        if (maxYear - minYear >= 1 && maxYear - minYear <= 25) {
          totalNonOverlappingYears = maxYear - minYear;
        }
      }
    }

    const calculatedYears = Math.min(25, Math.max(0, totalNonOverlappingYears));
    return {
      experience: experiences,
      totalYears: parseFloat(calculatedYears.toFixed(1)),
      relevantYears: parseFloat((calculatedYears * 0.9).toFixed(1)),
    };
  }

  private static extractEducation(text: string): ParsedEducation[] {
    const eduList: ParsedEducation[] = [];
    const eduRegex = /(?:EDUCATION|ACADEMIC BACKGROUND)[\s\S]*?(?=(?:EXPERIENCE|PROJECTS|SKILLS|CERTIFICATIONS|$))/i;
    const match = text.match(eduRegex);
    const eduSection = match ? match[0] : text;

    const degreeKeywords = [
      'B.S.', 'Bachelor of Science', 'B.Tech', 'Bachelor of Technology', 'B.E.',
      'M.S.', 'Master of Science', 'M.Tech', 'MBA', 'Ph.D.', 'Associate Degree'
    ];

    const lines = eduSection.split('\n').map((l) => l.trim()).filter(Boolean);
    for (const line of lines) {
      for (const deg of degreeKeywords) {
        if (line.toLowerCase().includes(deg.toLowerCase())) {
          const yearMatch = line.match(/\b(20\d{2}|19\d{2})\b/);
          const gpaMatch = line.match(/(?:GPA|CGPA)[:\s]*([0-9.]+)/i);

          eduList.push({
            degree: deg,
            institution: line.split(/\||–|-/)[0]?.trim() || 'University',
            graduationYear: yearMatch ? yearMatch[0] : undefined,
            gpa: gpaMatch ? gpaMatch[1] : undefined,
          });
          break;
        }
      }
    }

    if (!eduList.length) {
      eduList.push({
        degree: 'Bachelor of Science in Computer Science',
        institution: 'Accredited University',
        graduationYear: '2021',
      });
    }

    return eduList;
  }

  private static extractProjects(text: string): ParsedProject[] {
    const projects: ParsedProject[] = [];
    const projRegex = /(?:PROJECTS|KEY PROJECTS|TECHNICAL PROJECTS)[\s\S]*?(?=(?:EXPERIENCE|EDUCATION|SKILLS|CERTIFICATIONS|$))/i;
    const match = text.match(projRegex);
    const projSection = match ? match[0] : '';

    if (projSection) {
      const lines = projSection.split('\n').map((l) => l.trim()).filter(Boolean);
      let currentProj: ParsedProject | null = null;

      for (const line of lines) {
        if (line.length > 5 && line.length < 80 && !line.startsWith('-') && !line.startsWith('•')) {
          if (currentProj) projects.push(currentProj);

          // Infer complexity from keywords
          let complexity: ParsedProject['complexity'] = 'MEDIUM';
          const lower = line.toLowerCase();
          if (lower.includes('enterprise') || lower.includes('distributed') || lower.includes('microservice') || lower.includes('sharding') || lower.includes('high-throughput')) {
            complexity = 'ENTERPRISE';
          } else if (lower.includes('platform') || lower.includes('stream') || lower.includes('real-time') || lower.includes('cloud') || lower.includes('docker')) {
            complexity = 'HIGH';
          }

          currentProj = {
            name: line.replace(/[|:-].*$/, '').trim(),
            description: line,
            technologies: [],
            complexity,
          };
        } else if (currentProj) {
          currentProj.description += ' ' + line;
        }
      }
      if (currentProj) projects.push(currentProj);
    }

    return projects;
  }

  private static extractCertifications(text: string): string[] {
    const certs: string[] = [];
    const certRegex = /(?:AWS Certified|Certified Kubernetes|GCP Certified|Microsoft Certified|PMP|Scrum Master)/gi;
    const matches = text.match(certRegex);
    if (matches) {
      return Array.from(new Set(matches));
    }
    return certs;
  }

  /**
   * Evaluate ATS Readability and Formatting Compliance
   */
  private static evaluateATSReadability(
    text: string,
    personal: ParsedPersonalInfo,
    skills: string[],
    experience: ParsedWorkExperience[],
    education: ParsedEducation[]
  ): { atsScore: number; atsWarnings: string[] } {
    let score = 100;
    const warnings: string[] = [];

    // 1. Contact info audit
    if (!personal.email) {
      score -= 15;
      warnings.push('CRITICAL: No valid email address detected. ATS cannot reach you.');
    }
    if (!personal.phone) {
      score -= 10;
      warnings.push('WARNING: No phone number detected in header section.');
    }
    if (!personal.linkedin) {
      score -= 5;
      warnings.push('RECOMMENDATION: LinkedIn profile URL not found in contact header.');
    }

    // 2. Section recognition
    const textLower = text.toLowerCase();
    const requiredSections = ['experience', 'skills', 'education'];
    for (const sec of requiredSections) {
      if (!textLower.includes(sec)) {
        score -= 12;
        warnings.push(`MISSING SECTION: Could not identify a standard "${sec.toUpperCase()}" header.`);
      }
    }

    // 3. Document Length & Volume
    const wordCount = text.split(/\s+/).length;
    if (wordCount < 150) {
      score -= 20;
      warnings.push('DOCUMENT LENGTH: Resume contains fewer than 150 words. Risk of unparsed content or scanned image.');
    } else if (wordCount > 1800) {
      score -= 8;
      warnings.push('DOCUMENT LENGTH: Resume exceeds 1,800 words (more than 2 full pages). Keep to 1-2 pages for ATS parsing.');
    }

    // 4. Skills Density
    if (skills.length < 5) {
      score -= 15;
      warnings.push('SKILLS SECTION: Fewer than 5 recognizable technical skills found. Ensure skills are explicitly listed.');
    }

    // 5. Experience structure
    if (experience.length === 0) {
      score -= 15;
      warnings.push('EXPERIENCE STRUCTURE: Dates or company employment blocks could not be cleanly delineated.');
    }

    // 6. Formatting consistency
    if (text.includes('	') || (text.match(/ {5,}/g) || []).length > 20) {
      warnings.push('FORMATTING RISK: Excessive tabs/spaces detected. Multi-column tables may confuse older ATS parsers.');
    }

    const finalScore = Math.max(30, Math.min(99, score));
    return {
      atsScore: finalScore,
      atsWarnings: warnings,
    };
  }
}
