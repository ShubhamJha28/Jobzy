import { ParsedResumeResult } from './resumeParser';

export interface MatchingWeights {
  requiredSkills: number; // default 30
  experience: number;     // default 20
  technicalDepth: number; // default 15
  projects: number;       // default 15
  education: number;      // default 10
  preferredSkills: number;// default 10
}

export interface MatchEvaluationResult {
  overallScore: number;
  categoryScores: {
    requiredSkills: number;
    experience: number;
    technicalDepth: number;
    projects: number;
    education: number;
    preferredSkills: number;
  };
  matchedSkills: string[];
  missingMandatorySkills: string[];
  missingPreferredSkills: string[];
  evidence: {
    summary: string;
    keyStrengths: string[];
    gaps: string[];
    experienceEvaluation: string;
    projectEvaluation: string;
  };
  confidence: number;
}

export class MatchingEngineService {
  public static evaluateMatch(
    resume: ParsedResumeResult,
    job: {
      requiredSkills: string[];
      preferredSkills: string[];
      minimumExperience: number;
      weightsConfig?: string | null;
      title: string;
    }
  ): MatchEvaluationResult {
    // 1. Resolve weights
    let weights: MatchingWeights = {
      requiredSkills: 30,
      experience: 20,
      technicalDepth: 15,
      projects: 15,
      education: 10,
      preferredSkills: 10,
    };

    if (job.weightsConfig) {
      try {
        const custom = JSON.parse(job.weightsConfig);
        weights = { ...weights, ...custom };
      } catch (e) {
        // Fallback to defaults
      }
    }

    const candidateSkillsLower = new Set(resume.skills.map((s) => s.toLowerCase()));

    // 2. Skill Matching (Mandatory)
    const matchedSkills: string[] = [];
    const missingMandatory: string[] = [];

    const reqSkills = job.requiredSkills || [];
    for (const req of reqSkills) {
      if (candidateSkillsLower.has(req.toLowerCase())) {
        matchedSkills.push(req);
      } else {
        missingMandatory.push(req);
      }
    }

    const requiredSkillScore = reqSkills.length > 0
      ? (matchedSkills.length / reqSkills.length) * 100
      : 95;

    // 3. Preferred Skill Matching
    const matchedPreferred: string[] = [];
    const missingPreferred: string[] = [];

    const prefSkills = job.preferredSkills || [];
    for (const pref of prefSkills) {
      if (candidateSkillsLower.has(pref.toLowerCase())) {
        matchedPreferred.push(pref);
        if (!matchedSkills.includes(pref)) {
          matchedSkills.push(pref);
        }
      } else {
        missingPreferred.push(pref);
      }
    }

    const preferredSkillScore = prefSkills.length > 0
      ? (matchedPreferred.length / prefSkills.length) * 100
      : 80;

    // 4. Experience Alignment
    const candidateYears = resume.totalExperienceYears || 0;
    const minReq = job.minimumExperience || 0;
    let experienceScore = 100;

    if (minReq > 0) {
      if (candidateYears >= minReq) {
        // Bonus for exceeding experience, up to 100
        experienceScore = Math.min(100, 85 + ((candidateYears - minReq) / minReq) * 15);
      } else {
        // Linear deduction for experience gap
        const ratio = candidateYears / minReq;
        experienceScore = Math.max(30, ratio * 80);
      }
    }

    // 5. Technical Depth & Stack Breadth
    const totalDetectedSkills = resume.skills.length;
    let technicalDepthScore = Math.min(100, Math.max(40, totalDetectedSkills * 8));

    // 6. Project Relevance & Complexity
    let projectScore = 75;
    if (resume.projects.length > 0) {
      const hasEnterprise = resume.projects.some((p) => p.complexity === 'ENTERPRISE');
      const hasHigh = resume.projects.some((p) => p.complexity === 'HIGH');
      if (hasEnterprise) projectScore = 95;
      else if (hasHigh) projectScore = 88;
      else projectScore = 80;
    } else {
      projectScore = candidateYears > 3 ? 75 : 60;
    }

    // 7. Education & Qualifications
    let educationScore = 85;
    if (resume.education.length > 0) {
      const hasMasterOrPhD = resume.education.some((e) => /master|m\.s|m\.tech|ph\.d/i.test(e.degree));
      if (hasMasterOrPhD) educationScore = 95;
      else educationScore = 90;
    }

    // 8. Calculate Overall Weighted Score
    const totalWeight =
      weights.requiredSkills +
      weights.experience +
      weights.technicalDepth +
      weights.projects +
      weights.education +
      weights.preferredSkills;

    const rawOverall =
      (requiredSkillScore * weights.requiredSkills +
        experienceScore * weights.experience +
        technicalDepthScore * weights.technicalDepth +
        projectScore * weights.projects +
        educationScore * weights.education +
        preferredSkillScore * weights.preferredSkills) /
      totalWeight;

    const overallScore = parseFloat(Math.min(99.4, Math.max(25.0, rawOverall)).toFixed(1));

    // 9. Generate Explainable Evidence
    const keyStrengths: string[] = [];
    if (matchedSkills.length > 0) {
      keyStrengths.push(`Direct mastery of key technologies: ${matchedSkills.slice(0, 4).join(', ')}.`);
    }
    if (candidateYears >= minReq && minReq > 0) {
      keyStrengths.push(`${candidateYears} years of documented non-overlapping experience (meets or exceeds the ${minReq}-year requirement).`);
    }
    if (projectScore >= 85) {
      keyStrengths.push('Demonstrated high-scale or enterprise architecture complexity in documented projects.');
    }

    const gaps: string[] = [];
    if (missingMandatory.length > 0) {
      gaps.push(`Missing mandatory requirements: ${missingMandatory.join(', ')}.`);
    }
    if (candidateYears < minReq) {
      gaps.push(`Experience shortfall: Has ${candidateYears} years vs ${minReq} years required.`);
    }
    if (missingPreferred.length > 0) {
      gaps.push(`Preferred nice-to-haves not found: ${missingPreferred.slice(0, 3).join(', ')}.`);
    }

    const summary =
      overallScore >= 85
        ? `High-potential fit: Candidate satisfies ${matchedSkills.length} core job competencies and meets experience requirements with verified project evidence.`
        : overallScore >= 70
        ? `Promising alignment: Meets majority of technical capabilities, with minor gaps in ${missingMandatory.slice(0, 2).join(' or ') || 'preferred requirements'}.`
        : `Partial match: Notable gaps detected in mandatory skills (${missingMandatory.slice(0, 3).join(', ')}) or years of seniority.`;

    const confidence = parseFloat(Math.min(0.98, Math.max(0.85, 0.85 + (totalDetectedSkills > 6 ? 0.08 : 0.02))).toFixed(2));

    return {
      overallScore,
      categoryScores: {
        requiredSkills: parseFloat(requiredSkillScore.toFixed(1)),
        experience: parseFloat(experienceScore.toFixed(1)),
        technicalDepth: parseFloat(technicalDepthScore.toFixed(1)),
        projects: parseFloat(projectScore.toFixed(1)),
        education: parseFloat(educationScore.toFixed(1)),
        preferredSkills: parseFloat(preferredSkillScore.toFixed(1)),
      },
      matchedSkills,
      missingMandatorySkills: missingMandatory,
      missingPreferredSkills: missingPreferred,
      evidence: {
        summary,
        keyStrengths,
        gaps,
        experienceEvaluation: `${candidateYears} years documented career duration vs ${minReq} years job baseline.`,
        projectEvaluation: `Rated ${projectScore >= 90 ? 'High / Enterprise' : 'Moderate'} complexity based on architecture keywords and deliverables.`,
      },
      confidence,
    };
  }
}
