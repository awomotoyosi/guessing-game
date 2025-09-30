import express from 'express';

// Initialize the Express application
const app = express();

// Use the environment variable PORT (required by Render) or default to 3000.
const PORT = process.env.PORT || 3000;

// Simple root route to prove the server is running.
app.get('/', (req, res) => {
  res.status(200).send({
    status: 'Success: Link is Live!',
    message: 'Submission link generated. Development is ongoing...',
    port_listening: PORT
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Minimal server is listening on port ${PORT}`);
});
