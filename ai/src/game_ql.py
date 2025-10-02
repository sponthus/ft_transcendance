import numpy as np
import time
import pickle

BASE_BALL_SPEED = 1.0
PLAYER_SPEED = 1.0
SPEED_LIMIT = 2.0
SPEED_INCREMENT = 0.2

NB_OUTPUTS = 3
ALPHA = 0.2
GAMMA = 0.5
EPSILON_DECAY_FACTOR = 0.00001
EPSILON_MIN = 0.005

# Positions
X_INFERIOR_BALL_LIMIT = -5.8
X_SUPERIOR_BALL_LIMIT = 5.8
X_INFERIOR_PADDLE_LIMIT = -4.5
X_SUPERIOR_PADDLE_LIMIT = 4.5
Z_GOAL_LEFT = -9
Z_PADDLE_LEFT = -8
Z_PADDLE_RIGHT = 8
Z_GOAL_RIGHT = 9
X_PADDLE_HEIGHT = 1
Z_PADDLE_WIDTH = 0.5
X_TOTAL = X_SUPERIOR_BALL_LIMIT * 2
AREA_SIZE = 0.95
AREA_NUMBER = 12

UP = 0
DOWN = 1
STILL = 2

# Reward
MAX_REWARD = X_PADDLE_HEIGHT * 100

# Epsilon greedy exploration for q-learning algorithm

