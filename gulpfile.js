var gulp = require("gulp");

var path = require("path")

var source = require("vinyl-source-stream");

var browserify = require("browserify");
var watchify = require("watchify");
var tsify = require("tsify");

var ts = require("gulp-typescript");
var sourcemaps = require("gulp-sourcemaps");

var notify = require("gulp-notify");
var gutil = require("gulp-util");

var merge = require("merge2");

var config = {
    apps: [
        {
            taskID: "f-tools",
            dest: path.join(__dirname,"/js/"),
            source: path.join(__dirname,"/js/src"),
            main: "main.tsx",
            result: "main.js",
            browserify: true
        }
    ]
};

var tasks = [];

function register(i,app) {
    var id = app.taskID || "task-" + i;
    if(app.browserify) {
        tasks[tasks.length] = id;
        app.taskID = id;

        var bundler = browserify({
            cache: {},
            packageCache: {},
            basedir: app.source
        }).add(path.join(app.source,app.main))
            .plugin(watchify)
            .plugin(tsify,{jsx: "react"})
            .on("time",function(time) {
                // gutil.log("Finished rebuilding after " + time/1000 + " s")
            });
        
        gulp.task(id,function() {
            // gutil.log("Running sub-task " + id);

            function build(rebuild) {
                var bundle = bundler.bundle().on("error",function(err) {
                    gutil.log(err.toString())
                });

                return bundle
                .pipe(source(app.result))
                .pipe(gulp.dest(app.dest))
            }

            return build(false);
        });
    }
    else {
        tasks[tasks.length] = id;
        app.taskID = id;

        var project = ts.createProject(path.join(app.base,"tsconfig.json"),{
            declaration: true,
            sourceMap: true
        });

        gulp.task(id,function() {
            // gutil.log("Running sub-task " + id);

            var tsResult = project.src().pipe(sourcemaps.init()).pipe(ts(project));

            return merge([
                tsResult.js.pipe(sourcemaps.write(path.relative(app.source,app.sourceMapLocation),{
                    sourceRoot: (filepath) => {
                        return path.relative(path.dirname(filepath.path),app.source)
                    }
                })).pipe(gulp.dest(app.dest)),
                tsResult.dts.pipe(gulp.dest(app.definesLocation))
            ]);
        });
    }
}

for(var i=0;i < config.apps.length;i++) {
    register(i,config.apps[i]);
}

gulp.task("build",tasks);
gulp.task("default",tasks);

gulp.task("watch",tasks,function() {
    for(var i=0;i < config.apps.length;i++) {
        if(!config.apps[i].nowatch) {
            console.log("watching for " + config.apps[i].taskID);
            console.log(path.join(path.relative(__dirname,config.apps[i].source),"**/*.ts"))
            gulp.watch([
                path.join(path.relative(__dirname,config.apps[i].source),"**/*.ts"),
                path.join(path.relative(__dirname,config.apps[i].source),"**/*.tsx"),
                "!**/*.d.ts"
            ],[config.apps[i].taskID]);
        }
    }
});

process.on("error",function(e) {
    console.log("god dam");
    console.trace(e);
});
