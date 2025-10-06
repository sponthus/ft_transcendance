import { gameEventEmitter } from "./GameEventEmitter.js";
import fs from 'fs';

let X_PADDLE_HEIGHT = 1.0;
let X_INFERIOR_BALL_LIMIT = -5.8;
let X_SUPERIOR_BALL_LIMIT = 5.8;
let Z_PADDLE_LEFT = -8;
let Z_PADDLE_RIGHT = 8;
let AREA_NUMBER = 16;

// AI : 0 = no AI, 1 = AI as player1, 2 = AI as player2
// Option : 0 = classical pong, 1 = with crabmehameha
export class PongGame {
	constructor(gameId, ai, option) {
		if (ai == 0)
			this.gameMode = 0;
		else {
			if (ai == 1)
				this.gameMode = 1
			else 
				this.gameMode = 2;
			
			// Load Q-table from JSON file
			const data = fs.readFileSync("q_table.json", "utf-8");
			this.qtable = JSON.parse(data);
			console.log(this.qtable);
			console.log(typeof this.qtable);
			console.log(typeof this.qtable["00"]);
		}

		console.log("LAUNCHING A GAME WITH AI MODE ", this.gameMode);
		if (option)
			this.gameOption = 1;
		else
			this.gameOption = 0;

		this.gameId = gameId;

		this.inputs = {}; // { player1: {...}, player2: {...} }
		this.input1 = {};
		this.dt = 0.16666; // 1/60
		this.ispaused = true;
		this.spell1 = { x: -0.22, y: 1.9, z : -10.56};
		this.isSpellGo1 = false;
		this.spell2 = { x: 0.22, y: 1.9, z : 10.56};
		this.isSpellGo2 = false;
		this.specialCooldown1 = 3;
		this.specialCooldown2 = 3;

		this.paddle1 = { x: 0 };
		this.paddle2 = { x: 0 };
		this.speedPaddle = 1;

		this.ball = {
			x: 0,
			z: 0,
			dirX: Math.random() -0.5,
			dirZ: Math.random() < 0.5 ? -1 : 1,
			speed: 1 // unité par seconde
		};
		const length = Math.sqrt(this.ball.dirX ** 2 + this.ball.dirZ ** 2);
		this.ball.dirX /= length;
		this.ball.dirZ /= length;
		this.score = {s1: 0, s2: 0};

		this.die1 = false;
		this.die2 = false;

		this.groundLimitePositif = X_SUPERIOR_BALL_LIMIT;
		this.groundLimiteNegatif = X_INFERIOR_BALL_LIMIT;

		this.pauseBegin = true;
		this.timePauseBegin = 20;

		this.state = this.get_ai_state(2, undefined)
		this.impact_x = undefined;
	}

	setInputs(input)
	{
		this.inputs = input;
		this.input1 = this.inputs || {};
	}

	// Schema of state in 3 situations (0, 1, 2))
	// get_ai_state_situation()
	// {
	// 	let state;
	// 	if (this.gameMode == 1) {
	// 		if ((this.paddle1.x <= this.ball.x && this.ball.x <= this.paddle1.x + X_PADDLE_HEIGHT) 
	// 			|| (this.paddle1.x - X_PADDLE_HEIGHT <= this.ball.x && this.ball.x <= this.paddle1.x))
	// 			state = 0 // Ball is in the paddle range -> Best action = 2
	// 		else if (this.ball.x < this.paddle1)
	// 			state = 1 // Ball is under paddle -> Best action is up 0
	// 		else
	// 			state = 2 // Ball is over paddle -> Best action is down 1
	// 	}
	// 	else if (this.gameMode == 2) {
	// 		if ((this.paddle2.x <= this.ball.x && this.ball.x <= this.paddle2.x + X_PADDLE_HEIGHT) 
	// 			|| (this.paddle2.x - X_PADDLE_HEIGHT <= this.ball.x && this.ball.x <= this.paddle2.x))
	// 			state = 0 // Ball is in the paddle range -> Best action = 2
	// 		else if (this.ball.x < this.paddle2)
	// 			state = 1 // Ball is under paddle -> Best action is up 0
	// 		else
	// 			state = 2 // Ball is over paddle -> Best action is down 1
	// 	}
	// 	return state
	// }

