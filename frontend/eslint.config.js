import eslint from '@eslint/js';
import pluginVue from 'eslint-plugin-vue';
import parserTs from '@typescript-eslint/parser';
import pluginTs from '@typescript-eslint/eslint-plugin';
import pluginPrettier from '@vue/eslint-config-prettier';
import { fileURLToPath } from 'node:url';

export default [
    // 基础配置
    eslint.configs.recommended,

    // TypeScript配置
    {
        files: ['src/**/*.ts', 'src/**/*.vue'],
        languageOptions: {
            parser: parserTs,
            parserOptions: {
                ecmaVersion: 'latest',
                sourceType: 'module',
                project: fileURLToPath(new URL('./tsconfig.json', import.meta.url)),
                tsconfigRootDir: fileURLToPath(new URL('./', import.meta.url)),
                extraFileExtensions: ['.vue']
            },
            globals: {
                // Vue 3 API
                defineProps: 'readonly',
                defineEmits: 'readonly',
                defineExpose: 'readonly',
                withDefaults: 'readonly',
                // 浏览器全局对象
                window: 'readonly',
                document: 'readonly',
                console: 'readonly',
                setTimeout: 'readonly',
                clearTimeout: 'readonly',
                WheelEvent: 'readonly',
                AbortController: 'readonly',
                EventSource: 'readonly',
                HTMLElement: 'readonly',
                URL: 'readonly'
            }
        },
        plugins: {
            '@typescript-eslint': pluginTs
        },
        rules: {
            ...pluginTs.configs.recommended.rules,
            'no-undef': 'off',
            'no-useless-escape': 'off',
            'no-case-declarations': 'off',
            '@typescript-eslint/no-undef': 'off',
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/explicit-module-boundary-types': 'off',
            '@typescript-eslint/no-unused-expressions': 'off',
            '@typescript-eslint/no-unsafe-function-type': 'off',
            '@typescript-eslint/no-this-alias': 'off',
            '@typescript-eslint/no-unused-vars': 'off'
        }
    },

    // Vue配置
    ...pluginVue.configs['flat/essential'],
    {
        files: ['src/**/*.vue'],
        languageOptions: {
            parser: pluginVue.parser,
            parserOptions: {
                ecmaVersion: 'latest',
                sourceType: 'module',
                parser: {
                    ts: parserTs,
                    js: 'espree',
                    '<template>': 'espree'
                }
            }
        },
        rules: {
            'vue/multi-word-component-names': 'off',
            'vue/no-unused-vars': 'off',
            'vue/attribute-hyphenation': 'off',
            'vue/require-default-prop': 'off',
            'vue/require-valid-default-prop': 'off',
            'vue/no-parsing-error': 'off',
            'vue/html-self-closing': [
                'warn',
                {
                    html: {
                        void: 'always',
                        normal: 'always',
                        component: 'always'
                    },
                    svg: 'always',
                    math: 'always'
                }
            ]
        }
    },

    // Prettier集成
    pluginPrettier,

    // 为配置文件添加全局变量
    {
        files: ['eslint.config.js'],
        languageOptions: {
            globals: {
                URL: 'readonly'
            }
        }
    },

    // 忽略文件
    {
        ignores: ['node_modules/**', 'dist/**', 'public/**', 'vite.config.d.ts', 'vite.config.ts', 'components.d.ts']
    }
];
