//packages
const http = require('http');
const { parse: parseUrl } = require('url');

//external code
const populate_response_object_with_new_methods = require('./populate_response_with_new_methods');
const isJSONString = require('./isJson');
const parseQueryData = require('./parse_query_data');

class Exchange {
    constructor() {
        this.httpServer = http.createServer;
        this.routes = {
            POST: {},
            GET: {}
        };
    }

    /**
     * The function starts a server on the specified port and handles incoming requests by executing
     * the appropriate request method.
     * @param port - The `port` parameter is the port number on which the server will listen for
     * incoming requests. It is an integer value that specifies the port number, such as 3000 or 8080.
     * @param callback - The `callback` parameter is a function that will be called once the server has
     * started listening on the specified `port`. It is typically used to perform any necessary setup
     * or logging after the server has started.
     */
    startServer(port, callback) {
        this.httpServer((req, res) => {
            const method = req.method;
            if (method !== 'POST' && method !== 'GET') {
                res.end(`Cannot support ${method.toUpperCase()} method, use GET or POST`);
            } else {
                this._execute_request(req, res);
            }
        }).listen(port, callback);
    }

    /**
     * The function `execute_request` handles incoming HTTP requests, parses the request data, and calls
     * the appropriate route handler based on the request method and route exchange.
     * @param req - The `req` parameter is the request object, which contains information about the
     * incoming HTTP request such as the request method, headers, and URL.
     * @param res - The `res` parameter is the response object that is used to send the response back to
     * the client. It contains methods and properties that allow you to set the response status,
     * headers, and body.
     */
    _execute_request(req, res) {
        let requestData = '';

        const protocol = req.headers['x-forwarded-proto'] || 'http';

        const domain = req.headers.host;

        const url = `${protocol}://${domain}${req.url}`;

        req.on('data', (chunk) => {
            requestData += chunk;
        });

        req.on('end', () => {
            //console.log(req.path, req.url)
            try {
                /* The code block you provided is responsible for parsing the request data based on the
                request method (`POST` or `GET`) and storing it in the `postData` variable. */
                let postData = {};
                switch (req.method) {
                    case 'POST':
                        //console.log(url, requestData)
                        let isJson = isJSONString(requestData)

                        postData = isJson ? isJson : parseQueryData(requestData)

                        break;
                    case 'GET':

                        postData = parseUrl(url, true).query;
                        break;
                }

                /* The code block you provided is responsible for handling the incoming HTTP requests
                and routing them to the appropriate route handler based on the request method and
                route exchange. */
                const route = postData.route_exchange;

                if (!route) return res.end("{error: 'true', error_message: 'no route exchange defined'}");

                if (!this.routes[req.method][route]) return res.end(`Cannot ${req.method.toUpperCase()} /${route}`);


                /* The code `let data = {...postData }` creates a new object `data` and copies all the
                properties from the `postData` object into it. This is done using the spread syntax
                (`...`). */
                let data = {...postData }
                delete data.route_exchange
                req.data = data

                populate_response_object_with_new_methods(res)

                this.routes[req.method][route](req, res);


            } catch (error) {
                // console.log(error)
                res.end("Error while parsing JSON, Only JSON values allowed!");
            }
        });
    }


    /**
     * The function `post_exchange` adds a POST route to the `routes` object and assigns a callback
     * function to be executed when the route is accessed.
     * @param path - The `path` parameter is a string that represents the URL path for which the callback
     * function should be executed. It is used to define a route for the HTTP POST method.
     * @param callback - The `callback` parameter is a function that will be executed when a POST request
     * is made to the specified `path`. It takes two parameters: `req` and `res`. `req` represents the
     * request object, which contains information about the incoming request, such as headers, body, and
     * URL
     */
    post_exchange(path, callback) {

        /* The line `if (this.routes.POST[path]) return` is checking if a POST route with the specified
        `path` already exists in the `routes` object. If a route with the same `path` already
        exists, the function returns and does not add the new route. This prevents duplicate routes
        from being added. */
        if (this.routes.POST[path]) return

        this.routes.POST[path] = (req, res) => process.nextTick(() => callback(req, res))
    }

    /**
     * The function "get_exchange" adds a GET route to the routes object and assigns a callback function
     * to be executed when the route is accessed.
     * @param path - The `path` parameter is a string that represents the URL path for which the
     * exchange route is being defined. For example, if you want to define a route for the URL path
     * "/users", you would pass "/users" as the `path` parameter.
     * @param callback - The callback parameter is a function that will be executed when a GET request
     * is made to the specified path. It takes two parameters: req (the request object) and res (the
     * response object).
     */
    get_exchange(path, callback) {
        /* The line `if (this.routes.GET[path]) return` is checking if a GET route with the specified `path`
        already exists in the `routes` object. If a route with the same `path` already exists, the function
        returns and does not add the new route. This prevents duplicate routes from being added. */
        if (this.routes.GET[path]) return

        this.routes.GET[path] = (req, res) => process.nextTick(() => callback(req, res))
    }

    /**
     * The `Router` function returns an object with methods to add POST and GET routes to a `routes`
     * object and assign callback functions to be executed when the routes are accessed.
     * @returns The Router function returns an object with an exchange method. The exchange method takes
     * a path parameter and returns an object with two methods: post_exchange and get_exchange.
     */
    Router() {
        return {
            /* The `exchange` method is a function that takes a `path` parameter and returns an object
            with two methods: `post_exchange` and `get_exchange`. */
            exchange: (path) => {
                return {
                    /* The `post_exchange` method is a function that adds a POST route to the `routes`
                    object and assigns a callback function to be executed when the route is
                    accessed. */
                    post_exchange: (callback) => {
                        this.post_exchange(path, callback)
                        return {
                            get_exchange: (callback) => {
                                this.get_exchange(path, callback)
                            }
                        }
                    },
                    /* The `get_exchange` method is a function that adds a GET route to the `routes`
                    object and assigns a callback function to be executed when the route is
                    accessed. */
                    get_exchange: (callback) => {
                        this.get_exchange(path, callback)
                        return {
                            post_exchange: (callback) => {
                                this.post_exchange(path, callback)
                            }
                        }
                    }
                }
            }
        }
    }
}


/* `module.exports = Exchange` is exporting the ` Exchange` class as a module. This allows other files to
import and use the ` Exchange` class by requiring it using `require('path/to/ Exchange')`. */
module.exports = Exchange