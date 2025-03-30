import { check } from 'k6';
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
const projectId = __ENV.PROJECT_ID || 123456;
const config = getConfig(userInputEnv);
const users = loadUserData();

export const options = {
    scenarios: {
        checkout_scenario: {
            executor: 'ramping-vus',
            exec: 'generateAuthScenario',
            tags: { service: 'auth' },
            stages: [
                { duration: `${rampUp}s`, target: vus },
                { duration: `${stay}s`, target: vus },
                { duration: `${rampDown}s`, target: 0 },
            ]
        }
    },

    thresholds: {
        'http_req_duration{service:auth}': ['p(95)<400'],
        'http_req_failed{service:auth}': ['rate<0.01'],
        'checks{service:auth}': ['rate>0.99'],
    },

    cloud: {
        name: 'Distributed Load Test',
        projectID: projectId,
        staticIPs: true,
        drop_metrics: ['http_req_tls_handshaking', 'http_req_connecting'],
        drop_tags: { '*': ['instance_id'] },
        keep_tags: { http_req_waiting: ['instance_id'] },
        distribution: {
            'amazon:us:ashburn': { loadZone: 'amazon:us:ashburn', percent: 30 },
            'amazon:ie:dublin': { loadZone: 'amazon:ie:dublin', percent: 30 },
            'amazon:eu:frankfurt': { loadZone: 'amazon:eu:frankfurt', percent: 40 }
        },
        note: 'Testing API performance with distributed load from different locations.',
    }
};

console.log('User Putted Project ID: '+__ENV.PROJECT_ID);

export function generateAuthScenario() {

    const user = users[Math.floor(Math.random() * users.length)];

    console.log('Logging in as', user.username);
    console.log('User password is: '+user.password);

    const authUrl = `${config.baseUrl}${config.authUrl}`;
    const loginRes = sendPostRequest(authUrl, { username: user.username, password: user.password });

    check(loginRes, { 'Checkout success': (r) => r.status === 200 });

    console.log('User putted duration: '+totalDurationSec);
    console.log('User putted VUs: '+vus);
    console.log('Running test against: '+authUrl);
}
