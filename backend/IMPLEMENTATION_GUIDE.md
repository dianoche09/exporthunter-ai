# Backend Architecture Implementation Guide

This guide provides step-by-step instructions for implementing the architectural improvements outlined in `ARCHITECTURE.md`.

## Quick Start

The following files have been created and are ready to use:

1. ✅ **Standardized Response Utility** (`src/utils/response.ts`)
2. ✅ **Custom Error Classes** (`src/utils/errors.ts`)
3. ✅ **Request Validation Middleware** (`src/middleware/validate.ts`)
4. ✅ **Enhanced Error Handler** (`src/middleware/errorHandler.ts`)
5. ✅ **Rate Limiting Middleware** (`src/middleware/rateLimiter.ts`)
6. ✅ **Database Configuration** (`src/config/database.ts`)
7. ✅ **Example Validation Schemas** (`src/schemas/leadSchemas.ts`)

## Step 1: Update Dependencies

Add required packages to `package.json`:

```bash
npm install zod
npm install --save-dev @types/node
```

## Step 2: Update Controllers to Use New Utilities

### Example: Update `leadsController.ts`

**Before:**
```typescript
export const getLeads = async (req: AuthRequest, res: Response) => {
  try {
    // ... logic
    res.json({
      success: true,
      data: { leads, pagination }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
```

**After:**
```typescript
import { ApiResponse } from '../utils/response';
import { NotFoundError } from '../utils/errors';

export const getLeads = async (req: AuthRequest, res: Response) => {
  // Remove try-catch - errorHandler will catch AppErrors
  const { page = 1, limit = 20, status, search, sort } = req.query;
  
  const result = await leadService.getLeads(
    req.user._id,
    { status, search },
    { page: Number(page), limit: Number(limit), sort }
  );

  res.json(ApiResponse.paginated(result.leads, {
    page: Number(page),
    limit: Number(limit),
    total: result.total,
    totalPages: Math.ceil(result.total / Number(limit))
  }));
};
```

## Step 3: Add Validation to Routes

### Example: Update `routes/leads.ts`

```typescript
import { Router } from 'express';
import { getLeads, createLead, updateLead, deleteLead } from '../controllers/leadsController';
import { authMiddleware } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  createLeadSchema,
  updateLeadSchema,
  getLeadsSchema,
  getLeadByIdSchema,
  deleteLeadSchema
} from '../schemas/leadSchemas';

const router = Router();
router.use(authMiddleware);

// Apply validation middleware
router.get('/', validate(getLeadsSchema), getLeads);
router.post('/', validate(createLeadSchema), createLead);
router.put('/:id', validate(updateLeadSchema), updateLead);
router.delete('/:id', validate(deleteLeadSchema), deleteLead);
router.get('/:id', validate(getLeadByIdSchema), getLead);

export { router as leadsRouter };
```

## Step 4: Update Error Handling in Controllers

Replace manual error handling with custom error classes:

```typescript
// Before
if (!lead) {
  return res.status(404).json({ success: false, error: 'Lead not found' });
}

// After
import { NotFoundError } from '../utils/errors';

if (!lead) {
  throw new NotFoundError('Lead');
}
```

## Step 5: Test the Changes

### Test Validation

```bash
# Should fail validation
curl -X POST http://localhost:3001/api/leads \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"companyName": ""}'

# Expected response:
{
  "success": false,
  "error": {
    "message": "Validation failed",
    "code": "VALIDATION_ERROR",
    "fields": {
      "body.companyName": ["String must contain at least 1 character(s)"],
      "body.email": ["Required"]
    }
  }
}
```

### Test Rate Limiting

```bash
# Make 101 requests quickly
for i in {1..101}; do
  curl http://localhost:3001/api/leads \
    -H "Authorization: Bearer <token>"
done

# Expected: 429 status after 100 requests
```

## Step 6: Database Index Optimization

Add indexes to your models:

```typescript
// src/models/Lead.ts
leadSchema.index({ userId: 1, status: 1, aiScore: -1 });
leadSchema.index({ userId: 1, createdAt: -1 });
leadSchema.index({ userId: 1, country: 1 });
leadSchema.index({ userId: 1, industry: 1 });

// src/models/Campaign.ts
campaignSchema.index({ userId: 1, status: 1, createdAt: -1 });
campaignSchema.index({ status: 1, scheduledAt: 1 });

// src/models/EmailActivity.ts
emailActivitySchema.index({ campaignId: 1, status: 1 });
emailActivitySchema.index({ leadId: 1, status: 1 });
emailActivitySchema.index({ userId: 1, createdAt: -1 });
```

## Step 7: Environment Variables

Add to `.env`:

```env
# Rate Limiting (optional - uses in-memory store by default)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Encryption (for API keys)
ENCRYPTION_KEY=your-32-byte-hex-key-here

# Logging
LOG_LEVEL=info
NODE_ENV=production
```

## Migration Checklist

- [ ] Install new dependencies (`zod`)
- [ ] Update controllers to use `ApiResponse`
- [ ] Replace manual error handling with `AppError` classes
- [ ] Add validation schemas to routes
- [ ] Test validation with invalid requests
- [ ] Test rate limiting
- [ ] Add database indexes
- [ ] Update environment variables
- [ ] Test error responses
- [ ] Update API documentation

## Common Patterns

### Creating a New Endpoint

1. **Define validation schema:**
```typescript
// src/schemas/myResourceSchemas.ts
export const createMyResourceSchema: ValidationSchema = {
  body: z.object({
    name: z.string().min(1),
    // ... other fields
  })
};
```

2. **Create controller:**
```typescript
// src/controllers/myResourceController.ts
import { ApiResponse } from '../utils/response';
import { NotFoundError } from '../utils/errors';

export const createMyResource = async (req: AuthRequest, res: Response) => {
  const resource = await myResourceService.create(req.user._id, req.body);
  res.status(201).json(ApiResponse.created(resource));
};
```

3. **Add route:**
```typescript
// src/routes/myResource.ts
router.post('/', validate(createMyResourceSchema), createMyResource);
```

### Error Handling Pattern

```typescript
// In service layer
if (!resource) {
  throw new NotFoundError('Resource');
}

if (resource.userId.toString() !== userId) {
  throw new ForbiddenError('You do not have access to this resource');
}

// In controller - no try-catch needed!
// Error handler middleware will catch AppErrors
```

## Next Steps

After completing the basic implementation:

1. **Add Redis for caching** (see ARCHITECTURE.md section 4.1)
2. **Implement repository pattern** (see ARCHITECTURE.md section 6.2)
3. **Add background job queue** (see ARCHITECTURE.md section 7.1.1)
4. **Migrate file storage to S3** (see ARCHITECTURE.md section 7.1.2)

## Troubleshooting

### Validation errors not showing fields
- Ensure you're using the `validate` middleware
- Check that Zod schema matches request structure

### Rate limiting not working
- Verify rate limiter is applied before routes
- Check that `express-rate-limit` is installed

### Errors not being caught
- Ensure `errorHandler` is the last middleware
- Make sure you're throwing `AppError` instances, not plain Errors

## Support

For questions or issues, refer to:
- `ARCHITECTURE.md` for detailed architecture documentation
- `src/utils/response.ts` for response format examples
- `src/utils/errors.ts` for available error types

