import { Lead } from '../../models/Lead';
import Papa from 'papaparse';

class ImportExportService {
    async importLeadsFromCSV(userId: string, csvData: string) {
        try {
            const results = Papa.parse(csvData, {
                header: true,
                skipEmptyLines: true
            });

            const leads = results.data as any[];
            const importResults = {
                success: 0,
                failed: 0,
                errors: [] as string[]
            };

            for (const row of leads) {
                try {
                    // Validate required fields
                    if (!row.companyName || !row.email) {
                        importResults.failed++;
                        importResults.errors.push(`Missing required fields for row: ${JSON.stringify(row)}`);
                        continue;
                    }

                    // Check if lead already exists
                    const existingLead = await Lead.findOne({
                        userId,
                        email: row.email
                    });

                    if (existingLead) {
                        importResults.failed++;
                        importResults.errors.push(`Lead with email ${row.email} already exists`);
                        continue;
                    }

                    // Create new lead
                    await Lead.create({
                        userId,
                        companyName: row.companyName,
                        country: row.country || 'Unknown',
                        city: row.city || '',
                        email: row.email,
                        phone: row.phone || '',
                        website: row.website || '',
                        industry: row.industry || 'Other',
                        status: row.status || 'new',
                        source: 'import',
                        tags: row.tags ? row.tags.split(';').filter(Boolean) : [],
                        notes: row.notes || '',
                        aiScore: parseInt(row.aiScore) || 0
                    });

                    importResults.success++;
                } catch (error: any) {
                    importResults.failed++;
                    importResults.errors.push(`Error importing lead: ${error.message}`);
                }
            }

            return importResults;
        } catch (error) {
            console.error('Error importing leads:', error);
            throw error;
        }
    }

    async exportLeadsToCSV(userId: string) {
        try {
            const leads = await Lead.find({ userId }).lean();

            const csvData = leads.map(lead => ({
                companyName: lead.companyName,
                country: lead.country,
                city: lead.city,
                email: lead.email,
                phone: lead.phone || '',
                website: lead.website || '',
                industry: lead.industry,
                status: lead.status,
                source: lead.source,
                tags: (lead.tags || []).join(';'),
                notes: lead.notes || '',
                aiScore: lead.aiScore || 0,
                createdAt: lead.createdAt
            }));

            const csv = Papa.unparse(csvData);
            return csv;
        } catch (error) {
            console.error('Error exporting leads:', error);
            throw error;
        }
    }
}

export const importExportService = new ImportExportService();
