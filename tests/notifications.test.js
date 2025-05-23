import { check, sleep } from 'k6';
import {getConfig} from '../lib/config.js';
import {loadUserData } from '../lib/dataLoader.js';
import {sendPostRequest} from '../lib/httpHelper.js';
import {parseDuration} from "../lib/timeHelper.js";

const durationStr = __ENV.DURATION || '5m';
const totalDurationSec = parseDuration(durationStr);

const rampUp = Math.floor(totalDurationSec * 0.1);
const stay = Math.floor(totalDurationSec * 0.8);
const rampDown = totalDurationSec - rampUp - stay;

const vus = __ENV.VUS || 100;
const userInputEnv = __ENV.ENV || 'dev';
const projectId = __ENV.K6_CLOUD_PROJECT_ID || 123456;
const config = getConfig(userInputEnv);
const users = loadUserData();
const user = users[Math.floor(Math.random() * users.length)];

export const options = {
    scenarios: {
        checkout_scenario: {
            executor: 'ramping-vus',
            exec: 'notificationsScenario',
            tags: { service: 'notifications' },
            stages: [
                { duration: `${rampUp}s`, target: vus },
                { duration: `${stay}s`, target: vus },
                { duration: `${rampDown}s`, target: 0 },
            ]
        }
    },

    thresholds: {
        'http_req_duration{service:notifications}': ['p(95)<400'],
        'http_req_failed{service:notifications}': ['rate<0.01'],
        'checks{service:notifications}': ['rate>0.99'],
    },

    cloud: {
        name: 'Distributed Load Test',
        projectID: projectId,
        staticIPs: true,
        drop_metrics: ['http_req_tls_handshaking', 'http_req_connecting'],
        drop_tags: { '*': ['instance_id'] },
        keep_tags: { http_req_waiting: ['instance_id'] },
        distribution: config.distribution,
        note: 'Testing API performance with distributed load from different locations.',
    }
};

console.log('User Putted Project ID: '+projectId);

export function notificationsScenario() {
    const token = loginUser();
    const fullUrl = `${config.baseUrl}/notifications`;

    if (token) {
        const authHeader = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
        const userProfileRes = sendPostRequest(fullUrl, { method: 'card' }, authHeader);
        check(userProfileRes, { 'notifications success': (r) => r.status === 200 });
    }

    sleep(Math.random() * 4 + 1); // Randomized wait time (1-5 sec)

    console.log(`Running tests against ${fullUrl}`);
    console.log('User putted duration: '+totalDurationSec);
    console.log('User putted VUs: '+vus);
}

function loginUser() {
    // console.log('Logging in as', user.username);
    // console.log('User password is: '+user.password);

    const authUrl = `${config.baseUrl}${config.authUrl}`;
    const loginRes = sendPostRequest(authUrl, { username: user.username, password: user.password });

    const responseBody = JSON.parse(loginRes.body);
    if (loginRes.status === 200 && responseBody.token) {
        return responseBody.token;
    } else {
        console.log('Login failed:', loginRes.status, responseBody);
        return null;
    }
}
