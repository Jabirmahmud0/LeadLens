import { describe, it, expect, vi, beforeEach } from 'vitest';
import { hashToken, generateToken, validateSession, createSession } from './session';
import { db } from '@leadlens/database';

vi.mock('@leadlens/database', () => ({
  db: {
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    returning: vi.fn().mockResolvedValue([{ id: 'sess-123' }]),
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    innerJoin: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
  },
  schema: {
    sessions: { userId: 's.userId', tokenHash: 's.tokenHash', expiresAt: 's.expiresAt', id: 's.id' },
    users: { id: 'u.id', status: 'u.status' },
    organizations: { id: 'o.id' },
    organizationMembers: { role: 'om.role', organizationId: 'om.orgId', userId: 'om.userId' }
  }
}));

vi.mock('drizzle-orm', () => ({
  eq: vi.fn().mockReturnValue('eq'),
  and: vi.fn().mockReturnValue('and'),
  gt: vi.fn().mockReturnValue('gt'),
}));

describe('Auth Session Logic', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Token Hashing', () => {
    it('should generate deterministic hashes for the same token', () => {
      const token = 'my-super-secret-token-123';
      const hash1 = hashToken(token);
      const hash2 = hashToken(token);
      
      expect(hash1).toBe(hash2);
      expect(hash1).not.toBe(token);
      expect(hash1).toHaveLength(64); // SHA-256 produces 64 hex chars
    });

    it('should produce different hashes for different tokens', () => {
      const hash1 = hashToken('token-A');
      const hash2 = hashToken('token-B');
      
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('Session Validation', () => {
    it('should return null for expired sessions (simulated via db empty array)', async () => {
      (db.where as any).mockResolvedValueOnce([]); // session query (has no limit)
      
      const result = await validateSession('some-token');
      expect(result).toBeNull();
    });

    it('should return null if session is revoked', async () => {
      // Mock finding a revoked session
      (db.where as any).mockResolvedValueOnce([{
        session: { id: 'sess-123', revokedAt: new Date() },
        user: { id: 'user-1', status: 'active' }
      }]);
      
      const result = await validateSession('some-token');
      expect(result).toBeNull();
    });

    it.each(['suspended', 'deleted'])('should reject and revoke a session for a %s user', async (status) => {
      (db.where as any).mockResolvedValueOnce([{
        session: { id: 'sess-123', revokedAt: null },
        user: { id: 'user-1', status },
      }]);
      (db.update as any).mockReturnValueOnce({
        set: vi.fn().mockReturnValueOnce({
          where: vi.fn().mockResolvedValue(true),
        }),
      });

      await expect(validateSession('some-token')).resolves.toBeNull();
      expect(db.update).toHaveBeenCalled();
    });
    
    it('should update lastSeenAt if session is valid', async () => {
      const validSession = { 
        id: 'sess-123', 
        revokedAt: null,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 20) // 20 days (not near expiry)
      };
      
      (db.where as any)
        // First call is for session validation (returns promise directly)
        .mockResolvedValueOnce([{
          session: validSession,
          user: { id: 'user-1', status: 'active' }
        }])
        // Second call is for org finding, but it has a limit, so we mock where to return an object with limit
        .mockReturnValueOnce({
          limit: vi.fn().mockResolvedValue([{
            organization: { id: 'org-1' },
            role: 'owner'
          }])
        });
        
      (db.update as any).mockReturnValueOnce({
        set: vi.fn().mockReturnValueOnce({
          where: vi.fn().mockResolvedValue(true)
        })
      });
        
      const result = await validateSession('some-token');
      
      expect(result).not.toBeNull();
      expect(result?.user.id).toBe('user-1');
      expect(result?.organization?.id).toBe('org-1');
      expect(db.update).toHaveBeenCalled();
    });
  });
});
