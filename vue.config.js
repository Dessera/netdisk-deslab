const NodePolyfillPlugin = require('node-polyfill-webpack-plugin')
const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  publicPath: './',
  assetsDir: './',
  configureWebpack: {
    plugins: [new NodePolyfillPlugin()]
  },
  pluginOptions: {
    electronBuilder: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
      customFileProtocol: './'
    }
  }
})
