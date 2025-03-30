import { SharedArray } from 'k6/data';

export function loadUserData() {
    return new SharedArray('users', function () {
        const fileContent = open('../data/users.json');
        return JSON.parse(fileContent).users;  // convert the JSON content to a JS object
    });
}

export function loadCategoryData() {
    return new SharedArray('categories', function () {
        const fileContent = open('../data/category.json');
        return JSON.parse(fileContent).categories;  // convert the JSON content to a JS object
    });
}
