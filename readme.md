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
You can chain requests like
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
## About the Author

As the author of this exchange library documentation, I am a software engineer with expertise in web development and server-side programming. I developed this library to provide developers with a lightweight and efficient solution for building microservices-friendly servers with fast and reliable response times. If you have any questions or need further assistance, feel free to contact me.
