const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const dotenv = require('dotenv').config({ path: __dirname + '/.env' }).parsed;
const TerserPlugin = require('terser-webpack-plugin');
const webpack = require('webpack');

const config = {
  entry: ['./src/index.js'],
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: '/',
  },
  devServer: {
    contentBase: './dist',
    historyApiFallback: true,
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: './public/template.html',
      title: 'Dr. Steam - Evaluate your steam',
      favicon: './public/favicon.ico',
    }),
  ],
  optimization: {
    minimizer: [],
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\.s[ac]ss$/i,
        use: ['style-loader', 'css-loader', 'sass-loader'],
      },
      //   {
      //     test: /\.(png|jpe?g|gif|svg)$/i,
      //     use: [
      //       {
      //         loader: 'file-loader',
      //       },
      //     ],
      //   },
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loaders: ['babel-loader'],
      },
      {
        test: /\.css$/,
        loader: 'style-loader!css-loader',
      },
      {
        test: /\.(png|jpg|gif|svg|eot|ttf|woff|woff2|ico)$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
        },
      },
      {
        test: /\.html$/,
        use: [
          {
            loader: 'html-loader',
          },
        ],
      },
    ],
  },
};

module.exports = (_env, argv) => {
  if (argv.mode === 'production') {
    config.plugins.push(
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify('production'),
        'process.env.REACT_APP_BACKEND_URL': JSON.stringify(dotenv.REACT_APP_BACKEND_URL),
      })
    );
  }

  config.optimization.minimizer.push(
    new TerserPlugin({
      terserOptions: {
        compress: {
          drop_console: argv.mode === 'production' ? true : false,
        },
      },
    })
  );

  return config;
};
