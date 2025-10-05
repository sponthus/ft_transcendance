import { createDiv, createElement, createButton, createDropdownDiv, createFormDiv, createCheckBoxLabel, append, createImage, createInput} from '../../Utils/elementMaker.js';

export class LocalGamePage {

	private Page!: HTMLElement;
	// private PartyMap!: Map<number, HTMLInputElement>;
	private Username!: string;

	/*************************for creatingGame*************************/
	private PlayerA!: string;
	private PlayerB: string = "Crabby the bot";
	private Ai: number = 1; // ia playerA 2 PlayerB 
	private MaxScore: number = 5;
	private Option: number = 1;

	/*************************button*************************/
	private PlayBtn!: HTMLButtonElement;
	private SettingBtn!: HTMLButtonElement;
	private BackBtn!: HTMLButtonElement;

	/*************************button setting*************************/
	private botBtn!: HTMLButtonElement;
	private playerBtn!: HTMLButtonElement;
	private plusbtn!: HTMLButtonElement;
	private minusBtn!: HTMLButtonElement;
	private maxScoreP!: HTMLElement;
	private PlayerAInput!: HTMLInputElement;
	private PLayerBInput!: HTMLInputElement;
	private OptionBtn!: HTMLButtonElement;
	private OptionImg!: HTMLImageElement;

	/*************************utils div*************************/
	private SettingPan!: HTMLElement;

	constructor(Page: HTMLElement, UserName: string) {
		// this.AvailableGames = new availableGames(this.Page, this.PartyMap);
		this.Page = Page;
		// this.PartyMap = new Map<number, HTMLInputElement>();
		this.Username = UserName;
		this.PlayerA = this.Username; //this.Username; change to this.username
	}

	async render() {
		this.PlayBtn = (createButton("play", "relative flex items-center z-5 active:scale-95 hover:scale-105 h-[30%] aspect-square transition-all duration-200 translate-x-96", "") as HTMLButtonElement);
		this.SettingBtn = (createButton("settings", "relative flex items-center z-5 active:scale-95 hover:scale-105 h-[12%] w-[30%] transition-all duration-200 -translate-x-96", "") as HTMLButtonElement);
		this.BackBtn = (createButton("return", "relative flex items-center z-5 active:scale-95 hover:scale-105 h-[10%] w-[20%] transition-all duration-200 top-16 left-32 -translate-x-96", "") as HTMLButtonElement);
		append(this.Page, [createImage("1v1", "absolute object-fill object-center h-full w-full opacity-65", '1v1-page.png')]);

		append(this.PlayBtn, [createImage('Play', 'absolute object-center h-full w-full', 'game_ui/Playebtn.png')]);
		append(this.SettingBtn, [createImage('setting', 'absolute object-center h-full w-full', 'game_ui/Settingsbtn.png')]);
		append(this.BackBtn, [createImage('Back', 'absolute object-center h-full w-full', 'game_ui/Backbtn.png')]);

		append(this.Page, [createImage('bot-text', 'z-10 object-center h-[20%] w-[80%] animate-wiggle margin-top-32', 'game_ui/LocalPongText.png')
							,this.SettingBtn , this.PlayBtn , this.BackBtn]);

		this.Page.className = "flex flex-col items-center w-full h-full transition-all duration-300 text-center rounded-xl space-y-4";
		setTimeout(() => {
			this.PlayBtn.classList.remove('translate-x-96');
			this.SettingBtn.classList.remove('-translate-x-96');
			this.BackBtn.classList.remove('-translate-x-96');
		}, 100);
	}

	async renderSetting() {
		this.BackBtn = (createButton("return", "relative flex items-center z-5 active:scale-95 hover:scale-105 h-[10%] w-[20%] transition-all duration-200 left-32 -translate-x-96", "") as HTMLButtonElement);
		append(this.BackBtn, [createImage('Back', 'absolute object-center h-full w-full', 'game_ui/Backbtn.png')]);

		this.SettingPan = createDiv('setting-pan', 'relative flex flex-col items-center w-full h-[70%] transition-all duration-200 translate-x-96 space-y-4');
		append(this.SettingPan ,[createImage('1v1-setting', 'absolute object-center object-fill h-full w-full', 'game_ui/setting/SettingPan.png')]);		
		this.fillSetingPan();

		append(this.Page, [createImage("1v1", "absolute object-fill object-center h-full w-full opacity-20", '1v1-page.png')]);
		append(this.Page, [createImage('bot-text', 'z-10 object-center h-[7%] w-[50%] animate-wiggle margin-top-32', 'game_ui/setting/settingText.png')
							,this.SettingPan , this.BackBtn]);

		this.Page.className = "flex flex-col items-center w-full h-full transition-all duration-300 text-center rounded-xl space-y-4";
		setTimeout(async() => {
			this.SettingPan .classList.remove('translate-x-96');
			this.BackBtn.classList.remove('-translate-x-96');
		}, 100);
	}

