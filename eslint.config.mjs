// eslint.config.mjs
import js from '@eslint/js';
import ts from 'typescript-eslint';
import globals from 'globals';

export default [
    js.configs.recommended,
    ...ts.configs.recommended,
    {
        languageOptions: {
            globals: {
                ...globals.node
            },
            parserOptions: {
                project: './tsconfig.json'
            }
        },
        ignores: ['dist/**', 'node_modules/**']
    }
];