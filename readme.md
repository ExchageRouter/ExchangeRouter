# Documentation for Exchange Library

## Author Information

- Author: Mahmud Olamilekan Aremu
- Occupation: Software Engineer

## Introduction

The `exchange` library is a lightweight server module designed for microservices communication, offering fast and efficient response times. This documentation will provide an overview of the `exchange` library's features and how to use it to create a microservices-friendly server.

## Features

- Lightweight and efficient server implementation.
- Microservices-friendly architecture for seamless communication.

## Installation
To use the `exchange` library in your project, you can install it using npm:

```bash
npm install exchange-router
```

## Usage

To get started, require the `exchange` module in your main entry file (e.g., `index.js`):

```javascript
const exchange = require('exchange-router');
```

## Creating Routes

Routes can be defined using the `get_exchange()` method and the `post_exchange()`, method which takes two parameters: the route name and a callback function to handle the incoming requests. Here's an example:

```javascript

//for defining GET request's
exchange.get_exchange('/welcome', (req, res) => {
    let data = req.data;
    res.send(`Welcome to our lightweight microservices server! Your data: ${data}`);
});

// for defining POST requests
exchange.post_exchange('/welcome', (req, res) => {
    let data = req.data;
    res.send(`Welcome to our lightweight microservices server! Your data: ${data}`);
});
```

## Handling HTML Responses
You can also handle HTML responses using the `html()` method on the response object:

```javascript
exchange.get_exchange('/greeting', (req, res) => {
    let data = req.data;
    res.html(`<h1>Hello, ${data}!</h1>`);
});

```

## Starting the Server

After defining your routes, you can start the server by calling the `startServer()` method, passing the desired port number and an optional callback function to execute after the server starts:

```javascript

const port = 3000;

exchange.startServer(port, () => {
    console.log(`Server has started on port ${port}`);
});
```

## Example Router Module (`router.js`)

To keep your code organized, you can create a separate module for defining routes and then import it into your main file. Here's an example of a `router.js` module:

```javascript
const exchange = require('exchange-router');
const router = exchange.Router();

router
    .exchange('/hooked')
    .get_exchange((req, res) => {
        res.send('You got hooked into our microservices world!');
    });

router
    .exchange('/hooked-again')
    .get_exchange((req, res) => {
        res.send('You got hooked again! Welcome back!');
    });

router
    .exchange('/hooked-again')
    .post_exchange((req, res) => {
        res.send('You got hooked again! Welcome back!');
    });

module.exports = router;
```
You can chain requests like;

```javascript

router
    .exchange('/hooked-again')
    .get_exchange((req, res) => {
        res.send('You got hooked again! Welcome back!');
    });
    .post_exchange((req, res) => {
        res.send('You got hooked again! Welcome back!');
    });
```

## Orchestrating Multiple API Calls

The `exchange` library provides the capability to orchestrate multiple API calls, allowing you to efficiently manage and coordinate requests. This is particularly useful when you need to execute a sequence of API calls in a specific order.

In the example provided below, we demonstrate how to use the `exchange` library to orchestrate multiple API calls. The first API in the list contains initial data that is passed down the pipeline, and subsequent APIs can be designed to process and augment this data further.


```javascript

const apiList = [
    // Define API information here
    {
        uri: 'http://localhost:3002/api/data',
        method: 'post',
        requestData: {
            key: 35  // Initial data to be passed down the pipeline
        },

    },
    {
        uri: 'http://localhost:3001/api/data',
        method: 'post',

    }, {
        uri: 'http://localhost:3003/api/data',
        method: 'post',

    }
    // Add more APIs here
];

let exchange = require('exchange-router');

exchange.orchestrate(apiList)
    .then(finalResult => {
        console.log('Final Result:', finalResult);
    })
    .catch(error => {
        console.error('Error:', error.message);
    });

```


## TCP Server Connection Management

The TCP Protocol Controller is a feature integrated into the Exchange class, which enhances communication capabilities within Node.js applications. It facilitates connections to multiple TCP servers, manages data communication, and handles reconnections in case of failures. Below is a documentation that provides an overview of how to use this feature, error handling scenarios, events to listen to, and additional documentation.

## Getting Started

To use the TCP Protocol Controller feature, follow these steps:


1. Require `exchange-router` in your application:

   ```javascript
   const Exchange = require('exchange-router');
   ```

