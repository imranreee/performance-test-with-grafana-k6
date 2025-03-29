
const userInputEnv = __ENV.USER || 'dev'; // Default to 'dev' if USER is not provided

const config = {
    baseUrl: `https://${userInputEnv}.api.example.com`,
    authUrl: '/auth/login'
    /* catalogUrl: '/catalog',
    checkoutUrl: '/checkout',
    userProfileUrl: '/user-profile',
    recommendationEngineUrl: '/recommendation-engine',
    notificationsUrl: '/notifications',
    searchUrl: '/search',*/
};

export default config;
