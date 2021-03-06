/*
 * Learning Isomorphic Web Application Development
 * Copyright © 2016 Konstantin Tarkus - Tomas Alabes, Packt Publishing
 */

import path from 'path';
import extend from 'extend';

const common = {

  stats: {
    colors: true,
    chunks: false
  },

  // TODO: Figure out how to toggle this on builds...
  mode: 'development',

  module: {
    rules: [
      {
        test: /\.jsx?$/,
        include: [
          path.join(__dirname, '../api'),
          path.join(__dirname, '../components'),
          path.join(__dirname, '../core'),
          path.join(__dirname, '../data'),
          path.join(__dirname, '../routes'),
          path.join(__dirname, '../client.js'),
          path.join(__dirname, '../server.js')
        ],
        loader: 'babel-loader',
        query: {
          presets:[
            '@babel/react'
          ]
        }
      },
      { // Will inject small images and fonts under 10KB into the app bundle
        test: /\.(png|jpg|jpeg|gif|svg|woff|woff2)$/,
        // loader: 'url-loader?limit=10000' <-- Will create randomized image name.
        loader: 'url-loader?limit=10000&name=[path][name].[ext]'
      },
      { // A fairly "normal" way of loading binary files, etc.
        test: /\.(eot|ttf|wav|mp3)$/,
        loader: 'file-loader&name=[path][name].[ext]'
      },
      {
        test: /\.scss$/,
        include: [
          path.join(__dirname, '../components')
        ],
        use: [
          {
            loader: 'style-loader'
          },
          {
            loader: 'css-loader',
            // options: {
            //   modules: true,
            //   localIdentName: '[name]_[local]_[hash:base64:3]'
            // }
            // See: https://github.com/webpack-contrib/css-loader#localidentname
            options: {
              modules: {
                localIdentName: '[name]_[local]_[hash:base64:3]'
              },
            },
          },
          {
            loader: 'postcss-loader',
            options: {
              plugins: (loader) => [
                require('postcss-import')({ root: loader.resourcePath }),
                require('precss')(),
                require('autoprefixer')()
              ]
            }
          }
        ]
      }
    ]
  }

};

const client = extend(true, {}, common, {

  entry: path.join(__dirname, '../client.js'),

  output: {
    publicPath: '/',
    path: path.join(__dirname, '../build/public'),
    filename: 'client.js'
  }

});

const server = extend(true, {}, common, {

  entry: path.join(__dirname, '../server.js'),

  output: {
    path: path.join(__dirname, '../build'),
    filename: 'server.js',
    libraryTarget: 'commonjs2'
  },

  target: 'node',

  node: {
    console: false,
    global: false,
    process: false,
    Buffer: false,
    __filename: false,
    __dirname: false
  },

  externals: /^[a-z][a-z\/\.\-0-9]*$/i

});

// Remove `style-loader` from the server-side bundle configuration (p. 65)
server.module.rules[3].use.splice(0, 1);
server.module.rules[3].use.unshift({
  loader: 'node-style-loader'
});

export default [client, server];
