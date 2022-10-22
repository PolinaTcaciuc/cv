const {src,dest,watch,parallel,series} = require('gulp');
const fileinclude = require('gulp-file-include');
const sourcemaps = require('gulp-sourcemaps');
const concat = require('gulp-concat');
const browserSync = require('browser-sync').create();
const svgSprite = require('gulp-svg-sprite');
// const ttf2woff2 = require('gulp-ttf2woff2');
const webpack = require('webpack');
const uglify = require('gulp-uglify-es').default;
const autoprefixer = require('gulp-autoprefixer');
const webpackStream = require('webpack-stream');
const notify = require('gulp-notify');
const imagemin = require('gulp-imagemin');
const del = require('del');
const htmlmin = require('gulp-htmlmin');
const gulp = require('gulp');
const scss = require('gulp-sass')(require('sass'));


const styles = () => {
	return src('./src/style/**/*.scss')
		 .pipe(sourcemaps.init())
		.pipe(scss({
			outputStyle: 'compressed'
		}))
		.pipe(concat('style.min.css'))
		.pipe(autoprefixer({
			cascade: false,
		}))
		.pipe(sourcemaps.write('.'))
		.pipe(dest('./dist/css'))
		.pipe(browserSync.stream());
}


const htmlInclude = () => {
	return src(['./src/**/*.html'])
		.pipe(fileinclude({
			prefix: '@',
			basepath: '@file'
		}))
		.pipe(dest('./dist'))
		.pipe(browserSync.stream());
}

const imgagesDev = () => {
	return src(['./src/images/**/*.jpg', './src/images/**/*.png', './src/images/**/*.jpeg', './src/images/**/*.jpeg','./src/images/**/*.svg','!./src/images/icons/*.svg'])
		.pipe(dest('./dist/images'))
}

const svgSprites = () => {
	return src('./src/images/icons/**/*.svg',)
		.pipe(svgSprite({
			mode: {
				stack: {
					sprite: "../sprite.svg"
				}
			}
		}))
		.pipe(dest('./dist/images'))
}

const fonts = () => {

	return src('./src/fonts/**.woff')
		.pipe(dest('./dist/fonts/'))
}



function imagesCompress() {
	return src('dist/images/**/*')
		.pipe(imagemin([
			imagemin.gifsicle({
				interlaced: true
			}),
			imagemin.mozjpeg({
				quality: 75,
				progressive: true
			}),
			imagemin.optipng({
				optimizationLevel: 5
			}),
			imagemin.svgo({
				plugins: [{
						removeViewBox: true
					},
					{
						cleanupIDs: false
					}
				]
			})
		]))
		.pipe(dest('dist/images'))
}

const scripts = () => {
	return src('./src/js/script.js')
		.pipe(webpackStream({
			mode: 'development',
			output: {
				filename: 'main.js',
			},
			module: {
				rules: [{
					test: /\.m?js$/,
					exclude: /(node_modules|bower_components)/,
					use: {
						loader: 'babel-loader',
						options: {
							presets: ['@babel/preset-env']
						}
					}
				}]
			},
		}))
		.on('error', function (err) {
			console.error('WEBPACK ERROR', err);
			this.emit('end');
		})

		.pipe(sourcemaps.init())
		.pipe(uglify().on("error", notify.onError()))
		.pipe(sourcemaps.write('.'))
		.pipe(dest('./dist/js'))
		.pipe(browserSync.stream());
}

const watching = () => {
	browserSync.init({
		server: {
			baseDir: "dist/"
		}
	});
	watch('./src/style/**/*.scss', styles);
	watch('./src/**/*.html', htmlInclude);
	watch('./src/images/**/*.jpg', imgagesDev);
	watch('./src/images/**/*.png', imgagesDev);
	watch('./src/fonts/**.woff', fonts);
	watch('./src/images/**/*.jpeg', imgagesDev);
	watch('./src/js/**/*.js', scripts);
    watch('./src/images/**/*.svg', svgSprites);
}

function cleanDist() {
	return del('dist')
}

const scriptsBuild = () => {
	return src('./src/js/script.js')
		.pipe(webpackStream({
			mode: 'development',
			output: {
				filename: 'main.js',
			},
			module: {
				rules: [{
					test: /\.m?js$/,
					exclude: /(node_modules|bower_components)/,
					use: {
						loader: 'babel-loader',
						options: {
							presets: ['@babel/preset-env']
						}
					}
				}]
			},
		}))
		.on('error', function (err) {
			console.error('WEBPACK ERROR', err);
			this.emit('end');
		})
		.pipe(uglify().on("error", notify.onError()))
		.pipe(dest('./dist/js'))
}

function html() {
	return src('src/**/*.html')
		.pipe(htmlmin({
			collapseWhitespace: true,
		}))
		.pipe(dest('dist'))
		.pipe(browserSync.stream())
}



exports.styles = styles;
exports.watching = watching;
exports.fileinclude = htmlInclude;
exports.default = series(cleanDist,fonts,imgagesDev ,svgSprites,htmlInclude,scripts,styles,watching);
exports.build = series(cleanDist, parallel(htmlInclude, html,scriptsBuild, fonts, imgagesDev), styles, imagesCompress);
