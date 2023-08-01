/**
 * The function `populate_response_with_new_methods` adds new methods `send` and `html` to the `res`
 * object in JavaScript.
 * @param res - The "res" parameter is an object representing the response that will be sent back to
 * the client. It typically includes properties and methods for manipulating the response, such as
 * setting headers and sending data.
 */
function populate_response_object_with_new_methods(res) {
    /* The code `res.send` is adding a new method called `send` to the `res` object. This method is used
    to send a response back to the client. */
    res.send = (data) => {
        return res.end(typeof data === 'object' ? JSON.stringify(data) : data.toString())
    }

    /* The code `res.html = (data) => {...}` is adding a new method called `html` to the `res` object.
    This method is used to send an HTML response back to the client. */
    res.html = (data) => {
        res.setHeader('Content-Type', 'text/html');
        return res.end(typeof data === 'object' ? JSON.stringify(data) : data.toString())
    }
}

module.exports = populate_response_object_with_new_methods