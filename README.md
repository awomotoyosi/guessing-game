Real-Time Collaborative Guessing Game
📝 Project Overview

This is a real-time, multi-player guessing game built using a modular Node.js/Express backend and Socket.IO for live synchronization. The game is designed to be a session-based experience where a Game Master (GM) sets a question and other players compete to guess the answer within a time limit and a set number of attempts.
Key Features
Real-Time Sync: Uses Socket.IO to instantly update game state, scores, and chat logs across all connected clients.
Game Master Role: The GM role automatically rotates after each round. The GM is responsible for setting the question and initiating the game.
Session Management: The game transitions between LOBBY, IN_PROGRESS, and ENDED states.
Win Conditions: A player wins by guessing the correct answer, earning 10 points. If time expires (60 seconds), the round ends with no winner.
Attempts Limit: Players are limited to 3 attempts per round.
🏗️ Project Structure and Files
The backend is organized into clear, functional layers as requested, with server.js as the entry point and a simple client provided in the public directory.
guessing-game/
├── server.js           # Main entry point. Initializes Express, HTTP Server, and Socket.IO. Manages server-side timer.
├── app.js              # Express application configuration (middleware, static files, routes).
├── route.js            # Defines all REST API endpoints and maps them to controllers.
├── controller.js       # Handles API requests/Socket events, validates input, and calls the service layer.
├── service.js          # Core business logic (game state transitions, scoring, attempt checks).
├── model.js            # Defines data structures (Player, Session) and acts as the mock in-memory database.
└── public/
    └── index.html      # Simple HTML/CSS/JS client for connecting, guessing, and displaying state.


🚀 Installation and Running
This project requires Node.js and the following packages: express and socket.io.
Install Dependencies:
npm install express socket.io


Start the Server:
nodemon server.js
# OR
node server.js

The server will start on http://localhost:3000.
Access the Client:
Open multiple browser tabs and navigate to:
http://localhost:3000/index.html
🔌 API Endpoints for Testing
The game utilizes two types of endpoints: REST for control and setup, and Socket.IO for real-time interaction.
Note: For all REST endpoints, the session ID is currently hardcoded as main_session. To simulate different users for testing, you must provide a unique value in the X-User-Id header for each request.
A. REST API Endpoints (Control and Setup)


Method
Path
Description
Required Body (JSON)
Headers
GET
/api/v1/game/sessions/main_session
Retrieves the current public game state.
None
X-User-Id
POST
/api/v1/game/sessions/main_session/join
Joins a player to the session.
{"playerName": "Your Name"}
X-User-Id
POST
/api/v1/game/sessions/main_session/question
Sets the question and answer for the round (must be the GM).
{"question": "What is 5x5?", "answer": "25"}
X-User-Id
POST
/api/v1/game/sessions/main_session/start
Starts the round. Requires  players.
None
X-User-Id

B. Real-Time Socket.IO Events
These events are managed by the Socket.IO server running within server.js and are necessary for the interactive game loop.
Direction
Event Name
Description
Data Payload (Client → Server)
Client  Server
game:guess
Player submits a guess for the current question.
{sessionId: 'main_session', guess: 'my answer', playerName: 'Name'}
Server  Client
game:update
Core event. Broadcasts the full, updated game state (scores, attempts, status, chat) to all connected players.
GameSession object
Server  Client
game:timeout
Signals that the 60-second timer has expired, ending the round.
answer (string)


