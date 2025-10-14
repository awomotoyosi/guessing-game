// server.js - Main entry point: starts the HTTP server and the Socket.IO server.

import http from 'http';
import { Server } from 'socket.io';
import app from './app.js';
import gameController from './controller.js';
import gameService from './service.js';

const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

// 1. Initialize Socket.IO Server for real-time communication
const io = new Server(server, {
    cors: {
        origin: "*", // Allow all origins for development
        methods: ["GET", "POST"]
    }
});

// Store session timers globally
const sessionTimeouts = {};

/**
 * Handles server-side game timer logic.
 * This runs when the GM hits the /start endpoint.
 * @param {string} sessionId
 */
const startServerTimer = (sessionId, timeoutSeconds) => {
    if (sessionTimeouts[sessionId]) {
        clearTimeout(sessionTimeouts[sessionId]);
    }

    // Set the server-side timer
    const timer = setTimeout(() => {
        const result = gameService.handleTimeout(sessionId);
        if (result.success) {
            io.to(sessionId).emit('game:update', result.session);
            io.to(sessionId).emit('game:timeout', result.session.answer);
            console.log(`Session ${sessionId} ended by timeout.`);
        }
        delete sessionTimeouts[sessionId];
    }, timeoutSeconds * 1000);

    sessionTimeouts[sessionId] = timer;
    console.log(`Timer started for session ${sessionId} for ${timeoutSeconds}s.`);
};


// 2. Socket.IO Connection Handler
io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);
    
    const sessionId = 'main_session'; // Hardcoding for simplicity

    // Join the session room
    socket.join(sessionId);

    // Initial state push (when a player connects via socket)
    const session = gameService.getSession(sessionId);
    if (session) {
        socket.emit('game:update', session);
    }
    
    // Real-time listener for guess submission
    socket.on('game:guess', gameController.submitGuessRealTime(io));

    // Handle disconnection
    socket.on('disconnect', () => {
        // Cleanup player logic here (similar to the HTML file's beforeunload cleanup)
        // In a complex app, this often involves a short delay to check if they quickly reconnect
        console.log(`User disconnected: ${socket.id}`);
    });
});


// 3. Start the HTTP/Socket.IO Server
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Access the HTML client at http://localhost:${PORT}/index.html`);

    // Mocking an initialization call to start the server timer when the GM starts the game
    // A real implementation would intercept the POST /start route and call startServerTimer.
    app.post('/api/v1/game/sessions/:sessionId/start', (req, res, next) => {
        const result = gameService.startGame(req.params.sessionId, req.userId); // userId comes from middleware
        if (result.success) {
            startServerTimer(req.params.sessionId, result.timeout);
            // Broadcast the start event to all clients
            io.to(req.params.sessionId).emit('game:update', result.session);
        }
        // Then pass to controller for final response
        next(); 
    }, gameController.startGameRound); 
});
