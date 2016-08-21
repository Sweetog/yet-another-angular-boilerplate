var gulp = require('gulp'),
    sass = require('gulp-sass'),
    browserify = require('gulp-browserify'),
    browserSync = require('browser-sync'),
    autoprefixer = require('gulp-autoprefixer'),
    jshint = require('gulp-jshint'), //js linter
    header  = require('gulp-header'),
    rename = require('gulp-rename'),
    cssnano = require('gulp-cssnano'), //css minify 
    sourcemaps = require('gulp-sourcemaps'),
    package = require('./package.json'),
    config = require('./gulp.config.json'),
    plugins = require('gulp-load-plugins')(),
    gutil = require('gulp-util'),
    glob = require('glob'),
    plato = require('plato'), //js analyzer 
    merge = require('merge-stream'),
    runSequence = require('run-sequence'),
    del = require('del');

var log = plugins.util.log;
var colors = plugins.util.colors;

var banner = [
  '/*!\n' +
  ' * <%= package.name %>\n' +
  ' * <%= package.title %>\n' +
  ' * <%= package.url %>\n' +
  ' * @author <%= package.author %>\n' +
  ' * @version <%= package.version %>\n' +
  ' * Copyright ' + new Date().getFullYear() + '. <%= package.license %> licensed.\n' +
  ' */',
  '\n'
].join('');


gulp.task('html', function(){
	var dest = config.dev + 'app';

	log('copying templates/html to ' + dest);

  	gulp.src(config.client + 'app/**/*.html')
		.pipe(gulp.dest(dest))
        .pipe(browserSync.reload({stream:true}));
});

/////////////////////////////////////////////////////////////////////////////////////
//
// Create $templateCache from the html templates
// @return {Stream}
//
/////////////////////////////////////////////////////////////////////////////////////
gulp.task('build-templatecache', function() {
    log('Creating an AngularJS $templateCache');

    return gulp
        .src(config.htmltemplates)
        .pipe(plugins.bytediff.start())
        .pipe(plugins.htmlmin({
            empty: true
        }))
        .pipe(plugins.bytediff.stop(bytediffFormatter))
        .pipe(plugins.angularTemplatecache(config.templates, {
            module: 'app.core',
            standalone: false,
            root: 'app/'
        }))
        .pipe(gulp.dest(config.build));
});

gulp.task('css', ['vendorcss'], function () {
	var dest = config.dev + 'app/css';

	log('Compiling SASS and source mapping to ' + dest);

    return gulp.src(config.css)
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer('last 2 version'))
    //.pipe(cssnano())
    //.pipe(rename({ suffix: '.min' }))
    //.pipe(header(banner, { package : package }))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(dest))
    .pipe(browserSync.reload({stream:true}));
});

gulp.task('vendorcss', function () {
    var dest = config.dev + 'app/vendorcss';

    log('Compiling Vendor SASS and source mapping to ' + dest);

    return gulp.src(config.vendorcss)
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    //.pipe(autoprefixer('last 2 version'))
    //.pipe(cssnano())
    //.pipe(rename({ suffix: '.min' }))
    //.pipe(header(banner, { package : package }))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(dest));
});

gulp.task('build-css', ['build-vendorcss'], function () {
    return gulp.src(config.css)
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer('last 2 versions'))
        .pipe(cssnano()) //minify
        .pipe(rename({ suffix: '.min' }))
        .pipe(header(banner, { package : package }))
        .pipe(gulp.dest(config.build)) //save min.css
});

gulp.task('build-vendorcss', function () {
    var dest = config.build;

    log('Compiling Vendor SASS ' + dest);

    return gulp.src(config.vendorcss)
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer('last 2 versions'))
        .pipe(cssnano()) //minify
        .pipe(rename({ basename: 'vendor', suffix: '.min' }))
        .pipe(header(banner, { package : package }))
        .pipe(gulp.dest(dest)); //save min.css
});


