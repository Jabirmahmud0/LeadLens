import { describe, it, expect, vi } from 'vitest';
import { Stage6Schema } from './prompts/stage6-fit-scoring';
import { Stage1Schema } from './prompts/stage1-fact-extraction';
import { MAX_EVIDENCE_EXCERPT_LENGTH, normalizeStage10Output, Stage10Schema } from './prompts/stage10-source-verification';

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
        scoreLabel: 'High potential',
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
        scoreLabel: 'High potential',
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

  describe('Stage10Schema (Source Verification)', () => {
    it('normalizes an oversized citation instead of rejecting the report', () => {
      const oversizedExcerpt = 'e'.repeat(MAX_EVIDENCE_EXCERPT_LENGTH + 120);
      const parsed = Stage10Schema.parse({
        verifiedFindings: [{
          findingIndex: 12,
          citations: [{
            sourcePageId: '550e8400-e29b-41d4-a716-446655440000',
            evidenceExcerpt: oversizedExcerpt,
          }],
          confidence: 80,
          isFactOrInference: 'fact',
        }],
        limitations: [],
        unsupportedAreas: [],
      });

      const normalized = normalizeStage10Output(parsed);
      expect(normalized.verifiedFindings[0].citations[0].evidenceExcerpt).toHaveLength(MAX_EVIDENCE_EXCERPT_LENGTH);
      expect(normalized.verifiedFindings[0].citations[0].evidenceExcerpt).toBe(oversizedExcerpt.slice(0, MAX_EVIDENCE_EXCERPT_LENGTH));
    });
  });
});
