import numpy as np
from typing import Callable

NB_INPUTS = 7
NB_HIDDEN_LAYERS = 3
NB_NEURONS_PER_LAYER = 5
NB_OUTPUTS = 4

def ReLu(input_value: float) -> float :
	value = max(0, input_value) # ReLU activation
	return value

class Neuron:
	name: int = 0
	def __init__ (self, **kwargs):
	# def __init__(self, nb_input: int, activation_function: Callable, weights: list[float] = [], bias: float = 0):
		# Set 1: 'weights' and 'bias'
		set1 = kwargs.get('weights') is not None and kwargs.get('bias') is not None
		# Set 2: 'nb_inputs'
		set2 = kwargs.get('nb_inputs') is not None

		if not (set1 or set2):
			raise ValueError("You must provide either (weights and bias) or (nb_inputs) as arguments.")
		
		self.name: int = Neuron.name
		Neuron.name += 1

		self.weights: np.ndarray[float]
		if (kwargs.get('weights') is not None and len(kwargs.get('weights')) != 0):
			self.weights = np.array(kwargs.get('weights'))
		else:
			self.weights = np.random.randn(kwargs.get('nb_inputs')) 
			# TODO Possibility to modify biais generation for better alignment

		# TODO limit bias modification ? possibility to be neg ?
		self.bias: float
		if (kwargs.get('bias') is None):
			self.bias = np.random.uniform(-1, 1)
		else:
			self.bias = kwargs.get('bias')
		self.activation_function: Callable = kwargs.get('activation_function', ReLu)

	def get_weights(self) -> list[float] :
		return self.weights.tolist()
	
	def get_biais(self) -> float :
		return self.bias

	def __str__(self):
		return f"Neuron(name={self.name}, bias={self.bias}, weights={self.weights})"

	def __repr__(self):
		return f"Neuron(name={self.name}, bias={self.bias}, weights={self.weights})"
	
	def forward(self, input_values: list[float]) -> float :
		if len(input_values) != len(self.weights):
			raise ValueError("Input values must match the number of weights.")
		
		result: float = 0.0
		
		# Calculate the weighted sum of inputs
		for i in range(len(input_values)):
			result += input_values[i] * self.weights[i]
		# Add the bias once
		result += self.bias

		# Forward pass through the neuron
		value = self.activation_function(result)
		return value

class Layer:
	name: int = 0
	def __init__(self, **kwargs):
	# def __init__(self, nb_input: int, nb_neurons: int, activation_function: Callable, conf: dict[str, list[float] | list[list[float]]] = None):
		
		# Two ways to create a layer : either from conf, either from nb_inputs and nb_neurons
		has_conf = kwargs.get('conf') is not None
		has_params = kwargs.get('nb_inputs') is not None and kwargs.get('nb_neurons') is not None
		activation_function = kwargs.get('activation_function', ReLu)
		if not (has_conf or has_params):
			raise ValueError("Layer needs either 'conf' or both 'nb_inputs' and 'nb_neurons'.")
		
		Neuron.name = 0
		self.name: int = Layer.name
		Layer.name += 1
		if (has_conf):
			self.nb_neurons = len(kwargs.get('conf')["biases"])
		else:
			self.nb_neurons = kwargs.get('nb_neurons')
		
		self.neurons: list[Neuron] = []

		# TODO = Adjust nb of neurons per layer in each layer
		if (kwargs.get('conf')):
			conf = kwargs.get('conf')
			for n in range(self.nb_neurons):
				self.neurons.append(Neuron(activation_function=activation_function, weights=conf["weights"][n], bias=conf["biases"][n]))
		else:
			for n in range(self.nb_neurons):
				self.neurons.append(Neuron(nb_inputs=kwargs.get('nb_inputs'), activation_function=activation_function))

	def forward(self, input_values: list[float]) -> list[float]:
		results: list[float] = []
		for n in range(len(self.neurons)):
			results.append(self.neurons[n].forward(input_values))
		return results

	def get_conf(self) -> tuple[list[list[float]], list[float]] :
		weights: list[list[float]] = []
		biases: list[float] = []
		for n in range(len(self.neurons)):
			weights.append(self.neurons[n].get_weights())
			biases.append(self.neurons[n].get_biais())
		return weights, biases

	def __repr__(self):
		return f"Layer(name={self.name}, neurons={len(self.neurons)})"
	
