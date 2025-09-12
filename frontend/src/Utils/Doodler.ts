import p5 from "p5";
export class doodler {
	private p: p5;
	private x: number;
	private y: number;
	private width: number;
	private height: number;
	private velocity!: number;
	private gravity!: number
	private JumpForce: number;


	private DoodlerImg!: p5.Image[];

	private onLeft: boolean = false;
	private isJump: boolean = false;

	constructor(p: p5, DoodlerImg: p5.Image[]) {
		this.p = p;
		this.x = this.p.width / 2;
		this.y = this.p.height / 2;
		this.width = 50;
		this.height = 70;
		this.velocity = 0;
		this.gravity = 0.2;
		this.JumpForce = 10;
		this.DoodlerImg = DoodlerImg;
	}

	draw() {
		if (this.isJump)
			this.DrawPlayers(this.DoodlerImg[0]);
		else 
			this.DrawPlayers(this.DoodlerImg[1]);	
	}

	private DrawPlayers(PlayersImg: p5.Image) {
		this.p.push();
		if (this.onLeft) {
			this.p.translate(this.x + this.width / 2, this.y);
			this.p.scale(-1, 1);
			this.p.image(PlayersImg, -this.width, 0, this.width, this.height );
		}
		else 
			this.p.image(PlayersImg, this.x, this.y, this.width, this.height );
		this.p.pop();
	}
	update(platforms: platform[]) {
		this.velocity += this.gravity;
		this.y += this.velocity;

		if (this.p.keyIsDown(this.p.LEFT_ARROW))
		{
			this.onLeft = true;
			this.x -= 10;
		}
		if (this.p.keyIsDown(this.p.RIGHT_ARROW)) {
			this.onLeft = false;
			this.x += 10;
		}
		if (this.x + this.width < 0)
			this.x = this.p.width;
		if (this.x > this.p.width)
			this.x = -this.width;
		if (this.velocity > - this.JumpForce * 0.75)
			this.isJump = false;
		if (this.y + this.height >= this.p.height)
			this.jump();
		platforms.forEach(Platform => {
			if (this.y + this.height >= Platform._y && this.y + this.height <=  Platform._y + Platform._height) {
				let minX = Platform._x - this.width;
				let maxX = Platform._x + Platform._width;
				if (this.x >= minX && this.x <= maxX) {
					this.jump();
					console.log('velocity : ', this.velocity);
				}
			}
		})
	}
	jump() {
		this.isJump = true;
		this.velocity = - this.JumpForce;
	}

	get _velocity(): number {
		return this.velocity;
	}

	get _y() : number {
		return this.y;
	}
}

export class platform {
	private p: p5;
	private x: number;
	private y: number;
	private width: number;
	private height: number;
	private img: p5.Image;

	constructor(p: p5, x: number, y: number, img: p5.Image) {
		this.p = p;
		this.x = x;
		this.y = y;
		this.height = 20;
		this.width = 70;
		this.img = img;
	}

	draw() {

		this.p.fill(100, 255, 100);
		this.p.image(this.img, this.x, this.y, this.width, this.height);
	}

	get _y() : number {
		return this.y;
	}

	get _height(): number {
		return this.height;
	}
	
	get _x() : number {
		return this.x;
	}

	get _width(): number {
		return this.width;
	}
}