	// Mixes action and state of game to get the key of Q-table
	get_ai_state(action, predicted_impact)
	{
		const ai_area = this.get_ai_position();
		const impact_area = this.get_predicted_impact_area(predicted_impact);
		// console.log("impact_area value:", impact_area, "type:", typeof impact_area);
		const state = `${ai_area}-${impact_area}-${action}`;
		// String(ai_area) + '-' + String(impact_area) + '-' + str_action;
		// console.log("State for Q-table :", state, " with ai_area ", ai_area, " / impact area ", impact_area, " and action ", action);
		return state;
	}

	// Takes into account what the AI has previously seen
	get_state_without_new_view(old_state, action)
	{
		const ai_area = this.get_ai_position();
		const impact_area = old_state.split('-')[1];
		// console.log("impact_area value:", impact_area, "type:", typeof impact_area);
		const state = `${ai_area}-${impact_area}-${action}`;
		// console.log("State for Q-table :", state, " with ai_area ", ai_area, " / impact area ", impact_area, " and action ", action);
		return state;
	}

	get_max_arg(array) {
		if (array.length === 0) {
			return -1;
		}
		let max = array[0];
		let max_index = 0;
		for (let i = 1; i < array.length; i++) {
			if (array[i] > max) {
				max_index = i;
				max = array[i];
			}
		}
		return max_index;
	}

	// Schematization of ball position in AREA_NUMBER areas
	get_ai_position()
	{
		let area_percent = (this.paddle1.x - X_INFERIOR_BALL_LIMIT) / (X_SUPERIOR_BALL_LIMIT - X_INFERIOR_BALL_LIMIT);
		area_percent = Math.max(0.0, Math.min(1.0, area_percent)); // for security
		const area_zone = Math.min(AREA_NUMBER, Math.floor(area_percent * AREA_NUMBER) + 1);
		// if (this.gameMode == 2)
		// 	return AREA_NUMBER - area_zone + 1; // Reverse area for player 2
		return area_zone;
	}

	// Categorizes the ball direction (2 goes away, 1 approaches)
	get_ball_direction()
	{
		let state = 0;
		if (this.gameMode == 1) {
			if (this.ball.dirZ > 0)
				state = 2; // Ball goes away
			else
				state = 1; // Ball approaches
		}
		else if (this.gameMode == 2) {
			if (this.ball.dirZ < 0)
				state = 2; // Ball goes away
			else
				state = 1;
		}
		return state;
	}

	get_ai_decision(state)
	{
		if (this.qtable.hasOwnProperty(state) == false)
		{
			console.warn("State not found in Q-table :", state);
			return 2;
		}
		
		const action = this.get_max_arg(this.qtable[state]);
		if (action == -1 || action == undefined) {
			console.warn("No action found in Q-table for state :", state);
			return 2;
		}
		
		// console.log("Action from Q-table :", action);
		// console.log(typeof action);
		return action;
	}

	// Schematization of ball predicted impact in AREA_NUMBER areas
	get_predicted_impact_area(predicted_impact)
	{
		if (predicted_impact == undefined)
			return 0;
		let area_percent = (predicted_impact - X_INFERIOR_BALL_LIMIT) / (X_SUPERIOR_BALL_LIMIT - X_INFERIOR_BALL_LIMIT);
		area_percent = Math.max(0.0, Math.min(1.0, area_percent)); // security
		const area_zone = Math.min(AREA_NUMBER, Math.floor(area_percent * AREA_NUMBER) + 1);
		// if (this.gameMode == 2)
		// 	return AREA_NUMBER - area_zone + 1; // Reverse area for player 2
		return area_zone;
	}

