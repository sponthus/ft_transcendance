import { AdvancedDynamicTexture, TextBlock} from "@babylonjs/gui/2D";
import { Scene, AbstractMesh, Mesh, Vector3, MeshBuilder} from "@babylonjs/core";

export class Score {
	private _scene: Scene;
	private _scorePlayer1: number;
	private _scorePlayer2: number;
	private _bullBob: AbstractMesh | null;
	private _bullPatrick: AbstractMesh | null;

	private _bobSpeak: Mesh;
	private _patrickSpeak: Mesh;
	private _advancedTextureBob: AdvancedDynamicTexture;
	private _advancedTexturePatrick: AdvancedDynamicTexture;
	private _textBob: TextBlock;
	private _textPatrick: TextBlock;


	constructor(scene: Scene, scorePlayer1: number, scorePlayer2: number, bullBob: AbstractMesh | null, bullPatrick: AbstractMesh | null)
	{
		this._scene = scene;
		this._scorePlayer1 = scorePlayer1;
		this._scorePlayer2 = scorePlayer2;
		this._bullBob = bullBob;
		this._bullPatrick = bullPatrick;

		// plane pour mesh
		this._bobSpeak = MeshBuilder.CreatePlane("textPlane", { size: 4 }, this._scene);
		this._bobSpeak.parent = this._bullBob;
		this._bobSpeak.position = new Vector3(0, 0, -0.1); // décalé au-dessus de ton mesh
		this._bobSpeak.rotation = new Vector3(0, Math.PI, 0); // 180° sur Y
		// GUI sur le plane
		this._advancedTextureBob = AdvancedDynamicTexture.CreateForMesh(this._bobSpeak);
		this._textBob = new TextBlock();
		this._textBob.text = "";
		this._textBob.color = "black";
		this._textBob.fontSize = 70;
		this._textBob.fontFamily = "Comic Sans MS";

		this._advancedTextureBob.addControl(this._textBob);

		this._patrickSpeak = MeshBuilder.CreatePlane("textPlane2", { size: 4 }, this._scene);
		this._patrickSpeak.parent = this._bullPatrick;
		this._patrickSpeak.position = new Vector3(0, 0, -0.1); // décalé au-dessus de ton mesh
		//textPlane.billboardMode = Mesh.BILLBOARDMODE_ALL;
		this._patrickSpeak.rotation = new Vector3(0, Math.PI, 0); // 180° sur Y

		// GUI sur le plane
		this._advancedTexturePatrick = AdvancedDynamicTexture.CreateForMesh(this._patrickSpeak);
		this._textPatrick = new TextBlock();
		this._textPatrick.text = "";
		this._textPatrick.color = "black";
		this._textPatrick.fontSize = 96;
		this._textPatrick.fontFamily = "Comic Sans MS";

		this._advancedTexturePatrick.addControl(this._textPatrick);
		// Dessine les textes
		// this._drawScore();
		//this._drawSpeak();
	}

	private _drawScore()
	{
		if (this._bullPatrick)
			this._bullPatrick.setEnabled(true);
		this._textPatrick.text = this._scorePlayer1 + " - " + this._scorePlayer2;
	}

	public _drawSpeak()
	{
		if (this._bullBob)
			this._bullBob.setEnabled(true);
		this._textBob.text = this._phrases[Math.floor(Math.random() * this._phrases.length)];
	}

	private _bobGoal()
	{
		if (this._bullBob)
			this._bullBob.setEnabled(true);
		this._textBob.text = this._goalBob[Math.floor(Math.random() * this._phrases.length)];
	}
	public updateScore(score1: number, score2: number)
	{
		this._scorePlayer1 = score1;
		this._scorePlayer2 = score2;
		this._drawScore();
		this._bobGoal();
	}

	// public dispose()
	// {
	// 	this._scorePlane.dispose();
	// 	this._bobSpeak.dispose();
	// 	this._materialScore.dispose();
	// 	this._materialSpeak.dispose();
	// 	this._dynamicTextureScore.dispose();
	// 	this._dynamicTextureSpeak.dispose();
	// }

	private _phrases: string[] = [
    "What's the score Patrick ?",
    "He's a cheater right ?",
    "Pass the ball cousin !",
    "We are here to win !",
	"PATRIIICK !!!!",
	"I'm a Goofy Goober 🎵",
	"Have you seen Garry ?",
	"Krabby patty 🎵 !",
	"Boring, right ?",
	"Crabmehameha !!",
	" La🎵lala🎵🎵.. "
	];

	private _goalBob: string[] = [
    "MAMMA MIA!",
    "OMYGOD!",
    "CHE PASSOOOOO !",
    "UNPRECEDENTED !",
	"ROCRABDO !",
	"1, 2 AND 3🎵!",
	"HUMILIATION",
	"AHA, HE SUCKS!",
	"POPOPO !",
	"WOW"
	];
	
}