gulp.task('build-js', ['build-templatecache'], function(){
    log('Bundling, minifying');

    var source = [].concat(config.build + '*.js');

    return gulp.src(source)
        .pipe(plugins.modernizr())
        .pipe(plugins.concat(config.buildjs))
        .pipe(plugins.ngAnnotate({
    	        add: true,
    	        single_quotes: true
    	 }))
        .pipe(plugins.bytediff.start())
    	.pipe(plugins.uglify({
    	        mangle: true
    	}))
    	.pipe(plugins.bytediff.stop(bytediffFormatter))
        .pipe(header(banner, { package : package }))
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest(config.build));  //save .min.js
});

// Browserify task
gulp.task('browserify', function() {

    log('Reading the app\'s JavaScript and bundling dependencies to one file ' + config.browserified);

    // Single point of entry (make sure not to src ALL your files, browserify will figure it out for you)
    return gulp.src(config.client + 'app/app.js')
            .pipe(browserify({
                //insertGlobals: true,
                debug: true
            }))
            // Bundle to a single file
            //.pipe(plugins.concat(config.browserified))
            .pipe(sourcemaps.init({loadMaps: true}))
            .pipe(plugins.ngAnnotate({
                add: true,
                single_quotes: true
            }))
            .pipe(rename(config.browserified))
            .pipe(sourcemaps.write('./'))
            // Output it to our dist folder
            .pipe(gulp.dest(config.dev + 'app'))
            .pipe(browserSync.reload({stream:true, once: true}));

});

// Browserify task
gulp.task('build-browserify', ['analyze', 'build-templatecache'], function() {

    log('Reading the app\'s JavaScript and bundling dependencies to one file ' + config.browserified);

    // Single point of entry (make sure not to src ALL your files, browserify will figure it out for you)
    return gulp.src(config.client + 'app/app.js')
        .pipe(browserify({
            //insertGlobals: true,
            debug: false
        }))
        // Bundle to a single file
        //.pipe(plugins.concat(config.browserified))
        .pipe(rename(config.browserified))
        // Output it to our dist folder
        .pipe(gulp.dest(config.build));
});

//['js', 'css']
gulp.task('index', function () {
	var dest = config.dev;

	log('Copying and injecting index.html to ' + dest);

    var target = gulp.src(config.client + config.index);
     // It's not necessary to read the files (will speed up things), we're only after their config: 
    var sourcesCss = gulp.src(config.dev + 'app/css/**/*.css',  {read: false});
    var vendorCss = gulp.src(config.dev + 'app/vendorcss/**/*.css',  {read: false});
    var sources = gulp.src(config.dev + 'app/*.js');

 	var options = {
         addRootSlash: false,
         ignorePath: config.dev.substring(1)
    };
    var optionsVendor = {
         addRootSlash: false,
         ignorePath: [config.dev.substring(1)],
         name: 'inject-vendor'
    };

    return target
    	.pipe(plugins.inject(sources, options))
        .pipe(plugins.inject(vendorCss, optionsVendor))
        .pipe(plugins.inject(sourcesCss, options))
        .pipe(gulp.dest(dest))
        .pipe(browserSync.reload({stream:true, once: true}));
});

gulp.task('build-index', function () {
    var dest = config.build;

    log('Copying and injecting index.html to ' + dest);

    var target = gulp.src(config.client + config.index);
    // It's not necessary to read the files (will speed up things), we're only after their config: 
    var sources = gulp.src([config.build + '**/*.js', config.build + '**/*.css' , '!' + config.build + config.vendorcssmin], {read: false});
    var vendorCss = gulp.src(config.build + config.vendorcssmin,  {read: false});
 
    var injectOptions = {
         addRootSlash: false,
         ignorePath: config.build.substring(1)
    };
    var optionsVendor = {
         addRootSlash: false,
         ignorePath: config.build.substring(1),
         name: 'inject-vendor'
    };

    return target
        .pipe(plugins.inject(sources, injectOptions))
        .pipe(plugins.inject(vendorCss, optionsVendor))
        .pipe(gulp.dest(dest));
});

