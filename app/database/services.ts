import { openDatabase, getCurrentTimestamp, isCacheValid } from './index';

export interface CachedUser {
  memberId: string;
  accessToken?: string;
  userData?: any;
  updatedAt: number;
}

export interface CachedApartment {
  memberId: string;
  apartmentId: string;
  apartmentData?: any;
  updatedAt: number;
}

export interface CachedZippora {
  memberId: string;
  zipporaList?: any;
  updatedAt: number;
}

export interface CachedLogs {
  memberId: string;
  logsData?: any;
  updatedAt: number;
}

// User cache operations
export const userCacheService = {
  // Save or update user cache
  saveUserCache: (memberId: string, accessToken: string, userData: any): void => {
    const db = openDatabase();
    const timestamp = getCurrentTimestamp();
    const userDataJson = JSON.stringify(userData);

    db.runSync(
      `INSERT INTO user_cache (member_id, access_token, user_data, updated_at)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(member_id) DO UPDATE SET
         access_token = excluded.access_token,
         user_data = excluded.user_data,
         updated_at = excluded.updated_at`,
      [memberId, accessToken, userDataJson, timestamp]
    );
  },

  // Get user cache
  getUserCache: (memberId: string, maxAge: number = 300): CachedUser | null => {
    const db = openDatabase();
    const result = db.getFirstSync<{ member_id: string; access_token: string; user_data: string; updated_at: number }>(
      'SELECT member_id, access_token, user_data, updated_at FROM user_cache WHERE member_id = ?',
      [memberId]
    );

    if (!result) {
      return null;
    }

    if (!isCacheValid(result.updated_at, maxAge)) {
      return null;
    }

    return {
      memberId: result.member_id,
      accessToken: result.access_token,
      userData: result.user_data ? JSON.parse(result.user_data) : null,
      updatedAt: result.updated_at,
    };
  },

  // Clear user cache
  clearUserCache: (memberId: string): void => {
    const db = openDatabase();
    db.runSync('DELETE FROM user_cache WHERE member_id = ?', [memberId]);
  },
};

// Apartment cache operations
export const apartmentCacheService = {
  // Save or update apartment cache
  saveApartmentCache: (memberId: string, apartmentId: string, apartmentData: any): void => {
    const db = openDatabase();
    const timestamp = getCurrentTimestamp();
    const apartmentDataJson = JSON.stringify(apartmentData);

    db.runSync(
      `INSERT INTO apartment_cache (member_id, apartment_id, apartment_data, updated_at)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(member_id, apartment_id) DO UPDATE SET
         apartment_data = excluded.apartment_data,
         updated_at = excluded.updated_at`,
      [memberId, apartmentId, apartmentDataJson, timestamp]
    );
  },

  // Get apartment cache
  getApartmentCache: (memberId: string, apartmentId: string, maxAge: number = 300): CachedApartment | null => {
    const db = openDatabase();
    const result = db.getFirstSync<{ member_id: string; apartment_id: string; apartment_data: string; updated_at: number }>(
      'SELECT member_id, apartment_id, apartment_data, updated_at FROM apartment_cache WHERE member_id = ? AND apartment_id = ?',
      [memberId, apartmentId]
    );

    if (!result) {
      return null;
    }

    if (!isCacheValid(result.updated_at, maxAge)) {
      return null;
    }

    return {
      memberId: result.member_id,
      apartmentId: result.apartment_id,
      apartmentData: result.apartment_data ? JSON.parse(result.apartment_data) : null,
      updatedAt: result.updated_at,
    };
  },

  // Get all apartments for a member
  getAllApartments: (memberId: string, maxAge: number = 300): CachedApartment[] => {
    const db = openDatabase();
    const results = db.getAllSync<{ member_id: string; apartment_id: string; apartment_data: string; updated_at: number }>(
      'SELECT member_id, apartment_id, apartment_data, updated_at FROM apartment_cache WHERE member_id = ?',
      [memberId]
    );

    return results
      .filter(result => isCacheValid(result.updated_at, maxAge))
      .map(result => ({
        memberId: result.member_id,
        apartmentId: result.apartment_id,
        apartmentData: result.apartment_data ? JSON.parse(result.apartment_data) : null,
        updatedAt: result.updated_at,
      }));
  },

  // Clear apartment cache for a member
  clearApartmentCache: (memberId: string, apartmentId?: string): void => {
    const db = openDatabase();
    if (apartmentId) {
      db.runSync('DELETE FROM apartment_cache WHERE member_id = ? AND apartment_id = ?', [memberId, apartmentId]);
    } else {
      db.runSync('DELETE FROM apartment_cache WHERE member_id = ?', [memberId]);
    }
  },
};