	predictBallImpactX(paddleZ = Z_PADDLE_LEFT) {
		let x = this.ball.x;
		let z = this.ball.z;
		let dx = this.ball.dirX;
		let dz = this.ball.dirZ;
		let speed = this.ball.speed;

		// Ball doesn't go to the designated paddle or already crossed paddle
		if (dz == 0 || speed == 0 || (dz > 0 && paddleZ < 0) || (dz < 0 && paddleZ > 0)) {
			return undefined;
		}

		let tx_wall = 0.0;
		let tz_paddle = 0.0;
		let x_impact = 0.0;
		// Calc while there are rebounce
		while (true) {
			// Calc time to go to lat wall
			if (dx > 0)
				tx_wall = (X_SUPERIOR_BALL_LIMIT - x) / (dx * speed);
			else
				tx_wall = (X_INFERIOR_BALL_LIMIT - x) / (dx * speed);

			// Calc time to paddleZ
			tz_paddle = (paddleZ - z) / (dz * speed);
			if (tz_paddle < 0)
				return undefined; // Ball has crossed paddle

			// paddle is reached
			if (tz_paddle >= 0 && tz_paddle < tx_wall) {
				x_impact = x + dx * speed * tz_paddle;
				x_impact = Math.max(X_INFERIOR_BALL_LIMIT, Math.min(X_SUPERIOR_BALL_LIMIT, x_impact));
				return (x_impact);
			}

			// Or rebounce
			x += dx * speed * tx_wall;
			z += dz * speed * tx_wall;
			dx *= -1;
		}
	}

	update(action, can_see = false)
	{
		let chosen_action = action;
		this.isPausedManagement();
		if (this.ispaused === false)
		{
			this.isPauseBeginManagement();
			if (this.pauseBegin === false)
			{
				if (this.gameMode != 0) {
					if (can_see == true) {
						const ball_direction = this.get_ball_direction();
						let paddleZ = 0;
						switch (ball_direction) {
							case 1:
								switch (this.gameMode) {
									case 1:
										paddleZ = Z_PADDLE_LEFT;
										break;
									case 2:
										paddleZ = Z_PADDLE_RIGHT;
										break;
									default:
										console.error("Game mode error");
								}
								break;
							case 2:
								switch (this.gameMode) {
									case 1: 
										paddleZ = Z_PADDLE_RIGHT;
										break;
									case 2:
										paddleZ = Z_PADDLE_LEFT;
										break;
									default:
										console.error("Game mode error");
								}
								break;
							default:
								console.error("Direction error");
						}
						this.impact_x = this.predictBallImpactX(paddleZ);
						this.state = this.get_ai_state(action, this.impact_x);
					}
					else {
						this.state = this.get_state_without_new_view(this.state, action);
					}
					chosen_action = this.get_ai_decision(this.state);
					// console.log("Action is = ", action, typeof action);
				}
				if (this.gameMode == 1) {
					// console.log("Gamemode = 1");
					this.movePlayer1(chosen_action);
					this.movePlayer2();
				} else if (this.gameMode == 2) {
					this.movePlayer1();
					this.movePlayer2(chosen_action);
				} else {
					this.movePlayer1();
					this.movePlayer2();
				}
				this.moveBall();
				this.checkCollisionWall();
				this.checkCollisionPaddle(this.paddle1, Z_PADDLE_LEFT, this.die1);
				this.checkCollisionPaddle(this.paddle2, Z_PADDLE_RIGHT, this.die2);
				this.checkGoal();
				if (this.gameOption === 1)
					this.crabmehameha();
			}
		}
		return chosen_action;
	}

	getState()
	{
		return {
			paddle1: { x: this.paddle1.x },
			paddle2: { x: this.paddle2.x},
			ball: { x: this.ball.x, z: this.ball.z },
			score: {s1: this.score.s1 ,s2: this.score.s2},
			spell1: {x: this.spell1.x, y: this.spell1.y, z: this.spell1.z},
			spell2: {x: this.spell2.x, y: this.spell2.y, z: this.spell2.z},
			specialCooldown1: this.specialCooldown1,
			specialCooldown2: this.specialCooldown2,
			die1: this.die1,
			die2: this.die2,
			ispaused: this.ispaused,
			timePauseBegin: this.timePauseBegin
		};
	}

	isPausedManagement()
	{
		if (this.input1.p)
			this.ispaused = true;
		if (this.input1[' '])
			this.ispaused = false;
	}

	isPauseBeginManagement()
	{
		if (this.timePauseBegin > 0)
		{
			this.pauseBegin = true;
			this.timePauseBegin -= this.dt;
		}
		else
			this.pauseBegin = false;
	}

