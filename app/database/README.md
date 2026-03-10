# Database Module

This module provides SQLite database functionality for local data caching in the ZipAppUpdate app.

## Overview

The database module uses `expo-sqlite` to provide local storage and caching capabilities. It automatically caches API responses to improve performance and enable offline functionality.

## Structure

- `index.ts` - Database initialization and utility functions
- `services.ts` - Service layer for database operations (CRUD)
- `__tests__/` - Test suite for database operations

## Tables

### user_cache
Caches user profile information.

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key |
| member_id | TEXT | Unique user identifier |
| access_token | TEXT | User's access token |
| user_data | TEXT | JSON string of user data |
| updated_at | INTEGER | Unix timestamp |

### apartment_cache
Caches apartment information.

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key |
| member_id | TEXT | User identifier |
| apartment_id | TEXT | Apartment identifier |
| apartment_data | TEXT | JSON string of apartment data |
| updated_at | INTEGER | Unix timestamp |

### zippora_cache
Caches Zippora list data.

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key |
| member_id | TEXT | User identifier |
| zippora_list | TEXT | JSON string of zippora list |
| updated_at | INTEGER | Unix timestamp |

### logs_cache
Caches log data.

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key |
| member_id | TEXT | User identifier |
| logs_data | TEXT | JSON string of logs |
| updated_at | INTEGER | Unix timestamp |

## Usage

### Initialization

The database is automatically initialized when the app starts in `app/_layout.tsx`:

```typescript
import { initializeDatabase } from './database';

// Initialize database on app startup
initializeDatabase();
```

### Cache Services

#### User Cache

```typescript
import { userCacheService } from './database/services';

// Save user data to cache
userCacheService.saveUserCache(memberId, accessToken, userData);

// Get cached user data (with 5-minute default expiry)
const cachedUser = userCacheService.getUserCache(memberId);

// Get cached user data with custom expiry (in seconds)
const cachedUser = userCacheService.getUserCache(memberId, 600); // 10 minutes

// Clear user cache
userCacheService.clearUserCache(memberId);
```

#### Apartment Cache

```typescript
import { apartmentCacheService } from './database/services';

// Save apartment data
apartmentCacheService.saveApartmentCache(memberId, apartmentId, apartmentData);

// Get specific apartment
const apartment = apartmentCacheService.getApartmentCache(memberId, apartmentId);

// Get all apartments for a user
const apartments = apartmentCacheService.getAllApartments(memberId);

// Clear specific apartment
apartmentCacheService.clearApartmentCache(memberId, apartmentId);

// Clear all apartments for a user
apartmentCacheService.clearApartmentCache(memberId);
```

#### Zippora Cache

```typescript
import { zipporaCacheService } from './database/services';

// Save zippora list
zipporaCacheService.saveZipporaCache(memberId, zipporaList);

// Get cached zippora list
const zipporaList = zipporaCacheService.getZipporaCache(memberId);

// Clear zippora cache
zipporaCacheService.clearZipporaCache(memberId);
```

#### Logs Cache

```typescript
import { logsCacheService } from './database/services';

// Save logs
logsCacheService.saveLogsCache(memberId, logsData);

// Get cached logs
const logs = logsCacheService.getLogsCache(memberId);

// Clear logs cache
logsCacheService.clearLogsCache(memberId);
```

#### Clear All Caches

```typescript
import { clearAllCaches } from './database/services';

// Clear all caches for a user (useful on logout)
clearAllCaches(memberId);
```

### API Integration

The database is integrated with API calls in `app/config/apiService.ts`. API functions automatically:
1. Check cache before making API requests
2. Return cached data if valid
3. Make API request if cache is expired or missing
4. Update cache with fresh data

Example from `zipporaApi.getZipporaList`:

```typescript
// Check cache first
const cachedData = zipporaCacheService.getZipporaCache(credentials.memberId);
if (cachedData) {
  return cachedData.zipporaList;
}

// Make API request if cache miss
const response = await apiClient.get(requestURL);

// Save to cache
zipporaCacheService.saveZipporaCache(credentials.memberId, response.data);
```

## Cache Expiry

By default, cached data expires after 5 minutes (300 seconds). You can customize this by passing a different `maxAge` parameter:

```typescript
// Cache valid for 10 minutes
const data = userCacheService.getUserCache(memberId, 600);

// Cache valid for 1 hour
const data = userCacheService.getUserCache(memberId, 3600);
```

## Benefits

1. **Performance**: Reduces API calls and improves app responsiveness
2. **Offline Support**: Provides data when network is unavailable
3. **Reduced Bandwidth**: Minimizes data usage
4. **Better UX**: Faster load times for frequently accessed data

## Security

- Database files are stored locally on the device
- All caches are cleared when user logs out
- No sensitive data should be stored in plain text
- Access tokens are stored but should be treated as temporary