// Zippora cache operations
export const zipporaCacheService = {
  // Save or update zippora list cache
  saveZipporaCache: (memberId: string, zipporaList: any): void => {
    const db = openDatabase();
    const timestamp = getCurrentTimestamp();
    const zipporaListJson = JSON.stringify(zipporaList);

    db.runSync(
      `INSERT INTO zippora_cache (member_id, zippora_list, updated_at)
       VALUES (?, ?, ?)
       ON CONFLICT(member_id) DO UPDATE SET
         zippora_list = excluded.zippora_list,
         updated_at = excluded.updated_at`,
      [memberId, zipporaListJson, timestamp]
    );
  },

  // Get zippora cache
  getZipporaCache: (memberId: string, maxAge: number = 300): CachedZippora | null => {
    const db = openDatabase();
    const result = db.getFirstSync<{ member_id: string; zippora_list: string; updated_at: number }>(
      'SELECT member_id, zippora_list, updated_at FROM zippora_cache WHERE member_id = ?',
      [memberId]
    );

    if (!result) {
      return null;
    }

    if (!isCacheValid(result.updated_at, maxAge)) {
      return null;
    }

    return {
      memberId: result.member_id,
      zipporaList: result.zippora_list ? JSON.parse(result.zippora_list) : null,
      updatedAt: result.updated_at,
    };
  },

  // Clear zippora cache
  clearZipporaCache: (memberId: string): void => {
    const db = openDatabase();
    db.runSync('DELETE FROM zippora_cache WHERE member_id = ?', [memberId]);
  },
};

// Logs cache operations
export const logsCacheService = {
  // Save or update logs cache
  saveLogsCache: (memberId: string, logsData: any): void => {
    const db = openDatabase();
    const timestamp = getCurrentTimestamp();
    const logsDataJson = JSON.stringify(logsData);

    db.runSync(
      `INSERT INTO logs_cache (member_id, logs_data, updated_at)
       VALUES (?, ?, ?)
       ON CONFLICT(member_id) DO UPDATE SET
         logs_data = excluded.logs_data,
         updated_at = excluded.updated_at`,
      [memberId, logsDataJson, timestamp]
    );
  },

  // Get logs cache
  getLogsCache: (memberId: string, maxAge: number = 300): CachedLogs | null => {
    const db = openDatabase();
    const result = db.getFirstSync<{ member_id: string; logs_data: string; updated_at: number }>(
      'SELECT member_id, logs_data, updated_at FROM logs_cache WHERE member_id = ?',
      [memberId]
    );

    if (!result) {
      return null;
    }

    if (!isCacheValid(result.updated_at, maxAge)) {
      return null;
    }

    return {
      memberId: result.member_id,
      logsData: result.logs_data ? JSON.parse(result.logs_data) : null,
      updatedAt: result.updated_at,
    };
  },

  // Clear logs cache
  clearLogsCache: (memberId: string): void => {
    const db = openDatabase();
    db.runSync('DELETE FROM logs_cache WHERE member_id = ?', [memberId]);
  },
};

// Clear all caches for a member
export const clearAllCaches = (memberId: string): void => {
  userCacheService.clearUserCache(memberId);
  apartmentCacheService.clearApartmentCache(memberId);
  zipporaCacheService.clearZipporaCache(memberId);
  logsCacheService.clearLogsCache(memberId);
};