2. Use the `startTCPSystem` method to start the TCP system:
   ```javascript
   const systems = [
       { host: 'example.com', port: 3000, name: 'Client1' },
       { host: 'example.org', port: 4000, name: 'Client2' }
   ];

   exchange.startTCPSystem(systems, (req, res) => {
       // Handle incoming TCP requests
        let clientID = req.clientID
        res.send({ "message": 'recieved response from client: '+ clientID })
   });
   ```

## Handling incoming TCP requests in the provided callback function.

### `req` Object

The `req` object represents the incoming request in the TCP server's callback function. It contains the following properties:

- `req.data`: The parsed data from the client. It may include parameters, commands, or any other information sent by the client.
- `req.clientID`: The ID of the client sending the request.
- `req.clientName`: The name of the client sending the request.
- `req.error`: An error object, if any error occurred during the request processing.


### `res` Object

The `res` object represents the response that the TCP server sends back to the client. It contains only one method:

#### Methods:

- `res.send(data, [client]): boolean`: Sends data back to the client. This method is specific to the TCP Protocol Controller feature. It is used to send data to clients connected to the TCP server. The `data` parameter must be an object. Optionally, you can specify the `client` to send the data to. If not provided, it defaults to the client specified in the request object. Returns `true` if the sending process is successful and `false` if it fails.

#### Example Usage:

```javascript
// Send data back to the client
const success = res.send({ message: 'Hello, world!' });

if (success) {
    console.log('Data sent successfully');
} else {
    console.error('Failed to send data');
}

// Send data to a specific client
const success = res.send({ message: 'Hello, client!' }, 'Client1');
```

The `res.send()` method provides a convenient way to send data back to clients connected to the TCP server. It accepts an object as the data parameter and an optional client parameter to specify the recipient of the data. 

 The client parameter is based on the names given to the servers during connection.  It returns `true` if the sending process is successful and `false` if it fails.

## Events

The TCP Protocol Controller emits events using Node.js EventEmitter for various scenarios. You can listen to these events to handle specific situations:

- `TCP_ERR_CONN`: This event is emitted when a connection to a TCP server fails. It provides an error message as a parameter.

- `SERV_CONN`: This event is emitted when a connection to a TCP server is successfully established. It provides information about the successful connection.

- `SERV_RECONN`: This event is emitted when a re-connection to a TCP server is successfully established i.e during a reconnection. It provides information about the successful connection.

To listen for these events, you will to attach event listeners provided by the `startTCPSystem` method. Here's how you can do it:

```javascript
// Import the Exchange class
const exchange = require('exchange-router');

// Start the TCP system
const systems = [
    { host: 'example.com', port: 3000, name: 'Server1' },
    { host: 'example.org', port: 4000, name: 'Server2' }
];

// Start the TCP system and attach event listeners
exchange.startTCPSystem(systems, (req, res) => {
    // Handle incoming TCP requests
      let clientID = req.clientID
      res.send({ "message": 'recieved response from client: '+ clientID })
})
.on('TCP_ERR_CONN', (error) => {
    console.error('Error connecting to TCP server:', error);
})
.on('SERV_CONN', (successObject) => {
    console.log('Successfully connected to TCP server:', successObject);
})
.on('SERV_RECONN', (successObject) => {
    console.log('Successfully re-connected to TCP server:', successObject);
});
```


## Error Handling

The TCP Protocol Controller feature includes top-notch error handling scenarios to provide helpful error messages and logs. Here are some scenarios:

- Missing Data in Systems Array: If an item in the systems array is missing data (e.g., host or port), the controller logs the error with the index of the problematic item, providing a clear indication of the data that was wrong.

- Connection Failures: If a connection to a TCP server fails, the controller handles it gracefully, logs the error, and attempts reconnection automatically.


## Additional Documentation

For more detailed information and advanced usage of the TCP Protocol Controller feature, refer to the inline comments in the codebase. The code is structured using best practices and well-documented for easy understanding and maintenance.

## Contributors

- Mahmud Aremu (@aremumahmud)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.



## About the Author

As the author of this exchange library documentation, I am a software engineer with expertise in web development and server-side programming. I developed this library to provide developers with a lightweight and efficient solution for building microservices-friendly servers with fast and reliable response times. If you have any questions or need further assistance, feel free to contact me.

- LinkedIn : [MahmudAremu](www.linkedin.com/in/mahmud-aremu)
- Email : [MahmudAremu](mailto:aremumahmud2003@gmail.com)
