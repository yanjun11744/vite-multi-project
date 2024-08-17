/*
 * @Author: Shber
 * @Date: 2024-01-22 18:34:47
 * @LastEditors: Shber
 * @LastEditTime: 2024-01-22 21:46:37
 * @Description: 
 */
// import fs from "fs";
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path, {resolve} from 'path'
import compression from 'vite-plugin-compression' //gzip/br 压缩
import AutoImport from 'unplugin-auto-import/vite' // 自动引入
import Components from 'unplugin-vue-components/vite' // 组件自动引入
import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import chalk from 'chalk' // console高亮
import copy from 'rollup-plugin-copy';

// 引入多页面配置文件
const project = require('./scripts/multiPages.json')
// 获取npm run dev后缀 配置的环境变量
const npm_config_page = process.env.npm_config_page || ''
// 命令行报错提示
const errorLog = (error) => console.log(chalk.red(`${error}`))

//获取指定的单页面入口
const getEnterPages = () => {
  if (!npm_config_page)
    errorLog(
      '⚠️ 警告 -- 请在命令行后以 `--page=页面名称` 格式指定页面名称！'
    )
  const filterArr = project.filter(
    (item) => item.chunk.toLowerCase() == npm_config_page.toLowerCase()
  )
  if (!filterArr.length)
    errorLog(
      '⚠️ 警告 -- 不存在此页面，请检查页面名称！'
    )

  return {
    [npm_config_page]: path.resolve(
      __dirname,
      `src/projects/${npm_config_page}/index.html`
    )
  }
}

// 打包提示
const buildEndFn = (name)=>{
  console.log(`🚀🚀🚀 ${chalk.green.bold('项目构建')} ➡️   ${chalk.white.bgGreen.bold(` ${name} `)} 🇨🇳`);
}

//重命名html为项目名
const renameHtmlPlugin = () => {
  return {
    name: 'rename-html',
    generateBundle(options, bundle) {
      const oldFileName = 'index.html';
      const newFileName = `${npm_config_page}.html`;

      if (bundle[oldFileName]) {
        bundle[newFileName] = {
          ...bundle[oldFileName],
          fileName: newFileName,
        };
        // 删除旧的 index.html
        delete bundle[oldFileName];
      }
    },
  };
};

export default defineConfig({
  root: path.resolve(__dirname, `./src/projects/${npm_config_page}`),
  base: '/',
  envDir: path.resolve(__dirname), //用于加载 .env 文件的目录。可以是一个绝对路径，也可以是相对于项目根的路径。
  plugins: [
    vue(),
    AutoImport({
      // 自动导入 Vue 相关函数，如：ref, reactive, toRef 等
      imports: ['vue', 'vue-router'],
      dts: path.resolve(__dirname, './auto-import.d.ts'),
      eslintrc: {
        enabled: false, // 是否自动生成 eslint 规则，建议生成之后设置 false
        filepath: path.resolve(__dirname, './.eslintrc-auto-import.json'), // 指定自动导入函数 eslint 规则的文件
        globalsPropValue: true,
      },
      resolvers: [
        IconsResolver({ prefix: 'Icon', }), // 自动导入图标组件
        ElementPlusResolver() // // 自动导入 Element Plus 相关函数，如：ElMessage, ElMessageBox...
      ],
      // vueTemplate: true,
      // dts: true, // 配置文件生成位置(false:关闭自动生成)
      // dts: path.resolve(pathSrc, "types", "auto-imports.d.ts"), // 指定自动导入函数TS类型声明文件路径
    }),
    Components({
      resolvers: [
        IconsResolver({ enabledCollections: ['ep'], }), // 自动注册图标组件
        ElementPlusResolver() // 自动导入 Element Plus 组件
      ],
      dirs: ['src/**/components'], // 指定自定义组件位置(默认:src/components)
      // dts: true, // 配置文件位置(false:关闭自动生成)
      // dts: path.resolve(pathSrc, "types", "components.d.ts"), // 指定自动导入组件TS类型声明文件路径
    }),
    Icons({
      autoInstall: true,
    }),
    // gzip格式
    compression({
      threshold: 1024 * 500, // 体积大于 threshold 才会被压缩,单位 b
      ext: '.gz', // 压缩文件格式
      deleteOriginFile: false // 是否删除源文件
    })
  ],
  resolve: {
    alias: {
      '@': path.join(__dirname, './src'),
      '@projects': path.join(__dirname, './src/projects')
    }
  },
  server: {
    host: 'localhost', // 指定服务器主机名
    port: 8880, // 指定服务器端口
    hmr: true,  // 开启热更新
    open: true, // 在服务器启动时自动在浏览器中打开应用程序
    https: false // 是否开启 https
  },
  build: {
    outDir: path.resolve(__dirname, `dist/templates`), // 输出整体目录
    assetsInlineLimit: 4096, //小于此阈值的导入或引用资源将内联为 base64 编码，以避免额外的 http 请求
    emptyOutDir: true, //Vite 会在构建时清空该目录
    terserOptions: {
      compress: {
        keep_infinity: true, // 防止 Infinity 被压缩成 1/0，这可能会导致 Chrome 上的性能问题
        drop_console: true, // 生产环境去除 console
        drop_debugger: true, // 生产环境去除 debugger
      },
      format: {
        comments: false, // 删除注释
      },
    },
    rollupOptions: {  //自定义底层的 Rollup 打包配置
      input: getEnterPages(),
      buildEnd: buildEndFn(npm_config_page),
      output: {
        assetFileNames: `assets/${npm_config_page}/[name]-[hash].[ext]`, // 资源输出路径
        chunkFileNames: `assets/${npm_config_page}/js/[name]-[hash].js`,  // chunk包输出的路径
        entryFileNames: `assets/${npm_config_page}/js/[name]-[hash].js`,  // 入口文件输出的路径
        compact: true,
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            return id
                .toString()
                .split('node_modules/')[1]
                .split('/')[0]
                .toString();
          }
        }
      },
      plugins: [
        copy({
          targets: [
            { src: 'src/theme.yaml', dest: 'dist' }, // 复制文件到 dist 目录
            { src: 'src/settings.yaml', dest: 'dist' }, // 复制文件到 dist 目录
          ],
          hook: 'writeBundle', // 确保在写入包时进行复制
        }),
        renameHtmlPlugin(),
      ]
    }
  },
  emptyOutDir: true, // 清空输出目录
})