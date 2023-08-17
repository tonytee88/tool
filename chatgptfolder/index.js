const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3000;

app.use(cors());
// Serve static files from a directory
app.use('/static', express.static('chatgpt'));

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});