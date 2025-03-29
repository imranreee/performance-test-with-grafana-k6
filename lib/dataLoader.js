import { SharedArray } from 'k6/data';

export function loadUserData() {
    return new SharedArray('users', function () {
        return JSON.parse(open('../docs/users.js')).users;
    });
}

