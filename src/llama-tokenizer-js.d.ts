declare module 'llama-tokenizer-js' {
	export function encode(text: string): string[];
	export function decode(tokens: string[]): string;
}
