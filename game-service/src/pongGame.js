export class PongGame {
	constructor() {
		 this.gameMode = 0;
		 this.gameOption = 1;

		this.inputs = {}; // { player1: {...}, player2: {...} }
		this.input1 = {};
		this.dt = 0.16666; // 1/60
		this.ispaused = true;

		this.spell1 = { x: 0, z : -10};
		this.isSpellGo1 = false;
		this.spell2 = { x: 0, z : 10};
		this.isSpellGo2 = false;
		this.specialCooldown1 = 3;
		this.specialCooldown2 = 3;

		this.paddle1 = { x: 0 };
		this.paddle2 = { x: 0 };
		this.ball = {
			x: 0,
			z: 0,
			dirX: 0,//Math.random() > 0.5 ? 1 : -1,
			dirZ: 1,//(Math.random() * 2 - 1),
			speed: 1 // unité par seconde
		};
		this.score = {s1: 0, s2: 0};

		this.die1 = false;
		this.die2 = false;

	}

	setInputs(playerId, input)
	{
		this.inputs[playerId] = input;
		this.input1 = this.inputs['player1'] || {};
	}

	setGameMode(mode, option)
	{
		this.gameMode = mode;
		this.gameOption = option;
	}

	update()
	{
		this.isPausedManagement();
		if (this.ispaused === false)
		{
			this.movePlayer1();
			this.movePlayer2();
			this.moveBall();
			this.checkCollisionWall();
			this.checkCollisionPaddle(this.paddle1, -8, this.die1);
			this.checkCollisionPaddle(this.paddle2, 8, this.die2);
			this.checkGoal();
			if (this.gameOption === 1)
				this.crabmehameha();
		}
	}

	getState()
	{
		return {
			paddle1: { x: this.paddle1.x },
			paddle2: { x: this.paddle2.x},
			ball: { x: this.ball.x, z: this.ball.z },
			score: {s1: this.score.s1 ,s2: this.score.s2},
			spell1: {x: this.spell1.x, z: this.spell1.z},
			spell2: {x: this.spell2.x, z: this.spell2.z},
			specialCooldown1: this.specialCooldown1,
			specialCooldown2: this.specialCooldown2,
			die1: this.die1,
			die2: this.die2
		};
	}

	isPausedManagement()
	{
		if (this.input1.p)
			this.ispaused = true;
		if (this.input1[' '])
			this.ispaused = false;
	}

	movePlayer1()
	{
		if (this.input1.q && this.paddle1.x > -4.5)
			this.paddle1.x -= 0.3;
		if (this.input1.e && this.paddle1.x < 4.5)
			this.paddle1.x += 0.3;
	}

	movePlayer2()
	{
		if (this.gameMode === 1)
		{
			if (this.input1['7'] && this.paddle2.x > -4.5)
				this.paddle2.x -= 0.3;
			if (this.input1['9'] && this.paddle2.x < 4.5)
				this.paddle2.x += 0.3;
		}
		else
		{
			// IA débile
			if (this.paddle2.x > this.ball.x)
				this.paddle2.x -= 0.3;
			else if (this.paddle2.x === this.ball.x)
				;
			else
				this.paddle2.x += 0.3;
		}
		
	}

	moveBall()
	{
		this.ball.x += this.ball.dirX * this.ball.speed * this.dt;
		this.ball.z += this.ball.dirZ * this.ball.speed * this.dt;
	}

	checkCollisionWall()
	{
		if (this.ball.x < -5.8 )
		{
			this.ball.x = -5.7;
			this.ball.dirX *= -1;
		}
		if (this.ball.x > 5.8)
		{
			this.ball.x = 5.7;
			this.ball.dirX *= -1;
		}
	}

	checkCollisionPaddle(paddle, paddleZ, isDie)
	{

		const dx = Math.abs(this.ball.x - paddle.x);
		const dz = Math.abs(this.ball.z - paddleZ);

		if (dz < 0.5 && dx < 1 && isDie === false)
		{
			if (this.ball.speed < 2.2)
				this.ball.speed += 0.2;
			this.ball.dirZ *= -1;
			if (this.ball.z < 0)
				this.ball.z = -7.4;
			else
				this.ball.z = 7.4;
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
			this.reset();
			this.ball.dirZ *= -1;
		}
	}

	reset()
	{
		this.paddle1 = { x: 0 };
		this.paddle2 = { x: 0 };
		this.ball = {
			x: 0,
			z: 0,
			dirX: 0,//Math.random() > 0.5 ? 1 : -1,
			dirZ: 1,//(Math.random() * 2 - 1),
			speed: 1
		};
		this.die1 = false;
		this.die2 = false;

		this.spell1 = { x: 0, z : -10};
		this.isSpellGo1 = false;
		this.spell2 = { x: 0, z : 10};
		this.isSpellGo2 = false;
		this.specialCooldown1 = 3;
		this.specialCooldown2 = 3;
	}

	crabmehameha()
	{
		if (this.input1.x && this.specialCooldown1 < 0 && this.die1 === false)
		{
			this.isSpellGo1 = true;
			this.specialCooldown1 = 50;
		}
		if (this.gameMode === 1 && this.die2 === false)
		{
			if (this.input1['3'] && this.specialCooldown2 < 0)
			{
				this.isSpellGo2 = true;
				this.specialCooldown2 = 50;
			}
		}
		else
		{
			if (this.specialCooldown2 < 0 && this.die2 === false)
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
				this.spell1.z = -7;//this.paddle.z + 1;
			}
			if (this.spell1.z > 9)
			{
				this.isSpellGo1 = false;
				this.spell1.x = 0;
				this.spell1.z = -10;
			}
			this.impactCrabmehameha(this.spell1, -10, this.paddle2, 8);
			this.spell1.z += this.dt;
		}
		if (this.isSpellGo2 === true)
		{
			if (this.spell2.z > 9)
			{
				this.spell2.x = this.paddle2.x;
				this.spell2.z = 7;//this.paddle.z + 1;
			}
			if (this.spell2.z < -9)
			{
				this.isSpellGo2 = false;
				this.spell2.x = 0;
				this.spell2.z = 10;
			}
			this.impactCrabmehameha(this.spell2, 10, this.paddle1, -8);
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