	movePlayer1(ai_action = 2)
	{
		if (this.gameMode === 1)
		{
			switch (ai_action) {
				case 0: // UP
					if (this.paddle1.x < this.groundLimitePositif - 0.5)
						this.paddle1.x += this.speedPaddle * this.dt;
					break;
				case 1: // DOWN
					if (this.paddle1.x > this.groundLimiteNegatif + 0.5)
						this.paddle1.x -= this.speedPaddle * this.dt;
					break;
				case 2: // STILL
					break;
				default:
					console.warn("ERR: Action inconnue pour l'IA :", ai_action);
			}
			
			// // IA débile
			// if (this.paddle1.x > this.ball.x)
			// 	this.paddle1.x -= this.speedPaddle * this.dt;
			// else if (this.paddle1.x === this.ball.x)
			// 	;
			// else
			// 	this.paddle1.x += this.speedPaddle * this.dt;
		}
		else
		{
			if (this.input1.q && this.paddle1.x > this.groundLimiteNegatif + 0.5)
				this.paddle1.x -= this.speedPaddle * this.dt;
			if (this.input1.e && this.paddle1.x < this.groundLimitePositif - 0.5)
				this.paddle1.x += this.speedPaddle * this.dt;
		}
	}

	movePlayer2(ai_action = 2)
	{
		if (this.gameMode === 2)
		{
			switch (ai_action) {
				case 0: // UP -> Revert = DOWN
					if (this.paddle2.x < this.groundLimitePositif - 0.5)
						this.paddle2.x += this.speedPaddle * this.dt;
					break;
				case 1: // DOWN
					if (this.paddle2.x > this.groundLimiteNegatif + 0.5)
						this.paddle2.x -= this.speedPaddle * this.dt;
					break;
				case 2: // STILL
					break;
				default:
					console.warn("ERR: Action inconnue pour l'IA :", ai_action);
			}
			
			// // IA débile
			// if (this.paddle2.x > this.ball.x)
			// 	this.paddle2.x -= this.speedPaddle * this.dt;
			// else if (this.paddle2.x === this.ball.x)
			// 	;
			// else
			// 	this.paddle2.x += this.speedPaddle * this.dt;
		}
		else
		{
			if (this.input1['7'] && this.paddle2.x > this.groundLimiteNegatif + 0.5)
				this.paddle2.x -= this.speedPaddle * this.dt;
			if (this.input1['9'] && this.paddle2.x < this.groundLimitePositif - 0.5)
				this.paddle2.x += this.speedPaddle * this.dt;
		}
		
	}

	moveBall()
	{
		this.ball.x += this.ball.dirX * this.ball.speed * this.dt;
		this.ball.z += this.ball.dirZ * this.ball.speed * this.dt;
	}

	checkCollisionWall()
	{
		if (this.ball.x < this.groundLimiteNegatif )
		{
			this.ball.x = this.groundLimiteNegatif + 0.1;
			this.ball.dirX *= -1;
		}
		if (this.ball.x > this.groundLimitePositif)
		{
			this.ball.x = this.groundLimitePositif - 0.1;
			this.ball.dirX *= -1;
		}
	}

	checkCollisionPaddle(paddle, paddleZ, isDie)
	{

		const dx = Math.abs(this.ball.x - paddle.x);
		const dz = Math.abs(this.ball.z - paddleZ);

		if (dz < 0.5 && dx < 1 && isDie === false)
		{
			if (this.ball.speed < 2)
				this.ball.speed += 0.2;
			this.ball.dirZ *= -1;
			if (this.ball.z < 0)
				this.ball.z = Z_PADDLE_LEFT + 0.4;
			else
				this.ball.z = Z_PADDLE_RIGHT - 0.4;
			const relativeImpact = (this.ball.x - paddle.x);// * 0.5;

			// Clamp entre -1 et 1
			const clampedImpact = Math.max(-1, Math.min(1, relativeImpact));
			this.ball.dirX = clampedImpact;
			//this.ball.dirZ = Math.cos(angle);
			const length = Math.sqrt(this.ball.dirX ** 2 + this.ball.dirZ ** 2);
			this.ball.dirX /= length;
			this.ball.dirZ /= length;

		}
	}

	checkGoal()
	{
		if (this.ball.z < -9 || this.ball.z > 9)
		{
			if (this.ball.z < -9)
				this.score.s1++;
			else
				this.score.s2++;
			gameEventEmitter.emitGameEvent('player:scored', this.gameId, {
				scoreA: this.score.s1,
				scoreB: this.score.s2
			});
			//anim but
			//temps dattente de 3seconde? avant reprise
			this.timePauseBegin = 25;
			this.reset();
			//this.ball.dirZ *= -1;
		}
	}

