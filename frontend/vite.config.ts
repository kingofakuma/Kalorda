import { defineConfig, loadEnv, ProxyOptions } from 'vite';
import type { UserConfig, ConfigEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { PrimeVueResolver } from '@primevue/auto-import-resolver';
import vitePluginBundleObfuscator from 'vite-plugin-bundle-obfuscator';
import { resolve, join } from 'path';
import { rmSync } from 'fs';
const packageJson = require('./package.json');

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }: ConfigEnv): UserConfig => {
    const env = loadEnv(mode, process.cwd());
    const proxy: Record<string, string | ProxyOptions> = {};

    const timestamp = Date.now();
    const appVersion = packageJson.version;
    const base = env.VITE_APP_BASE;
    // 是否打包正式生产环境
    const isProdEnv = env.VITE_ENV_NAME == 'prod';
    //后端api接口代理
    const apiServerURL = env.VITE_API_SERVER_URL;
    const apiProxyPath = env.VITE_API_PROXY_PATH;

    // 前端打包输出目录定向到后端项目里，方便后端项目打whl包时不用手动复制
    const web_dist = join(__dirname, '../backend/src/kalorda/web_dist');

    proxy[apiProxyPath] = {
        target: apiServerURL,
        changeOrigin: true,
        // rewrite: (path: any) => path.replace(new RegExp(`^${apiProxyPath}`), '')
    };

    return {
        // csj ems模块规范的转换
        // optimizeDeps: {
        //     // noDiscovery: true
        // },
        base: base,
        plugins: [
            {
                name: 'clean-outdir-plugin',
                // 打包前自动清理之前的打包结果
                buildStart() {
                    rmSync(web_dist, { recursive: true, force: true });
                    console.log(`✓ Cleaned output directory: ${web_dist}`);
                }
            },
            vue(),
            AutoImport({
                imports: ['vue'],
                dts: 'src/auto-import.d.ts'
            }),
            Components({
                resolvers: [PrimeVueResolver()]
            }),
            vueTemplatePlugin(env),
            vitePluginBundleObfuscator({
                excludes: [],
                enable: true,
                log: true,
                autoExcludeNodeModules: false,
                threadPool: false,
                options: {
                    compact: true,
                    controlFlowFlattening: true,
                    controlFlowFlatteningThreshold: 1,
                    deadCodeInjection: false,
                    debugProtection: false,
                    debugProtectionInterval: 0,
                    disableConsoleOutput: false,
                    identifierNamesGenerator: 'hexadecimal',
                    log: false,
                    numbersToExpressions: false,
                    renameGlobals: false,
                    selfDefending: true,
                    simplify: true,
                    splitStrings: false,
                    stringArray: false,
                    stringArrayCallsTransform: false,
                    stringArrayCallsTransformThreshold: 0.5,
                    stringArrayEncoding: [],
                    stringArrayIndexShift: true,
                    stringArrayRotate: true,
                    stringArrayShuffle: true,
                    stringArrayWrappersCount: 1,
                    stringArrayWrappersChainedCalls: true,
                    stringArrayWrappersParametersMaxCount: 2,
                    stringArrayWrappersType: 'variable',
                    stringArrayThreshold: 0.75,
                    unicodeEscapeSequence: false
                }
            })
        ],
        server: {
            host: '0.0.0.0',
            port: 8060,
            open: false,
            cors: true,
            proxy: proxy
        },
        resolve: {
            alias: {
                '@': join(__dirname, 'src'),
                components: resolve(__dirname, './src/components'),
                assets: resolve(__dirname, './src/assets'),
                '#': resolve(__dirname, 'types'),
                'vue-i18n': 'vue-i18n/dist/vue-i18n.cjs.js'
            }
        },
        build: {
            // 打包输出到后端项目scr/kalorda目录下，文件夹名称为web_dist，前端打包完成后再进行后端打包
            outDir: web_dist,
            sourcemap: false, //构建后是否生成 source map 文件
            reportCompressedSize: true, //显示压缩后的文件大小
            chunkSizeWarningLimit: 2000, //chunk 大小警告的限制（以 kb 为单位）默认：500
            cssTarget: 'chrome61', //防止 vite 将 rgba() 颜色转化为 #RGBA 十六进制符号的形式  (要兼容的场景是安卓微信中的 webview 时,它不支持 CSS 中的 #RGBA 十六进制颜色符号)
            // target: ['chrome89', 'edge89', 'firefox89', 'safari15'], //浏览器兼容目标
            target: 'es2022',
            minify: 'terser',
            terserOptions: {
                compress: {
                    drop_console: isProdEnv,
                    drop_debugger: isProdEnv,
                    pure_funcs: isProdEnv ? ['console.log', 'console.info', 'console.warn'] : []
                },
                // mangle: true, // 变量名混淆
                output: {
                    /** 删除注释 = false */
                    comments: isProdEnv ? false : true
                }
            },
            rollupOptions: {
                treeshake: true, // 开启 Tree Shaking，消除未使用的代码，减小最终的包大小
                output: {
                    manualChunks(id: string) {
                        //最小化拆分包
                        // if (id.includes('node_modules')) {
                        //     return id.toString().split('node_modules/')[1].split('/')[0].toString();
                        // }
                        if (id.includes('node_modules')) {
                            return 'vendors';
                        }
                    },
                    chunkFileNames: `chunks/[name]-v${appVersion}-${timestamp}.js`,
                    entryFileNames: `chunks/[name]-v${appVersion}-${timestamp}-entry.js`,
                    assetFileNames: `assets/[name]-v${appVersion}-${timestamp}.[ext]`
                }
            }
        }
    };
});

//vue模板打包时处理逻辑（去除vue模板中的注释等）
function vueTemplatePlugin(env: any) {
    //开发环境pass
    if (env.NODE_ENV === 'development') {
        return;
    }
    return {
        name: 'vueTemplatePlugin',
        transform(code: any, id: any) {
            if (id.endsWith('.vue')) {
                return code.replace(/<!--[\s\S]*?-->/g, '');
            }
            return code;
        }
    };
}