	private fillSetingPan() {
		append(this.SettingPan, [this.createOpponentDiv(), this.createPlayerNameDiv(), this.createScorelimitDiv(), this.createcrabmehamehaDiv()]);
	}

	private createOpponentDiv(): HTMLElement {
		const opponentDiv: HTMLElement = createDiv('opponent', 'relative flex items-center h-[13%] w-[70%] translate-y-16 space-x-8');

		this.botBtn = createButton('bot', 'relative flex items-center z-5 active:scale-95 hover:scale-110 h-full w-[45%] transition-all duration-200', '');
		append(this.botBtn, [createImage('bot', 'absolute object-center object-fill h-full w-full', 'game_ui/setting/botPan.png')]);
		
		this.playerBtn = createButton('player-setting', 'relative flex items-center z-5 active:scale-95 hover:scale-110 h-full w-[45%] transition-all duration-200', '');
		append(this.playerBtn, [createImage('player', 'absolute object-center object-fill h-full w-full', 'game_ui/setting/PlayerPan.png')]);
	
		if (this.Ai > 0) {
			this.botBtn.classList.remove('hover:scale-110');
			this.botBtn.classList.add('scale-110');
		}

		else {
			this.playerBtn.classList.remove('hover:scale-110');
			this.playerBtn.classList.add('scale-110');
		}

		append(opponentDiv, [this.botBtn, this.playerBtn]);
		return opponentDiv;
	}

	private createPlayerNameDiv(): HTMLElement {
		const PlayerNameDiv: HTMLElement = createDiv('player-name', 'flex flex-col h-[30%] w-[70%] translate-y-16 space-y-4');

		append(PlayerNameDiv, [createImage('player-name', 'z-5 object-center object-fill h-[30%] w-[40%]', 'game_ui/setting/playerNamestext.png')]);

		const playerADiv: HTMLElement = createDiv('player-name', 'relative flex h-[30%] w-full space-x-4');
		this.PlayerAInput = createInput(['', '', '', true], 'PlayerA', 'h-full w-[40%]');
		this.PlayerAInput.value = this.PlayerA;
		if (this.Ai > 0)
			this.PlayerAInput.readOnly = true;
		append(playerADiv, [createImage('playerA', 'z-5 object-center object-fill h-full w-[40%]', 'game_ui/setting/playerA.png'), this.PlayerAInput]);

		const playerBDiv: HTMLElement = createDiv('player-name', 'relative flex h-[30%] w-full space-x-4');
		this.PLayerBInput = createInput(['', '', '', true], 'PlayerA', 'h-full w-[40%]');
		this.PLayerBInput.value = this.PlayerB;
		if (this.Ai > 0)
			this.PLayerBInput.readOnly = true;
		append(playerBDiv, [createImage('playerB', 'z-5 object-center object-fill h-full w-[40%]', 'game_ui/setting/playerB.png'), this.PLayerBInput]);

		append(PlayerNameDiv, [playerADiv, playerBDiv]);
		return PlayerNameDiv;
	}

