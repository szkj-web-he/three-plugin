const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: {main: `./src/${process.env.APPLICATION_ENTRY_POINT || 'index'}`},
    mode: 'production',
    output: {
        path: path.join(__dirname, 'dist'),
        filename: '[contenthash].js',
        hashFunction: 'sha256'
    },
    devtool: 'source-map',
    resolve: {
        extensions: ['.tsx', '.ts', '.jsx', '.js'],
        modules: [path.resolve(__dirname, "src"), path.resolve(__dirname, "node_modules")],
        fallback: {
            assert: require.resolve('assert'),
            buffer: require.resolve('buffer'),
            console: require.resolve('console-browserify'),
            constants: require.resolve('constants-browserify'),
            crypto: require.resolve('crypto-browserify'),
            domain: require.resolve('domain-browser'),
            events: require.resolve('events'),
            http: require.resolve('stream-http'),
            https: require.resolve('https-browserify'),
            os: require.resolve('os-browserify/browser'),
            path: require.resolve('path-browserify'),
            punycode: require.resolve('punycode'),
            process: require.resolve('process/browser'),
            querystring: require.resolve('querystring-es3'),
            stream: require.resolve('stream-browserify'),
            string_decoder: require.resolve('string_decoder'),
            sys: require.resolve('util'),
            timers: require.resolve('timers-browserify'),
            tty: require.resolve('tty-browserify'),
            url: require.resolve('url'),
            util: require.resolve('util'),
            vm: require.resolve('vm-browserify'),
            zlib: require.resolve('browserify-zlib')
        }
    },
    optimization: {
        splitChunks: {
            chunks: 'all',
            filename: '[contenthash].js'
        },
    },
    module: {
        rules: [
            {
                test: /(assets\/raw)/i,
                type: 'asset/source',
            },
            {
                test: /\.jsx?$/i,
                exclude: /node_modules/,
                use: ['babel-loader', 'thread-loader'],
            },
            {
                test: /\.tsx?$/i,
                use: [
                    {
                        loader: 'ts-loader',
                        options: {
                            transpileOnly: true,
                        },
                    },
                    'thread-loader'
                ],
            },
            {
                test: /\.css$/i,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader'
                ]
            },
            {
                test: /\.s[ac]ss$/i,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                    'sass-loader'
                ]
            },
            {
                test: /\.ya?ml$/i,
                type: 'json',
                use: 'yaml-loader'
            },
            {
                test: /\.svg$/i,
                use: 'svg-inline-loader'
            },
            {
                test: /\.(gif|png|jpe?g|webp)$/i,
                type: 'asset'
            },
            {
                test: /\.(obj|mtl|stl)$/i,
                type: 'asset/resource'
            }
        ]
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: '[contenthash].css',
        }),
        new HtmlWebpackPlugin({
            title: 'Plugin',
            filename: 'index.html',
        })
    ]
};
