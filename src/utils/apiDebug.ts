// Debug utility untuk API connection testing
import { testApiConnection } from '../service/api';

export const debugApiConnection = async () => {
  console.log('🔍 Testing API Connection...');
  
  try {
    const result = await testApiConnection();
    
    console.log('📡 API Connection Test Result:');
    console.log('✅ Success:', result.success);
    console.log('🌐 URL:', result.url);
    console.log('📝 Message:', result.message);
    
    if (!result.success) {
      console.error('❌ API Connection Failed!');
      console.log('💡 Solutions:');
      console.log('1. Check if API server is running');
      console.log('2. Verify CORS configuration on API server');
      console.log('3. Check network connectivity');
      console.log('4. Ensure REACT_APP_API_URL is correct');
    }
    
    return result;
  } catch (error: any) {
    console.error('🚨 Debug Error:', error);
    return {
      success: false,
      url: 'unknown',
      message: error.message || 'Debug test failed'
    };
  }
};

// Auto-run in development
if (process.env.REACT_APP_ENV === 'development') {
  // Uncomment untuk auto-test saat development
  // debugApiConnection();
}