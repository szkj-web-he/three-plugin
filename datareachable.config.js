module.exports = {
    module: {
        rules: [
            {
                test: /\.(stl|obj|mtl)$/,
                type: 'asset/resource',
            },
        ],
    },
};
