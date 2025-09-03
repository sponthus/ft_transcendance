from flask import Flask, render_template_string
from flask_socketio import SocketIO, emit
import threading
import time
from game import SimplePongGame, PongGame
from network import Network


app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")

HTML = "train_page.html"

@app.route('/')
def index():
	return render_template_string(HTML)

# TODO = Crabmehameha is on the wrong side of the screen ? Check scores, make dumb AI better
def game_thread():
	game = PongGame()
	ai = Network(3, 5, 7, 4)

	ticks_per_decision = int(1 / game.dt)
	action = 2  # STILL by default
	max_ticks = int(60 / game.dt)
	tick = 0
	while tick < max_ticks :
		if tick % ticks_per_decision == 0:
			action = ai.work(game.get_state_for_ai())
		game.update(action)
		state = game.get_state()
		socketio.emit('state', state)
		tick += 1
		time.sleep(game.dt)

if __name__ == '__main__':
	threading.Thread(target=game_thread, daemon=True).start()
	socketio.run(app, port=5000)