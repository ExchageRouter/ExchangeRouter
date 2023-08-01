function parseQueryData(data) {
    const params = new URLSearchParams(data);

    // Convert the URLSearchParams object to a JavaScript object
    const parsedObject = {};
    params.forEach((value, key) => {
        parsedObject[key] = value;
    });

    return parsedObject
}

module.exports = parseQueryData