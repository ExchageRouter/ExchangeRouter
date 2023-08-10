const http = require('http')

function postRequest(uri, data) {
    /* The code block you provided is creating a function called `postRequest` that sends a POST request
    to a specified URI with the provided data. */
    return new Promise((resolve, reject) => {
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(data) // Calculate the data length correctly
            }
        };

        /* The code block you provided is creating a request object `req` using the `http.request()`
        method. This method is used to send an HTTP request to the specified `uri` with the provided
        `options`. */
        const req = http.request(uri, options, (response) => {
            let responseData = '';
            response.on('data', (chunk) => {
                responseData += chunk;
            });

            response.on('end', () => {
                resolve({ data: responseData });
            });
        });


        /* The code block `req.on('error', (error) => { reject(error); });` is an event listener that
        listens for any error that occurs during the HTTP request. If an error occurs, the `reject`
        function is called with the error as an argument, indicating that the promise should be
        rejected. */
        req.on('error', (error) => {
            reject(error);
        });

        /* `req.write(data)` is used to write the data to the request body. In this case, the `data`
        parameter is being written to the request body. */
        req.write(data);
        req.end();
    });
}


module.exports = postRequest