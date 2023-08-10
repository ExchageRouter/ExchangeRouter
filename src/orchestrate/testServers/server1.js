const express = require('express');
const app = express();
const port = 3003;

app.use(express.json());
app.use(express.urlencoded())

app.post('/api/data', (req, res) => {
    const receivedData = req.body;
    console.log(receivedData)
    const response = receivedData;

    res.json(response);
});

app.listen(port, () => {
    console.log(`Server 3 is running on port ${port}`);
});