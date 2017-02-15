const project = require('./project.config');
const _ = require('lodash');
const webpack = require('webpack');

const webpackConfig = {
    name: 'client',
    target: 'web',
    devtool: false,
    resolve: {
        modules: [
            project.paths.client(),
            'node_modules'
        ]
    },
    module: {}
};

// ------------------------------------
// Output
// ------------------------------------
webpackConfig.entry = project.paths.client('index.js');

// ------------------------------------
// Output
// ------------------------------------
webpackConfig.output = {
    filename: `index.js`,
    path: project.paths.dist(),
    publicPath: '/'
};

// ------------------------------------
// Plugins
// ------------------------------------
webpackConfig.plugins = [
    new webpack.optimize.UglifyJsPlugin({
        compress: {
            unused: true,
            dead_code: true,
            warnings: false
        }
    })
];

// ------------------------------------
// Loaders
// ------------------------------------
// JavaScript / JSON
webpackConfig.module.rules = [
    {
        test    : /\.(js|jsx)$/,
        exclude : /node_modules/,
        use : [
            {
                loader: 'babel-loader',
                options: {
                    cacheDirectory: true,
                    plugins: ['transform-runtime'],
                    presets: ['es2015']
                }
            }
        ]
    }
];

module.exports = webpackConfig;
