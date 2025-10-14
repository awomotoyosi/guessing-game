// model.js - Defines the data structures for the game.
// In a real environment, this might use Mongoose for MongoDB or Sequelize for SQL.

/**
 * @typedef {Object} Player
 * @property {string} id - Unique player identifier (e.g., socket ID or User ID).
 * @property {string} name - Player's display name.
 * @property {number} score - Total points accumulated.
 * @property {number} attemptsUsed - Guesses used in the current round.
 */

/**
 * @typedef {Object} GameSession
 * @property {string} sessionId - The unique ID for the game session.
 * @property {string} status - 'LOBBY', 'IN_PROGRESS', or 'ENDED'.
 * @property {string} gameMasterId - The ID of the current player who set the question.
 * @property {string} question - The current question.
 * @property {string} answer - The secret answer (stored securely, e.g., hashed).
 * @property {number} answerHash - Placeholder for secure answer storage/comparison.
 * @property {Object.<string, Player>} players - Map of player IDs to Player objects.
 * @property {string | null} winnerId - ID of the player who won the round, or null.
 * @property {number | null} timeoutTime - Timestamp for when the round ends (60s limit).
 * @property {Array.<Object>} chatLog - Log of game events and guesses.
 */

const GameSessionSchema = {
    // Defines structure for session data
    // In a real project, this would be exported from a database ORM.
};

const PlayerSchema = {
    // Defines structure for player data
};

// Mock Database (In-Memory Store for conceptual structure)
const mockDB = {
    sessions: {
        'main_session': {
            sessionId: 'main_session',
            status: 'LOBBY',
            gameMasterId: null,
            question: 'Waiting for GM to set a question.',
            answer: 'secret', // Should be hashed in production
            players: {},
            winnerId: null,
            timeoutTime: null,
            chatLog: []
        }
    }
};

export default { GameSessionSchema, PlayerSchema, mockDB };
