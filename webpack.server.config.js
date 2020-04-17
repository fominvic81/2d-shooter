const nodeExternals = require('webpack-node-externals');
const path = require('path');

module.exports = {
  target: 'node',
  externals: [nodeExternals()],
  entry: './src/server.js',
  output: {
    path: path.join(__dirname, 'server-dist'),
    filename: 'server.js',
    libraryTarget: 'commonjs2'
  },
};
