import pickle
import json
import numpy as np

def save_q_table(qtable, filename="q_table"):
	with open(f"{filename}.pkl", "wb") as f:	
		pickle.dump(qtable, f)

def load_q_table(filename="q_table_latest.pkl"):
	with open(filename, "rb") as f:
		return pickle.load(f)

def save_json(qtable, filename="q_table"):
	with open(f"{filename}.json", "w") as f:
		json.dump(qtable, f)

if __name__ == '__main__':
	qtable = load_q_table(filename="q_table_1550.pkl")
	print(qtable)
	new_qtable = {}
	for key, value in qtable.items():
		new_key = '-'.join(str(k) for k in key)  # Convert tuple to string with comma
		if isinstance(value, np.ndarray):
			new_qtable[new_key] = value.tolist()
		else:
			new_qtable[new_key] = value
	print(new_qtable)
	save_json(new_qtable, filename="q_table")