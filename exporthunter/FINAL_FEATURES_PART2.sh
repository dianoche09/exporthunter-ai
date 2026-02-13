#!/bin/bash

echo "🚀 Final Features Part 2 ekleniyor..."

cd exporthunter-ai/backend

# ===========================================
# 4. AUTO FOLLOW-UP SYSTEM
# ===========================================

cat > src/services/campaign/autoFollowUp.ts << 'FOLLOWUP'
import { Campaign } from '../../models/Campaign';
import { Lead } from '../../models/Lead';
import { EmailActivity } from '../../models/EmailActivity';
import { geminiService } from '../ai/geminiService';
import { resendService } from '../email/resendService';

export class AutoFollowUpService {
  /**
   * Check and send follow-ups for campaigns
   */
  async processFollowUps(): Promise<void> {
    try {
      console.log('🔄 Processing auto follow-ups...');

      // Get completed campaigns
      const campaigns = await Campaign.find({ status: 'completed' });

      for (const campaign of campaigns) {
        await this.processC ampaignFollowUps(campaign._id.toString());
      }

      console.log('✅ Auto follow-ups processed');
    } catch (error) {
      console.error('Auto Follow-up Error:', error);
    }
  }

  /**
   * Process follow-ups for a specific campaign
   */
  private async processCampaignFollowUps(campaignId: string): Promise<void> {
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) return;

    // Get email activities that need follow-up
    const activities = await EmailActivity.find({
      campaignId,
      status: 'sent',
      openedAt: { $exists: false },
      sentAt: { $exists: true }
    }).populate('leadId');

    const now = new Date();

    for (const activity of activities) {
      const daysSinceSent = Math.floor(
        (now.getTime() - activity.sentAt!.getTime()) / (1000 * 60 * 60 * 24)
      );

      // First follow-up: Day 4
      if (daysSinceSent === 4 && !activity.metadata?.followUp1Sent) {
        await this.sendFollowUp(campaign, activity, 1);
      }

      // Second follow-up: Day 11
      if (daysSinceSent === 11 && !activity.metadata?.followUp2Sent) {
        await this.sendFollowUp(campaign, activity, 2);
      }
    }
  }

  /**
   * Send follow-up email
   */
  private async sendFollowUp(
    campaign: any,
    activity: any,
    followUpNumber: number
  ): Promise<void> {
    try {
      const lead = activity.leadId;
      if (!lead) return;

      // Generate follow-up with AI
      const followUpBody = await geminiService.generateFollowUp({
        companyName: lead.companyName,
        previousEmail: campaign.body,
        daysSince: followUpNumber === 1 ? 4 : 11
      });

      // Send email
      const result = await resendService.sendEmail({
        to: lead.email,
        subject: `Re: ${campaign.subject}`,
        html: followUpBody
      });

      if (result.success) {
        // Update activity metadata
        const metadataField = `followUp${followUpNumber}Sent`;
        activity.metadata = activity.metadata || {};
        activity.metadata[metadataField] = true;
        activity.metadata[`followUp${followUpNumber}SentAt`] = new Date();
        await activity.save();

        console.log(`✅ Follow-up ${followUpNumber} sent to ${lead.companyName}`);
      }
    } catch (error) {
      console.error(`Follow-up ${followUpNumber} error:`, error);
    }
  }

  /**
   * Schedule follow-ups (call this periodically)
   */
  startScheduler(): void {
    // Run every 6 hours
    setInterval(() => {
      this.processFollowUps();
    }, 6 * 60 * 60 * 1000);

    // Run immediately on start
    this.processFollowUps();
  }
}

export const autoFollowUpService = new AutoFollowUpService();
FOLLOWUP

# ===========================================
# 5. CSV IMPORT/EXPORT
# ===========================================

cat > src/services/data/importExport.ts << 'IMPORTEXPORT'
import { Lead } from '../../models/Lead';
import { Parser } from 'json2csv';

export class ImportExportService {
  /**
   * Import leads from CSV
   */
  async importLeadsFromCSV(
    userId: string,
    csvData: string
  ): Promise<{ success: number; failed: number; errors: string[] }> {
    const lines = csvData.split('\n');
    const headers = lines[0].split(',').map(h => h.trim());

    let success = 0;
    let failed = 0;
    const errors: string[] = [];

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;

      try {
        const values = lines[i].split(',').map(v => v.trim());
        const leadData: any = { userId };

        headers.forEach((header, index) => {
          const key = this.mapCSVHeader(header);
          if (key) {
            leadData[key] = values[index] || '';
          }
        });

        // Validate required fields
        if (!leadData.companyName || !leadData.email) {
          errors.push(`Row ${i + 1}: Missing required fields`);
          failed++;
          continue;
        }

        await Lead.create(leadData);
        success++;
      } catch (error: any) {
        errors.push(`Row ${i + 1}: ${error.message}`);
        failed++;
      }
    }

