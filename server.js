const express = require('express');
const config = require('./config/config');
const app = express();
const port = config.PORT;

app.get('/health', (req, res) => {
    res.status(200).send('Server is healthy');
});


app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});