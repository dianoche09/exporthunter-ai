
import { GoogleGenerativeAI } from '@google/generative-ai';

const key = 'AIzaSyDVYD8CC2C0CtHzYoN3LCIv1hYUug04Ek0';

async function findFlashModel() {
    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
        const response = await fetch(url);
        const data: any = await response.json();

        if (data.models) {
            const flashModels = data.models
                .filter((m: any) => m.name.includes('flash'))
                .map((m: any) => m.name);
            console.log('Flash models found:', flashModels);
        } else {
            console.log('No models found in response');
        }

    } catch (error: any) {
        console.error('❌ FAILURE:', error.message);
    }
}

findFlashModel();
