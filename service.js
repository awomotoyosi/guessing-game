// service.js - Contains the core business logic, independent of Express (HTTP) details.

import model from './model.js';
const db = model.mockDB;

const GAME_TIMEOUT_SECONDS = 60;
const ATTEMPTS_LIMIT = 3;
const WIN_POINTS = 10;

/**
 * Utility to get the current session state.
 * @param {string} sessionId
 * @returns {GameSession | undefined}
 */
const getSession = (sessionId) => {
    return db.sessions[sessionId];
};

/**
 * Handles player joining a session.
 * @param {string} sessionId
 * @param {string} playerId
 * @param {string} playerName
 * @returns {{success: boolean, session: GameSession | null, message: string}}
 */
const joinSession = (sessionId, playerId, playerName) => {
    const session = getSession(sessionId);
    if (!session) return { success: false, message: 'Session not found.', session: null };
    if (session.status !== 'LOBBY') return { success: false, message: 'Game in progress.', session: null };

    if (!session.gameMasterId) {
        session.gameMasterId = playerId;
    }

    session.players[playerId] = {
        id: playerId,
        name: playerName,
        score: session.players[playerId]?.score || 0, // Keep existing score
        attemptsUsed: 0
    };
    session.chatLog.push({ type: 'system', message: `${playerName} joined!` });
    return { success: true, session: session, message: 'Joined successfully.' };
};

/**
 * Handles GM setting the question and answer.
 */
const setQuestion = (sessionId, gmId, question, answer) => {
    const session = getSession(sessionId);
    if (!session || session.gameMasterId !== gmId) return { success: false, message: 'Unauthorized or session invalid.' };

    session.question = question;
    session.answer = answer.toLowerCase();
    session.status = 'LOBBY';
    session.winnerId = null;
    session.timeoutTime = null;
    session.chatLog.push({ type: 'system', message: 'GM set a new question. Ready to start!' });
    return { success: true, session: session };
};


/**
 * Handles GM starting the game.
 */
const startGame = (sessionId, gmId) => {
    const session = getSession(sessionId);
    const playerCount = Object.keys(session.players).length;

    if (!session || session.gameMasterId !== gmId || session.status !== 'LOBBY') return { success: false, message: 'Cannot start game now.' };
    if (playerCount < 3) return { success: false, message: 'Need at least 3 players to start.' };
    if (!session.answer) return { success: false, message: 'GM must set a question first.' };

    // Reset player attempts
    Object.values(session.players).forEach(p => p.attemptsUsed = 0);

    session.status = 'IN_PROGRESS';
    session.timeoutTime = Date.now() + GAME_TIMEOUT_SECONDS * 1000;
    session.chatLog.push({ type: 'system', message: 'Game Started! 60 seconds on the clock.' });

    // Important: The calling controller must set up the server-side timer/job
    return { success: true, session: session, timeout: GAME_TIMEOUT_SECONDS };
};

/**
 * Handles player submitting a guess.
 */
const submitGuess = (sessionId, playerId, guess) => {
    const session = getSession(sessionId);
    if (!session || session.status !== 'IN_PROGRESS') return { success: false, message: 'Game not active.', session: null };

    const player = session.players[playerId];
    if (!player || player.attemptsUsed >= ATTEMPTS_LIMIT) return { success: false, message: 'No attempts left.', session: null };

    const isCorrect = guess.toLowerCase() === session.answer;
    player.attemptsUsed += 1;
    session.chatLog.push({ type: 'guess', playerId: playerId, playerName: player.name, message: guess });

    if (isCorrect) {
        // End game logic
        player.score += WIN_POINTS;
        session.winnerId = playerId;
        session.status = 'ENDED';

        const playerArray = Object.values(session.players);
        const currentGMIndex = playerArray.findIndex(p => p.id === session.gameMasterId);
        const nextGMIndex = (currentGMIndex + 1) % playerArray.length;
        session.gameMasterId = playerArray[nextGMIndex].id; // Rotate GM

        session.chatLog.push({ type: 'system', message: `${player.name} WON! Answer: ${session.answer}. New GM: ${session.players[session.gameMasterId].name}.` });
        return { success: true, session: session, isWinner: true };
    }

    if (player.attemptsUsed >= ATTEMPTS_LIMIT) {
        session.chatLog.push({ type: 'system', message: `${player.name} ran out of attempts.` });
    }

    return { success: true, session: session, isWinner: false };
};

/**
 * Handles the game ending due to time expiration.
 */
const handleTimeout = (sessionId) => {
    const session = getSession(sessionId);
    if (!session || session.status !== 'IN_PROGRESS') return { success: false, message: 'Game already ended.', session: null };

    session.status = 'ENDED';
    session.winnerId = null; // No winner
    session.chatLog.push({ type: 'system', message: `Time expired! Answer was: ${session.answer}. No points awarded.` });

    // Rotate GM
    const playerArray = Object.values(session.players);
    const currentGMIndex = playerArray.findIndex(p => p.id === session.gameMasterId);
    const nextGMIndex = (currentGMIndex + 1) % playerArray.length;
    session.gameMasterId = playerArray[nextGMIndex].id;

    return { success: true, session: session };
};

export default { getSession, joinSession, setQuestion, startGame, submitGuess, handleTimeout };
