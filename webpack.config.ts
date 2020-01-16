import webpack from 'webpack';
import { VueLoaderPlugin } from 'vue-loader';
import CopyWebpackPlugin from 'copy-webpack-plugin';

const config: webpack.Configuration = {
  mode: 'production',
  entry: {
    index: './src/index.ts',
    panel: './src/panel.ts'
  },
  output: {
    path: `${__dirname}/dist`,
    filename: '[name].js'
  },
  resolve: {
    extensions: ['.ts', '.js', '.json']
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: 'awesome-typescript-loader'
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
      }
    ]),
    new VueLoaderPlugin()
  ],
  performance: {
    hints: false
  }
};

export default config;