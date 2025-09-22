import numpy as np
import json as json
from network import Network

NB_INPUTS = 7
NB_NEURONS_PER_LAYER = 5
NB_HIDDEN_LAYERS = 3
NB_OUTPUTS = 4

UP = 0
DOWN = 1
STILL = 2
CRAB = 3

# json va garder le format des data stockees dedans : un dict ou une liste de dict !
def parse_json(file: str):
	conf: list = []
	with open(file, "r") as f:
		conf = json.load(f)
	return conf

if __name__ == '__main__':
	# print(np.random.rand())
	network = Network(NB_HIDDEN_LAYERS, NB_NEURONS_PER_LAYER)
	# y paddle 1, y paddle 2, ball x, ball y, ball dy, ball dx, bool crabmehameha
	inputs = [0.4, 0.2, 0.2, -1.3, +0.3, 0.3, False]
	# print(network.work(inputs))
	conf = network.get_conf()

	with open("data_training", "w") as f:
		json.dump(conf, f)

	# plus tard on aura une liste de dictionnaires
	conf_from_json: dict[str, dict[str, list[float] | list[list[float]]]] = []
	conf_from_json = parse_json("training_data")

	network2 = Network(NB_HIDDEN_LAYERS, NB_NEURONS_PER_LAYER, conf_from_json)

	with open("test2", "w") as f:
		json.dump(network2.get_conf(), f)
