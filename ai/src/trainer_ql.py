from game_ql import PongGame
import time
import concurrent.futures

def play_a_game(game, i):
	ticks_per_decision = int(1 / 0.016666)
	max_ticks = int(3600 / 0.16)
	action = 2 # STILL
	tick = 0
	while tick < max_ticks:
		if tick % ticks_per_decision == 0:
			action = game.update(action, can_see=True)
		else:
			action = game.update(action)
		# print(f"Tick: {tick}, Score: {game.score.s1} - {game.score.s2}, Epsilon: {game.epsilon}, AI score: {game.ai_score}")
		# print(f"Ball pos: ({game.ball.x:.2f}X, {game.ball.z:.2f}Z), Ball dir: ({game.ball.dirX:.2f}X, {game.ball.dirZ:.2f}Z)")
		# print(f"State : {game.get_ai_state_situation()} / reward: {game.reward():.4f}")
		# print(f"Paddle pos: 1 = {game.paddle1:.2f}X, 2 = {game.paddle2:.2f}X\n")
		tick += 1
		# time.sleep(game.dt / 3)
	if ((i % 10) == 0):
		print(f"Game: {i}, Score: {game.score.s1} - {game.score.s2}, Epsilon: {game.epsilon:.4f}, AI score: {game.ai_score}")
	if (i % 10 == 0):
		game.save_q_table(i)
		# print(f"{game.q_table}")
	game.reset(total=True)

if __name__ == '__main__':
	game = PongGame(gameOption=0, training=True)
	for i in range(5000):
		play_a_game(game, i)
	print(game.q_table)
