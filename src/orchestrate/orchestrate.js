const isJSONString = require("../isJson");
const getRequest = require("./getRequest");
const postRequest = require("./postRequest");
const transformDataForNextAPI = require("./transformDataForNextApi");

/**
 * The function `orchestrateAPIs` is an asynchronous function that takes a list of API information and
 * processes them sequentially, making GET or POST requests and transforming the response data for the
 * next API in the list.
 * @param apiList - The `apiList` parameter is an array of objects, where each object represents an API
 * to be called. Each object in the `apiList` array has the following properties:
 * @returns the final result of the API orchestration process.
 */
async function orchestrateAPIs(apiList) {
    try {
        let inputData = null;

        for (const [i, apiInfo] of apiList.entries()) {

            /* The code block you provided is responsible for making API requests based on the
            information provided in the `apiInfo` object. */
            const { uri, method, requestData = {}, requestDataType = 'json', responseDataType = 'json' } = apiInfo;

            // console.log(`Processing API at index ${i}: ${uri}`);

            let response;
            if (method.toLowerCase() === 'get') {
                response = await getRequest(uri, requestData);
            } else if (method.toLowerCase() === 'post') {

                //if (isJSONString(requestData)) requestData


                const requestDataToSend = (requestDataType === 'json' && !isJSONString(requestData)) ?
                    JSON.stringify(requestData) :
                    requestData;

                // console.log(`Sending POST request to ${uri} with data:`, requestDataToSend);
                response = await postRequest(uri, requestDataToSend);
            }

            const responseData = response.data;

            // console.log(`Received response from API at index ${i}:`, responseData);

            if (responseDataType === 'json' || responseDataType === 'text') {
                if (!apiList[i + 1]) return inputData = responseData
                inputData = transformDataForNextAPI(responseData, i + 1, apiList);
                apiList[i + 1].requestData = inputData;
            } else {
                throw new Error('unsupported response datatype ' + responseDataType + ' The only supported datatypes supported are `json` and `text`');
            }
        }

        return inputData; // Final result
    } catch (error) {
        throw new Error('API orchestration failed: ' + error.message);
    }
}

module.exports = orchestrateAPIs