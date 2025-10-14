// route.js - Defines all API endpoints for the game.

import express from 'express';
import gameController from './controller.js';
import middleware from './middleware.js';

const router = express.Router();

// Middleware applied to all routes in this router
router.use(middleware.mockAuth);

// GET /api/v1/game/sessions/:sessionId - Get current state of a session
router.get('/sessions/:sessionId', gameController.getSessionState);

// POST /api/v1/game/sessions/:sessionId/join - Join a session (Player name in body)
router.post('/sessions/:sessionId/join', 
    (req, res, next) => { 
        if (!req.body.playerName) return res.status(400).json({ error: 'Player name required.' }); 
        next(); 
    }, 
    gameController.joinGame
);

// POST /api/v1/game/sessions/:sessionId/question - GM sets the question
router.post('/sessions/:sessionId/question', 
    middleware.validateQuestionInput, 
    gameController.setQuestionAndAnswer
);

// POST /api/v1/game/sessions/:sessionId/start - GM starts the game
router.post('/sessions/:sessionId/start', gameController.startGameRound);

// Note: The real-time actions (Guess, Timeout) are managed by Socket.IO in server.js, 
// not exposed as standard REST endpoints here.

export default router;
