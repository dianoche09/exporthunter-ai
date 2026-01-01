/**
 * Test script for batch lead discovery
 * 
 * This demonstrates how to use the new /api/leads/discover-batch endpoint
 * to discover 20 leads at once using Gemini AI
 */

// Example usage:
// POST http://localhost:3001/api/leads/discover-batch

const exampleRequest = {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_JWT_TOKEN_HERE'
    },
    body: JSON.stringify({
        product: 'Turkish Marble and Natural Stone',
        targetMarkets: ['UAE', 'Saudi Arabia', 'Qatar', 'Kuwait'],
        industry: 'Construction Materials',
        count: 20 // Optional, defaults to 20
    })
};

// Example response:
const exampleResponse = {
    success: true,
    data: {
        leads: [
            {
                "_id": "...",
                "userId": "...",
                "companyName": "Example Construction Co.",
                "country": "UAE",
                "city": "Dubai",
                "email": "info@example.com",
                "website": "https://example.com",
                "industry": "Construction Materials",
                "status": "new",
                "source": "ai-discovery",
                "tags": ["UAE", "Saudi Arabia", "Qatar", "Kuwait"],
                "notes": "Leading construction materials distributor in Gulf region",
                "aiScore": 85,
                "createdAt": "2026-01-01T15:45:52.123Z",
                "updatedAt": "2026-01-01T15:45:52.123Z"
            }
            // ... 19 more leads
        ],
        stats: {
            discovered: 20,
            saved: 20,
            failed: 0
        }
    }
};

// CURL Example:
const curlExample = `
curl -X POST http://localhost:3001/api/leads/discover-batch \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \\
  -d '{
    "product": "Turkish Marble and Natural Stone",
    "targetMarkets": ["UAE", "Saudi Arabia", "Qatar", "Kuwait"],
    "industry": "Construction Materials",
    "count": 20
  }'
`;

// Fetch Example (Frontend):
async function discoverLeadsBatch({ product, targetMarkets, industry, count = 20 }) {
    try {
        const response = await fetch('http://localhost:3001/api/leads/discover-batch', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                product,
                targetMarkets,
                industry,
                count
            })
        });

        const data = await response.json();

        if (data.success) {
            console.log(`✅ Discovered ${data.data.stats.discovered} leads`);
            console.log(`💾 Saved ${data.data.stats.saved} leads`);
            console.log(`❌ Failed ${data.data.stats.failed} leads`);
            return data.data.leads;
        } else {
            console.error('Failed to discover leads:', data.error);
            throw new Error(data.error);
        }
    } catch (error) {
        console.error('Error discovering leads:', error);
        throw error;
    }
}

// Usage in your app:
// const leads = await discoverLeadsBatch({
//   product: 'Turkish Marble',
//   targetMarkets: ['UAE', 'Saudi Arabia'],
//   industry: 'Construction',
//   count: 20
// });

console.log('✅ Batch Lead Discovery API is ready!');
console.log('📡 Endpoint: POST /api/leads/discover-batch');
console.log('🔑 Requires: JWT Authentication');
console.log('📝 Parameters: product, targetMarkets[], industry, count (optional)');
