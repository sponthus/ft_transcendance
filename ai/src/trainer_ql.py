from game_ql import PongGame
import time

if __name__ == '__main__':
	game = PongGame(gameOption=0, training=True)
	ticks_per_decision = int(1 / game.dt)
	max_ticks = int(3600 / game.dt)
	action = 2 # STILL
	for i in range(5000):
		tick = 0
		while tick < max_ticks:
			if tick % ticks_per_decision == 0:
				action = game.update(action, action_needed=True)
				# print(f"Tick: {tick}, Score: {game.score.s1} - {game.score.s2}, Epsilon: {game.epsilon}, AI score: {game.ai_score}")
				# print(f"Ball pos: ({game.ball.x:.2f}X, {game.ball.z:.2f}Z), Ball dir: ({game.ball.dirX:.2f}X, {game.ball.dirZ:.2f}Z)")
				# print(f"State : {game.get_ai_state_situation()} / reward: {game.reward():.4f}")
				# print(f"Paddle pos: 1 = {game.paddle1:.2f}X, 2 = {game.paddle2:.2f}X\n")
			else:
				action = game.update(action)
			tick += 1
			# time.sleep(game.dt / 3)
		if ((i % 10) == 0):
			print(f"Game: {i}, Score: {game.score.s1} - {game.score.s2}, Epsilon: {game.epsilon:.4f}, AI score: {game.ai_score}")
		if (i > 1000 and i % 100 == 0):
			game.save_q_table(i)
			# print(f"{game.q_table}")
		game.reset(total=True)


