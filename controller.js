// controller.js - Handles HTTP requests, calls the service layer, and formats the response.

import gameService from './service.js';

// NOTE: Real-time updates handled by Socket.IO in server.js, not via these REST controllers.
// These controllers mostly handle initial state changes (joining, starting, setting question).

/**
 * [REST Controller] Gets the current game session state.
 */
const getSessionState = (req, res) => {
    const session = gameService.getSession(req.params.sessionId);
    if (!session) {
        return res.status(404).json({ error: 'Session not found.' });
    }
    // Filter sensitive data before sending (e.g., the secret answer)
    const publicSession = { ...session, answer: session.status === 'ENDED' ? session.answer : 'HIDDEN' };
    res.json(publicSession);
};

/**
 * [REST Controller] Player joins the game.
 */
const joinGame = (req, res) => {
    const { playerName } = req.body;
    const { sessionId } = req.params;
    const playerId = req.userId; // Mocked from middleware

    const result = gameService.joinSession(sessionId, playerId, playerName);
    if (!result.success) {
        return res.status(400).json({ error: result.message });
    }
    // In a real setup, Socket.IO would handle broadcasting the change.
    res.status(200).json({ message: result.message, session: result.session });
};

/**
 * [REST Controller] GM sets the question and answer.
 */
const setQuestionAndAnswer = (req, res) => {
    const { question, answer } = req.body;
    const { sessionId } = req.params;
    const gmId = req.userId; // Mocked from middleware

    const result = gameService.setQuestion(sessionId, gmId, question, answer);
    if (!result.success) {
        return res.status(403).json({ error: result.message });
    }
    // Socket.IO would broadcast the new question.
    res.status(200).json({ message: 'Question set.', session: result.session });
};

/**
 * [REST Controller] GM starts the game.
 */
const startGameRound = (req, res) => {
    const { sessionId } = req.params;
    const gmId = req.userId; // Mocked from middleware

    const result = gameService.startGame(sessionId, gmId);
    if (!result.success) {
        return res.status(400).json({ error: result.message });
    }
    
    // NOTE: The Socket.IO server must listen for this event and start the server-side timer.
    res.status(200).json({ message: 'Game starting now!', session: result.session, timeout: result.timeout });
};

/**
 * [REAL-TIME Action] Player submits a guess.
 * NOTE: This endpoint is conceptual for REST but the *actual* guess submission MUST use
 * a real-time connection (e.g., Socket.IO) to ensure low latency and atomic updates.
 */
const submitGuessRealTime = (io) => (socket, data) => {
    const { sessionId, guess, playerName } = data;
    const playerId = socket.id; // Use socket ID as the player identifier

    // Mocking the player name storage temporarily for real-time demonstration
    // In a real app, you'd look up the player's name from your DB using socket.id.
    socket.playerName = playerName; 
    
    const result = gameService.submitGuess(sessionId, playerId, guess);

    if (result.success) {
        // Broadcast the updated state to all clients
        io.to(sessionId).emit('game:update', result.session);

        if (result.isWinner) {
            // Send special event for win
            io.to(sessionId).emit('game:win', { winnerName: result.session.players[playerId].name, answer: result.session.answer });
            // The GM rotation is already handled in the service layer's state update.
        }
    } else {
        // Send private error message
        socket.emit('error:guess', result.message);
    }
};


export default { getSessionState, joinGame, setQuestionAndAnswer, startGameRound, submitGuessRealTime };
