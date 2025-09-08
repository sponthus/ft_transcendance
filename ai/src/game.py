import numpy as np
import time

# WARNING : Multiply speed by 10 compared to real game
BASE_BALL_SPEED = 10
PLAYER_SPEED = 0.3
SPEED_LIMIT = 22
SPEED_INCREMENT = 2

# Positions
INFERIOR_BALL_LIMIT = -5.8
SUPERIOR_BALL_LIMIT = 5.8
INFERIOR_PADDLE_LIMIT = -4.5
SUPERIOR_PADDLE_LIMIT = 4.5
LEFT_GOAL = -9
LEFT_PADDLE = -7.4
RIGHT_PADDLE = 7.4
RIGHT_GOAL = 9

# Simulation d'une partie a partir de la physique du jeu
# Ajout de scores lors de la partie : point quand il a touche la balle
# Crabmehameha : point quand un crabmehameha est fait alors que la balle est proche d'un ennemi, point ++ quand ca le touche, negatif ++ quand crabmehameha demande alors que indispo

class SimplePongGame:
	def __init__(self):
		self.paddle1 = {'x': 0}
		self.paddle2 = {'x': 0}
		self.ball = {'x': 0, 'z': 0, 'dirX': 1, 'dirZ': 1, 'speed': 1}
		self.dt = 0.016666
		self.crab1_cooldown = 0
		self.crab2_cooldown = 0
		self.crab2_paralyzed = 0
		self.score = {'s1': 0, 's2': 0}

	def step(self, action_nn):
		# action_nn: 0=UP, 1=DOWN, 2=STILL, 3=CRAB

		# Joueur 1 (réseau neuronal)
		if action_nn == 0 and self.paddle1['x'] > -4.5:
			self.paddle1['x'] -= PLAYER_SPEED
		elif action_nn == 1 and self.paddle1['x'] < 4.5:
			self.paddle1['x'] += PLAYER_SPEED
		elif action_nn == 3 and self.crab1_cooldown <= 0:
			self.crab1_cooldown = 2.0
			self.crab2_paralyzed = 2.0  # Paralyse l'adversaire

		# Joueur 2 (adversaire simple)
		if self.crab2_paralyzed <= 0:
			if self.paddle2['x'] > self.ball['x']:
				self.paddle2['x'] -= PLAYER_SPEED
			elif self.paddle2['x'] < self.ball['x']:
				self.paddle2['x'] += PLAYER_SPEED
		# Adversaire peut aussi lancer crabmehameha
		if self.crab2_cooldown <= 0 and abs(self.paddle2['x'] - self.ball['x']) < 0.5:
			self.crab2_cooldown = 2.0
			# Paralyse le joueur 1 (optionnel, à ajouter si tu veux)

		# Bouger la balle
		self.ball['x'] += self.ball['dirX'] * self.ball['speed'] * self.dt
		self.ball['z'] += self.ball['dirZ'] * self.ball['speed'] * self.dt

		# Rebonds sur les murs
		if self.ball['x'] < INFERIOR_BALL_LIMIT or self.ball['x'] > SUPERIOR_BALL_LIMIT:
			self.ball['dirX'] *= -1
		if self.ball['z'] < -9 or self.ball['z'] > 9:
			if self.ball['z'] < -9:
				self.score['s2'] += 1
			else:
				self.score['s1'] += 1
			self.reset_ball()

		# Crabmehameha cooldowns
		if self.crab1_cooldown > 0:
			self.crab1_cooldown -= self.dt
		if self.crab2_cooldown > 0:
			self.crab2_cooldown -= self.dt
		if self.crab2_paralyzed > 0:
			self.crab2_paralyzed -= self.dt

	def reset_ball(self):
		self.ball = {'x': 0, 'z': 0, 'dirX': 1, 'dirZ': 1, 'speed': 1}

	def get_state(self):
		return {
			'paddle1': self.paddle1['x'],
			'paddle2': self.paddle2['x'],
			'ball_x': self.ball['x'],
			'ball_z': self.ball['z'],
			'score1': self.score['s1'],
			'score2': self.score['s2'],
			'crab1_cooldown': self.crab1_cooldown,
			'crab2_cooldown': self.crab2_cooldown,
			'crab2_paralyzed': self.crab2_paralyzed
		}

	def run_with_ai(self, ai_decision_fn: callable, max_seconds=60):
		ticks_per_decision = int(1 / self.dt)  # ≈ 6
		action = 2  # STILL by default
		for sec in range(max_seconds):
			state = self.get_state()
			action = ai_decision_fn(state)  # IA choses an action every second
			for sub_tick in range(ticks_per_decision):
				self.step(action)  # Same action applied for 1s
				time.sleep(self.dt)
			sec += 1

