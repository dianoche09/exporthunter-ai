/**
 * Lead Validation Schemas
 * Example of using Zod for request validation
 */

import { z } from 'zod';
import { ValidationSchema, commonSchemas } from '../middleware/validate';

// Create Lead Schema
export const createLeadSchema: ValidationSchema = {
  body: z.object({
    companyName: z.string().min(1, 'Company name is required').max(200),
    email: commonSchemas.email,
    country: z.string().min(2, 'Country is required').max(100),
    city: z.string().max(100).optional(),
    phone: z.string().max(50).optional(),
    website: z.string().url('Invalid website URL').optional().or(z.literal('')),
    industry: z.string().min(1, 'Industry is required').max(100),
    status: z.enum(['new', 'contacted', 'interested', 'qualified', 'customer', 'rejected']).optional(),
    tags: z.array(z.string()).optional(),
    notes: z.string().max(5000).optional(),
    aiScore: z.number().min(0).max(100).optional(),
    potentialProducts: z.array(z.string()).optional(),
  })
};

// Update Lead Schema
export const updateLeadSchema: ValidationSchema = {
  params: z.object({
    id: commonSchemas.mongoId
  }),
  body: z.object({
    companyName: z.string().min(1).max(200).optional(),
    email: commonSchemas.email.optional(),
    country: z.string().min(2).max(100).optional(),
    city: z.string().max(100).optional(),
    phone: z.string().max(50).optional(),
    website: z.string().url().optional().or(z.literal('')),
    industry: z.string().min(1).max(100).optional(),
    status: commonSchemas.status.optional(),
    tags: z.array(z.string()).optional(),
    notes: z.string().max(5000).optional(),
    aiScore: z.number().min(0).max(100).optional(),
    potentialProducts: z.array(z.string()).optional(),
    nextStep: z.string().max(500).optional(),
    nextStepDate: z.string().datetime().optional(),
  }).refine(data => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update'
  })
};

// Get Leads Query Schema
export const getLeadsSchema: ValidationSchema = {
  query: z.object({
    page: commonSchemas.pagination.shape.page,
    limit: commonSchemas.pagination.shape.limit,
    status: z.enum(['all', 'new', 'contacted', 'interested', 'qualified', 'customer', 'rejected']).optional(),
    search: z.string().max(200).optional(),
    min_score: z.string().regex(/^\d+$/).transform(Number).optional(),
    sort: z.enum(['score_desc', 'score_asc', 'companyName_asc', 'companyName_desc', 'created_desc']).optional(),
  })
};

// Get Lead by ID Schema
export const getLeadByIdSchema: ValidationSchema = {
  params: z.object({
    id: commonSchemas.mongoId
  })
};

// Delete Lead Schema
export const deleteLeadSchema: ValidationSchema = {
  params: z.object({
    id: commonSchemas.mongoId
  })
};

// Discover Leads Batch Schema
export const discoverLeadsBatchSchema: ValidationSchema = {
  body: z.object({
    product: z.string().min(1, 'Product is required').max(200),
    targetMarkets: z.array(z.string().min(2)).min(1, 'At least one target market is required'),
    industry: z.string().min(1, 'Industry is required').max(100),
    count: z.number().min(1).max(50).optional().default(15),
  })
};

