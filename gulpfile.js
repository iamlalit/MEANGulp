var gulp = require('gulp'),
    connect = require('connect'),
    runSequence = require('run-sequence');
    concat = require('gulp-concat'),
    http = require('http'),
    opn = require('opn'),
    watch = require('gulp-watch');
    sass = require('gulp-ruby-sass'),
    imagemin = require('gulp-imagemin'),
    pngquant = require('imagemin-pngquant'),
    autoprefixer = require('gulp-autoprefixer'),
    rimraf = require('rimraf'),
    jshint = require('gulp-jshint'),
    rename = require('gulp-rename'),
    uglify = require('gulp-uglify'),
    notify = require('gulp-notify'),
    cssbeautify = require('gulp-cssbeautify'),
    minifycss = require('gulp-minify-css'),
    useref = require('gulp-useref'),
    gulpif = require('gulp-if'),
    concat = require('gulp-concat'),
    livereload = require('gulp-livereload'),
    config = {
        app: 'app',
        dist: 'dist',
        port: 3000,
        scripts: function () {
            return this.app + '/scripts';
        },
        styles: function () {
            return this.app + '/scss';
        },
        html: function () {
            return this.app + '/*.html';
        },
        lib: function () {
            return 'lib';
        }
    };
config.scripts.apply(config);
config.styles.apply(config);
config.lib.apply(config);
config.html.apply(config);

gulp.task('clean', function(cb) {
    rimraf('/public', cb);
});

gulp.task('sass-lib', function () {
    var dir = config.styles();
    var stream = gulp.src('styles/bootstrap.scss')
        .pipe(sass({ style: 'expanded' }))
        .pipe(gulp.dest('public/stylesheets'))
        .pipe(rename({suffix: '.min'}))
        .pipe(minifycss())
        .pipe(gulp.dest('public/stylesheets'))
        .pipe(notify({ message: 'Styles task complete for bootstrap' }));

    return stream;
});

gulp.task('sass-custom', function () {
    var dir = config.styles();
    var stream = gulp.src('styles/custom.scss')
        .pipe(sass({ style: 'expanded' }))
        .pipe(gulp.dest('public/stylesheets'))
        .pipe(rename({suffix: '.min'}))
        .pipe(minifycss())
        .pipe(gulp.dest('public/stylesheets'))
        .pipe(notify({ message: 'Styles task complete for custom scss' }));

    return stream;
});

gulp.task('watch', function() {
  gulp.watch('styles/**/*.scss', ['sass-custom']);
  gulp.watch('styles/bootstrap.scss', ['sass-lib']);
  gulp.watch('scripts/**/*.js', ['scripts-custom']);
});

gulp.task('scripts-lib', function() {
    var dir = config.scripts();
    var stream = gulp.src([
      'lib/jquery/dist/jquery.js',
      'lib/angularjs/angular.js',
      'lib/bootstrap-sass-official/assets/javascripts/bootstrap.js',
      'lib/bootstrap-sass-official/assets/javascripts/bootstrap/affix.js',
      'lib/bootstrap-sass-official/assets/javascripts/bootstrap/alert.js',
      'lib/bootstrap-sass-official/assets/javascripts/bootstrap/button.js',
      'lib/bootstrap-sass-official/assets/javascripts/bootstrap/carousel.js',
      'lib/bootstrap-sass-official/assets/javascripts/bootstrap/collapse.js',
      'lib/bootstrap-sass-official/assets/javascripts/bootstrap/dropdown.js',
      'lib/bootstrap-sass-official/assets/javascripts/bootstrap/tab.js',
      'lib/bootstrap-sass-official/assets/javascripts/bootstrap/transition.js',
      'lib/bootstrap-sass-official/assets/javascripts/bootstrap/scrollspy.js',
      'lib/bootstrap-sass-official/assets/javascripts/bootstrap/modal.js',
      'lib/bootstrap-sass-official/assets/javascripts/bootstrap/tooltip.js',
      'lib/bootstrap-sass-official/assets/javascripts/bootstrap/popover.js',
           ]
       )
    .pipe(concat('bower.js'))
    .pipe(gulp.dest('public/scripts'))
    .pipe(rename({suffix: '.min'}))
    .pipe(uglify())
    .pipe(gulp.dest('public/scripts'))
    .pipe(notify({ message: 'Scripts task complete for libraries' }));

    return stream;
});

gulp.task('scripts-custom', function() {
    var dir = config.scripts();
    var stream = gulp.src([
      'scripts/app.js',
      'scripts/socialAuth.js'
       ]
     )
    .pipe(concat('app.js'))
    .pipe(gulp.dest('public/scripts'))
    .pipe(rename({suffix: '.min'}))
    .pipe(uglify())
    .pipe(gulp.dest('public/scripts'))
    .pipe(notify({ message: 'Scripts task complete for custom js' }));

    return stream;
});

gulp.task('fonts', function(){
    var stream = gulp.src('lib/bootstrap-sass-official/assets/fonts/bootstrap/*')
        .pipe(gulp.dest('public/fonts/bootstrap/'));
    
    return stream;
});

gulp.task('server', ['build'], function() {

});

gulp.task('build', function(callback) {
  runSequence('clean',
        ['sass-lib', 'sass-custom', 'scripts-lib', 'scripts-custom', 'fonts', 'watch'],
        callback);
});