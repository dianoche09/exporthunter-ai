
import { Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { AuthRequest } from '../middleware/auth';
import { geminiService } from '../services/ai/geminiService';

export const register = async (req: AuthRequest, res: Response) => {
  try {
    const { email, name, company, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User already exists'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      email,
      name,
      company,
      password: hashedPassword
    });

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: 3600 }
    );

    const refreshToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          company: user.company,
          subscription: user.subscription,
          productGroups: user.productGroups,
          targetMarkets: user.targetMarkets,
          country: user.country,
          industry: user.industry,
          phone: user.phone,
          website: user.website,
          jobTitle: user.jobTitle,
          companyType: user.companyType,
          logo: user.logo,
          onboardingCompleted: user.onboardingCompleted,
          targetCustomerProfile: user.targetCustomerProfile,
          preferredLanguage: user.preferredLanguage
        },
        token,
        refreshToken
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export const login = async (req: AuthRequest, res: Response) => {
  try {
    const { email, password } = req.body;
    console.log(`Login attempt for: ${email}`);

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: 3600 }
    );

    const refreshToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          company: user.company,
          subscription: user.subscription,
          productGroups: user.productGroups,
          targetMarkets: user.targetMarkets,
          country: user.country,
          industry: user.industry,
          phone: user.phone,
          website: user.website,
          onboardingCompleted: user.onboardingCompleted,
          targetCustomerProfile: user.targetCustomerProfile,
          preferredLanguage: user.preferredLanguage
        },
        token,
        refreshToken
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export const getCurrentUser = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          company: user.company,
          subscription: user.subscription,
          apiKeys: user.apiKeys,
          productGroups: user.productGroups,
          targetMarkets: user.targetMarkets,
          country: user.country,
          industry: user.industry,
          phone: user.phone,
          website: user.website,
          onboardingCompleted: user.onboardingCompleted,
          targetCustomerProfile: user.targetCustomerProfile,
          preferredLanguage: user.preferredLanguage
        }
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user._id;
    const {
      name, company, apiKeys, productGroups, targetMarkets,
      country, industry, phone, website, onboardingCompleted,
      targetCustomerProfile, preferredLanguage, jobTitle, companyType, logo
    } = req.body;

    console.log('Update Profile Request:', { userId, name, company, apiKeys, productGroups });

    const updateData: any = {};
    // Handle nested apiKeys update
    if (apiKeys) {
      updateData.apiKeys = {
        ...(req.user.apiKeys && typeof req.user.apiKeys === 'object' ? req.user.apiKeys : {}), // keep existing keys safely
        ...apiKeys // overwrite with new ones
      };
    }

    if (name !== undefined) updateData.name = name;
    if (company !== undefined) updateData.company = company;
    if (productGroups !== undefined) updateData.productGroups = productGroups;
    if (targetMarkets !== undefined) updateData.targetMarkets = targetMarkets;
    if (country !== undefined) updateData.country = country;
    if (industry !== undefined) updateData.industry = industry;
    if (phone !== undefined) updateData.phone = phone;
    if (website !== undefined) updateData.website = website;
    if (onboardingCompleted !== undefined) updateData.onboardingCompleted = onboardingCompleted;
    if (targetCustomerProfile !== undefined) updateData.targetCustomerProfile = targetCustomerProfile;
    if (preferredLanguage !== undefined) updateData.preferredLanguage = preferredLanguage;
    if (jobTitle !== undefined) updateData.jobTitle = jobTitle;
    if (companyType !== undefined) updateData.companyType = companyType;
    if (logo !== undefined) updateData.logo = logo;

    const user = await User.findByIdAndUpdate(userId, updateData, { new: true });

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          company: user.company,
          subscription: user.subscription,
          apiKeys: user.apiKeys,
          productGroups: user.productGroups,
          targetMarkets: user.targetMarkets,
          country: user.country,
          industry: user.industry,
          phone: user.phone,
          website: user.website,
          onboardingCompleted: user.onboardingCompleted,
          targetCustomerProfile: user.targetCustomerProfile,
          preferredLanguage: user.preferredLanguage
        }
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export const analyzeMarkets = async (req: AuthRequest, res: Response) => {
  try {
    const { companyName, industry, productGroups, country, apiKey } = req.body;

    // Prefer body params, fallback to user profile
    const finalCompany = companyName || req.user.company;
    const finalIndustry = industry || 'General';
    const productSource = productGroups && productGroups.length > 0 ? productGroups : req.user.productGroups || [];
    const finalProducts = productSource.map((p: any) =>
      typeof p === 'object' ? `${p.name} (HS Code: ${p.hsCode})` : p
    );
    const finalCountry = country || 'Turkey';

    if (!finalProducts || finalProducts.length === 0) {
      return res.status(400).json({ success: false, error: 'Please provide products to analyze.' });
    }

    const markets = await geminiService.analyzeTargetMarkets({
      companyName: finalCompany,
      industry: finalIndustry,
      productGroups: finalProducts,
      country: finalCountry,
      apiKey: apiKey || req.user.apiKeys?.gemini
    });

    res.json({
      success: true,
      data: { markets }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
