from game import PongGame
from network import Network
import random

class Trainer:
	# TODO make me kwargs
	def __init__(self, population_size: int, weights_mutation_intensity: float = 0.1, bias_mutation_intensity: float = 0.05, weights_mutation_rate: float = 0.1, biases_mutation_rate: float = 0.1, nb_inputs: int, nb_hidden_layers: int, nb_neurons_per_layer: int, nb_outputs: int):
		# On average, % of the weights and biases will be mutated
		self.weights_mutation_rate = weights_mutation_rate 
		self.bias_mutation_rate = biases_mutation_rate
		# Max value added or subtracted during mutation
		self.weights_mutation_intensity = weights_mutation_intensity
		self.bias_mutation_intensity = bias_mutation_intensity

		self.population_size = population_size

		self.nb_hidden_layers = nb_hidden_layers
		self.nb_neurons_per_layer = nb_neurons_per_layer
		self.nb_inputs = nb_inputs
		self.nb_outputs = nb_outputs

		self.generation = 0
		self.population = [
			Network(nb_inputs=nb_inputs, nb_neurons_per_layer=nb_neurons_per_layer, nb_hidden_layers=nb_hidden_layers, nb_outputs=nb_outputs) for _ in range(population_size)
		]

	def evaluate(self, network: Network, nb_games: int = 5):
		action = 2  # STILL by default
		total_score = 0
		game = PongGame()
		ticks_per_decision = int(1 / game.dt)

		for _ in range(nb_games):
			# game_len / game.dt = max_ticks
			max_ticks = int(60 / game.dt)
			tick = 0
			while tick < max_ticks :
				if tick % ticks_per_decision == 0:
					action = network.work(game.get_state_for_ai())
				game.update(action)
				tick += 1
			total_score += game.get_ai_score() + game.get_crab_score() #Doesn´t take crab score
			game.reset(True)
		average_score = total_score / nb_games
		return average_score

	# Mutate the network's weights and biases based on the mutation rate
	# Keep the best 20% and cross them to create children
	# keep 5% randoms to cross with the best ones
	def evolve(self, retain_rate: float = 0.2, random_select: float = 0.05, random_network_rate: float = 0.05):
		scores = [(self.evaluate(network), network) for network in self.population]
		
		scores.sort(key=lambda x: x[0], reverse=True)
		retain_length = int(len(scores) * retain_rate)
		parents = [network for _, network in scores[:retain_length]]
		random_network_length = int(len(scores) * random_network_rate)

		random_networks = []
		
		# Add some completely random individuals to promote genetic diversity
		for _ in range(random_network_length):
			random_networks.append(Network(nb_hidden_layers=self.nb_hidden_layers, nb_neurons_per_layer=self.nb_neurons_per_layer, nb_inputs=self.nb_inputs, nb_outputs=self.nb_outputs))

		# Randomly add other individuals to promote genetic diversity
		for _, network in scores[retain_length:]:
			if random_select > random.random():
				parents.append(network)

		# TODO Delete crossovers for now, only mutations
		# Crossover parents to create children, then mutate them
		children = []
		while len(children) + len(parents) < self.population_size - random_network_length:
			mother = random.choice(parents)
			father = random.choice(parents)
			if mother != father:
				child_conf = self.crossover(mother.get_conf(), father.get_conf())
				# TODO test with or without mutation, or add mutation rate ? Maybe at the beginning crossover, then mutate
				child = Network(conf=child_conf)
				self.mutate(child)
				children.append(child)

		# TODO: Choose if mutation is needed instead of crossover
		# You need to identify whatś best between mutation and crossoverand both, at the same time or part/part
		self.population = random_networks + parents + children
		self.generation += 1
	
	# TODO : add mutation rate per weight/bias
	def mutate(self, network: Network):
		new_conf = {}
		conf = network.get_conf()
		for layer_key in conf.keys():
			layer = conf[layer_key]
			# TODO Mutation is not right
			for i in range(len(layer['weights'])):
				for j in range(len(layer['weights'][i])):
					if self.weights_mutation_rate > random.random():
						layer['weights'][i] += (random.uniform(-0.2, 0.2) * self.weights_mutation_intensity)
			for i in range(len(layer['biases'])):
				if self.bias_mutation_rate > random.random():
					layer['biases'] += (random.uniform(-0.2, 0.2) * self.bias_mutation_intensity)
			new_conf[layer_key] = layer
		network.set_conf(new_conf)

	def crossover(self, conf1, conf2):
		child_conf = {}
		for key in conf1.keys():
			child_conf[key] = self.crossover_layer(conf1[key], conf2[key])
		return child_conf
	
	# TODO No crossover for now ... See later
	def crossover_layer(self, layer1, layer2):
		weights1, biases1 = layer1['weights'], layer1['biases']
		weights2, biases2 = layer2['weights'], layer2['biases']
		child_weights = []
		child_biases = []

		# TODO: Evaluate if it's better to cross either mom or dad or do the average
		# or even do a random mix of both
		for w1, w2 in zip(weights1, weights2):
			if random.random() > 0.5:
				child_weights.append(w1)
			else:
				child_weights.append(w2)

		for b1, b2 in zip(biases1, biases2):
			if random.random() > 0.5:
				child_biases.append(b1)
			else:
				child_biases.append(b2)

		return {"weights": child_weights, "biases": child_biases}

