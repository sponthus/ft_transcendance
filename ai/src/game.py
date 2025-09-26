import numpy as np
import time

BASE_BALL_SPEED = 1
PLAYER_SPEED = 0.2
SPEED_LIMIT = 2
SPEED_INCREMENT = 0.2

# Positions
X_INFERIOR_BALL_LIMIT = -5.8
X_SUPERIOR_BALL_LIMIT = 5.8
X_INFERIOR_PADDLE_LIMIT = -4.5
X_SUPERIOR_PADDLE_LIMIT = 4.5
Z_GOAL_LEFT = -9
Z_PADDLE_LEFT = -7.4
Z_PADDLE_RIGHT = 7.4
Z_GOAL_RIGHT = 9
X_PADDLE_HEIGHT = 1
Z_PADDLE_WIDTH = 0.5

UP = 0
DOWN = 1
STILL = 2

POINTS_MOVE_TO_WALL = 0 # lost if you move to the wall
POINTS_TOUCH_BALL = 20000 # Points for touching the ball
POINTS_MARK_GOAL = 50000 # Points for scoring a goal
POINTS_TAKE_A_GOAL = 20000 # lost if you take a goal
POINTS_WELL_PLACED = 100 # Points for being well placed to hit the ball
POINTS_ALMOST_WELL_PLACED = 50 # Points for being almost well placed to hit the ball
POINTS_BAD_PLACED = 200 # lost for being badly placed to hit the ball
POINTS_CRAB_WELL_LAUNCHED = 10 # Points for launching a crabmehameha well
# Simulation d'une partie a partir de la physique du jeu
# Ajout de scores lors de la partie : point quand il a touche la balle
# Crabmehameha : point quand un crabmehameha est fait alors que la balle est proche d'un ennemi, point ++ quand ca le touche, negatif ++ quand crabmehameha demande alors que indispo

