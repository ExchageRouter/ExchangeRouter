const { fail } = require('assert')
const Net = require('net')
const { v4: uuidv4 } = require('uuid')
const isJSONString = require('../isJson')

function tcp_protocol_controller(systems, verbose, callback) {

    let availableSockets = {}
    let failedSockets = []

    let req = {}

    let res = (request_object) => ({
        send: (data, client = request_object.name || request_object.clientID) => {

            //first we check if data is an object
            if (!(typeof data === 'object')) throw new Error(`The data to be send must be an "Object" and not a/an ${data.constructor.name}`)


            let client_retrieved = availableSockets[client]

            if (client_retrieved) {
                return client_retrieved.write(data)
            }

            console.log(`requested client not found, Send operation Failed for client with clientID/clientName of: ${client}`)

        }
    })


    let data_callback = (error, data) => {

        const { data: request_data, clientID, clientName } = data

        req.data = request_data
        req.clientID = clientID
        req.clientName = clientName
        req.error = error ? { message: error } : false


        response_object = res(req)

        process.nextTick(() => callback(req, response_object))
    }


    tcp_connect_controller(systems, failedSockets, availableSockets, verbose, data_callback)
}


function tcp_connect_controller(systems, failedSockets, availableSockets, verbose, callback) {

    // Define the TCP client

    //handle error scenario for when "systems" argument is not an array
    if (!Array.isArray(systems)) throw new Error(`The argument "system" must be an "Array" and not a/an ${systems.constructor.name}`)

    //handle error scenario for when "callback" argument is not a function
    if (!(typeof callback === 'function')) throw new Error(`The argument "callback" must be a "Function" and not a/an ${callback.constructor.name}`)

    systems.forEach((system, index) => {

        connect_helper(system, index, (err, sucess_object) => {
            if (err) {
                verbose && console.log('Connection to TCP server Failed: ', err)
                failedSockets.push(system)
                return
            }

            availableSockets[sucess_object.name || sucess_object.clientID] = sucess_object

            sucess_object.client && sucess_object.client.on("data", (chunk) => {

                let data = chunk.toString()

                let isJson = isJSONString(data)

                isJson
                    ?
                    callback(false, { data, clientID: sucess_object.clientID, clientName: sucess_object.clientName }) :
                    callback("message sent must be in JSON format!")

            })
        })
    })


    //function to reconnect the failed servers

    function reconnect() {

        if (failedSockets.length < 1) return

        failedSockets.forEach(({ system, index }) => {
            connect_helper(system, index, (err, success_object) => {
                if (!err) {
                    failedSockets.splice(index, 1); // Remove from failedSockets if reconnected successfully
                    availableSockets[success_object.name || success_object.clientID] = success_object;
                }
            });
        });

        setTimeout(reconnect, 5000); // Attempt reconnection every 5 seconds
    }

    reconnect(); // Start the reconnection process initially


}



function connect_helper({ host, port, name }, index, callback) {

    // Define the TCP client
    let client = new Net.Socket();

    //
    if (!(host && port)) throw new Error(`Please check index: ${index} at the structure of your systems array as they are not well populated i.e they contain incomplete data`)

    //connect to the tcp server, providing both the host and its port
    client.connect({
            port,
            host
        },

        // if the connection is successfull , we send both the clients id , socket name and the socket for 
        // backwards communication 
        () => callback(false, {
            clientID: uuidv4(),
            clientName: name,
            clientSocket: client
        }));

    client.on('error', (err) => callback(err))

}


module.exports = tcp_protocol_controller
module.exports = tcp_protocol_controller