import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { AIService } from '../services/aiService';
import prisma from '../config/prisma';

export class OptimizerController {
  public static async rewriteBullet(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { text, targetSkill, resumeId } = req.body;

      if (!text || text.trim().length === 0) {
        res.status(400).json({ success: false, message: 'Please provide bullet point text to rewrite.' });
        return;
      }

      const suggestion = await AIService.rewriteExperienceBullet(text, targetSkill);

      // If resumeId is provided, save recommendation to database
      if (resumeId) {
        await prisma.aIRecommendation.create({
          data: {
            resumeId,
            category: suggestion.category,
            priority: suggestion.priority,
            originalText: suggestion.originalText,
            suggestedText: suggestion.suggestedText,
            explanation: suggestion.explanation,
            requirementRef: suggestion.targetRequirement || null,
            status: 'PENDING',
          },
        });
      }

      res.status(200).json({ success: true, suggestion });
    } catch (error: any) {
      console.error('rewriteBullet error:', error);
      res.status(500).json({ success: false, message: 'Failed to rewrite bullet point.' });
    }
  }

  public static async optimizeSummary(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { summary, targetJobTitle, keySkills, resumeId } = req.body;

      const suggestion = await AIService.optimizeSummary(
        summary,
        targetJobTitle || 'Senior Software Engineer',
        keySkills || ['TypeScript', 'React.js', 'Node.js', 'PostgreSQL']
      );

      if (resumeId) {
        await prisma.aIRecommendation.create({
          data: {
            resumeId,
            category: suggestion.category,
            priority: suggestion.priority,
            originalText: suggestion.originalText,
            suggestedText: suggestion.suggestedText,
            explanation: suggestion.explanation,
            status: 'PENDING',
          },
        });
      }

      res.status(200).json({ success: true, suggestion });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to optimize summary.' });
    }
  }

  public static async getRecommendations(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { resumeId } = req.params;
      const recommendations = await prisma.aIRecommendation.findMany({
        where: { resumeId },
        orderBy: { createdAt: 'desc' },
      });

      res.status(200).json({ success: true, recommendations });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to retrieve recommendations.' });
    }
  }

  public static async updateRecommendationStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body; // ACCEPTED, REJECTED

      const updated = await prisma.aIRecommendation.update({
        where: { id },
        data: { status },
      });

      res.status(200).json({ success: true, recommendation: updated });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to update recommendation status.' });
    }
  }
}
