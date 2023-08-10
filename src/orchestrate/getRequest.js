const http = require('http')

function getRequest(uri, requestData) {
    /* The `const queryString` line is creating a query string from the `requestData` object. */
    const queryString = Object.entries(requestData).map(([key, value]) => {
        return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
    }).join('&');

    /* The code is creating a new Promise that wraps an HTTP GET request. */
    return new Promise((resolve, reject) => {
        http.get(`${uri}?${queryString}`, (response) => {
            let data = '';
            response.on('data', (chunk) => {
                data += chunk;
            });

            response.on('end', () => {
                resolve({ data });
            });
        }).on('error', (error) => {
            reject(error);
        });
    });
}


module.exports = getRequest