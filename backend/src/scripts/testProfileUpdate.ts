
import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

async function testUpdate() {
    try {
        // 1. Login
        console.log('Logging in...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'test@exporthunter.com',
            password: 'password123'
        });
        const token = loginRes.data.data.token;
        console.log('Logged in. Token:', token.substring(0, 20) + '...');

        // 2. Update Profile
        console.log('Updating profile with Gemini Key...');
        const updateRes = await axios.put(
            `${API_URL}/auth/me`,
            {
                apiKeys: {
                    gemini: 'TEST_GEMINI_KEY_123'
                }
            },
            {
                headers: { Authorization: `Bearer ${token}` }
            }
        );
        console.log('Update response data:', JSON.stringify(updateRes.data, null, 2));

        // 3. Verify
        const user = updateRes.data.data.user;
        if (user.apiKeys && user.apiKeys.gemini === 'TEST_GEMINI_KEY_123') {
            console.log('✅ SUCCESS: Gemini key was updated!');
        } else {
            console.log('❌ FAILURE: Gemini key was NOT updated.');
            console.log('Received apiKeys:', user.apiKeys);
        }

    } catch (error: any) {
        console.error('Error:', error.response ? error.response.data : error.message);
    }
}

testUpdate();
