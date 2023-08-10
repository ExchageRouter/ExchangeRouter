const express = require('express');
const app = express();
const port = 3002;

app.use(express.json());
app.use(express.urlencoded())

app.post('/api/data', (req, res) => {
    const receivedData = req.body;
    console.log(receivedData)
    const response = receivedData;
    res.json({ data: response.key + 4 });
});

app.listen(port, () => {
    console.log(`Server 2 is running on port ${port}`);
});