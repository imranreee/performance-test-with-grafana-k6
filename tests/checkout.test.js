import http from 'k6/http';
import { check } from 'k6';
import config from '../lib/config';
import { loadUserData } from '../lib/dataLoader'; // Import the data loader function

const duration = __ENV.DURATION || '5m'; // Default to 5 minutes if no duration is passed
const vus = __ENV.VUS || 100; // Default to 100 VUs if no VUs value is passed

export const options = {
    scenarios: {
        checkout_spike: {
            executor: 'spike',
            startRate: 0,
            timeUnit: '1s',
            stages: [
                { duration: '30s', target: 1000 },
                { duration: duration, target: vus }, // Dynamic duration and VUs
                { duration: '1m', target: 0 },
            ],
            exec: 'checkoutScenario',
            tags: { service: 'checkout' },
        },
    },

    thresholds: {
        'http_req_duration{service:checkout}': ['p(95)<400'],
        'http_req_failed{service:checkout}': ['rate<0.01'],
        'checks{service:checkout}': ['rate>0.99'],
    },

    cloud: {
        name: 'Distributed Load Test',
        projectID: __ENV.PROJECT_ID || 123456,
        staticIPs: true,
        drop_metrics: ['http_req_tls_handshaking', 'http_req_connecting'],
        drop_tags: { '*': ['instance_id'] },
        keep_tags: { http_req_waiting: ['instance_id'] },
        distribution: {
            us_east: { loadZone: 'amazon:us:ashburn', percent: 30 },
            eu_west: { loadZone: 'amazon:ie:dublin', percent: 30 },
            au_sydney: { loadZone: 'amazon:eu:frankfurt', percent: 40 }
        },
        note: 'Testing API performance with distributed load from different locations.',
    }
};

export function checkoutScenario() {
    // Get user credentials dynamically within the login function
    const token = loginUser();

    if (token) {
        // Add to cart
        const cartRes = http.post(`${config.baseUrl}/cart`, JSON.stringify({ itemId: '12345', qty: 1 }), {
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        });

        check(cartRes, {
            'Add to cart success': (r) => r.status === 201,
        });

        // Proceed to payment
        const payRes = http.post(`${config.baseUrl}/pay`, JSON.stringify({ method: 'card' }), {
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        });

        check(payRes, {
            'Payment success': (r) => r.status === 200,
        });

        // Proceed to checkout
        const checkoutRes = http.post(`${config.baseUrl}/checkout`, JSON.stringify({ method: 'card' }), {
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        });

        check(checkoutRes, {
            'Checkout success': (r) => r.status === 200,
        });
    }
}

// Helper function for logging in and dynamically loading user data
function loginUser() {
    const users = loadUserData();
    const user = users[Math.floor(Math.random() * users.length)];

    // Make the login request using the selected user credentials
    const authUrl = `${config.baseUrl}${config.authUrl}`;
    const res = http.post(authUrl, JSON.stringify({ username: user.username, password: user.password }), {
        headers: { 'Content-Type': 'application/json' },
    });

    const responseBody = JSON.parse(res.body);
    if (res.status === 200 && responseBody.token) {
        return responseBody.token;
    } else {
        console.log('Login failed:', res.status, responseBody);
        return null;
    }
}
