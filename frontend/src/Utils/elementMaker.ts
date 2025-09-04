import { className } from "@babylonjs/core";
import { DropDown } from "../Utils/dropDown";

export function createDiv(Id: string, ClassName: string): HTMLElement {
	const div: HTMLElement = document.createElement('div');
	div.id = Id + "-div";
	div.className = ClassName;

	return div;
}

export function createElement(Element: string, Id: string,  TextContent: string, ClassName: string): HTMLElement {

	const text: HTMLElement = document.createElement(Element);
	text.id = Id + "-" + Element;
	text.className = ClassName;
	text.textContent = TextContent;

	return text;
}

export function createButton(Id: string, ClassName: string, TextContent: string ): HTMLButtonElement {
	const Btn: HTMLButtonElement = document.createElement('button');
	Btn.id = Id + "-btn";
	Btn.className = ClassName;
	Btn.textContent = TextContent;

	return Btn;
}

export function createLabel(Name: string, ClassName: string): HTMLLabelElement {
	const Label: HTMLLabelElement = document.createElement('label');
	Label.htmlFor = Name + '-Label';
	Label.className = ClassName;
	
	return Label;
}

export function createImage(Id: string, ClassName: string, srcImg: string): HTMLImageElement {
	const Img = document.createElement('img') as HTMLImageElement;
	Img.id = Id + "-img";
	Img.className = ClassName;
	Img.src = srcImg;

	return Img;
}

export function createAnchorElement(Id: string, TextContent: string, Link: string, ClassName: string): HTMLAnchorElement {
	const a = document.createElement('a') as HTMLAnchorElement;
	a.id = Id + "-a";
	a.textContent = TextContent;
	a.className = ClassName;
	a.href = Link;
	return a;
}

export function createInput(InputOptions: [Type: string,  id: String, PlaceHolder: string, required: boolean],  Name: string, ClassName: string): HTMLInputElement {
	const Input: HTMLInputElement = document.createElement('input');
	Input.className = ClassName;
	Input.type = InputOptions[0];
	Input.name = Name;
	Input.id = InputOptions[1] + "-input";
	Input.placeholder = InputOptions[2];
	Input.required = InputOptions[3];

	return Input;
}

export function  createFormDiv(InputOptions: [Type: string, id: String, PlaceHolder: string, required: boolean]
								, Name: string
								, TextContent: string
								, ClassName: [DivClass:string, LabelClass: string, InputClass: string, TextClass: string]): HTMLElement  {

		const Div: HTMLElement = createDiv(Name, ClassName[0]);
		const Label: HTMLLabelElement = createLabel(Name, ClassName[1]);
		const Input: HTMLInputElement = createInput(InputOptions, Name, ClassName[2]);
		const Text: HTMLElement = createElement('p', Name, TextContent, ClassName[3]);

		append(Div, [Text, Label, Input]);
		
		return Div;
}

export function createCheckBoxLabel(Id: string, Name: string, TextContent: string, ClassName: [LabelClass: string, InputClass: string]): HTMLLabelElement {
	const Label = createLabel("", ClassName[0]);
	Label.textContent = TextContent;

	const Input = createInput(["checkbox", Id, "", false], Name, ClassName[1]);

	append(Label, [Input]);

	return Label

}

export function createDropdownDiv(Options: string[], Name: string, TextContent: string, ClassName: [DivClass: string, TextClass: string, DropDownClass: string]): HTMLElement {

	const div = createDiv(Name, ClassName[0]);
	const Text = createElement('h1', Name, TextContent, ClassName[1]);

	const DropDownDiv: DropDown = new DropDown(Options, Name + "-DropDown");
	DropDownDiv.getDropdownDiv.className = ClassName[2];

	append(div, [Text, DropDownDiv.getDropdownDiv]);

	return div;
}

export function append(Parent: HTMLElement, Childs: HTMLElement[]) {

	Childs.forEach(Child => {
		Parent.appendChild(Child);
	})
}