import { check, Trend } from 'k6';
import { loginUser } from '../lib/auth';

const BASE_URL = __ENV.BASE_URL || 'https://api.test.io';
const authDurationTrend = new Trend('auth_duration');

export const options = {
    scenarios: {
        auth_load: {
            executor: 'ramping-arrival-rate',
            startRate: 1000,
            timeUnit: '1s',
            preAllocatedVUs: 200,
            maxVUs: 20000,
            stages: [
                { target: 5000, duration: '1m' },
                { target: 10000, duration: '2m' },
                { target: 0, duration: '30s' },
            ],
            exec: 'authScenario',
            tags: { service: 'auth' }
        }
    },

    thresholds: {
        'http_req_duration{service:auth}': ['p(95)<300'],
        'http_req_failed{service:auth}': ['rate<0.01'],
        'checks{service:auth}': ['rate>0.99'],
    },
};

export function authScenario() {
    // Simulate the login of 1000 users concurrently
    for (let i = 0; i < 1000; i++) {
        const token = loginUser('user' + i, 'pass123');  // Simulate a login request with incremental usernames

        if (token) {
            authDurationTrend.add(token);  // Track the response duration for each successful login
        }
    }
}
