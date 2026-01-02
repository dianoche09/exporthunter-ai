# Backend Architecture - Quick Reference

## 📋 Overview

This document provides a quick reference for the backend architecture improvements. For detailed documentation, see `ARCHITECTURE.md`.

## 🎯 Key Improvements Implemented

### 1. Standardized API Responses
- **File:** `src/utils/response.ts`
- **Usage:** `ApiResponse.success(data)`, `ApiResponse.error(message, code)`, `ApiResponse.paginated(items, meta)`
- **Benefit:** Consistent response format across all endpoints

### 2. Custom Error Classes
- **File:** `src/utils/errors.ts`
- **Classes:** `ValidationError`, `NotFoundError`, `UnauthorizedError`, `ForbiddenError`, etc.
- **Usage:** `throw new NotFoundError('Lead')`
- **Benefit:** Structured error handling with proper HTTP status codes

### 3. Request Validation
- **File:** `src/middleware/validate.ts`
- **Usage:** `router.post('/', validate(createLeadSchema), createLead)`
- **Benefit:** Type-safe validation with Zod, automatic error responses

### 4. Enhanced Error Handler
- **File:** `src/middleware/errorHandler.ts`
- **Features:** Handles AppErrors, Zod errors, Mongoose errors, MongoDB duplicates
- **Benefit:** Centralized error handling, consistent error format

### 5. Rate Limiting
- **File:** `src/middleware/rateLimiter.ts`
- **Limiters:** `apiLimiter`, `authLimiter`, `aiLimiter`, `emailLimiter`
- **Usage:** Applied in `server.ts` to routes
- **Benefit:** Protection against abuse, subscription-based limits

### 6. Database Optimization
- **File:** `src/config/database.ts`
- **Features:** Connection pooling, timeout configuration, event handlers
- **Benefit:** Better performance, graceful shutdown

## 📁 File Structure

```
backend/src/
├── config/
│   └── database.ts          # MongoDB connection config
├── middleware/
│   ├── auth.ts             # Authentication
│   ├── errorHandler.ts     # Enhanced error handling
│   ├── rateLimiter.ts      # Rate limiting
│   └── validate.ts         # Request validation
├── schemas/
│   └── leadSchemas.ts      # Example validation schemas
└── utils/
    ├── errors.ts           # Custom error classes
    └── response.ts         # Standardized responses
```

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install zod
```

### 2. Use in Controller
```typescript
import { ApiResponse } from '../utils/response';
import { NotFoundError } from '../utils/errors';

export const getLead = async (req: AuthRequest, res: Response) => {
  const lead = await Lead.findById(req.params.id);
  if (!lead) throw new NotFoundError('Lead');
  
  res.json(ApiResponse.success(lead));
};
```

### 3. Add Validation to Route
```typescript
import { validate } from '../middleware/validate';
import { getLeadByIdSchema } from '../schemas/leadSchemas';

router.get('/:id', validate(getLeadByIdSchema), getLead);
```

## 📊 API Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "timestamp": "2024-01-15T10:00:00Z"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "message": "Lead not found",
    "code": "NOT_FOUND"
  },
  "timestamp": "2024-01-15T10:00:00Z"
}
```

### Validation Error Response
```json
{
  "success": false,
  "error": {
    "message": "Validation failed",
    "code": "VALIDATION_ERROR",
    "fields": {
      "body.email": ["Invalid email format"],
      "body.companyName": ["Required"]
    }
  },
  "timestamp": "2024-01-15T10:00:00Z"
}
```

## 🔒 Rate Limits

| Endpoint Type | Limit | Window |
|--------------|-------|--------|
| General API | 100 requests | 15 minutes |
| Authentication | 5 requests | 15 minutes |
| AI Endpoints | 10-1000 requests | 1 hour (by subscription) |
| Email Sending | 50-5000 requests | 1 hour (by subscription) |

## 🗄️ Database Indexes (Recommended)

### Lead Model
```typescript
leadSchema.index({ userId: 1, status: 1, aiScore: -1 });
leadSchema.index({ userId: 1, createdAt: -1 });
leadSchema.index({ userId: 1, country: 1 });
```

### Campaign Model
```typescript
campaignSchema.index({ userId: 1, status: 1, createdAt: -1 });
campaignSchema.index({ status: 1, scheduledAt: 1 });
```

### EmailActivity Model
```typescript
emailActivitySchema.index({ campaignId: 1, status: 1 });
emailActivitySchema.index({ leadId: 1, status: 1 });
emailActivitySchema.index({ userId: 1, createdAt: -1 });
```

## 🔧 Common Patterns

### Creating a New Endpoint

1. **Define Schema:**
```typescript
export const createResourceSchema: ValidationSchema = {
  body: z.object({
    name: z.string().min(1),
    email: commonSchemas.email
  })
};
```

2. **Create Controller:**
```typescript
export const createResource = async (req: AuthRequest, res: Response) => {
  const resource = await resourceService.create(req.user._id, req.body);
  res.status(201).json(ApiResponse.created(resource));
};
```

3. **Add Route:**
```typescript
router.post('/', validate(createResourceSchema), createResource);
```

### Error Handling Pattern
```typescript
// In service/controller - no try-catch needed!
if (!resource) {
  throw new NotFoundError('Resource');
}

// Error handler middleware catches it automatically
```

## 📈 Next Steps

1. **Phase 1 (Week 1-2):** ✅ Foundation
   - ✅ API standardization
   - ✅ Error handling
   - ✅ Request validation
   - ✅ Rate limiting

2. **Phase 2 (Week 3-4):** Performance
   - [ ] Redis caching
   - [ ] Database index optimization
   - [ ] Query optimization

3. **Phase 3 (Week 5):** Security
   - [ ] API key encryption
   - [ ] Input sanitization
   - [ ] Enhanced security headers

4. **Phase 4 (Week 6-8):** Scalability
   - [ ] Background job queue
   - [ ] File storage migration (S3)
   - [ ] Repository pattern

## 📚 Documentation

- **Full Architecture:** `ARCHITECTURE.md`
- **Implementation Guide:** `IMPLEMENTATION_GUIDE.md`
- **This Summary:** `ARCHITECTURE_SUMMARY.md`

## 🐛 Troubleshooting

### Validation not working
- Ensure `validate` middleware is applied before controller
- Check schema matches request structure

### Errors not caught
- Verify `errorHandler` is last middleware
- Use `AppError` classes, not plain `Error`

### Rate limiting too strict
- Adjust limits in `rateLimiter.ts`
- Check subscription-based limits

## ✅ Checklist

- [x] Standardized response format
- [x] Custom error classes
- [x] Request validation middleware
- [x] Enhanced error handler
- [x] Rate limiting
- [x] Database connection optimization
- [ ] Add database indexes
- [ ] Update all controllers
- [ ] Add validation to all routes
- [ ] Test error scenarios
- [ ] Update API documentation

---

**Last Updated:** 2024-01-15  
**Version:** 1.0

