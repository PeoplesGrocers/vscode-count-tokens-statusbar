module.exports = {
	parser: '@typescript-eslint/parser',
	plugins: ['@typescript-eslint', 'unused-imports', 'prettier'],
	extends: [
		'plugin:@typescript-eslint/eslint-recommended',
		'plugin:@typescript-eslint/recommended',
		'plugin:prettier/recommended',
	],
	rules: {
		'@typescript-eslint/no-explicit-any': 'warn',
		'unused-imports/no-unused-imports': 'warn',
		'max-len': ['warn', { code: 100, tabWidth: 4 }],
		indent: ['error', 'tab'],
		quotes: ['error', 'single'],
		'prettier/prettier': [
			'error',
			{ useTabs: true, tabWidth: 4, singleQuote: true },
		],

		'@typescript-eslint/no-unused-vars': [
			'error',
			{ argsIgnorePattern: '^_' },
		],
	},
};
