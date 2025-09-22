from flask import Flask, render_template_string
from flask_socketio import SocketIO, emit
import threading
import time
from game import SimplePongGame, PongGame
from network import Network


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
	Nb of AI : 
	<input id="nbAIs" type="number" value="1" min="1" style="width:60px;">
	 | Nb of games per AI : 
	<input id="nbGames" type="number" value="1" min="1" style="width:60px;">
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
    ctx.fillText("S1: " + state.score.s1, 10, 390);
    ctx.fillText("S2: " + state.score.s2, 10, 30);
	
	// AI score
    ctx.fillStyle = "black";
    ctx.font = "20px Arial";
    ctx.fillText("AI score: " + state.ai_score, 10, 180);
	ctx.fillText("Game " + state.game_id + " AI " + state.ai_id, 10, 220);
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

document.getElementById('aiSelect').onchange = function() {
    selectedAI = this.value;
};

function updateSelectors() {
    const aiSelect = document.getElementById('aiSelect');
    aiSelect.innerHTML = '';
    Object.keys(aiGames).forEach(ai_id => {
        const opt = document.createElement('option');
        opt.value = ai_id;
        opt.text = "IA " + ai_id;
        aiSelect.appendChild(opt);
    });
    // 1st AI by default
    selectedAI = aiSelect.value || Object.keys(aiGames)[0];
}

document.getElementById('startBtn').onclick = () => {
	const nbGames = parseInt(document.getElementById('nbGames').value, 10);
	const nbAIs = parseInt(document.getElementById('nbAIs').value, 10);
	if (socket)
		socket.disconnect();
	socket = io();
	socket.emit('start_games', { nbGames, nbAIs });

	socket.on('state', function(state) {
		if (!aiGames[state.ai_id]) {
			aiGames[state.ai_id] = true;
			updateSelectors();
		}
		if (state.ai_id == selectedAI) {
			lastState = state;
			draw(state);
		}
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
	nb_ais = int(data.get('nbAIs', 1))

	def ai_thread(ai_id, results):
		game = PongGame()
		ai = Network(nb_input_layers=3, nb_neurons_per_layer=5, nb_inputs=7, nb_outputs=4)
		print(ai.get_conf())

		ticks_per_decision = int(1 / game.dt)
		action = 2  # STILL by default

		for game_id in range(nb_games):
			max_ticks = int(60 / game.dt)
			tick = 0
			ai_score = 0
			while tick < max_ticks :
				if tick % ticks_per_decision == 0:
					action = ai.work(game.get_state_for_ai())
				game.update(action)
				state = game.get_state()
				state['ai_id'] = ai_id
				state['ai_score'] = game.get_ai_score()
				state['game_id'] = game_id
				socketio.emit('state', state)
				tick += 1
				# time.sleep(game.dt)
			results[ai_id].append(ai_score)
			game = PongGame()

	results = {} # Score dict for each AI : result[ai_id] = list of scores for each game
	threads = []
	for ai_id in range(nb_ais):
		results[ai_id] = []
		t = threading.Thread(target=ai_thread, args=(ai_id, results), daemon=True)
		t.start()
		threads.append(t)
	
	for t in threads:
		t.join()

# TODO = Make dumb AI better

if __name__ == '__main__':
	socketio.run(app, port=5000)