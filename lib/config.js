export function getConfig(userInputEnv = 'dev') {// Default to 'dev' if userInputEnv is not provided
    const config = {
        baseUrl: `https://${userInputEnv}.api.example.com`,
        authUrl: '/auth/login'
    };

    return config;
}

