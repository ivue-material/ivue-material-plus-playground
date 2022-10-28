import path from 'node:path';
import { defineConfig } from 'vite';

// UnoCSS 的 Vite 插件
import Unocss from 'unocss/vite';
import vue from '@vitejs/plugin-vue';
import Components from 'unplugin-vue-components/vite';

// 自动按需引入
import { IvueMaterialPlusResolver } from 'ivue-material-plus/resolvers/ivue-material-plus';

// 自动导入 Vite、Webpack、Rollup 和 esbuild 的 API
import AutoImport from 'unplugin-auto-import/vite';
// 检查 Vite 插件的中间状态。对调试和创作插件很有用
import Inspect from 'vite-plugin-inspect';
// 使用 mkcert 为 vite https 开发服务提供证书支持。
import Mkcert from 'vite-plugin-mkcert';
// 获取有关本地软件包的信息
import { getPackageInfo } from 'local-pkg';
// package
import pkg from './package.json';

const pathSrc = path.resolve(__dirname, 'src');

export default defineConfig(async () => {

  // @vue/repl 版本
  const repl = await getPackageInfo('@vue/repl');

  return {
    resolve: {
      alias: {
        '@': pathSrc,
      },
    },
    // 定义全局常量替换方式
    define: {
      'import.meta.env.APP_VERSION': JSON.stringify(pkg.version),
      'import.meta.env.REPL_VERSION': JSON.stringify(repl!.version),
    },
    server: {
      // 启用 TLS + HTTP/2
      https: true,
      // 指定服务器应该监听哪个 IP 地址。 如果将此设置为 0.0.0.0 或者 true 将监听所有地址
      host: true,
    },
    plugins: [
      vue({
        // 启用 Vue 反应性转换
        // true`: 将为所有 vue,js(x),ts(x) 文件启用转换，除了那些在node_modules里面的
        reactivityTransform: true,
      }),
      AutoImport({
        dirs: [path.resolve(pathSrc, 'composables')],
        imports: ['vue', '@vueuse/core'],
        resolvers: [IvueMaterialPlusResolver()],
        dts: path.resolve(pathSrc, 'auto-imports.d.ts'),
      }),
      Components({
        dirs: [path.resolve(pathSrc, 'components')],
        resolvers: [IvueMaterialPlusResolver()],
        dts: path.resolve(pathSrc, 'components.d.ts'),
      }),
      Unocss(),
      Mkcert(),
      Inspect(),
    ],
  };
});
