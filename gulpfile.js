const gulp = require('gulp');
const args = require('yargs').argv;
const browserSync = require('browser-sync');
const config = require('./gulp.config')();
const del = require('del');
const $ = require('gulp-load-plugins')({lazy: true});
const env = require('node-env-file');

env(`${__dirname}/.env`);

gulp.task('help', $.taskListing);
gulp.task('default', ['help']);

gulp.task('vet', function() {
    log('Analyzing source with JSHint and JSCS');

    return gulp
        .src(config.alljs)
        .pipe($.if(args.verbose, $.print()))
        .pipe($.jscs())
        .pipe($.jshint())
        .pipe($.jshint.reporter('jshint-stylish', {verbose: true}))
        .pipe($.jshint.reporter('fail'));
});

gulp.task('clean-tmp', function(done) {
    const files = config.tmp;
    clean(files, done);
});

gulp.task('clean', function(done) {
    const delconfig = [].concat(config.dist, config.tmp);
    log('Cleaning ' + $.util.colors.blue(delconfig));
    del(delconfig, done);
});

gulp.task('clean-all', function(done) {
    const delconfig = config.allToClean;
    log('Cleaning ' + $.util.colors.blue(delconfig));
    clean(delconfig, done);
});

gulp.task('jade-docs', function() {
    log('Compiling docs jade --> html');

    const options = {
        pretty: false
    }

    return gulp
        .src(config.docsJade)
        .pipe($.plumber({errorHandler: swallowError}))
        .pipe($.jade(options))
        .pipe(gulp.dest(config.docs));
});

gulp.task('less', function() {
    log('Compiling Less --> CSS');

    return gulp
        .src(config.less)
        .pipe($.plumber({errorHandler: swallowError}))
        .pipe($.less())
        .pipe($.autoprefixer())
        .pipe(gulp.dest(config.tmp));
});

gulp.task('less-watcher', function() {
    gulp.watch([config.less], {interval: 500}, ['less']);
});

gulp.task('sass', function() {
    log('Compiling Sass --> CSS');

    const sassOptions = {
        outputStyle: 'nested' // nested, expanded, compact, compressed
    };

    return gulp
        .src(config.sass)
        .pipe($.plumber({errorHandler: swallowError}))
        .pipe($.sourcemaps.init())
        .pipe($.sass(sassOptions))
        .pipe($.autoprefixer())
        .pipe($.sourcemaps.write())
        .pipe(gulp.dest(config.tmp + '/styles'));
});

gulp.task('sass-min', function() {
    log('Compiling Sass --> minified CSS');

    const sassOptions = {
        outputStyle: 'compressed' // nested, expanded, compact, compressed
    };

    return gulp
        .src(config.sass)
        .pipe($.plumber({errorHandler: swallowError}))
        .pipe($.sass(sassOptions))
        .pipe($.autoprefixer())
        .pipe(gulp.dest(config.tmp + '/styles'));    
})

gulp.task('sass-watcher', function() {
    gulp.watch([config.sass], {interval: 500}, ['sass']);
});

gulp.task('inject', function() {
    log('Injecting custom scripts to index.html');

    return gulp
        .src(config.index)
        .pipe( $.inject(gulp.src(config.js), {relative: true}) )
        .pipe(gulp.dest(config.client));
});

gulp.task('copy', function() {
    log('Copying assets');

    const assets = [].concat(config.assetsLazyLoad, config.assetsToCopy);

    return gulp
        .src(assets, {base: config.client})
        .pipe(gulp.dest(config.dist + '/'));
});

gulp.task('optimize', ['inject', 'sass-min'], function() {
    log('Optimizing the js, css, html');

    const jsFilter = $.filter('client/scripts/*.js', { restore: true });
    const indexHtmlFilter = $.filter(['client/scripts/*.js', 'client/styles/*.css', '!**/index.html'], { restore: true });

    return gulp
        .src(config.index)
        .pipe($.plumber({errorHandler: swallowError}))
        .pipe($.useref())
        .pipe(jsFilter)
        .pipe($.if('scripts/app.js', $.uglify()))
        .pipe($.replace(/http:\/\/localhost:8080\/api\//g, process.env.API_BASE))
        .pipe(jsFilter.restore)
        .pipe($.replace(/\.html(?=[\'\"])/g, '.html?v=' + (new Date()).getTime()))
        .pipe($.replace(/\.json(?=[\'\"])/g, '.json?v=' + (new Date()).getTime()))
        .pipe(indexHtmlFilter)
        .pipe($.rev())                // Rename the concatenated files (but not index.html)
        .pipe(indexHtmlFilter.restore)
        .pipe($.revReplace())         // Substitute in new filenames
        .pipe(gulp.dest( config.dist ));

});


gulp.task('serve', ['inject', 'sass'], function() {
    startBrowserSync('serve');
});

gulp.task('build', ['optimize', 'copy'], function() {
    
})

gulp.task('serve-dist', function() {
    startBrowserSync('dist');
})

gulp.task('serve-docs', ['jade-docs'], function() {
    startBrowserSync('docs');
})



function clean(path, done) {
    log('Cleaning: ' + $.util.colors.blue(path));
    del(path, done);
}

function log(msg) {
    if (typeof(msg) === 'object') {
        for (const item in msg) {
            if (msg.hasOwnProperty(item)) {
                $.util.log($.util.colors.green(msg[item]));
            }
        }
    } else {
        $.util.log($.util.colors.green(msg));
    }
}

function swallowError (error) {
    // If you want details of the error in the console
    console.log(error.toString());

    this.emit('end');
}

function startBrowserSync(opt) {
    if (args.nosync || browserSync.active) {
        return;
    }

    let options = {
        port: 3000,
        ghostMode: {
            clicks: false,
            location: false,
            forms: false,
            scroll: true
        },
        injectChanges: true,
        logFileChanges: true,
        logLevel: 'debug',
        logPrefix: 'gulp-patterns',
        notify: true,
        reloadDelay: 0, //1000,
        online: false
    };

    switch(opt) {
        case 'dist':
            log('Serving dist app');
            serveDistApp();
            break;
        case 'docs':
            log('Serving docs');
            serveDocs();
            break;
        default:
            log('Serving app');
            serveApp();
            break;
    }

    function serveApp() {
        gulp.watch([config.sass], {interval: 500}, ['sass']);

        options.server = {
            baseDir: [
                config.client,
                config.tmp
            ]
        };
        options.files = [
            config.client + '/**/*.*',
            '!' + config.sass,
            config.tmp + '/**/*.css'
        ];
        options.open = false;

        browserSync(options);
    }

    function serveDistApp() {
        options.server = {
            baseDir: [
                config.dist
            ]
        };
        options.files = [];
        options.open = false;

        browserSync(options);
    }

    function serveDocs() {
        gulp.watch([config.docsJade], {interval: 500}, ['jade-docs']);

        options.server = {
            baseDir: [
                config.docs
            ]
        }

        options.files = [
            config.docs + '/index.html',
            '!' + config.jade
        ];

        browserSync(options);
    }

}


