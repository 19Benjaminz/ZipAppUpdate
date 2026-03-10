import { 
  userCacheService, 
  apartmentCacheService, 
  zipporaCacheService, 
  logsCacheService,
  clearAllCaches 
} from '../services';
import { initializeDatabase, getCurrentTimestamp } from '../index';

// Mock SQLite
jest.mock('expo-sqlite', () => ({
  openDatabaseSync: jest.fn(() => ({
    execSync: jest.fn(),
    runSync: jest.fn(),
    getFirstSync: jest.fn(),
    getAllSync: jest.fn(),
  })),
}));

describe('Database Services', () => {
  beforeAll(() => {
    // Initialize database before tests
    initializeDatabase();
  });

  describe('userCacheService', () => {
    const testMemberId = 'test-member-123';
    const testAccessToken = 'test-token-456';
    const testUserData = { name: 'Test User', email: 'test@example.com' };

    it('should save user cache', () => {
      expect(() => {
        userCacheService.saveUserCache(testMemberId, testAccessToken, testUserData);
      }).not.toThrow();
    });

    it('should clear user cache', () => {
      expect(() => {
        userCacheService.clearUserCache(testMemberId);
      }).not.toThrow();
    });
  });

  describe('apartmentCacheService', () => {
    const testMemberId = 'test-member-123';
    const testApartmentId = 'apt-456';
    const testApartmentData = { name: 'Test Apartment', units: 10 };

    it('should save apartment cache', () => {
      expect(() => {
        apartmentCacheService.saveApartmentCache(testMemberId, testApartmentId, testApartmentData);
      }).not.toThrow();
    });

    it('should clear apartment cache for specific apartment', () => {
      expect(() => {
        apartmentCacheService.clearApartmentCache(testMemberId, testApartmentId);
      }).not.toThrow();
    });

    it('should clear all apartments for a member', () => {
      expect(() => {
        apartmentCacheService.clearApartmentCache(testMemberId);
      }).not.toThrow();
    });
  });

  describe('zipporaCacheService', () => {
    const testMemberId = 'test-member-123';
    const testZipporaList = { items: ['item1', 'item2'] };

    it('should save zippora cache', () => {
      expect(() => {
        zipporaCacheService.saveZipporaCache(testMemberId, testZipporaList);
      }).not.toThrow();
    });

    it('should clear zippora cache', () => {
      expect(() => {
        zipporaCacheService.clearZipporaCache(testMemberId);
      }).not.toThrow();
    });
  });

  describe('logsCacheService', () => {
    const testMemberId = 'test-member-123';
    const testLogsData = { logs: ['log1', 'log2'] };

    it('should save logs cache', () => {
      expect(() => {
        logsCacheService.saveLogsCache(testMemberId, testLogsData);
      }).not.toThrow();
    });

    it('should clear logs cache', () => {
      expect(() => {
        logsCacheService.clearLogsCache(testMemberId);
      }).not.toThrow();
    });
  });

  describe('clearAllCaches', () => {
    const testMemberId = 'test-member-123';

    it('should clear all caches for a member', () => {
      expect(() => {
        clearAllCaches(testMemberId);
      }).not.toThrow();
    });
  });

  describe('getCurrentTimestamp', () => {
    it('should return a valid timestamp', () => {
      const timestamp = getCurrentTimestamp();
      expect(typeof timestamp).toBe('number');
      expect(timestamp).toBeGreaterThan(0);
    });
  });
});
