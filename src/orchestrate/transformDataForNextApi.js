function transformDataForNextAPI(inputData, nextIndex, apiList) {

    /* The code block is checking if the `nextIndex` is less than the length of the `apiList` array. If
    it is, it retrieves the API object at the `nextIndex` position and assigns it to the `nextApi`
    variable. It also retrieves the `requestDataType` property from the `nextApi` object and assigns
    it to the `nextApiRequestDataType` variable. */

    if (nextIndex < apiList.length) {
        const nextApi = apiList[nextIndex];
        const nextApiRequestDataType = nextApi.requestDataType;

        // console.log(`Transforming data for API at index ${nextIndex} with request data type: ${nextApiRequestDataType}`);

        /* The `if` statement is checking if the `inputData` is neither a string nor an object. If this
        condition is true, it means that the `inputData` has an unsupported data type. In this case,
        the code throws an error with a message indicating that the response data type is
        unsupported. The error message also specifies that the only supported data types are `json`
        and `text`. */
        if (typeof inputData !== 'string' && typeof inputData !== 'object') throw new Error('unsupported response datatype ' + responseDataType + ' The only supported datatypes supported are `json` and `text`');

        /* The code block is checking if the `inputData` is of type string and if the
        `nextApiRequestDataType` is equal to 'text'. If both conditions are true, it returns an object
        with a `data` property set to the value of `inputData`. This suggests that if the `inputData`
        is a string and the `nextApiRequestDataType` is 'text', the function should transform the data
        by wrapping it in an object with a `data` property. */
        if (typeof inputData === 'string' && nextApiRequestDataType === 'text') {

            return { data: inputData };

        }
    }

    return inputData;
}


module.exports = transformDataForNextAPI