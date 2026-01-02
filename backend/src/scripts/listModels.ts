
import { GoogleGenerativeAI } from '@google/generative-ai';

const key = 'AIzaSyDVYD8CC2C0CtHzYoN3LCIv1hYUug04Ek0';

async function listModels() {
    console.log('Listing models with key:', key);
    try {
        const genAI = new GoogleGenerativeAI(key);
        // We can't list models directly with the helper but we can try a raw fetch or just try another model
        // Actually the error message suggested: "Call ListModels to see the list of available models"
        // The SDK doesn't expose listModels on the main class easily in all versions, but let's try a direct fetch to the API endpoint.

        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
        const response = await fetch(url);
        const data = await response.json();

        console.log('Status:', response.status);
        console.log('Data:', JSON.stringify(data, null, 2));

    } catch (error: any) {
        console.error('❌ FAILURE:', error.message);
    }
}

listModels();
