import { describe, it, expect, vi } from 'vitest';
import { Stage6Schema } from './prompts/stage6-fit-scoring';
import { Stage1Schema } from './prompts/stage1-fact-extraction';

vi.mock('@leadlens/database', () => ({
  db: {
    insert: vi.fn(),
  }
}));

describe('AI Zod Schemas Validation', () => {
  describe('Stage6Schema (Fit Scoring)', () => {
    it('should validate a correct payload', () => {
      const validData = {
        overallScore: 85,
        scoreLabel: 'Excellent',
        confidence: 90,
        scoreBreakdown: {
          agencyServiceFit: 95,
          problemSeverity: 80,
          businessMaturity: 70,
          likelyProjectValue: 85,
          evidenceQuality: 90,
          outreachReadiness: 75
        },
        positiveFactors: ['Great tech stack match', 'Obvious signs of budget'],
        negativeFactors: ['No clear decision maker'],
        missingInformation: ['Current agency spending']
      };
      
      const result = Stage6Schema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject out of bounds scores', () => {
      const invalidData = {
        overallScore: 105, // > 100
        scoreLabel: 'Excellent',
        confidence: 90,
        scoreBreakdown: {
          agencyServiceFit: 95,
          problemSeverity: 80,
          businessMaturity: 70,
          likelyProjectValue: 85,
          evidenceQuality: 90,
          outreachReadiness: 75
        },
        positiveFactors: [],
        negativeFactors: [],
        missingInformation: []
      };
      
      const result = Stage6Schema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path[0]).toBe('overallScore');
      }
    });
    
    it('should reject invalid score labels', () => {
      const invalidData = {
        overallScore: 85,
        scoreLabel: 'Okay', // Not an enum value
        confidence: 90,
        scoreBreakdown: {
          agencyServiceFit: 95,
          problemSeverity: 80,
          businessMaturity: 70,
          likelyProjectValue: 85,
          evidenceQuality: 90,
          outreachReadiness: 75
        },
        positiveFactors: [],
        negativeFactors: [],
        missingInformation: []
      };
      
      const result = Stage6Schema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('Stage1Schema (Fact Extraction)', () => {
    it('should validate a correct payload', () => {
      const validData = {
        companyName: 'Acme Corp',
        industry: 'Software',
        offerings: ['Widgets', 'Gadgets'],
        audience: 'B2B',
        businessModel: 'SaaS',
        contactChannels: ['hello@acme.com'],
        socialLinks: ['https://twitter.com/acme'],
        copyrightYear: '2023',
        technologiesUsed: ['React', 'Node.js']
      };
      
      const result = Stage1Schema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject when missing required fields', () => {
      const invalidData = {
        companyName: 'Acme Corp'
        // Missing description, industry, etc
      };
      
      const result = Stage1Schema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
});