	private createScorelimitDiv(): HTMLElement {
		const scoreLimitDiv: HTMLElement = createDiv('score-limit', 'flex items-center justify-around h-[20%] w-[80%] translate-y-10 space-x-4');

		this.plusbtn = createButton('plus', 'relative flex items-center z-5 active:scale-95 hover:scale-105 h-full w-[40%] transition-all duration-200', '')
		append(this.plusbtn, [createImage('plus', 'absolute object-cover object-center', 'game_ui/setting/plusValue.png')])

		this.minusBtn = createButton('minus', 'relative flex items-center z-5 active:scale-95 hover:scale-105 h-full w-[40%] transition-all duration-200', '');
		append(this.minusBtn, [createImage('minus', 'absolute object-cover object-center', 'game_ui/setting/minusValue.png')]);

		const container: HTMLElement = createDiv('', 'grid place-items-center w-full h-full')
		const MaxScorePan: HTMLImageElement = createImage('max-score', 'w-full h-full object-contain col-start-1 row-start-1', 'game_ui/setting/emptyPan.png');
		this.maxScoreP = createElement('p','score-limit', `${this.MaxScore.toString()}`, 'z-10 text-center col-start-1 row-start-1 text-orange-200');
		append(container, [this.maxScoreP ,MaxScorePan]); // add Maxscore img here 

		const scoreLimitPan: HTMLElement = createDiv('score-limit-pan', 'relative flex h-full w-[45%] space-x-4');
		append(scoreLimitPan, [this.plusbtn, container, this.minusBtn]);

		append(scoreLimitDiv, [createElement('p', '', "score limit", 'text-center text-orange-200 text-4xl')
								,scoreLimitPan]);
		
		return scoreLimitDiv;
	}
	
	private createcrabmehamehaDiv() : HTMLElement {
		const checcrabmehamehaDiv: HTMLElement = createDiv('crabmehameha', 'flex items-center justify-arround h-[10%] translate-y-2 space-x-4');

		this.OptionBtn = createButton('minus', 'relative flex items-center z-5 active:scale-95 hover:scale-105 transition-all duration-200', '');
		let src: string = 'game_ui/setting/checkedValue.png';
		if (this.Option == 0)
			src = 'game_ui/setting/uncheckedValue.png';

		this.OptionImg = createImage('check', 'active:scale-95 hover:scale-105 transition-all duration-200', src);
		append(this.OptionBtn, [this.OptionImg]);
	
		append(checcrabmehamehaDiv, [createElement('p', '', "option crabmehameha", 'text-center text-orange-200 text-4xl')
									,this.OptionBtn]);

		return checcrabmehamehaDiv;
	}

	/******************************************getter*************************************/
	get _PlayerA() :string{
		return this.PlayerA;
	}

	get _PlayerB(): string {
		return this.PlayerB;
	}

	get _Ai(): number {
		return this.Ai;
	}

	get _MaxScore(): number{
		return this.MaxScore;
	}

	get _option(): number{
		return this.Option;
	}

	get	_playBtn(): HTMLButtonElement {
		return this.PlayBtn;
	}

	get _settingBtn(): HTMLButtonElement {
		return this.SettingBtn;
	}

	get _backBtn(): HTMLButtonElement {
		return this.BackBtn;
	}

	get _settingPan(): HTMLElement {
		return this.SettingPan;
	}

	get _botBtn(): HTMLButtonElement {
		return this.botBtn;
	}

	get _playerBtn(): HTMLButtonElement {
		return this.playerBtn;
	}

	get _plusbtn(): HTMLButtonElement {
		return this.plusbtn;
	}

	get _minusbtn() : HTMLButtonElement {
		return this.minusBtn;
	}

	get _maxScoreP(): HTMLElement {
		return this.maxScoreP;
	}

	get _playerAInput(): HTMLInputElement {
		return this.PlayerAInput;
	}

	get _playerBinput(): HTMLInputElement {
		return this.PLayerBInput;
	}

	get _optionbtn():HTMLButtonElement {
		return this.OptionBtn;
	}

	get _optionimg(): HTMLImageElement {
		return this.OptionImg;
	}
	/******************************************setter*************************************/
	set setPlayerA(PlayerA: string){
		this.PlayerA = PlayerA;
	}

	set setPlayerB(PlayerB: string) {
		this.PlayerB = PlayerB;
	}

	set setAi(Ai: number) {
		this.Ai = Ai;
	}

	set setMaxScore(MaxScore: number){
		this.MaxScore = MaxScore;
	}

	set setOption(Option: number){
		this.Option = Option;
	}

	set setPlayerAInput(PlayerA: string) {
		this.PlayerAInput.value = PlayerA;
	}

	set setPlayerAReadonly(readonly: boolean) {
		this.PlayerAInput.readOnly = readonly;
	}

	set setPlayerBInput(PlayerB: string) {
		this.PLayerBInput.value = PlayerB;
	}

	set setPlayerBReadonly(readonly: boolean) {
		this.PLayerBInput.readOnly = readonly;
	}
}
