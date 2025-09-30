import { AdvancedDynamicTexture, TextBlock} from "@babylonjs/gui/2D";
import { Scene, AbstractMesh, Mesh, Vector3, MeshBuilder} from "@babylonjs/core";

export class DisplayName
{
    private _scene: Scene;
    private _namePlayer1: string;
    private _namePlayer2: string;
    private _meshPlayer1: AbstractMesh | null;
    private _meshPlayer2: AbstractMesh | null;
    
    private _plane1: Mesh;
    private _plane2: Mesh;
    private _advancedTexture1: AdvancedDynamicTexture;
	private _advancedTexture2: AdvancedDynamicTexture;
    private _text1: TextBlock;
	private _text2: TextBlock;

    constructor(scene: Scene, namePlayer1: string, namePlayer2: string, meshPlayer1: AbstractMesh | null, meshPlayer2: AbstractMesh | null)
	{
        this._scene = scene;
        this._namePlayer1 = namePlayer1;
        this._namePlayer2 = namePlayer2;
        this._meshPlayer1 = meshPlayer1;
        this._meshPlayer2 = meshPlayer2;

        // plane pour mesh
		this._plane1 = MeshBuilder.CreatePlane("textPlane", { size: 4 }, this._scene);
		this._plane1.parent = this._meshPlayer1;
		this._plane1.position = new Vector3(0.02, 0.05, 0); // décalé au-dessus de ton mesh
		this._plane1.rotation = new Vector3(0, 4.71, 0); // 180° sur Y
		// GUI sur le plane
		this._advancedTexture1 = AdvancedDynamicTexture.CreateForMesh(this._plane1);
		this._text1 = new TextBlock();
		this._text1.text = this._namePlayer1;
		this._text1.color = "blue";
		this._text1.fontSize = 20;
		this._text1.fontFamily = "Comic Sans MS";
		this._text1.fontStyle = "italic";
		this._text1.fontWeight = "bold";

		this._advancedTexture1.addControl(this._text1);

		this._plane2 = MeshBuilder.CreatePlane("textPlane2", { size: 4 }, this._scene);
		this._plane2.parent = this._meshPlayer2;
		this._plane2.position = new Vector3(0.02, 0.05, 0); // décalé au-dessus de ton mesh
		//textPlane.billboardMode = Mesh.BILLBOARDMODE_ALL;
		this._plane2.rotation = new Vector3(0, 4.71, 0); // 180° sur Y

		// GUI sur le plane
		this._advancedTexture2 = AdvancedDynamicTexture.CreateForMesh(this._plane2);
		this._text2 = new TextBlock();
		this._text2.text = this._namePlayer2;
		this._text2.color = "red";
		this._text2.fontSize = 20;
		this._text2.fontFamily = "Comic Sans MS";
		this._text2.fontStyle = "italic";
		this._text2.fontWeight = "bold";

		this._advancedTexture2.addControl(this._text2);
    }
}