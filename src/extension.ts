/*
	Count tokens in your VSCode status bar
    Copyright (C) 2023 Peoples Grocers LLC
    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License version 3 as
    published by the Free Software Foundation.
    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.
    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
import * as vscode from 'vscode';
import {
	Tiktoken,
	TiktokenEncoding,
	getEncoding,
	TiktokenModel,
} from 'js-tiktoken';
import claude from './claude.json';
let myStatusBarItem: vscode.StatusBarItem;
const myCommandId = 'marxism.ai-token-count.changeTokenizer';
let countTokens: (fragment: string) => number;
// The @anthropic-ai/tokenizer library depends on the tiktoken library which tries to load
// tiktioken_bg.wasm which does not work with our esbuild setup.
//
// So instead I vendored the raw bpe_ranks file into this repository
// https://github.com/anthropics/anthropic-tokenizer-typescript/blob/main/index.ts
let anthropicEncoder: Tiktoken;
type TokenizerKind = TiktokenEncoding | 'anthropic';
function makeCountTokens(kind: TokenizerKind) {
	if (kind === 'anthropic') {
		return (fragment: string) => {
			return anthropicEncoder.encode(fragment.normalize('NFKC'), 'all')
				.length;
		};
	} else {
		const encoder = getEncoding(kind);
		return (fragment: string) => encoder.encode(fragment).length;
	}
}
export function activate({
	subscriptions,
	globalState,
}: vscode.ExtensionContext) {
	try {
		anthropicEncoder = new Tiktoken({
			bpe_ranks: claude.bpe_ranks,
			special_tokens: claude.special_tokens,
			pat_str: claude.pat_str,
		});
		const tokenizer =
			(globalState.get('tokenizer') as TiktokenEncoding) || 'cl100k_base';
		countTokens = makeCountTokens(tokenizer);
		async function changeTokenizer() {
			const currentTokenizer =
				(globalState.get('tokenizer') as TiktokenEncoding) ||
				'cl100k_base';
			const choices: {
				label: TiktokenEncoding | TiktokenModel | 'anthropic';
				value: TiktokenEncoding | 'anthropic';
				description?: string;
				iconPath?: vscode.ThemeIcon;
			}[] = [
				{ label: 'cl100k_base', value: 'cl100k_base' },
				{ label: 'p50k_edit', value: 'p50k_edit' },
				{ label: 'p50k_base', value: 'p50k_base' },
				{ label: 'r50k_base', value: 'r50k_base' },
				{ label: 'gpt2', value: 'gpt2' },
				// All Anthropic models use the same tokenizer
				{ label: 'anthropic', value: 'anthropic' },
			];
			for (let i = 0; i < choices.length; i++) {
				if (choices[i].label === currentTokenizer) {
					choices[i].iconPath = new vscode.ThemeIcon('pass-filled');
				} else {
					choices[i].iconPath = new vscode.ThemeIcon(
						'circle-large-outline',
					);
				}
			}
			// for each of the MODEL_FOR_ENCODING, add a choice
			for (const model in MODEL_TO_ENCODING) {
				choices.push({
					label: model as TiktokenModel,
					value: MODEL_TO_ENCODING[model as TiktokenModel],
					description: MODEL_TO_ENCODING[model as TiktokenModel],
					iconPath: new vscode.ThemeIcon('circle-large-outline'),
				});
			}
			const selectedTokenizerName = await vscode.window.showQuickPick(
				choices,
				{ placeHolder: 'Select which tokenizer you want to use' },
			);
			if (!selectedTokenizerName) return;
			globalState.update('tokenizer', selectedTokenizerName.value);
			countTokens = makeCountTokens(selectedTokenizerName.value);
			const n = updateStatusBarItem();
			vscode.window.showInformationMessage(
				`Using ${selectedTokenizerName.value}: ${n} tokens(s) selected!`,
			);
		}
		// register a command that is invoked when the status bar
		// item is selected
		subscriptions.push(
			vscode.commands.registerCommand(myCommandId, changeTokenizer),
		);
		// create a new status bar item that we can now manage
		myStatusBarItem = vscode.window.createStatusBarItem(
			vscode.StatusBarAlignment.Right,
			100,
		);
		myStatusBarItem.command = myCommandId;
		subscriptions.push(myStatusBarItem);
		function updateStatusBarItem(): number {
			const editor = vscode.window.activeTextEditor;
			let n = 0;
			let total = 0;
			n = getNumberOfSelectedTokens(vscode.window.activeTextEditor);
			if (editor) {
				total = countTokens(editor.document.getText());
			}
			if (n > 0) {
				myStatusBarItem.text = `Tokens: ${total} (${n} selected)`;
				myStatusBarItem.show();
			} else {
				myStatusBarItem.text = `Tokens: ${total}`;
				myStatusBarItem.show();
			}
			return n;
		}
		// register some listener that make sure the status bar
		// item always up-to-date
		subscriptions.push(
			vscode.window.onDidChangeActiveTextEditor(updateStatusBarItem),
		);
		subscriptions.push(
			vscode.window.onDidChangeTextEditorSelection(updateStatusBarItem),
		);
		subscriptions.push(
			vscode.workspace.onDidChangeTextDocument(updateStatusBarItem),
		);
		// update status bar item once at start
		updateStatusBarItem();
	} catch (err) {
		vscode.window.showInformationMessage(
			'Activation failed on an exception. Show Logs -> Extension Host to see the exception.',
		);
		throw err;
	}
}
function getNumberOfSelectedTokens(
	editor: vscode.TextEditor | undefined,
): number {
	let tokens = 0;
	if (editor) {
		tokens = editor.selections.reduce((prev, curr) => {
			const document = editor.document;
			const fragment = document.getText(curr);
			return prev + countTokens(fragment);
		}, 0);
	}
	return tokens;
}
const MODEL_TO_ENCODING: { [key in TiktokenModel]: TiktokenEncoding } = {
	'text-davinci-003': 'p50k_base',
	'text-davinci-002': 'p50k_base',
	'text-davinci-001': 'r50k_base',
	'text-curie-001': 'r50k_base',
	'text-babbage-001': 'r50k_base',
	'text-ada-001': 'r50k_base',
	davinci: 'r50k_base',
	curie: 'r50k_base',
	babbage: 'r50k_base',
	ada: 'r50k_base',
	'code-davinci-002': 'p50k_base',
	'code-davinci-001': 'p50k_base',
	'code-cushman-002': 'p50k_base',
	'code-cushman-001': 'p50k_base',
	'davinci-codex': 'p50k_base',
	'cushman-codex': 'p50k_base',
	'text-davinci-edit-001': 'p50k_edit',
	'code-davinci-edit-001': 'p50k_edit',
	'text-embedding-ada-002': 'cl100k_base',
	'text-similarity-davinci-001': 'r50k_base',
	'text-similarity-curie-001': 'r50k_base',
	'text-similarity-babbage-001': 'r50k_base',
	'text-similarity-ada-001': 'r50k_base',
	'text-search-davinci-doc-001': 'r50k_base',
	'text-search-curie-doc-001': 'r50k_base',
	'text-search-babbage-doc-001': 'r50k_base',
	'text-search-ada-doc-001': 'r50k_base',
	'code-search-babbage-code-001': 'r50k_base',
	'code-search-ada-code-001': 'r50k_base',
	gpt2: 'gpt2',
	'gpt-3.5-turbo': 'cl100k_base',
	'gpt-3.5-turbo-0301': 'cl100k_base',
	'gpt-3.5-turbo-0613': 'cl100k_base',
	'gpt-3.5-turbo-16k': 'cl100k_base',
	'gpt-3.5-turbo-16k-0613': 'cl100k_base',
	'gpt-4': 'cl100k_base',
	'gpt-4-0314': 'cl100k_base',
	'gpt-4-0613': 'cl100k_base',
	'gpt-4-32k': 'cl100k_base',
	'gpt-4-32k-0314': 'cl100k_base',
	'gpt-4-32k-0613': 'cl100k_base',
};
