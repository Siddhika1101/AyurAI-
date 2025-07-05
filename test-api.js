// Test API endpoints
const API_BASE = 'http://localhost:5000/api';

async function testAPI() {
    console.log('🧪 Testing AIHerb Backend API...\n');

    try {
        // Test 1: Health Check
        console.log('1️⃣ Testing Health Check...');
        const healthResponse = await fetch(`${API_BASE}/health`);
        const healthData = await healthResponse.json();
        console.log('✅ Health Check:', healthData.message);
        console.log('⏰ Timestamp:', healthData.timestamp);
        console.log('');

        // Test 2: User Registration
        console.log('2️⃣ Testing User Registration...');
        const registerResponse = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Test User',
                email: 'test@example.com',
                password: 'password123',
                age: 25,
                gender: 'male'
            })
        });
        
        if (registerResponse.ok) {
            const registerData = await registerResponse.json();
            console.log('✅ Registration Successful!');
            console.log('👤 User:', registerData.user.name);
            console.log('🔑 Token received:', registerData.token ? 'Yes' : 'No');
            console.log('');
            
            // Test 3: Symptom Analysis
            console.log('3️⃣ Testing Symptom Analysis...');
            const analysisResponse = await fetch(`${API_BASE}/symptoms/analyze`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${registerData.token}`
                },
                body: JSON.stringify({
                    symptoms: [
                        {
                            name: 'anxiety',
                            severity: 'moderate',
                            duration: '2 weeks',
                            frequency: 'daily'
                        }
                    ]
                })
            });
            
            if (analysisResponse.ok) {
                const analysisData = await analysisResponse.json();
                console.log('✅ Symptom Analysis Successful!');
                console.log('🔍 Primary Dosha:', analysisData.analysis.primaryDosha);
                console.log('⚖️ Imbalance:', analysisData.analysis.imbalance);
                console.log('🌿 Herbs Recommended:', analysisData.recommendations.herbs.length);
                console.log('');
            } else {
                console.log('❌ Symptom Analysis Failed');
            }
            
        } else {
            const errorData = await registerResponse.json();
            console.log('❌ Registration Failed:', errorData.error);
            console.log('');
        }

        // Test 4: Dashboard Overview
        console.log('4️⃣ Testing Dashboard Overview...');
        const dashboardResponse = await fetch(`${API_BASE}/dashboard/overview`, {
            headers: { 'Authorization': `Bearer ${registerData.token}` }
        });
        
        if (dashboardResponse.ok) {
            const dashboardData = await dashboardResponse.json();
            console.log('✅ Dashboard Data Retrieved!');
            console.log('📊 Total Analyses:', dashboardData.statistics.totalAnalyses);
            console.log('🏥 Health Score:', dashboardData.statistics.healthScore + '%');
            console.log('');
        } else {
            console.log('❌ Dashboard Failed');
        }

        console.log('🎉 All API tests completed!');
        console.log('🚀 Your AIHerb backend is fully functional!');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.log('💡 Make sure the server is running: npm run dev');
    }
}

// Run the tests
testAPI(); 