// middleware.js - Contains reusable Express middleware for security and validation.

/**
 * Mock Auth Middleware: In a real app, this would verify a JWT or session cookie.
 * For this instrumental structure, it simply attaches a placeholder user ID.
 */
const mockAuth = (req, res, next) => {
    // Simulating user ID from a hypothetical authentication system.
    // In a real Socket.IO app, the ID is often derived from the socket.
    const mockUserId = req.headers['x-user-id'] || 'user_mock_123';
    req.userId = mockUserId; 
    next();
};

/**
 * Validates that the request body contains a non-empty question and answer.
 */
const validateQuestionInput = (req, res, next) => {
    const { question, answer } = req.body;
    if (!question || question.trim() === '') {
        return res.status(400).json({ error: 'Question cannot be empty.' });
    }
    if (!answer || answer.trim() === '') {
        return res.status(400).json({ error: 'Answer cannot be empty.' });
    }
    next();
};

/**
 * Validates that the request body contains a non-empty guess.
 */
const validateGuessInput = (req, res, next) => {
    const { guess } = req.body;
    if (!guess || guess.trim() === '') {
        return res.status(400).json({ error: 'Guess cannot be empty.' });
    }
    next();
};

export default { mockAuth, validateQuestionInput, validateGuessInput };
