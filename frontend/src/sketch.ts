import p5 from "p5";
import { doodler, platform } from "./Utils/Doodler";

let Doodler: doodler;
let gap: number;
let Platforms: platform[] = []
let width: number;
let height: number;

let bgLayer1: p5.Image;
let bgLayer2: p5.Image;
let bgLayer3: p5.Image;
let bgLayer4: p5.Image;

let Score: number = 0;

function loadPlayersImages(p: p5): p5.Image[] {
	const DoodlerImg: p5.Image[] = [];
	DoodlerImg[0] = p.loadImage('/Doodle/Players/bunny1_walk1.png');
	DoodlerImg[1] = p.loadImage('/Doodle/Players/bunny1_walk2.png');
	return DoodlerImg;
}

function loadGrass(p: p5): p5.Image {
	const GassBlockImg: p5.Image =  p.loadImage('/Doodle/Environment/ground_grass.png');
	return GassBlockImg;
}

const sketch = (p: p5) => {
  p.setup = () => {
	loadBackground(p);
	let canvas = p.createCanvas(screen.width , screen.height *0.5);
	width = (window.innerWidth - p.width) / 2;
	height = (window.innerHeight - p.height) / 2;
	canvas.position(0,  height);
	
	Doodler = new doodler(p, loadPlayersImages(p));

	let PlatformCount: number = 10;
	gap = p.height / PlatformCount;
	for (let i = 0; i < 10; i++) {
		Platforms.push(new platform(p, p.random(p.width), p.height - i * gap, loadGrass(p)));
	}

};

p.draw = () => {
	addBackground(p);
	drawScore(p);
	if (Doodler._y > Platforms[0]._y) {
		gameOver();
		p.noLoop();
	}
	if (Doodler._y < height / 2)
		p.translate(0, (height / 2) - Doodler._y);
	Doodler.draw();
	Doodler.update(Platforms);

	Platforms.forEach((Platform) => {
		Platform.draw();
	})
	if (Doodler._y < Platforms[Platforms.length - 1]._y + 400) 
 	  Platforms.push(new platform(p, p.random(p.width), Platforms[Platforms.length-1]._y - gap, loadGrass(p)));
	console.log("Platforms[0]._y - Doodler._y < height / 2 + 400", Platforms[0]._y - Doodler._y > height / 2 + 400)
	console.log(Platforms[0]._y, " ", Doodler._y);
	if (Platforms[0]._y - Doodler._y > height / 2 + 400) {
	    Platforms.shift();
		Score++;
	}
  	};

  p.keyPressed = () => {
	if (p.key == ' ')
		Score = 0;
		p.setup();
		p.loop();
  }
};

function gameOver() {
	Platforms.splice(0, Platforms.length);
}

function loadBackground(p: p5) {
	bgLayer1 = p.loadImage('/Doodle/Background/bg_layer1.png');
	bgLayer2 = p.loadImage('/Doodle/Background/bg_layer2.png');
	bgLayer3 = p.loadImage('/Doodle/Background/bg_layer3.png');
	bgLayer4 = p.loadImage('/Doodle/Background/bg_layer4.png');
}

function addBackground(p: p5) {
	p.background("white");
	p.image(bgLayer1, 0, 0, p.width, p.height);
	p.image(bgLayer2, 0, 0, p.width, p.height);
	p.image(bgLayer3, 0, 0, p.width, p.height);
	p.image(bgLayer4, 0, 0, p.width, p.height);
}

function drawScore(p: p5) {
		p.push();
		p.fill(255, 255, 255);
		p.textSize(50);
		p.textAlign(p.CENTER);
		p.text(Score, p.width / 2,  p.height / 4);
		p.pop();
}

export default sketch;
