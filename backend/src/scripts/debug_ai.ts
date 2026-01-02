import dotenv from 'dotenv';
import path from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config({ path: path.join(__dirname, '../../../.env') });

const MODELS_TO_TRY = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro', 'gemini-1.0-pro-latest'];

async function testModels() {
    console.log("🚀 Testing Available Models...");
    const key = process.env.GEMINI_API_KEY;
    if (!key) { console.error("No API Key"); return; }

    const genAI = new GoogleGenerativeAI(key);

    for (const modelName of MODELS_TO_TRY) {
        process.stdout.write(`Testing Model: ${modelName}... `);
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Hello, are you there?");
            console.log(`✅ SUCCESS!`);
            // console.log(`Response: ${result.response.text()}`);

            // If success, log it clearly so I can pick it
            console.log(`\n🎉 WORKING MODEL FOUND: ${modelName}`);
            return;
        } catch (error: any) {
            console.log(`❌ FAILED (${error.message.split(':')[0]})`);
        }
    }
    console.log("\n❌ All models failed.");
}

testModels();
