import numpy as np

def ReLu(input_value: float) -> float :
	value = max(0, input_value) # ReLU activation
	return value

class Neuron:
	name: int = 0

	def __init__(self, nb_input: int, activation_function: callable, weights: list[float] = None, bias: float = 0):
		self.name: int = Neuron.name
		Neuron.name += 1

		self.weights: np.ndarray[float]
		if (weights != None):
			self.weights = np.array(weights)
		else:
			self.weights = np.random.randn(nb_input) # TODO Possibility to modify biais generation for better alignment

		self.bias: float
		if (bias == 0):
			self.bias = np.random.rand() # TODO Limit biais to limit impact on neuron response
		else:
			self.bias = bias
		self.activation_function: callable = activation_function

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
	def __init__(self, nb_input: int, nb_neurons: int, activation_function: callable, conf: dict[str, list[float] | list[list[float]]] = None):
		self.name: int = Layer.name
		Layer.name += 1
		self.nb_neurons: int = nb_neurons
		self.neurons: list[Neuron] = []

		# TODO = Adjust nb of neurons per layer in each layer
		if (conf):
			for n in range(self.nb_neurons):
				self.neurons.append(Neuron(nb_input, activation_function, conf["weights"][n], conf["biases"][n]))
		else:
			for n in range(self.nb_neurons):
				self.neurons.append(Neuron(nb_input, activation_function))

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
	def __init__(self, nb_hidden_layers: int, nb_neurons_per_layer: int, nb_inputs: int, nb_outputs: int, conf = None):
		self.input_layer: Layer
		self.hidden_layers: list[Layer] = []
		self.output_layer: Layer
		self.nb_hidden_layers: int = nb_hidden_layers
		self.nb_neurons_per_layer: int = nb_neurons_per_layer
		
		if (conf):
			self.input_layer = Layer(nb_inputs, self.nb_neurons_per_layer, ReLu, conf["input_layer"])
			for l in range(self.nb_hidden_layers):
				self.hidden_layers.append(Layer(self.nb_neurons_per_layer, self.nb_neurons_per_layer, ReLu, conf[str(l)]))
			self.output_layer = Layer(self.nb_neurons_per_layer, nb_outputs, ReLu, conf["output_layer"])
		else:
			self.input_layer = Layer(nb_inputs, self.nb_neurons_per_layer, ReLu)
			for _ in range(self.nb_hidden_layers):
				self.hidden_layers.append(Layer(self.nb_neurons_per_layer, self.nb_neurons_per_layer, ReLu))
			self.output_layer = Layer(self.nb_neurons_per_layer, nb_outputs, ReLu)

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
			results[str(l)] = {
				'weights' : hidden_layers_weights[l],
				'biases' : hidden_layers_biases[l]
			}
		
		output_layer_weights, output_layer_biases = self.output_layer.get_conf()
		results['output_layer'] = {
			'weights' : output_layer_weights,
			'biases' : output_layer_biases
		}
		return results

	def __repr__(self):
		return f"Network(layers={self.nb_hidden_layers})"