/////////////////////////////////////////////////////////////////////////////////////
//
// Inject all the files into the new index.html
// rev, but no map
// @return {Stream}
//
/////////////////////////////////////////////////////////////////////////////////////
gulp.task('build-rev', function() {
    log('Rev\'ing files and adding revs to index.html');

    var minified = config.build + '**/*.min.*';
    var index = config.build + config.index;
    var minFilter = plugins.filter(['**/*.min.*', '!**/*.map'], {restore: true});

    var stream = gulp
        // Write the revisioned files
        .src([].concat(minified, index)) // add all built min files and index.html
        .pipe(minFilter) // filter the stream to minified css and js
        .pipe(plugins.rev()) // create files with rev's
        .pipe(minFilter.restore) // remove filter, back to original stream

        // replace the files referenced in index.html with the rev'd files
        .pipe(plugins.revReplace()) // Substitute in new filenames
        .pipe(gulp.dest(config.build)) // write index.html changes and the rev files
        .pipe(plugins.revDeleteOriginal())
        .pipe(plugins.rev.manifest()) // create the manifest (must happen last or we screw up the injection)
        .pipe(gulp.dest(config.build)); // write the manifest
});

/////////////////////////////////////////////////////////////////////////////////////
//
// browser-sync to run dev/localhost
//
/////////////////////////////////////////////////////////////////////////////////////
gulp.task('browser-sync', function() {
	if(browserSync.active) {
		return;
	}

	log('Starting BrowserSync on port 3000');

	browserSync({
		server: {
		    baseDir: config.dev
		},
		port: 3000,
		files: [config.client + '/**/*.*'],
		ghostMode: { // these are the defaults t,f,t,t
		    clicks: true,
		    location: false,
		    forms: true,
		    scroll: true
		},
		//logLevel: 'debug',
		//logPrefix: 'gulp-patterns',
		notify: true
		//reloadDelay: 2000
	});
});

gulp.task('bs-reload', function () {
    browserSync.reload();
});


/////////////////////////////////////////////////////////////////////////////////////
//
// Lint the code, create coverage report, and a visualizer
// @return {Stream}
//
/////////////////////////////////////////////////////////////////////////////////////
gulp.task('analyze', function() {
    log('Analyzing source with JSHint, JSCS, and Plato');

    var jshint = analyzejshint(config.js);
    var jscs = analyzejscs(config.js);

    startPlatoVisualizer();

    return merge(jshint, jscs);
});

/////////////////////////////////////////////////////////////////////////////////////
//
// Delete ./build, ./dev, ./report
// @return {Stream}
/////////////////////////////////////////////////////////////////////////////////////
gulp.task('clean', function() {
    log('Cleaning: ' + colors.blue(config.build) + ' & ' + colors.blue(config.report) + ' & ' + colors.blue(config.dev));

    var delPaths = [].concat(config.build, config.report, config.dev);

    return del(delPaths);
});

/////////////////////////////////////////////////////////////////////////////////////
//
// Delete original copied to ./Build files, before bundled, minified etc.
// @return {Stream}
/////////////////////////////////////////////////////////////////////////////////////
gulp.task('build-js-tidy', function() {
    var pathBrowserified = config.build + config.browserified;
    var pathTemplates = config.build + config.templates;

    log('Cleaning: ' + colors.blue(pathBrowserified) + ' & ' + colors.blue(pathTemplates));

    var delPaths = [].concat(pathBrowserified, pathTemplates);
    
    return del(delPaths);
});



/////////////////////////////////////////////////////////////////////////////////////
//
// Big Gulps
//
/////////////////////////////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////////////////////////////
//
// This will run in this order:
// * clean
// * 'css', 'js', 'html' in parallel
// * index
// * browser-sync
// * Finally, onDevComplete()
//
/////////////////////////////////////////////////////////////////////////////////////
gulp.task('dev', function () {
	runSequence(
        'clean',
		['css', 'browserify', 'html'],
        'index',
        'browser-sync',
        onDevComplete
    );

    gulp.watch(config.client + "**/*.scss", ['css']);
    gulp.watch(config.client + "**/*.js", ['browserify']);
    gulp.watch(config.client + "app/**/*.html", ['html']);
    gulp.watch(config.client + "*.html", ['index']);
});

/////////////////////////////////////////////////////////////////////////////////////
//
// Test dev build without running browser-sync
// More of a debugging big-gulp, can be deleted
//
/////////////////////////////////////////////////////////////////////////////////////
gulp.task('dev-test', function () {
    runSequence(
        'clean',
        ['css', 'browserify', 'html'],
        'index',
        function(){
            gulp
                .src('')
                .pipe(plugins.notify({
                    onLast: true,
                    message: 'Dev test complete!'
                })
            );
        }
    );
});

