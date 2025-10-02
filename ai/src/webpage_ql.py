from flask import Flask, render_template_string
from flask_socketio import SocketIO, emit
import threading
import time
from game_ql import PongGame
import json as json

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")

HTML = """<!DOCTYPE html>
<html>
<head>
	<title>Pong Viewer</title>
</head>
<body>
	<br>
	Show IA : 
	<select id="aiSelect"></select>
	<canvas id="pong" width="600" height="400" style="border:2px solid black;"></canvas>
	<br>
	 | Nb of games per AI : 
	<input id="nbGames" type="number" value="1" min="1" style="width:60px;">
	<input id="generation" type="text" value="10" style="width:60px;">
	<button id="startBtn">Launch games</button>
<script>
const canvas = document.getElementById('pong');
const ctx = canvas.getContext('2d');

function draw(state) {
    ctx.clearRect(0,0,600,400);

    // Ball
    ctx.beginPath();
    ctx.arc(toCanvasX(state.ball.x), toCanvasY(state.ball.z), 10, 0, 2*Math.PI);
    ctx.fill();

    // Paddle 1
    ctx.fillRect(toCanvasX(state.paddle1.x) - 40, canvas.height - 30, 80, 10);

    // Paddle 2
    ctx.fillRect(toCanvasX(state.paddle2.x) - 40, 20, 80, 10);

    // Spell 1 (crabmehameha joueur 1)
    ctx.fillStyle = "blue";
    ctx.beginPath();
    ctx.arc(toCanvasX(state.spell1.x), toCanvasY(state.spell1.z), 8, 0, 2*Math.PI);
    ctx.fill();

    // Spell 2 (crabmehameha joueur 2)
    ctx.fillStyle = "red";
    ctx.beginPath();
    ctx.arc(toCanvasX(state.spell2.x), toCanvasY(state.spell2.z), 8, 0, 2*Math.PI);
    ctx.fill();

    // Scores
    ctx.fillStyle = "black";
    ctx.font = "20px Arial";
    ctx.fillText("S1: " + state.score["s1"], 10, 390);
    ctx.fillText("S2: " + state.score["s2"], 10, 30);
	
	// AI score
    ctx.fillStyle = "black";
    ctx.font = "20px Arial";
    ctx.fillText("AI score: " + state.ai_score, 10, 180);
	ctx.fillText("Game " + state.game_id + " Act: " + state.ai_action, 10, 220);
}

function toCanvasX(gameX) {
    // gameX varie de -5.8 à 5.8
    return ((gameX + 5.8) / (2 * 5.8)) * canvas.width;
}
function toCanvasY(gameZ) {
    // gameZ varie de -10 à 10
    return ((-gameZ + 10) / (2 * 10)) * canvas.height;
}

let lastState = null;
let socket = null;
let aiGames = {}; // Dict
let selectedAI = 0;
let generation = "10"

document.getElementById('aiSelect').onchange = function() {
    selectedAI = this.value;
};

document.getElementById('startBtn').onclick = () => {
    const nbGames = parseInt(document.getElementById('nbGames').value, 10);
    const generation = document.getElementById('generation').value;
    if (socket)
        socket.disconnect();
    socket = io();
    socket.emit('start_games', { nbGames, generation }); // ENLEVER nbAIs

    socket.on('state', function(state) {
        draw(state);
    });
};

</script>
<script src="https://cdn.socket.io/4.7.4/socket.io.min.js"></script>
</body>
</html>"""

@app.route('/')
def index():
	return render_template_string(HTML)

@socketio.on('start_games')
def start_games(data):
	nb_games = int(data.get('nbGames', 1)) # If no nbGames, gives 1
	gen = data.get('generation', 'latest')
	file = f"q_table_{gen}.pkl"

	def ai_thread(ai_id: int):
		game = PongGame(gameOption=0, training=False, dumb=False)
		game.load_q_table(file)
		ticks_per_decision = int(1 / 0.016666)
		action = 2  # STILL by default
		for game_id in range(nb_games):
			max_ticks = int(3600 / 0.016666)
			tick = 0
			while tick < max_ticks :
				if tick % ticks_per_decision == 0:
					action = game.update(action, action_needed=True)
				else:
					game.update(action)
				state = game.get_state()
				state['ai_score'] = game.get_ai_score()
				state['game_id'] = game_id
				state['ai_action'] = str(action)
				socketio.emit('state', state)
				tick += 1
				time.sleep(game.dt / 50)

	ai_thread(0)

def parse_json(file: str):
	conf: list = []
	with open(file, "r") as f:
		conf = json.load(f)
	return conf

if __name__ == '__main__':
	socketio.run(app, port=5000)