    return { success, failed, errors };
  }

  /**
   * Export leads to CSV
   */
  async exportLeadsToCSV(userId: string): Promise<string> {
    const leads = await Lead.find({ userId }).lean();

    const fields = [
      'companyName',
      'email',
      'country',
      'city',
      'phone',
      'website',
      'industry',
      'status',
      'aiScore',
      'notes'
    ];

    const parser = new Parser({ fields });
    return parser.parse(leads);
  }

  /**
   * Map CSV headers to model fields
   */
  private mapCSVHeader(header: string): string | null {
    const mapping: Record<string, string> = {
      'company': 'companyName',
      'company name': 'companyName',
      'name': 'companyName',
      'email': 'email',
      'e-mail': 'email',
      'country': 'country',
      'city': 'city',
      'phone': 'phone',
      'telephone': 'phone',
      'website': 'website',
      'web': 'website',
      'industry': 'industry',
      'sector': 'industry',
      'status': 'status',
      'notes': 'notes',
      'note': 'notes'
    };

    return mapping[header.toLowerCase()] || null;
  }

  /**
   * Import from Excel (XLSX)
   */
  async importFromExcel(
    userId: string,
    buffer: Buffer
  ): Promise<{ success: number; failed: number; errors: string[] }> {
    // This would use xlsx package to parse Excel files
    // Converting to CSV first for simplicity
    const xlsx = require('xlsx');
    const workbook = xlsx.read(buffer);
    const sheetName = workbook.SheetNames[0];
    const csvData = xlsx.utils.sheet_to_csv(workbook.Sheets[sheetName]);

    return this.importLeadsFromCSV(userId, csvData);
  }
}

export const importExportService = new ImportExportService();
IMPORTEXPORT

cat > src/controllers/importExportController.ts << 'IMPORTEXPORTCTRL'
import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { importExportService } from '../services/data/importExport';
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() });

export const importLeads = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user._id;
    const file = (req as any).file;

    if (!file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    const csvData = file.buffer.toString('utf-8');
    const result = await importExportService.importLeadsFromCSV(userId, csvData);

    res.json({
      success: true,
      data: result,
      message: `Imported ${result.success} leads successfully. ${result.failed} failed.`
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export const exportLeads = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user._id;
    const csv = await importExportService.exportLeadsToCSV(userId);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=leads.csv');
    res.send(csv);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export const uploadMiddleware = upload.single('file');
IMPORTEXPORTCTRL

cat > src/routes/import.ts << 'IMPORTROUTE'
import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { importLeads, exportLeads, uploadMiddleware } from '../controllers/importExportController';

const router = Router();

router.use(authMiddleware);

router.post('/leads', uploadMiddleware, importLeads);
router.get('/leads/export', exportLeads);

export { router as importRouter };
IMPORTROUTE

# ===========================================
# UPDATE SERVER.TS
# ===========================================

cat >> src/server.ts << 'SERVERUPDATE'

// Add new routes
import { statsRouter } from './routes/stats';
import { importRouter } from './routes/import';
import { autoFollowUpService } from './services/campaign/autoFollowUp';

app.use('/api/stats', statsRouter);
app.use('/api/import', importRouter);

// Start auto follow-up scheduler
autoFollowUpService.startScheduler();
SERVERUPDATE

# ===========================================
# UPDATE PACKAGE.JSON (add missing deps)
# ===========================================

cat > backend/package.json << 'PACKAGE'
{
  "name": "exporthunter-backend",
  "version": "1.0.0",
  "main": "dist/server.js",
  "scripts": {
    "dev": "nodemon --exec ts-node src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js"
  },
  "dependencies": {
    "@google/generative-ai": "^0.21.0",
    "express": "^4.18.2",
    "mongoose": "^8.0.3",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "express-rate-limit": "^7.1.5",
    "compression": "^1.7.4",
    "dotenv": "^16.3.1",
    "zod": "^3.22.4",
    "axios": "^1.6.2",
    "resend": "^3.0.0",
    "json2csv": "^6.0.0",
    "multer": "^1.4.5-lts.1",
    "xlsx": "^0.18.5"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/node": "^20.10.6",
    "@types/bcryptjs": "^2.4.6",
    "@types/jsonwebtoken": "^9.0.5",
    "@types/cors": "^2.8.17",
    "@types/multer": "^1.4.11",
    "typescript": "^5.3.3",
    "ts-node": "^10.9.2",
    "nodemon": "^3.0.2"
  }
}
PACKAGE

echo ""
echo "✅ Part 2/2 tamamlandı!"
echo ""
echo "📦 Eklenen Özellikler:"
echo "  1. ✅ Dashboard Stats API - Gerçek istatistikler"
echo "  2. ✅ Campaign Stats Sync - Tracking düzeltildi"
echo "  3. ✅ Professional Email Templates - TR/EN"
echo "  4. ✅ Auto Follow-Up System - 4. ve 11. gün"
echo "  5. ✅ CSV Import/Export - Toplu lead işleme"
echo ""
echo "🎯 Yeni API Endpoints:"
echo "  GET  /api/stats/dashboard - Dashboard istatistikleri"
echo "  POST /api/import/leads - CSV import"
echo "  GET  /api/import/leads/export - CSV export"
echo ""
