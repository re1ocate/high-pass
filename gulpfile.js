const { src, dest, series, watch} = require('gulp');
const concat = require('gulp-concat');
const htmlMin = require('gulp-htmlmin');
const autoprefixes = require('gulp-autoprefixer');
const cleanCSS = require('gulp-clean-css');
const svgSprite = require('gulp-svg-sprite');
const image = require("gulp-imagemin");
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const gulpIf = require('gulp-if');
const pug = require('gulp-pug');
const inject = require('gulp-inject');
const sass = require('gulp-sass')(require('sass'));
const sourcemaps = require('gulp-sourcemaps');
const del = require('del');
const browserSync = require('browser-sync').create();

let isProduction = false;

const setProd = (done) => {
  isProduction = true;
  done()
}

const setDev = (done) => {
  isProduction = false;
  done()
}


const clean = () => {
  return del(['dist'])
}

const styles = () => {
  return src('src/styles/*.scss')
    .pipe(gulpIf(!isProduction, sourcemaps.init()))
    .pipe(sass().on('error', sass.logError))
    .pipe(concat('main.css'))
    .pipe(autoprefixes({
      cascade: false
    }))
    .pipe(gulpIf(isProduction, cleanCSS({
      level: 2
    }), cleanCSS({
      format: 'beautify',
      level: 2
    })))
    .pipe(gulpIf(!isProduction, sourcemaps.write()))
    .pipe(dest('dist'))
    .pipe(browserSync.stream())
}

const htmlMinify = () => {
  return src('src/*.pug')
    .pipe(pug({
      pretty: true
    }))
    .pipe(gulpIf(isProduction, htmlMin({
      collapseWhitespace: true,
    })))
    .pipe(dest('dist'))
    .pipe(browserSync.stream())
}

const svgSprites = () => {
  return src('src/img/svg/**/*.svg')
  .pipe(svgSprite({
    mode: {
      stack: {
        sprite: '../sprite.svg'
      }
    }
  }))
  .pipe(dest('dist/images'))
}


const images = () => {
  return src([
    'src/img/**/*.jpg',
    'src/img/**/*.png',
    'src/img/**/*.jpeg',
    'src/img/*.svg',
    'src/img/**/*.webp',
  ], {
    encoding: false
  })
  .pipe(image())
  .pipe(dest('dist/images'))
}

const fonts = () => {
  return src('src/fonts/*.{woff,woff2,ttf,otf,eot}',
    {encoding: false}
  )
  .pipe(dest('dist/fonts'));
}



const watchFiles = () => {
  browserSync.init({
    server: {
      baseDir: 'dist'
    }
  })
}
watch('src/fonts/*.ttf', fonts)
watch('src/**/*.pug', htmlMinify);
watch('src/styles/**/*.scss', styles)
watch('src/images/svg/**/*.svg', svgSprites);
watch('src/images/*.png', images);

exports.clean = clean;
exports.styles = styles;
exports.htmlMinify = htmlMinify;
exports.dev = series(setDev, clean, htmlMinify, svgSprites, styles, fonts, images, watchFiles);
exports.prod = series(setProd, clean, htmlMinify, svgSprites, styles, fonts, images);
