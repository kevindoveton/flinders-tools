var gulp = require("gulp");

var source = require("vinyl-source-stream");
var browserify = require("browserify");
var watchify = require("watchify");
var tsify = require("tsify");
var notify = require("gulp-notify");
var gutil = require('gulp-util');

var config = {
    publicPath: __dirname + "/js/",
    app: {
        path: __dirname + "/js/src",
        main: "main.tsx",
        result: "main.js"
    }
};

gulp.task("compile-js",function() {
    var bundler = browserify({
        cache: {},
        packageCache: {},
        basedir: config.app.path
    })
        .plugin(watchify)
        .add(config.app.path + "/" + config.app.main)
        .plugin(tsify)
        .on("time",function(time) {
            gutil.log("Finished rebuilding after " + time/1000 + " s")
        });

    function rebuild(rebuild) {
        var bundle = bundler.bundle();

        if(rebuild) {
            gutil.log("Rebuilding...");
        }

        return bundle
        .pipe(source(config.app.result))
        .pipe(gulp.dest(config.publicPath))
        .on("error",function(err) {
            var args = Array.prototype.slice.call(arguments);
            notify.onError({
                title: "Compile Error",
                message: "<%= error.message %>"
            }).apply(this,args);
            this.emit("end");
        });
    }

    bundler.on("update",function() {
        rebuild(true);
    });

    return rebuild(false);
});
