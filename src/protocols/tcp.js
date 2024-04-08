const Net = require('net')
const { v4: uuidv4 } = require('uuid')
var events = require('events')
var util = require('util')


var { EventEmitter } = events
const isJSONString = require('../isJson')

/**
 * Main function that controls the TCP protocol.
 * @param {Array} systems - An array containing information about the systems to connect to.
 * @param {boolean} verbose - A boolean flag indicating whether to output verbose logs.
 * @param {function} callback - A callback function to handle incoming data.
 * @returns {EventEmitter} - Returns an EventEmitter instance that emits events throughout the TCP protocol controller.
 */

function tcp_protocol_controller(systems, verbose, callback) {


    let self = new EventEmitter() // Create a new EventEmitter instance
    let availableSockets = {} // Object to store available sockets
    let failedSockets = [] // Array to store failed sockets connections



    /**
     * Function to create a response object.
     * @param { object } request_object - The request object containing data and client information.
     * @returns { object } - Returns a response object with a send method to send data to clients.
     */

    function res(request_object) {
        return ({
            send: (data, client = request_object.clientName || request_object.clientID) => {

                // Check if data is an object, throw error if not
                if (!(typeof data === 'object')) throw new Error(`The data to be send must be an "Object" and not a/an ${data.constructor.name}`)

                // Retrieve client socket
                let client_retrieved = availableSockets[client]

                if (client_retrieved) {

                    // Write data to the client socket if found and return 
                    // if the write is successfull it will return true
                    // else it would return false
                    return client_retrieved.clientSocket.write(JSON.stringify(data))

                }

                // Log error if client not found and if verbose is set to true
                verbose && console.log(`requested client not found, Send operation Failed for client with clientID/clientName of: ${client}`)

                // return false if client not found
                return false
            }
        })
    }


    /**
     * Callback function to handle incoming data.
     * @param {string|null} error - Error message, if any.
     * @param {object} data - The incoming data object containing data, clientID, and clientName.
     */

    let data_callback = (error, data) => {

        const { data: request_data, clientID, clientName } = data // Destructure data object

        // Construct request object
        let req = {}
        req.data = request_data
        req.clientID = clientID
        req.clientName = clientName
        req.error = error ? { message: error } : false

        // Create response object
        response_object = res(req)

        // Execute callback asynchronously with both the request_object and response object
        process.nextTick(() => callback && callback(req, response_object))
    }

    // Connect to the TCP servers
    tcp_connect_controller(systems, failedSockets, availableSockets, verbose, data_callback, self)


    // Return the EventEmmitter Instance to listen to events
    return self
}


/**
 * Function to control TCP connections to servers.
 * @param {Array} systems - An array containing information about the systems to connect to.
 * @param {Array} failedSockets - An array to store information about sockets that failed to connect.
 * @param {Object} availableSockets - An object to store information about available sockets.
 * @param {boolean} verbose - A boolean flag indicating whether to output verbose logs.
 * @param {function} callback - A callback function to handle incoming data.
 * @param {EventEmitter} self - EventEmitter instance for emitting events.
 */

function tcp_connect_controller(systems, failedSockets, availableSockets, verbose, callback, self) {

    // Handle error scenarios for invalid arguments

    //handle error scenario for when "systems" argument is not an array
    if (!Array.isArray(systems)) throw new Error(`The argument "system" must be an "Array" and not a/an ${systems.constructor.name}`)

    //handle error scenario for when "callback" argument is not a function
    if (!(typeof callback === 'function')) throw new Error(`The argument "callback" must be a "Function" and not a/an ${callback.constructor.name}`)


    // Iterate through each system and attempt to connect
    systems.forEach((system, index) => {

        // Connect to the system with the connect helper function
        connect_helper(system, index, (err, sucess_object) => {

            if (err) {

                // If connection fails, emit TCP_ERR_CONN event and store in failedSockets array
                // and then we reconnect and return 
                verbose && console.log('Connection to TCP server Failed: ', err)

                self.emit('TCP_ERR_CONN', err.toString())

                failedSockets.push(system)

                return reconnect();
            }


            // If connection is successful, emit SERV_CONN event and store in availableSockets object
            self.emit("SERV_CONN", sucess_object)
            availableSockets[sucess_object.clientName || sucess_object.clientID] = sucess_object

            // Listen for incoming data on client socket
            sucess_object.clientSocket && sucess_object.clientSocket.on("data", (chunk) => {

                let data = chunk.toString() // Convert data to string

                let isJson = isJSONString(data) // Check if data is JSON

                // Callback function with incoming data or error, depending on if the data is JSON or text
                isJson
                    ?
                    callback(false, { data, clientID: sucess_object.clientID, clientName: sucess_object.clientName }) :
                    callback("message sent must be in JSON format!", { data, clientID: sucess_object.clientID, clientName: sucess_object.clientName })

            })
        })
    })


    // Reconnect to failed servers
    function reconnect() {


        failedSockets.forEach((system, index) => {

            // Attempt to reconnect to failed systems
            connect_helper(system, index, (err, success_object) => {
                if (!err) {
                    failedSockets.splice(index, 1); // Remove from failedSockets if reconnected successfully

                    self.emit("SERV_RECONN", success_object) // Emit SERV_RECONN event for successful reconnection

                    availableSockets[success_object.clientName || success_object.clientID] = success_object; // Store available socket

                    // Listen for incoming data on client socket
                    success_object.clientSocket && success_object.clientSocket.on("data", (chunk) => {

                        let data = chunk.toString() // Convert data to string

                        let isJson = isJSONString(data) // Check if data is JSON

                        // Callback function with incoming data or error, depending on if the data is JSON or text
                        isJson
                            ?
                            callback(false, { data, clientID: success_object.clientID, clientName: success_object.clientName }) :
                            callback("message sent must be in JSON format!", { data, clientID: success_object.clientID, clientName: success_object.clientName })

                    })

                    return
                }

                // If reconnection fails, emit TCP_ERR_CONN event
                self.emit('TCP_ERR_CONN', err.toString())
                verbose && console.log('Connection to TCP server Failed: ', err)
            });
        });

        failedSockets = []; // Clear failedSockets array
        setTimeout(reconnect, 5000); // Attempt reconnection every 5 seconds
    }

}


/**
 * Helper function to connect to a TCP server.
 * @param {Object} param0 - An object containing host, port, and name of the system.
 * @param {number} index - The index of the system in the systems array.
 * @param {function} callback - A callback function to handle the connection result.
 */

function connect_helper({ host, port, name }, index, callback) {

    // Define the TCP client
    let client = new Net.Socket();

    // Check for missing host or port information and throw a detailed error for easy debugging
    if (!(host && port)) throw new Error(`Please check index: ${index} at the structure of your systems array as they are not well populated i.e they contain incomplete data`)

    //connect to the tcp server, providing both the host and its port
    client.connect({
            port,
            host
        },

        // if the connection is successfull , we send both the clients id , socket name and the socket for 
        // backwards communication 
        () => callback(false, {
            clientID: uuidv4(), // Generate client ID
            clientName: name, // Assign client name
            clientSocket: client // Provide client socket for communication
        }));

    // Handle errors on connection
    client.on('error', (err) => callback(err))

}




module.exports = tcp_protocol_controller