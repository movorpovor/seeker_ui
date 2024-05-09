// @ts-check

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config({
        rules: {
            '@typescript-eslint/array-type': 'error'
        }
    }
);