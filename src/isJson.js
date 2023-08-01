function isJSONString(str) {
    try {

        return JSON.parse(str);

    } catch (error) {
        return false;
    }
}

module.exports = isJSONString