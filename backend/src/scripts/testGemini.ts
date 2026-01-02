
import { GoogleGenerativeAI } from '@google/generative-ai';

const key = 'AIzaSyDVYD8CC2C0CtHzYoN3LCIv1hYUug04Ek0';

async function test() {
    console.log('Testing Gemini with key:', key);
    try {
        const genAI = new GoogleGenerativeAI(key);
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
        const result = await model.generateContent('Say hello');
        console.log('Response:', result.response.text());
        console.log('✅ SUCCESS');
    } catch (error: any) {
        console.error('❌ FAILURE:', error.message);
    }
}

test();
