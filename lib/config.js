export function getConfig(userInputEnv = 'dev') {// Default to 'dev' if userInputEnv is not provided
    const config = {
        /*baseUrl: `https://${userInputEnv}.api.example.com`,
        authUrl: '/auth/login'*/

        baseUrl : `https://${userInputEnv}-grocery-store-api.glitch.me`, // https://simple-grocery-store-api.glitch.me
        authUrl : '/status',

        distribution: {
            'amazon:us:ashburn': { loadZone: 'amazon:us:ashburn', percent: 30 },
            'amazon:ie:dublin': { loadZone: 'amazon:ie:dublin', percent: 30 },
            'amazon:de:frankfurt': { loadZone: 'amazon:de:frankfurt', percent: 40 }
        }
    };

    return config;
}

