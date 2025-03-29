import http from 'k6/http';

export function sendPostRequest(url, payload, headers) {
    return http.post(url, JSON.stringify(payload), {
        headers: headers || { 'Content-Type': 'application/json' },
    });
}

export function sendGetRequest(url, headers) {
    return http.get(url, { headers: headers || {} });
}
