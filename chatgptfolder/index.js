const express = require('express');
const app = express();
const PORT = 3000;

// Serve static files from a directory
app.use('/static', express.static('chatgpt/javascript'));

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});