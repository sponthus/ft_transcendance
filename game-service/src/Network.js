function ReLu(input_value) {
	return (Math.max(0, input_value));
}

class Neuron {
	name = 0
	constructor(conf) {
		this.name = Neuron.name += 1;
		this.weights = conf.weights; // array of weights
		this.bias = conf.bias;
		this.activation_function = ReLu;
	}

	forward(input_values) {
		if (input_values.length != this.weights.length) {
			throw new Error("Input values length does not match weights length");
		}
		let result = 0.0;
		for (let i = 0; i < this.weights.length; i++) {
			result += this.weights[i] * input_values[i];
		}
		result += this.bias;
		return this.activation_function(result);
	}
}

class Layer {
	name = 0;
	constructor(conf) {
		this.name = Layer.name += 1;
		this.nb_neurons = conf["biases"].length;
		this.neurons = [];
		for (let i = 0; i < this.nb_neurons; i++) {
			const neuron_conf = {
				weights: conf["weights"][i],
				bias: conf["biases"][i]
			};
			this.neurons.push(new Neuron(neuron_conf));
		}
	}

	forward(input_values) {
		const output_values = [];
		for (let i = 0; i < this.nb_neurons; i++) {
			const neuron = this.neurons[i];
			const neuron_output = neuron.forward(input_values);
			output_values.push(neuron_output);
		}
		return output_values;
	}
}

class Network {
	constructor(conf) {
		this.nb_inputs = conf["input_layer"]["weights"][0].length;
		this.nb_outputs = conf["output_layer"]["biases"].length;
		this.nb_hidden_layers = conf.length - 2;
		this.nb_neurons_per_layer = conf["input_layer"]["biases"].length;
		this.hidden_layers = [];
		this.input_layer = new Layer(conf["input_layer"]);
		for (let i = 0; i < this.nb_hidden_layers; i++) {
			const layer_conf = conf[`${i + 1}`];
			this.hidden_layers.push(new Layer(layer_conf));
		}
		this.output_layer = new Layer(conf["output_layer"]);
	}

	argmax(array) {
    	const maxValue = Math.max(...array);
    	return array.indexOf(maxValue);
	}

	work(input_values) {
		if (input_values.length != this.nb_inputs) {
			throw new Error("Input values length does not match number of inputs");
		}
		results = this.input_layer.forward(input_values);
		for (let layer of this.hidden_layers) {
			results = layer.forward(results);
		}
		results = this.output_layer.forward(results);
		return this.argmax(results);
	}
}