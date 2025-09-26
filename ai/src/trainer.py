from game import PongGame
from network import Network
import random
import json as json
import time
import concurrent.futures
import copy

class Trainer:
	# TODO make me kwargs
	def __init__(self, **kwargs):
		# Check if has config
		has_config = 'config' in kwargs and kwargs['config'] is not None
		# Or check if all required params are provided
		has_params = all(
			k in kwargs and kwargs[k] is not None
			for k in ['population_size', 'nb_inputs', 'nb_hidden_layers', 'nb_neurons_per_layer', 'nb_outputs']
		)
		if not (has_config or has_params):
			raise ValueError(
				"Trainer needs either 'config' or all of 'population_size', 'nb_inputs', 'nb_hidden_layers', 'nb_neurons_per_layer', 'nb_outputs'."
			)
		
		self.generation: int = 0
		
		# Population characteristics
		if (has_config):
			conf = kwargs.get('config')
			self.population_size = len(conf)
			self.nb_inputs = len(conf[0]['input_layer']['weights'][0])
			self.nb_hidden_layers = len(conf[0]) - 2 # input and output layers are not counted
			self.nb_neurons_per_layer = len(conf[0]['input_layer']['biases'])
			self.nb_outputs = len(conf[0]['output_layer']['biases'])
			self.population = [Network(conf=conf[i]) for i in range(self.population_size)]
		else:
			self.population_size: int = kwargs.get('population_size', 50)
			self.nb_inputs: int = kwargs.get('nb_inputs', 7)
			self.nb_hidden_layers: int = kwargs.get('nb_hidden_layers', 3)
			self.nb_neurons_per_layer: int = kwargs.get('nb_neurons_per_layer', 5)
			self.nb_outputs: int = kwargs.get('nb_outputs', 4)
			self.population = [
				Network(nb_inputs=self.nb_inputs, nb_neurons_per_layer=self.nb_neurons_per_layer, nb_hidden_layers=self.nb_hidden_layers, nb_outputs=self.nb_outputs) for _ in range(self.population_size)
			]

		# Max value added or subtracted during mutation, * 0.2
		self.weights_mutation_intensity: float = kwargs.get('weights_mutation_intensity', 0.25)
		self.bias_mutation_intensity: float = kwargs.get('bias_mutation_intensity', 0.15)

		# On average, % of the weights and biases will be mutated
		self.weights_mutation_rate: float = kwargs.get('weights_mutation_rate', 0.1)
		self.biases_mutation_rate: float = kwargs.get('biases_mutation_rate', 0.1)

	def evaluate(self, network: Network, nb_games: int = 5):
		action = 2  # STILL by default
		total_score = 0
		game = PongGame(gameOption=0)
		ticks_per_decision = int(1 / game.dt)
	
		for i in range(nb_games):
			# game_len / game.dt = max_ticks
			max_ticks = int(60 * 60 / game.dt)
			tick = 0
			while tick < max_ticks :
				last_action = action
				if tick % ticks_per_decision == 0:
					action = network.work(game.get_state_for_ai())
				game.update(action)
				tick += 1
				# time.sleep(game.dt)
				# if (action != last_action):
				# 	total_score += 100
			total_score += game.get_ai_score() + game.get_crab_score()
			game.reset(True)
			# print(f"Game {i} done - Total score: {total_score}")
		average_score = total_score / nb_games
		# print(f"------ Average score over {nb_games} games: {average_score}")
		return average_score

	# Mutate the network's weights and biases based on the mutation rate
	# Keep the best 20% and cross them to create children
	# keep 5% randoms to cross with the best ones
	def train(self, nb_generations: int = 50, save_rate: int = 10):
		
		for _ in range(nb_generations):
			if (self.generation % save_rate == 0):
				self.save_config(best=True, population=True)
			with concurrent.futures.ThreadPoolExecutor() as executor:
				results = list(executor.map(self.evaluate, self.population))
			scores: list[tuple[float, Network]] = [(score, network) for score, network in zip(results, self.population)]
			scores.sort(key=lambda x: x[0], reverse=True)
			# print(scores)
			print(f"Generation {self.generation} - Best score: {scores[0][0]}")
			self.evolve(scores)
			# for i, network in enumerate(self.population):
			# 	conf = network.get_conf()
			# 	# Vérifie la structure
			# 	assert len(conf['input_layer']['weights']) == self.nb_neurons_per_layer
			# 	assert len(conf['input_layer']['weights'][0]) == self.nb_inputs
			# 	# ...idem pour hidden_layers et output_layer...
			# 	for j in range(self.nb_hidden_layers):
			# 		assert len(conf[f'{j + 1}']['weights']) == self.nb_neurons_per_layer
			# 		assert len(conf[f'{j + 1}']['weights'][0]) == self.nb_neurons_per_layer if j > 0 else self.nb_inputs
			# 	assert len(conf['output_layer']['weights']) == self.nb_outputs
			# 	assert len(conf['output_layer']['weights'][0]) == self.nb_neurons_per_layer
		self.save_config(best=True, population=True)
	
	def evolve(self, scores: list[tuple[float, Network]], best_untouched_rate: float = 0.1, retain_rate: float = 0.3, random_select: float = 0.05, random_network_rate: float = 0.05):
		# Select the best networks
		retain_length = int(self.population_size * retain_rate)
		parents = [network for _, network in scores[:retain_length]]

		# Keep best network without any change
		best_untouched_length = max(1, int(self.population_size * best_untouched_rate))
		best_networks = [network for _, network in scores[:best_untouched_length]]

		# Add some completely random individuals to promote genetic diversity
		random_network_length = int(len(scores) * random_network_rate)
		random_networks = self.get_random_networks(random_network_length)

		# Randomly add other individuals to parents to promote genetic diversity
		for _, network in scores[retain_length:]:
			if random_select > random.random():
				parents.append(network)

		# Crossover parents to create children, then mutate them
		children = []
		while len(children) + len(parents) + best_untouched_length + random_network_length < self.population_size:
			mother = random.choice(parents)
			father = random.choice(parents)
			if mother != father:
				child_conf = self.crossover(mother.get_conf(), father.get_conf())
				# TODO test with or without mutation, or add mutation rate ? Maybe at the beginning crossover, then mutate
				child = Network(conf=child_conf)
				self.mutate(child)
				children.append(child)

		self.population = best_networks + random_networks + parents + children
		self.generation += 1

	# Add some completely random individuals to promote genetic diversity
	def get_random_networks(self, nb_networks: int):
		return [Network(nb_hidden_layers=self.nb_hidden_layers, nb_neurons_per_layer=self.nb_neurons_per_layer, nb_inputs=self.nb_inputs, nb_outputs=self.nb_outputs) for _ in range(nb_networks)]	

	# TODO : add mutation rate per weight/bias
	def mutate(self, network: Network):
		new_conf = {}
		conf = copy.deepcopy(network.get_conf())
		for layer_key in conf.keys():
			layer = conf[layer_key]
			# TODO Mutation is not right
			for i in range(len(layer['weights'])):
				for j in range(len(layer['weights'][i])):
					if self.weights_mutation_rate > random.random():
						layer['weights'][i][j] += (random.uniform(-1, 1) * self.weights_mutation_intensity)
			for i in range(len(layer['biases'])):
				if self.biases_mutation_rate > random.random():
					layer['biases'][i] += (random.uniform(-1, 1) * self.bias_mutation_intensity)
			new_conf[layer_key] = layer
		network.set_conf(new_conf)

	def crossover(self, conf1, conf2):
		child_conf = {}
		for key in conf1.keys():
			child_conf[key] = self.crossover_layer(conf1[key], conf2[key])
		return child_conf
	
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

	def print_networks(self):
		for i, network in enumerate(self.population):
			print(f"Network {i}:\n")
			print(f"Layers:")
			print(f" Input Layer: {network.input_layer}")
			for j, layer in enumerate(network.hidden_layers):
				print(f" Hidden Layer {j}: {layer}")
			print(f" Output Layer: {network.output_layer}\n")

	def save_config(self, best: bool = True, population: bool = True):
		if (population):
			result = []
			for i, network in enumerate(self.population):
				conf = network.get_conf()
				result.append(conf)
			with open(f"data_gen_{self.generation}.json", "w") as f:
				json.dump(result, f)
		
		if (best):
			best_network = self.population[0]
			best_conf = best_network.get_conf()
			with open(f"data_gen_{self.generation}_best.json", "w") as f:
				json.dump(best_conf, f)
	


# Testing
# import json as json

def parse_json(file: str):
	conf: list = []
	with open(file, "r") as f:
		conf = json.load(f)
	return conf

if __name__ == '__main__':
	# network = Network(nb_inputs=4, nb_neurons_per_layer=5, nb_hidden_layers=2, nb_outputs=4)
	# conf = network.get_conf()
	# with open("data_training", "w") as f:
	# 	json.dump(conf, f)

	# # plus tard on aura une liste de dictionnaires
	# conf_from_json: dict[str, dict[str, list[float] | list[list[float]]]] = []
	# conf_from_json = parse_json("data_training")

	# network2 = Network(conf=conf_from_json)
	# with open("test2", "w") as f:
	# 	json.dump(network2.get_conf(), f)

	trainer = Trainer(population_size=50, nb_inputs=6, nb_hidden_layers=3, nb_neurons_per_layer=5, nb_outputs=3)
	trainer.train(nb_generations=100, save_rate=5)
	# trainer.print_networks()
	# trainer.print_networks()
	# trainer.save_config()

	# conf_from_json = parse_json("data_gen_30.json")
	# trainer2 = Trainer(config=conf_from_json)
	# trainer2.train(nb_generations=100, save_rate=10)
