const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
	entry: path.resolve(__dirname, 'src/index.js'),
	output: {
		filename: 'bundle.js',
		path: path.resolve(__dirname, '../be/dist/Javascript')
	},
	module: {
		rules:[
			{
				test: /\.js$/,
	      exclude: /(node_modules)/,
	      use: {
	        loader: 'babel-loader',
	        options: {
	        	presets: ['react', 'es2015', 'stage-0'],
	        	plugins: [
	        		['import', { libraryName: 'antd', style:'css' }]
	        	]
	        }
	      }
			},
			{
				test: /\.css$/,
				use: [ 'style-loader', 'css-loader']
			}
		]
	}
}