# Real pong game from the project
class PongGame:
	def __init__(self):
		self.gameMode = 0
		self.gameOption = 1
		self.inputs = {}; # { player1: {...}, player2: {...} }
		self.input1 = {}

		self.dt = 0.016666
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
		return [ self.paddle1['x'], 
		  self.paddle2['x'], 
		  self.ball['x'], 
		  self.ball['z'], 
		  self.ball['dirX'], 
		  self.ball['dirZ'], 
		  self.isSpell1Available ]
	
	def get_ai_score(self):
		return self.ai_score
	
	def movePlayer1(self, action_nn):
		if action_nn == 0 and self.paddle1['x'] > INFERIOR_PADDLE_LIMIT:
			self.paddle1['x'] -= PLAYER_SPEED
		elif action_nn == 1 and self.paddle1['x'] < SUPERIOR_PADDLE_LIMIT:
			self.paddle1['x'] += PLAYER_SPEED
		# elif action_nn == 3 and self.crab1_cooldown <= 0:
		# 	self.crab1_cooldown = 2.0
		# 	self.crab2_paralyzed = 2.0  # Paralyse l'adversaire

	def movePlayer2(self):
		if (self.gameMode == 1):
			if (self.input1['7'] and self.paddle2['x'] > INFERIOR_PADDLE_LIMIT):
				self.paddle2['x'] -= PLAYER_SPEED # Useless in training
			if (self.input1['9'] and self.paddle2['x'] < SUPERIOR_PADDLE_LIMIT):
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
		if (self.ball['x'] < INFERIOR_BALL_LIMIT ):
			self.ball['x'] = INFERIOR_BALL_LIMIT + 0.1
			self.ball['dirX'] *= -1
		if (self.ball['x'] > SUPERIOR_BALL_LIMIT):
			self.ball['x'] = SUPERIOR_BALL_LIMIT - 0.1
			self.ball['dirX'] *= -1

	def checkCollisionPaddle(self, paddle, paddleZ, isDie):
		dx = abs(self.ball['x'] - paddle['x'])
		dz = abs(self.ball['z'] - paddleZ)

		if (dz < 0.5 and dx < 1 and isDie == False):
			if (paddleZ == -8):
				self.ai_score += 10

			if (self.ball['speed'] < SPEED_LIMIT):
				self.ball['speed'] += SPEED_INCREMENT
			self.ball['dirZ'] *= -8
			if (self.ball['z'] < 0):
				self.ball['z'] = LEFT_PADDLE
			else:
				self.ball['z'] = RIGHT_PADDLE
			relativeImpact = (self.ball['x'] - paddle['x'])# * 0.5

			# Clamp entre -1 et 1
			clampedImpact = max(-1, min(1, relativeImpact))
			self.ball['dirX'] = clampedImpact
			#self.ball['dirZ'] = np.cos(angle)
			length = np.sqrt(self.ball['dirX'] ** 2 + self.ball['dirZ'] ** 2)
			self.ball['dirX'] /= length
			self.ball['dirZ'] /= length

	def checkGoal(self):
		if (self.ball['z'] < LEFT_GOAL or self.ball['z'] > RIGHT_GOAL):
			if (self.ball['z'] < LEFT_GOAL):
				self.score['s2'] += 1
			else:
				self.score['s1'] += 1
				self.ai_score += 1
			# self.reset() # To make game endless
			self.ball['dirZ'] *= -1

	def reset(self):
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

	def crabmehameha(self, action_nn):
		if (self.specialCooldown1 < 0):
			self.isSpell1Available = True

		if (action_nn == 3 and self.isSpell1Available and self.die1 == False):
			self.crab_score += 1
			self.isSpellGo1 = True
			self.isSpell1Available = False
			self.specialCooldown1 = 50
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
			if (self.spell1['z'] < LEFT_GOAL):
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
			if (self.spell2['z'] < LEFT_GOAL):
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
