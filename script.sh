#!/bin/bash

npm init -y

function npmInit() {
  echo "npmInit"
  npm install --save-dev gulp gulp-ejs gulp-rename gulp-plumber gulp-autoprefixer \
    gulp-notify gulp-connect gulp-ejs gulp-notify gulp-uglify
}

function sassInit() {
  npm install --save-dev sass fibers gulp-sass
}

function createGulp() {
  touch gulpfile.js

}


function main() {
  echo "main"
  npmInit
  sassInit
}

main 
