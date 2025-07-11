const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = {
  target: 'node',
  mode: 'production',
  entry: './api/index.js', // Nosso ficheiro de entrada
  output: {
    path: path.resolve(__dirname, 'dist'), // Pasta de saída
    filename: 'index.js',
    libraryTarget: 'commonjs2',
  },
  externals: [nodeExternals()], // Exclui node_modules do bundle
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader', // Se você usar Babel, caso contrário, pode remover esta regra
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
    ],
  },
};
