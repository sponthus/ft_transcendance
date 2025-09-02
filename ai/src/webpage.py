from flask import Flask, render_template_string
from flask_socketio import SocketIO, emit
import threading
import time
from game import SimplePongGame, PongGame

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")

HTML = """
<!DOCTYPE html>
<html>
<head>
	<title>Pong Viewer</title>
</head>
<body>
<canvas id="pong" width="600" height="400" style="border:2px solid black;"></canvas>
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
}

function toCanvasX(gameX) {
    // gameX varie de -5.8 à 5.8
    return ((gameX + 5.8) / (2 * 5.8)) * canvas.width;
}
function toCanvasY(gameZ) {
    // gameZ varie de -9 à 9
    return ((gameZ + 9) / (2 * 9)) * canvas.height;
}

let lastState = null;
window.onload = () => {
	const socket = io();
	socket.on('state', function(state) {
		lastState = state;
		draw(state);
	});
};
</script>
<script src="https://cdn.socket.io/4.7.4/socket.io.min.js"></script>
</body>
</html>
"""

@app.route('/')
def index():
	return render_template_string(HTML)

# TODO = Crabmehameha is on the wrong side of the screen ? Check scores, make dumb AI better
def game_thread():
	game = PongGame()
	def test_ai(state):
		return 2  # STILL

	ticks_per_decision = int(1 / game.dt)
	action = 2  # STILL
	tick = 0
	while True:
		if tick % ticks_per_decision == 0:
			action = test_ai(game.get_state_for_ai())
		game.update(action)
		state = game.get_state()
		socketio.emit('state', state)
		tick += 1
		time.sleep(game.dt)

if __name__ == '__main__':
	threading.Thread(target=game_thread, daemon=True).start()
	socketio.run(app, port=5000)