const CopyWebpackPlugin = require('copy-webpack-plugin');
let terser = require('terser');
const VueLoaderPlugin = require('vue-loader/lib/plugin');

module.exports = {
  mode: 'production',
  entry: './src/index.ts',
  output: {
    path: __dirname + '/dist',
    filename: 'bundle.js'
  },
  resolve: {
    extensions: ['.ts', '.js', '.json']
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: "awesome-typescript-loader"
      },
      {
        test: /\.css$/,
        use: [
          { loader: 'style-loader' },
          {
            loader: 'css-loader',
            options: {
              url: false
            }
          }
        ]
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      },
    ]
  },
  node: {
    fs: 'empty'
  },
  plugins: [
    new CopyWebpackPlugin([
      {
        from: 'static',
        to: '.'
      },
      {
        from: 'node_modules/webextension-polyfill/dist/browser-polyfill.js',
        to: '.',
        transform: fileContent => terser.minify(fileContent.toString()).code.toString()
      }
    ]),
    new VueLoaderPlugin()
  ],
  performance: {
    hints: false
  }
}
