import numpy as np

# Simulation d'une partie a partir de la physique du jeu
# Ajout de scores lors de la partie : point quand il a touche la balle
# Crabmehameha : point quand un crabmehameha est fait alors que la balle est proche d'un ennemi, point ++ quand ca le touche, negatif ++ quand crabmehameha demande alors que indispo
# def play():

# Real pong game from the project
class PongGame:
	def __init__(self):
		self.gameMode = 0
		self.gameOption = 1
		self.inputs = {}; # { player1: {...}, player2: {...} }
		self.input1 = {}

		self.dt = 0.16666
		self.spell1 = { 
			'x': 0, 
			'z' : -10
		}
		self.isSpellGo1 = False
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
			'speed': 1 # unité par seconde
		}
		self.score = {
			's1': 0, 
			's2': 0
		}

		self.die1 = False
		self.die2 = False
	
	def setGameMode(self, mode, option):
		self.gameMode = mode
		self.gameOption = option

	def setInputs(self, playerId, input) :
		self.inputs[playerId] = input
		self.input1 = self.inputs['player1'] | {} #???

	def update(self) :
			self.movePlayer1()
			self.movePlayer2()
			self.moveBall()
			self.checkCollisionWall()
			self.checkCollisionPaddle(self.paddle1, -8, self.die1)
			self.checkCollisionPaddle(self.paddle2, 8, self.die2)
			self.checkGoal()
			if (self.gameOption == 1):
				self.crabmehameha()

	def getState(self):
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
	
	def movePlayer1(self):
		if (self.input1['q'] & self.paddle1['x'] > -4.5) :
			self.paddle1['x'] -= 0.3
		if (self.input1['e'] & self.paddle1['x'] < 4.5) :
			self.paddle1['x'] += 0.3

	def movePlayer2(self):
		if (self.gameMode == 1):
			if (self.input1['7'] & self.paddle2['x'] > -4.5):
				self.paddle2['x'] -= 0.3
			if (self.input1['9'] & self.paddle2['x'] < 4.5):
				self.paddle2['x'] += 0.3
		else:
			# IA débile
			if (self.paddle2['x'] > self.ball['x']):
				self.paddle2['x'] -= 0.3
			elif (self.paddle2['x'] == self.ball['x']):
				pass
			else:
				self.paddle2['x'] += 0.3

	def moveBall(self):
		self.ball['x'] += self.ball['dirX'] * self.ball['speed'] * self.dt
		self.ball['z'] += self.ball['dirZ'] * self.ball['speed'] * self.dt

	def checkCollisionWall(self):
		if (self.ball['x'] < -5.8 ):
			self.ball['x'] = -5.7
			self.ball['dirX'] *= -1
		if (self.ball['x'] > 5.8):
			self.ball['x'] = 5.7
			self.ball['dirX'] *= -1

	def checkCollisionPaddle(self, paddle, paddleZ, isDie):
		dx = abs(self.ball['x'] - paddle['x'])
		dz = abs(self.ball['z'] - paddleZ)

		if (dz < 0.5 & dx < 1 & isDie == False):
			if (self.ball['speed'] < 2.2):
				self.ball['speed'] += 0.2
			self.ball.dirZ *= -1
			if (self.ball['z'] < 0):
				self.ball['z'] = -7.4
			else:
				self.ball['z'] = 7.4
			relativeImpact = (self.ball['x'] - paddle['x'])# * 0.5

			# Clamp entre -1 et 1
			clampedImpact = max(-1, min(1, relativeImpact))
			self.ball.dirX = clampedImpact
			#self.ball.dirZ = np.cos(angle)
			length = np.sqrt(self.ball.dirX ** 2 + self.ball.dirZ ** 2)
			self.ball.dirX /= length
			self.ball.dirZ /= length

	def checkGoal(self):
		if (self.ball['z'] < -9 | self.ball['z'] > 9):
			if (self.ball['z'] < -9):
				self.score['s1'] += 1
			else:
				self.score['s2'] += 1
			self.reset()
			self.ball['dirZ'] *= -1

	def reset(self):
		self.paddle1 = { 'x': 0 }
		self.paddle2 = { 'x': 0 }
		self.ball = {
			'x': 0,
			'z': 0,
			'dirX': 0,#np.random.uniform(-1, 1) > 0 ? 1 : -1,
			'dirZ': 1,#np.random.uniform(-1, 1),
			'speed': 1
		}
		self.die1 = False
		self.die2 = False

		self.spell1 = { 'x': 0, 'z' : -10}
		self.isSpellGo1 = False
		self.spell2 = { 'x': 0, 'z' : 10}
		self.isSpellGo2 = False
		self.specialCooldown1 = 3
		self.specialCooldown2 = 3

	def crabmehameha(self):
		if (self.input1['x'] & self.specialCooldown1 < 0 & self.die1 == False):
			self.isSpellGo1 = True
			self.specialCooldown1 = 50
		if (self.gameMode == 1 & self.die2 == False):
			if (self.input1['3'] & self.specialCooldown2 < 0):
				self.isSpellGo2 = True
				self.specialCooldown2 = 50
		else:
			if (self.specialCooldown2 < 0 & self.die2 == False):
				self.isSpellGo2 = True
				self.specialCooldown2 = 50
		self.specialCooldown1 -= self.dt
		self.specialCooldown2 -= self.dt
		self.updateCrabmehameha()

	def updateCrabmehameha(self):
		if (self.isSpellGo1 == True):
			if (self.spell1['z'] < -9):
				self.spell1['x'] = self.paddle1['x']
				self.spell1['z'] = -7;#self.paddle['z'] + 1
			if (self.spell1['z'] > 9):
				self.isSpellGo1 = False
				self.spell1['x'] = 0
				self.spell1['z'] = -10
			self.impactCrabmehameha(self.spell1, -10, self.paddle2, 8)
			self.spell1['z'] += self.dt
		if (self.isSpellGo2 == True):
			if (self.spell2['z'] > 9):
				self.spell2['x'] = self.paddle2['x']
				self.spell2['z'] = 7;#self.paddle['z'] + 1
			if (self.spell2['z'] < -9):
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
		if (ballColx < 0.5 & ballColz < 0.5):
			if (spell == self.spell1):
				self.isSpellGo1 = False
			else:
				self.isSpellGo2 = False
			spell['x'] = 0
			spell['z'] = posResetSpell
		# tuer si collision
		if (dx < 0.8 & dz < 0.5):
			if (paddleTarget == self.paddle1):
				self.die1 = True
			else:
				self.die2 = True

	def __repr__(self):
		return "PongGame"