class Network:
	name_val: int = 0
	def __init__(self, **kwargs): 
	#def __init__(self, nb_hidden_layers: int, nb_neurons_per_layer: int, nb_inputs: int, nb_outputs: int, conf = None):
		self.name = str(Network.name_val)
		Network.name_val += 1
		self.input_layer: Layer
		self.hidden_layers: list[Layer] = []
		self.output_layer: Layer
		self.nb_hidden_layers: int
		self.nb_neurons_per_layer: int

		Layer.name = 0
		
		has_conf = 'conf' in kwargs and kwargs['conf'] is not None
		has_params = all(
			k in kwargs and kwargs[k] is not None
			for k in ['nb_inputs', 'nb_outputs', 'nb_hidden_layers', 'nb_neurons_per_layer']
		)
		if not (has_conf or has_params):
			raise ValueError("You must provide either 'conf' or all of 'nb_inputs', 'nb_outputs', 'nb_hidden_layers', and 'nb_neurons_per_layer'.")

		if (has_conf):
			self.set_conf(kwargs.get('conf'))
		else:
			self.nb_inputs = kwargs.get('nb_inputs', NB_INPUTS)
			self.nb_outputs = kwargs.get('nb_outputs', NB_OUTPUTS)
			self.nb_hidden_layers = kwargs.get('nb_hidden_layers', NB_HIDDEN_LAYERS)
			self.nb_neurons_per_layer = kwargs.get('nb_neurons_per_layer', NB_NEURONS_PER_LAYER)
										  
			self.input_layer = Layer(nb_inputs=self.nb_inputs, nb_neurons=self.nb_neurons_per_layer, activation_function=ReLu)
			for _ in range(self.nb_hidden_layers):
				self.hidden_layers.append(Layer(nb_inputs=self.nb_neurons_per_layer, nb_neurons=self.nb_neurons_per_layer, activation_function=ReLu))
			self.output_layer = Layer(nb_inputs=self.nb_neurons_per_layer, nb_neurons=self.nb_outputs, activation_function=ReLu)

	def work(self, inputs: list[float]):
		results: list[float] = []
		results = self.input_layer.forward(inputs)
		for layer in self.hidden_layers:
			results = layer.forward(results)
		results = self.output_layer.forward(results)
		return np.argmax(results)
	
	def get_conf(self) -> dict[str, dict[str, list[float] | list[list[float]]]]:
		results: dict[str, dict[str, list[float] | list[list[float]]]] = {}

		input_layer_weights, input_layer_biases = self.input_layer.get_conf()
		results['input_layer'] = { 
			'weights' : input_layer_weights,
			'biases' : input_layer_biases
		}
		hidden_layers_weights: dict[int, list[float]] = {}
		hidden_layers_biases: dict[int, float] = {}

		for l in range(len(self.hidden_layers)):
			hidden_layers_weights[l], hidden_layers_biases[l] = self.hidden_layers[l].get_conf()
			results[str(l + 1)] = {
				'weights' : hidden_layers_weights[l],
				'biases' : hidden_layers_biases[l]
			}
		
		output_layer_weights, output_layer_biases = self.output_layer.get_conf()
		results['output_layer'] = {
			'weights' : output_layer_weights,
			'biases' : output_layer_biases
		}
		return results

	def set_conf(self, conf: dict[str, dict[str, list[float] | list[list[float]]]]):
		self.nb_inputs = len(conf['input_layer']['weights'][0])
		self.nb_outputs = len(conf['output_layer']['biases'])
		self.nb_hidden_layers = len(conf) - 2
		self.nb_neurons_per_layer = len(conf['input_layer']['biases'])
		self.hidden_layers = []

		Layer.name = 0
		self.input_layer = Layer(conf=conf['input_layer'])
		for l in range(self.nb_hidden_layers):
			self.hidden_layers.append(Layer(conf=conf[str(l + 1)]))
		self.output_layer = Layer(conf=conf['output_layer'])

	def __repr__(self):
		return f"N{self.name}"

# Testing
# import json as json

# def parse_json(file: str):
# 	conf: list = []
# 	with open(file, "r") as f:
# 		conf = json.load(f)
# 	return conf

# if __name__ == '__main__':
# 	network = Network(nb_inputs=4, nb_neurons_per_layer=5, nb_hidden_layers=2, nb_outputs=4)
# 	conf = network.get_conf()
# 	with open("data_training", "w") as f:
# 		json.dump(conf, f)

# 	# plus tard on aura une liste de dictionnaires
# 	conf_from_json: dict[str, dict[str, list[float] | list[list[float]]]] = []
# 	conf_from_json = parse_json("data_training")

# 	network2 = Network(conf=conf_from_json)
# 	with open("test2", "w") as f:
# 		json.dump(network2.get_conf(), f)