# Real pong game from the project
class PongGame:
	def __init__(self, gameOption=1):
		self.gameMode = 0
		self.gameOption = gameOption
		self.inputs = {}; # { player1: {...}, player2: {...} }
		self.input1 = {}

		self.dt = 0.16666
		self.spell1 = { 
			'x': 0, 
			'z' : -10
		}
		self.isSpellGo1 = False
		self.isSpell1Available = False
		self.spell2 = { 
			'x' : 0, 
			'z' : 10
		}
		self.isSpellGo2 = False
		self.specialCooldown1 = 3
		self.specialCooldown2 = 3

		self.paddle1 = { 'x': 0 }
		self.paddle2 = { 'x': 0 }
		self.ball = {
			'x': 0,
			'z': 0,
			'dirX': 0,#np.random.uniform(-1, 1) > 0 ? 1 : -1,
			'dirZ': 1,#np.random.uniform(-1, 1),
			'speed': BASE_BALL_SPEED # unité par seconde
		}
		self.score = {
			's1': 0, 
			's2': 0
		}

		self.die1 = False
		self.die2 = False

		self.ai_score = 0
		self.crab_score = 0
	
	def setGameMode(self, mode, option):
		self.gameMode = mode
		self.gameOption = option

	def setInputs(self, playerId, input) :
		self.inputs[playerId] = input
		self.input1 = self.inputs['player1'] or {} #???

	def update(self, action_nn) :
		self.movePlayer1(action_nn)
		self.movePlayer2()
		self.moveBall()
		self.checkCollisionWall()
		self.checkCollisionPaddle(self.paddle1, -8, self.die1)
		self.checkCollisionPaddle(self.paddle2, 8, self.die2)
		self.checkGoal()
		if (self.gameOption == 1):
			self.crabmehameha(action_nn)

	def get_state(self):
		return {
			'paddle1': { 'x': self.paddle1['x'] },
			'paddle2': { 'x': self.paddle2['x']},
			'ball': { 'x': self.ball['x'], 'z': self.ball['z'] },
			'score': {'s1': self.score['s1'] ,'s2': self.score['s2']},
			'spell1': {'x': self.spell1['x'], 'z': self.spell1['z']},
			'spell2': {'x': self.spell2['x'], 'z': self.spell2['z']},
			'specialCooldown1': self.specialCooldown1,
			'specialCooldown2': self.specialCooldown2,
			'die1': self.die1,
			'die2': self.die2
		}

	def get_state_for_ai(self):
		if (self.gameOption == 0):
			return [ self.paddle1['x'], 
			  self.paddle2['x'], 
			  self.ball['x'], 
			  self.ball['z'], 
			  self.ball['dirX'], 
			  self.ball['dirZ'] ]
		else:
			return [ self.paddle1['x'], 
			self.paddle2['x'], 
			self.ball['x'], 
			self.ball['z'], 
			self.ball['dirX'], 
			self.ball['dirZ'], 
			self.isSpell1Available ]
	
	def get_ai_score(self):
		return self.ai_score

	def get_crab_score(self):
		return self.crab_score

	def predictBallImpactX(self, paddleZ=Z_PADDLE_RIGHT):
		# Initial positions and directions
		x = self.ball['x']
		z = self.ball['z']
		dx = self.ball['dirX']
		dz = self.ball['dirZ']
		speed = self.ball['speed']

		if dz == 0 or dx == 0 or speed == 0 or dz < 0:  # Ball moving away from the paddle
			return None

		while True:
			# Time to reach the next X wall
			if dx > 0:
				tx_wall = (X_SUPERIOR_BALL_LIMIT - x) / (dx * speed)
			else:
				tx_wall = (X_INFERIOR_BALL_LIMIT - x) / (dx * speed)

			# Time to reach the paddleZ
			tz_paddle = (paddleZ - z) / (dz * speed)

			# If the paddleZ is reached before the wall
			if tz_paddle < tx_wall and tz_paddle > 0:
				x_impact = x + dx * speed * tz_paddle
				# Clamp the impact within the X limits
				x_impact = max(X_INFERIOR_BALL_LIMIT, min(X_SUPERIOR_BALL_LIMIT, x_impact))
				return x_impact

			# Otherwise, bounce off the wall
			x += dx * speed * tx_wall
			z += dz * speed * tx_wall
			dx *= -1  # Horizontal bounce

			# If the ball exceeds the paddleZ during the bounce, we calculate the impact at that moment
			if (dz > 0 and z >= paddleZ) or (dz < 0 and z <= paddleZ):
				# Remaining time to reach paddleZ from the last position
				t_remain = (paddleZ - (z - dz * speed * tx_wall)) / (dz * speed)
				x_impact = (x - dx * speed * tx_wall) + dx * speed * t_remain
				x_impact = max(X_INFERIOR_BALL_LIMIT, min(X_SUPERIOR_BALL_LIMIT, x_impact))
				return x_impact

	def movePlayer1(self, action_nn):

		if action_nn == 0:
			if self.paddle1['x'] > X_INFERIOR_PADDLE_LIMIT:
				self.paddle1['x'] -= PLAYER_SPEED
				self.ai_score += POINTS_MOVE_TO_WALL
			else:
				self.ai_score -= POINTS_MOVE_TO_WALL # Penalize hitting the wall
		elif action_nn == 1:
			if (self.paddle1['x'] < X_SUPERIOR_PADDLE_LIMIT):
				self.paddle1['x'] += PLAYER_SPEED
				self.ai_score += POINTS_MOVE_TO_WALL
			else:
				self.ai_score -= POINTS_MOVE_TO_WALL # Penalize hitting the wall
		
		impactX = self.predictBallImpactX(paddleZ=Z_PADDLE_RIGHT)  # Z du paddle IA
		if impactX is not None:
			dist = self.paddle1['x'] - impactX
			if abs(dist) < X_PADDLE_HEIGHT:
				if (action_nn == STILL):
					self.ai_score += POINTS_WELL_PLACED * 2
				else:
					self.ai_score += POINTS_ALMOST_WELL_PLACED  # bien placé
			elif (action_nn == UP and dist < 0) or (action_nn == DOWN and dist > 0):
					self.ai_score += POINTS_ALMOST_WELL_PLACED  # presque bien placé
			else:
				self.ai_score -= POINTS_BAD_PLACED  # mal placé
	
		# elif action_nn == 3 and self.crab1_cooldown <= 0:
		# 	self.crab1_cooldown = 2.0
		# 	self.crab2_paralyzed = 2.0  # Paralyse l'adversaire

	def movePlayer2(self):
		if (self.gameMode == 1):
			if (self.input1['7'] and self.paddle2['x'] > X_INFERIOR_PADDLE_LIMIT):
				self.paddle2['x'] -= PLAYER_SPEED # Useless in training
			if (self.input1['9'] and self.paddle2['x'] < X_SUPERIOR_PADDLE_LIMIT):
				self.paddle2['x'] += PLAYER_SPEED # Useless in training
		else:
			# Basic IA -> Does the right movement 75% of the time otherwise does the contrary
			if (np.random.rand() < 0.75):
				if (self.paddle2['x'] > self.ball['x']):
					self.paddle2['x'] -= PLAYER_SPEED
				elif (self.paddle2['x'] == self.ball['x']):
					pass
				else:
					self.paddle2['x'] += PLAYER_SPEED
			else:
				if (self.paddle2['x'] > self.ball['x']):
					self.paddle2['x'] += PLAYER_SPEED
				else:
					self.paddle2['x'] -= PLAYER_SPEED

	def moveBall(self):
		self.ball['x'] += self.ball['dirX'] * self.ball['speed'] * self.dt
		self.ball['z'] += self.ball['dirZ'] * self.ball['speed'] * self.dt

	def checkCollisionWall(self):
		if (self.ball['x'] < X_INFERIOR_BALL_LIMIT ):
			self.ball['x'] = X_INFERIOR_BALL_LIMIT + 0.1
			self.ball['dirX'] *= -1
		if (self.ball['x'] > X_SUPERIOR_BALL_LIMIT):
			self.ball['x'] = X_SUPERIOR_BALL_LIMIT - 0.1
			self.ball['dirX'] *= -1

	def checkCollisionPaddle(self, paddle, paddleZ, isDie):
		dx = abs(self.ball['x'] - paddle['x'])
		dz = abs(self.ball['z'] - paddleZ)

		if (dz < Z_PADDLE_WIDTH and dx < X_PADDLE_HEIGHT and isDie == False):
			if (paddleZ == -8):
				# Points if AI touches the ball
				self.ai_score += POINTS_TOUCH_BALL

			if (self.ball['speed'] < SPEED_LIMIT):
				self.ball['speed'] += SPEED_INCREMENT
			self.ball['dirZ'] *= -8
			if (self.ball['z'] < 0):
				self.ball['z'] = Z_PADDLE_LEFT
			else:
				self.ball['z'] = Z_PADDLE_RIGHT
			relativeImpact = (self.ball['x'] - paddle['x'])# * 0.5

			# Clamp entre -1 et 1
			clampedImpact = max(-1, min(1, relativeImpact))
			self.ball['dirX'] = clampedImpact
			#self.ball['dirZ'] = np.cos(angle)
			length = np.sqrt(self.ball['dirX'] ** 2 + self.ball['dirZ'] ** 2)
			self.ball['dirX'] /= length
			self.ball['dirZ'] /= length

	def checkGoal(self):
		if (self.ball['z'] < Z_GOAL_LEFT or self.ball['z'] > Z_GOAL_RIGHT):
			if (self.ball['z'] < Z_GOAL_LEFT):
				self.score['s2'] += 1
				self.ai_score -= POINTS_TAKE_A_GOAL # Penalize for conceding a goal
			else:
				self.score['s1'] += 1
				self.ai_score += POINTS_MARK_GOAL # Big bonus for scoring
			# self.reset() # To make game endless
			self.ball['dirZ'] *= -1

	def reset(self, total: bool = False):
		self.paddle1 = { 'x': 0 }
		self.paddle2 = { 'x': 0 }
		self.ball = {
			'x': 0,
			'z': 0,
			'dirX': 0,#np.random.uniform(-1, 1) > 0 ? 1 : -1,
			'dirZ': 1,#np.random.uniform(-1, 1),
			'speed': BASE_BALL_SPEED
		}
		self.die1 = False
		self.die2 = False

		self.spell1 = { 'x': 0, 'z' : -10}
		self.isSpellGo1 = False
		self.spell2 = { 'x': 0, 'z' : 10}
		self.isSpellGo2 = False
		self.specialCooldown1 = 3
		self.specialCooldown2 = 3

		# Reset scores
		if (total):
			self.score = { 's1': 0, 's2': 0 }
			self.crab_score = 0
			self.ai_score = 0

	def crabmehameha(self, action_nn):
		if (self.specialCooldown1 < 0):
			self.isSpell1Available = True

		if (action_nn == 3 and self.isSpell1Available and self.die1 == False):
			self.crab_score += POINTS_CRAB_WELL_LAUNCHED # Bonus for a spell launched
			self.isSpellGo1 = True
			self.isSpell1Available = False
			self.specialCooldown1 = 50
		elif (action_nn == 3 and self.isSpell1Available == False):
			self.crab_score -= 5 # Penalize useless spell
		if (self.gameMode == 1 and self.die2 == False):
			if (self.input1['3'] and self.specialCooldown2 < 0):
				self.isSpellGo2 = True
				self.specialCooldown2 = 50 # Useless because we don't play
		else:
			if (self.specialCooldown2 < 0 and self.die2 == False):
				self.isSpellGo2 = True
				self.specialCooldown2 = 50
		self.specialCooldown1 -= self.dt
		self.specialCooldown2 -= self.dt
		self.updateCrabmehameha()

	def updateCrabmehameha(self):
		if (self.isSpellGo1 == True):
			if (self.spell1['z'] < Z_GOAL):
				self.spell1['x'] = self.paddle1['x']
				self.spell1['z'] = -7;#self.paddle['z'] + 1
			if (self.spell1['z'] > RIGHT_GOAL):
				self.isSpellGo1 = False
				self.spell1['x'] = 0
				self.spell1['z'] = -10
			self.impactCrabmehameha(self.spell1, -10, self.paddle2, 8)
			self.spell1['z'] += self.dt
		if (self.isSpellGo2 == True):
			if (self.spell2['z'] > RIGHT_GOAL):
				self.spell2['x'] = self.paddle2['x']
				self.spell2['z'] = 7;#self.paddle['z'] + 1
			if (self.spell2['z'] < Z_GOAL):
				self.isSpellGo2 = False
				self.spell2['x'] = 0
				self.spell2['z'] = 10
			self.impactCrabmehameha(self.spell2, 10, self.paddle1, -8)
			self.spell2['z'] -= self.dt

	def impactCrabmehameha(self, spell, posResetSpell, paddleTarget, paddleZ):
		dx = abs(spell['x'] - paddleTarget['x'])
		dz = abs(spell['z'] - paddleZ)

		ballColx = abs(spell['x'] - self.ball['x'])
		ballColz = abs(spell['z'] - self.ball['z'])

		# annuler le spell si ball collision
		if (ballColx < 0.5 and ballColz < 0.5):
			if (spell == self.spell1):
				self.isSpellGo1 = False
			else:
				self.isSpellGo2 = False
			spell['x'] = 0
			spell['z'] = posResetSpell
		# tuer si collision
		if (dx < 0.8 and dz < 0.5):
			if (paddleTarget == self.paddle1):
				self.die1 = True
			else:
				self.die2 = True

	def __repr__(self):
		return "PongGame"