	reset()
	{
		this.paddle1 = { x: 0 };
		this.paddle2 = { x: 0 };
		this.ball = {
			x: 0,
			z: 0,
			dirX: Math.random() -0.5,
			dirZ: Math.random() < 0.51 ? -1 : 1,
			speed: 1
		};
		this.ball.dirX *= 1.5;
		const length = Math.sqrt(this.ball.dirX ** 2 + this.ball.dirZ ** 2);
		this.ball.dirX /= length;
		this.ball.dirZ /= length;
		this.die1 = false;
		this.die2 = false;
		this.spell1 = { x: -0.22, y: 1.8, z: -10.56};
		this.isSpellGo1 = false;
		this.spell2 = { x: 0.22, y: 1.8, z: 10.56};
		this.isSpellGo2 = false;
		this.specialCooldown1 = 3;
		this.specialCooldown2 = 3;
	}

	crabmehameha()
	{
		if (this.gameMode === 1 && this.die1 === false)
		{
			if (this.specialCooldown1 < 0 && this.die1 === false)
			{
				this.isSpellGo1 = true;
				this.specialCooldown1 = 50;
			}
		}
		else
		{
			if (this.input1.x && this.specialCooldown1 < 0 && this.die1 === false)
			{
				this.isSpellGo1 = true;
				this.specialCooldown1 = 50;
			}
		}

		if (this.gameMode === 2 && this.die2 === false)
		{
			if (this.specialCooldown2 < 0 && this.die2 === false)
			{
				this.isSpellGo2 = true;
				this.specialCooldown2 = 50;
			}
		}
		else
		{
			if (this.input1['3'] && this.specialCooldown2 < 0)
			{
				this.isSpellGo2 = true;
				this.specialCooldown2 = 50;
			}
		}
		this.specialCooldown1 -= this.dt;
		this.specialCooldown2 -= this.dt;
		this.updateCrabmehameha();
	}

	updateCrabmehameha()
	{
		if (this.isSpellGo1 === true)
		{
			if (this.spell1.z < -9)
			{
				this.spell1.x = this.paddle1.x;
				this.spell1.y = 0.4;
				this.spell1.z = -7;//this.paddle.z + 1;
			}
			if (this.spell1.z > 9)
			{
				this.isSpellGo1 = false;
				this.spell1.x = -0.22;
				this.spell1.y = 1.8;
				this.spell1.z = -10.56;
			}
			this.impactCrabmehameha(this.spell1, -10, this.paddle2, Z_PADDLE_RIGHT);
			this.spell1.z += this.dt;
		}
		if (this.isSpellGo2 === true)
		{
			if (this.spell2.z > 9)
			{
				this.spell2.x = this.paddle2.x;
				this.spell2.y = 0.4;
				this.spell2.z = 7;//this.paddle.z + 1;
			}
			if (this.spell2.z < -9)
			{
				this.isSpellGo2 = false;
				this.spell2.x = 0.22;
				this.spell2.y = 1.9;
				this.spell2.z = 10.56;
			}
			this.impactCrabmehameha(this.spell2, 10, this.paddle1, Z_PADDLE_LEFT);
			this.spell2.z -= this.dt;
		}
	}

	impactCrabmehameha(spell, posResetSpell, paddleTarget, paddleZ)
	{
		const dx = Math.abs(spell.x - paddleTarget.x);
		const dz = Math.abs(spell.z - paddleZ);

		const ballColx = Math.abs(spell.x - this.ball.x);
		const ballColz = Math.abs(spell.z - this.ball.z);

		// annuler le spell si ball collision
		if (ballColx < 0.5 && ballColz < 0.5)
		{
			if (spell === this.spell1)
				this.isSpellGo1 = false;
			else
				this.isSpellGo2 = false;
			spell.x = 0;
			spell.z = posResetSpell;
		}
		// tuer si collision
		if (dx < 0.8 && dz < 0.5)
		{
			if (paddleTarget === this.paddle1)
				this.die1 = true;
			else
				this.die2 = true;
		}
	}
}