/////////////////////////////////////////////////////////////////////////////////////
//
// This will run in this order: 
// * clean
// * build-browserify and build-css in parallel
// * build-js
// * build-index
// * build-js-tidy
// * rev
// * tidy
// * Finally, onBuildComplete()
//
/////////////////////////////////////////////////////////////////////////////////////
gulp.task('build', function() {
    runSequence(
        'clean',
        ['build-browserify', 'build-css'],
        'build-js',
        'build-js-tidy',
        'build-index',
        'build-rev',
        onBuildComplete
    );
});

/////////////////////////////// END - Big Gulps//////////////////////////////////////


/////////////////////////////////////////////////////////////////////////////////////
//
// Called after 'gulp build' complete
// @return {Stream}
//
/////////////////////////////////////////////////////////////////////////////////////
function onDevComplete() {
    return gulp
        .src('')
        .pipe(plugins.notify({
                onLast: false,
                message: 'Dev running!'
            })
        );
}


/////////////////////////////////////////////////////////////////////////////////////
//
// Called after 'gulp build' complete
// @return {Stream}
//
/////////////////////////////////////////////////////////////////////////////////////
function onBuildComplete() {
    return gulp
        .src('')
        .pipe(plugins.notify({
                onLast: true,
                message: 'Deployed code!'
            })
        );
}


/////////////////////////////////////////////////////////////////////////////////////
//
// Execute JSHint on given source files
// @param  {Array} sources
// @param  {String} overrideRcFile
// @return {Stream}
//
/////////////////////////////////////////////////////////////////////////////////////
function analyzejshint(sources, overrideRcFile) {
    var jshintrcFile = overrideRcFile || './.jshintrc';
    log('Running JSHint');
    log(sources);
    return gulp
        .src(sources)
        .pipe(plugins.jshint(jshintrcFile))
        .pipe(plugins.jshint.reporter('jshint-stylish'));
}

/////////////////////////////////////////////////////////////////////////////////////
//
// Execute JSCS on given source files
// @param  {Array} sources
// @return {Stream}
//
/////////////////////////////////////////////////////////////////////////////////////
function analyzejscs(sources) {
    log('Running JSCS');
    return gulp
        .src(sources)
        .pipe(plugins.jscs('./.jscsrc'));
}

/////////////////////////////////////////////////////////////////////////////////////
//
// Start Plato inspector and visualizer
//
/////////////////////////////////////////////////////////////////////////////////////
function startPlatoVisualizer() {
    log('Running Plato');

    var files = glob.sync('./src/client/app/**/*.js'); //cannot use config.js
    //var excludeFiles = /\/src\/client\/app\/.*\.spec\.js/;

    var options = {
        title: 'Plato Inspections Report'
        //exclude: excludeFiles
    };

    var outputDir = './report/plato';

    plato.inspect(files, outputDir, options, platoCompleted);

    function platoCompleted(report) {
        var overview = plato.getOverviewReport(report);
        log(overview.summary);
    }
}

/////////////////////////////////////////////////////////////////////////////////////
//
// Formatter for bytediff to display the size changes after processing
// @param  {Object} data - byte data
// @return {String}      Difference in bytes, formatted
//
/////////////////////////////////////////////////////////////////////////////////////
function bytediffFormatter(data) {
    var difference = (data.savings > 0) ? ' smaller.' : ' larger.';
    return data.fileName + ' went from ' +
        (data.startSize / 1000).toFixed(2) + ' kB to ' + (data.endSize / 1000).toFixed(2) + ' kB' +
        ' and is ' + formatPercent(1 - data.percent, 2) + '%' + difference;
}

/////////////////////////////////////////////////////////////////////////////////////
//
// Format a number as a percentage
// @param  {Number} num       Number to format as a percent
// @param  {Number} precision Precision of the decimal
// @return {String}           Formatted percentage
//
/////////////////////////////////////////////////////////////////////////////////////
function formatPercent(num, precision) {
    return (num * 100).toFixed(precision);
}
