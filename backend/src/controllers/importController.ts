import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Lead } from '../models/Lead';
import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';

/**
 * Import leads from CSV file
 */
export const importLeads = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user._id;
        const csvContent = req.body.csvContent;

        if (!csvContent) {
            return res.status(400).json({
                success: false,
                error: 'No CSV content provided'
            });
        }

        // Parse CSV
        const records = parse(csvContent, {
            columns: true,
            skip_empty_lines: true,
            trim: true,
            relax_column_count: true
        });

        if (records.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'CSV file is empty'
            });
        }

        // Auto-detect field mapping
        const firstRecord = records[0];
        const fieldMapping = detectFieldMapping(firstRecord);

        const savedLeads = [];
        const errors = [];

        for (let i = 0; i < records.length; i++) {
            const record = records[i];

            try {
                // Map CSV fields to Lead model
                const leadData = {
                    userId,
                    companyName: record[fieldMapping.companyName] || '',
                    country: record[fieldMapping.country] || '',
                    city: record[fieldMapping.city] || '',
                    email: record[fieldMapping.email] || '',
                    phone: record[fieldMapping.phone] || '',
                    website: record[fieldMapping.website] || '',
                    industry: record[fieldMapping.industry] || 'Other',
                    status: mapStatus(record[fieldMapping.status]) || 'new',
                    source: 'import' as const,
                    tags: record[fieldMapping.tags] ? record[fieldMapping.tags].split(',').map((t: string) => t.trim()) : [],
                    notes: record[fieldMapping.notes] || '',
                    aiScore: parseFloat(record[fieldMapping.aiScore]) || 0
                };

                // Validate required fields
                if (!leadData.companyName) {
                    throw new Error('Company name is required');
                }
                if (!leadData.email) {
                    throw new Error('Email is required');
                }
                if (!leadData.country) {
                    throw new Error('Country is required');
                }

                const lead = await Lead.create(leadData);
                savedLeads.push(lead);
            } catch (error: any) {
                errors.push({
                    row: i + 1,
                    data: record,
                    error: error.message
                });
            }
        }

        res.status(201).json({
            success: true,
            data: {
                imported: savedLeads.length,
                failed: errors.length,
                total: records.length,
                leads: savedLeads,
                errors: errors.length > 0 ? errors : undefined,
                fieldMapping
            }
        });
    } catch (error: any) {
        console.error('CSV Import Error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to import CSV'
        });
    }
};

/**
 * Export leads to CSV
 */
export const exportLeads = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user._id;
        const { status, tags } = req.query;

        const query: any = { userId };
        if (status) query.status = status;
        if (tags) query.tags = { $in: (tags as string).split(',') };

        const leads = await Lead.find(query).sort({ createdAt: -1 });

        // Convert to CSV
        const records = leads.map(lead => ({
            'Company Name': lead.companyName,
            'Country': lead.country,
            'City': lead.city || '',
            'Email': lead.email,
            'Phone': lead.phone || '',
            'Website': lead.website || '',
            'Industry': lead.industry,
            'Status': lead.status,
            'Source': lead.source,
            'Tags': lead.tags.join(', '),
            'Notes': lead.notes,
            'AI Score': lead.aiScore,
            'Created At': lead.createdAt.toISOString()
        }));

        const csv = stringify(records, {
            header: true,
            quoted: true
        });

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="leads-export-${Date.now()}.csv"`);
        res.send(csv);
    } catch (error: any) {
        console.error('CSV Export Error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to export CSV'
        });
    }
};

/**
 * Auto-detect field mapping from CSV headers
 */
function detectFieldMapping(firstRecord: any): Record<string, string> {
    const headers = Object.keys(firstRecord);
    const mapping: Record<string, string> = {
        companyName: '',
        country: '',
        city: '',
        email: '',
        phone: '',
        website: '',
        industry: '',
        status: '',
        tags: '',
        notes: '',
        aiScore: ''
    };

    const patterns: Record<string, RegExp[]> = {
        companyName: [/company/i, /business/i, /organization/i, /firma/i, /şirket/i],
        country: [/country/i, /nation/i, /ülke/i],
        city: [/city/i, /town/i, /şehir/i],
        email: [/email/i, /e-mail/i, /mail/i, /eposta/i],
        phone: [/phone/i, /tel/i, /mobile/i, /telefon/i],
        website: [/website/i, /web/i, /url/i, /site/i],
        industry: [/industry/i, /sector/i, /sektör/i],
        status: [/status/i, /state/i, /durum/i],
        tags: [/tag/i, /category/i, /etiket/i],
        notes: [/note/i, /comment/i, /remark/i, /not/i],
        aiScore: [/score/i, /rating/i, /puan/i]
    };

    for (const [field, regexList] of Object.entries(patterns)) {
        for (const header of headers) {
            if (regexList.some(regex => regex.test(header))) {
                mapping[field] = header;
                break;
            }
        }
    }

    return mapping;
}

/**
 * Map CSV status values to Lead status enum
 */
function mapStatus(status: string): 'new' | 'contacted' | 'interested' | 'qualified' | 'customer' | 'rejected' {
    if (!status) return 'new';

    const normalized = status.toLowerCase().trim();
    const statusMap: Record<string, 'new' | 'contacted' | 'interested' | 'qualified' | 'customer' | 'rejected'> = {
        'new': 'new',
        'yeni': 'new',
        'contacted': 'contacted',
        'iletişim kuruldu': 'contacted',
        'interested': 'interested',
        'ilgileniyor': 'interested',
        'qualified': 'qualified',
        'kalifiye': 'qualified',
        'customer': 'customer',
        'müşteri': 'customer',
        'rejected': 'rejected',
        'reddedildi': 'rejected'
    };

    return statusMap[normalized] || 'new';
}
