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
