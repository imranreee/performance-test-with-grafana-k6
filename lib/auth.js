import http from 'k6/http';
import { check } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'https://api.test.io';

export function loginUser(username, password) {
    const payload = JSON.stringify({ username, password });
    const res = http.post(`${BASE_URL}/auth/login`, payload, {
        headers: { 'Content-Type': 'application/json' },
    });

    check(res, {
        'Auth status is 200': (r) => r.status === 200,
        'Token received': (r) => JSON.parse(r.body).token !== undefined,
    });

    if (res.status === 200) {
        return JSON.parse(res.body).token;
    } else {
        return null;
    }
}