# Real pong game from the project
class PongGame:
	def __init__(self, gameOption=1, training=False, dumb=True):
		self.training = training
		self.gameMode = 0
		self.gameOption = gameOption
		self.inputs = {}; # { player1: {...}, player2: {...} }
		self.input1 = {}
		self.dumb = dumb

		self.dt = 0.16666
		class Spell:
			def __init__(self, x, y, z):
				self.x = x
				self.y = y
				self.z = z
		self.spell1 = Spell(x=-0.22, y=1.9, z=-10.56)
		self.spell2 = Spell(x=0.22, y=1.9, z=10.56)

		self.isSpellGo1 = False
		self.isSpell1Available = False
		
		self.isSpellGo2 = False
		self.specialCooldown1 = 3
		self.specialCooldown2 = 3

		self.paddle1 = 0.0 # X
		self.paddle2 = 0.0 # X

		class Ball:
			def __init__(self, x=0.0, z=-10.0, dirX = 0.0, dirZ = 1.0, speed=BASE_BALL_SPEED):
				self.x = x
				self.z = z
				self.dirX = dirX
				self.dirZ = dirZ
				self.speed = speed
		self.ball = Ball(
			x=0.0,
			z=0.0,
			dirX=np.random.random() - 0.5,
			dirZ=-1 if np.random.random() < 0.5 else 1,
			speed=BASE_BALL_SPEED
		)

		class Score:
			def __init__(self, s1=0, s2=0):
				self.s1 = s1
				self.s2 = s2
		self.score = Score(s1=0, s2=0)

		self.die1 = False
		self.die2 = False

		self.ai_score = 0.0
		self.crab_score = 0.0

		self.epsilon = 1.0 # Exploration factor
		self.epsilon_decay_factor = EPSILON_DECAY_FACTOR # Decreases through time
		self.epsilon_min = EPSILON_MIN # Minimum exploration factor

		self.q_table = {} # Q-table for storing state-action values
	
	# Makes epsilon decrease until minimum is reached
	def epsilon_decay(self):
		self.epsilon = max(self.epsilon_min, self.epsilon * (1 - self.epsilon_decay_factor))

	def get_ai_action(self, state):
		if state not in self.q_table:
			self.q_table[state] = np.zeros(NB_OUTPUTS) # Initialize Q-values for new state
			# print("Unknown action/state : {state}")
		if (self.training == True):
			self.epsilon_decay()
			if (np.random.uniform() < self.epsilon):
				action = np.random.randint(0, NB_OUTPUTS) # Explore: random action
			else:
				action = np.argmax(self.q_table[state]) # Exploit: best known action
		else:
			action = np.argmax(self.q_table[state])
		return action

	# Updates Q-value for the state-action pair using the Q-learning formula
	def update_q_value(self, state, action, reward, next_state, alpha=ALPHA, gamma=GAMMA):
		if state not in self.q_table:
			self.q_table[state] = np.zeros(NB_OUTPUTS)
		if (next_state not in self.q_table):
			self.q_table[next_state] = np.zeros(NB_OUTPUTS) # Initialize Q-values for new state	
		td_target = reward + gamma * np.max(self.q_table[next_state])
		td_delta = td_target - self.q_table[state][action]
		self.q_table[state][action] += alpha * td_delta

	def save_q_table(self, episode: int, filename="q_table"):
		with open(f"{filename}_{episode}.pkl", "wb") as f:	
			pickle.dump(self.q_table, f)

	def load_q_table(self, filename="q_table_latest.pkl"):
		with open(filename, "rb") as f:
			self.q_table = pickle.load(f)

	def update(self, previous_action_qn, action_needed=False) :
		begin_state = self.get_ai_state(previous_action_qn, self.get_ball_state_situation())
		if (action_needed == True):
			chosen_action = self.get_ai_action(begin_state)
			# print("ai_action")
		else: 
			chosen_action = previous_action_qn
		self.movePlayer1(chosen_action)
		self.movePlayer2()
		self.moveBall()
		self.checkCollisionWall()
		self.checkCollisionPaddle(self.paddle1, -8, self.die1)
		self.checkCollisionPaddle(self.paddle2, 8, self.die2)
		self.checkGoal()
		if (self.gameOption == 1):
			self.crabmehameha(chosen_action)
		if (self.training == True and action_needed == True):
			reward = self.reward()
			next_state = self.get_ai_state(chosen_action)
			self.update_q_value(begin_state, chosen_action, reward, next_state)
			self.ai_score += reward
		return chosen_action

	def predictBallImpactX(self, paddleZ=Z_PADDLE_LEFT):
		x = self.ball.x
		z = self.ball.z
		dx = self.ball.dirX
		dz = self.ball.dirZ
		speed = self.ball.speed

		# print(f"Predicting impact: x={x}, z={z}, dz={dz}, dx={dx}speed={speed}, paddleZ={paddleZ}, t={(paddleZ - z) / (dz * speed)}")

		# Ball doesn´t go to the paddle
		if dz == 0 or speed == 0 or (dz > 0 and paddleZ < 0) or (dz < 0 and paddleZ > 0) :
			return None

		# Rebounce taken into account
		while True:
			# Time to lateral wall
			if dx > 0:
				tx_wall = (X_SUPERIOR_BALL_LIMIT - x) / (dx * speed)
			else:
				tx_wall = (X_INFERIOR_BALL_LIMIT - x) / (dx * speed)

			# Time to paddle Z
			tz_paddle = (paddleZ - z) / (dz * speed)
			if tz_paddle < 0:
				return None

			# Si le paddle est atteint
			if tz_paddle >= 0 and tz_paddle < tx_wall:
				x_impact = x + dx * speed * tz_paddle
				x_impact = max(X_INFERIOR_BALL_LIMIT, min(X_SUPERIOR_BALL_LIMIT, x_impact))
				# print("Predicted impact:", x_impact)
				return x_impact

			# Sinon, rebond sur le mur
			x += dx * speed * tx_wall
			z += dz * speed * tx_wall
			dx *= -1
			# print("Ball will bounce")

	# Calc the reward associated to the position of the paddle compared to the ball
	def reward(self):
		
		# if ()
		x_ball_dist_to_paddle = abs(self.paddle1 - self.ball.x)
		reward = -1 * (x_ball_dist_to_paddle / (X_SUPERIOR_PADDLE_LIMIT - X_INFERIOR_BALL_LIMIT)) * MAX_REWARD
		if (x_ball_dist_to_paddle < X_PADDLE_HEIGHT / 2):
			reward += MAX_REWARD
		# Have a minimum reward to avoid too much negative rewards
		return max(-MAX_REWARD, reward)

	# We schematize ball position  : 12 areas from left to right
	def get_ai_position(self):
		# Normalize between 0 and 1 the position
		area_percent = (self.paddle1 - X_INFERIOR_BALL_LIMIT) / (X_SUPERIOR_BALL_LIMIT - X_INFERIOR_BALL_LIMIT)
		area_percent = max(0.0, min(1.0, area_percent))  # Security
		area_zone = min(AREA_NUMBER, int(area_percent * AREA_NUMBER) + 1)
		return area_zone

	def get_ball_state_situation(self):
		if (self.ball.dirZ > 0):
			state = 2 # Ball going away
		else:
			state = 1 # Ball approaching
		return state

	def get_predicted_impact(self, predicted_impact):
		if (predicted_impact is None):
			return 0  # Ball going away
		
		# Normalize between 0 and 1 the predicted impact
		area_percent = (predicted_impact - X_INFERIOR_BALL_LIMIT) / (X_SUPERIOR_BALL_LIMIT - X_INFERIOR_BALL_LIMIT)
		area_percent = max(0.0, min(1.0, area_percent))  # Security
		area_zone = min(AREA_NUMBER, int(area_percent * AREA_NUMBER) + 1)
		# print(f"zone: {area_zone}")
		return area_zone

	# Full state with situation and action
	def get_ai_state(self, action_qn: int, ball_dirZ=1):
		if (ball_dirZ == 1):
			paddleZ = Z_PADDLE_LEFT
		else:
			paddleZ = Z_PADDLE_RIGHT
		predicted_impact = self.predictBallImpactX(paddleZ)
		# print(f"Predicted impact: {predicted_impact}")
		state = (
			self.get_ai_position(),
			self.get_predicted_impact(predicted_impact),
			action_qn
		)
		# print(state)
		# state = self.get_ai_state_situation()
		return state

	# To show it in webpage
	def get_state(self):
		return {
			'paddle1': { 'x': self.paddle1 },
			'paddle2': { 'x': self.paddle2},
			'ball': { 'x': self.ball.x, 'z': self.ball.z },
			'score': {'s1': self.score.s1 ,'s2': self.score.s2},
			'spell1': {'x': self.spell1.x, 'z': self.spell1.z},
			'spell2': {'x': self.spell2.x, 'z': self.spell2.z},
			'specialCooldown1': self.specialCooldown1,
			'specialCooldown2': self.specialCooldown2,
			'die1': self.die1,
			'die2': self.die2
		}
	
	def get_ai_score(self):
		return self.ai_score

	# def get_crab_score(self):
	# 	return self.crab_score

	def movePlayer1(self, action_qt):

		if action_qt == DOWN:
			if self.paddle1 > X_INFERIOR_BALL_LIMIT + 0.5:
				self.paddle1 -= PLAYER_SPEED * self.dt
		elif action_qt == UP:
			if (self.paddle1 < X_SUPERIOR_BALL_LIMIT - 0.5):
				self.paddle1 += PLAYER_SPEED * self.dt

	def movePlayer2(self):
		if (self.gameMode == 1):
			if (self.input1['7'] and self.paddle2 > X_INFERIOR_BALL_LIMIT + 0.5):
				self.paddle2 -= PLAYER_SPEED * self.dt # Useless in training
			if (self.input1['9'] and self.paddle2 < X_SUPERIOR_BALL_LIMIT - 0.5):
				self.paddle2 += PLAYER_SPEED * self.dt # Useless in training
		else:
			if (self.dumb == True):
				if (np.random.rand() < 0.75):
					if (self.paddle2 > self.ball.x):
						self.paddle2 -= PLAYER_SPEED * self.dt
					elif (self.paddle2 == self.ball.x):
						pass
					else:
						self.paddle2 += PLAYER_SPEED * self.dt
				else:
					if (self.paddle2 > self.ball.x):
						self.paddle2 -= PLAYER_SPEED * self.dt
					elif (self.paddle2 == self.ball.x):
						pass
					else:
						self.paddle2 += PLAYER_SPEED * self.dt
			else:
				if (self.paddle2 > self.ball.x):
					self.paddle2 -= PLAYER_SPEED * self.dt
				elif (self.paddle2 == self.ball.x):
						pass
				else:
					self.paddle2 += PLAYER_SPEED * self.dt

	def setGameMode(self, mode, option):
		self.gameMode = mode
		self.gameOption = option

	def setInputs(self, playerId, input) :
		self.inputs[playerId] = input
		self.input1 = self.inputs['player1'] or {}

	def moveBall(self):
		self.ball.x += self.ball.dirX * self.ball.speed * self.dt
		self.ball.z += self.ball.dirZ * self.ball.speed * self.dt

	def checkCollisionWall(self):
		if (self.ball.x < X_INFERIOR_BALL_LIMIT ):
			self.ball.x = X_INFERIOR_BALL_LIMIT + 0.1
			self.ball.dirX *= -1
		if (self.ball.x > X_SUPERIOR_BALL_LIMIT):
			self.ball.x = X_SUPERIOR_BALL_LIMIT - 0.1
			self.ball.dirX *= -1

	def checkCollisionPaddle(self, paddle, paddleZ, isDie):
		dx = abs(self.ball.x - paddle)
		dz = abs(self.ball.z - paddleZ)

		# CONCLUSION z negatif = vers paddle 1 !
		# print("ball z = " + str(self.ball.z) + " dz = " + str(self.ball.dirZ))
		if (dz < Z_PADDLE_WIDTH and dx < X_PADDLE_HEIGHT and isDie == False):
			if (self.ball.speed < SPEED_LIMIT):
				self.ball.speed += SPEED_INCREMENT
			self.ball.dirZ *= -1
			if (self.ball.z < 0):
				self.ball.z = Z_PADDLE_LEFT + 0.6
			else:
				self.ball.z = Z_PADDLE_RIGHT - 0.6
			relativeImpact = (self.ball.x - paddle)# * 0.5

			# Clamp entre -1 et 1
			clampedImpact = max(-1, min(1, relativeImpact))
			self.ball.dirX = clampedImpact
			#self.ball['dirZ'] = np.cos(angle)
			length = np.sqrt(self.ball.dirX ** 2 + self.ball.dirZ ** 2)
			self.ball.dirX /= length
			self.ball.dirZ /= length

	def checkGoal(self):
		if (self.ball.z < Z_GOAL_LEFT or self.ball.z > Z_GOAL_RIGHT):
			if (self.ball.z < Z_GOAL_LEFT):
				self.score.s2 += 1 
				# print("GOAL for player 2, score ", self.score.s2)
			else:
				self.score.s1 += 1
				# print("GOAL for player 1, score ", self.score.s1)
			self.reset(total=False) # Comment to make game endless no points
			self.ball.dirZ *= -1

	def reset(self, total: bool = False):
		self.paddle1 = 0.0
		self.paddle2 = 0.0
		self.ball.x = 0
		self.ball.z = 0
		self.ball.dirX = np.random.random() - 0.5
		self.ball.dirZ = -1 if np.random.random() < 0.5 else 1
		self.ball.speed = BASE_BALL_SPEED

		length = np.sqrt(self.ball.dirX ** 2 + self.ball.dirZ ** 2)
		self.ball.dirX /= length
		self.ball.dirZ /= length
		self.die1 = False
		self.die2 = False

		# self.spell1 = { 'x': 0, 'z' : -10}
		self.spell1.x = -0.22
		self.spell1.y = 1.8
		self.spell1.z = -10.56
		self.isSpell1Available = False

		self.isSpellGo1 = False
		# self.spell2 = { 'x': 0, 'z' : 10}
		self.spell2.x = 0.22
		self.spell2.y = 1.8
		self.spell2.z = 10.56
		self.isSpell2Available = False

		self.isSpellGo2 = False
		self.specialCooldown1 = 3
		self.specialCooldown2 = 3

		# Reset scores
		if (total == True):
			self.score.s1 = 0
			self.score.s2 = 0
			self.crab_score = 0
			self.ai_score = 0
			# self.score = { 's1': 0, 's2': 0 }

	def crabmehameha(self, action_nn):
		if (self.gameMode == 1 and self.die1 == False):
			if (self.specialCooldown1 < 0 and self.die1 == False):
				self.isSpell1Go1 = True
				self.specialCooldown1 = 50
		else: 
			if (self.input1['x'] and self.specialCooldown1 < 0 and self.die1 == False):
				self.isSpell1Go1 = True
				self.specialCooldown1 = 50
		
		# Deleted logic for player 2 crabmehameha

		self.specialCooldown1 -= self.dt
		self.specialCooldown2 -= self.dt
		self.updateCrabmehameha()

	def updateCrabmehameha(self):
		if (self.isSpellGo1 == True):
			if (self.spell1.z < Z_GOAL_LEFT):
				self.spell1.x = self.paddle1
				self.spell1.y = 0.4
				self.spell1.z = -7;#self.paddle['z'] + 1
			if (self.spell1.z > Z_GOAL_RIGHT):
				self.isSpellGo1 = False
				self.spell1.x = -0.22
				self.spell1.y = 1.8
				self.spell1.z = -10.56
			self.impactCrabmehameha(self.spell1, -10, self.paddle2, 8)
			self.spell1.z += self.dt
		if (self.isSpellGo2 == True):
			if (self.spell2.z > Z_GOAL_RIGHT):
				self.spell2.x = self.paddle2
				self.spell2.y = 0.4
				self.spell2.z = 7
			if (self.spell2.z < Z_GOAL_LEFT):
				self.isSpellGo2 = False
				self.spell2.x = 0.22
				self.spell2.y = 1.9
				self.spell2.z = 10.56
			self.impactCrabmehameha(self.spell2, 10, self.paddle1, -8)
			self.spell2.z -= self.dt

	def impactCrabmehameha(self, spell, posResetSpell, paddleTarget, paddleZ):
		dx = abs(spell.x - paddleTarget)
		dz = abs(spell.z - paddleZ)

		ballColx = abs(spell.x - self.ball.x)
		ballColz = abs(spell.z - self.ball.z)

		# annuler le spell si ball collision
		if (ballColx < 0.5 and ballColz < 0.5):
			if (spell == self.spell1):
				self.isSpellGo1 = False
			else:
				self.isSpellGo2 = False
			spell.x = 0
			spell.z = posResetSpell
		# tuer si collision
		if (dx < 0.8 and dz < 0.5):
			if (paddleTarget == self.paddle1):
				self.die1 = True
			else:
				self.die2 = True

	def __repr__(self):
		return "PongGame"
