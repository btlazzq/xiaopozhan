const CompressionPlugin = require('compression-webpack-plugin');
const path = require("path");
function resolve(dir) {
    return path.join(__dirname, dir)
}
module.exports = {

    chainWebpack: (config) => {
        config.plugin('define').tap((definitions) => {
            Object.assign(definitions[0], {
                __VUE_OPTIONS_API__: 'true',
                __VUE_PROD_DEVTOOLS__: 'false',
                __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'false'
            })
            return definitions
        })
    },
    devServer: {
        webSocketServer: false,
        host: '0.0.0.0',
        port: 80,
        open: true,
        proxy: {
            // detail: https://cli.vuejs.org/config/#devserver-proxy
            '/api': {
                target: 'http://localhost:3002',
                changeOrigin: true
            },
            '/uploads': {
                target: 'http://localhost:3002',
                changeOrigin: true
            }
        },
        allowedHosts: "all",
        client: {
            overlay: {
                warnings: false,
                errors: false
            }
        },
    },
    configureWebpack: {
        name: "poxiaozhan",
        resolve: {
            alias: {
                '@': resolve('src')
            }
        },
        plugins: [

            // http://doc.ruoyi.vip/ruoyi-vue/other/faq.html#使用gzip解压缩静态文件
            new CompressionPlugin({
                test: /\.(js|css|html|jpe?g|png|gif|svg)?$/i,  // 压缩文件格式
                filename: '[path][base].gz[query]',            // 压缩后的文件名
                algorithm: 'gzip',                             // 使用gzip压缩
                minRatio: 0.8,                                 // 压缩比例，小于 80% 的文件不会被压缩
                deleteOriginalAssets: false                    // 压缩后删除原文件
            })
        ],
    },

}
