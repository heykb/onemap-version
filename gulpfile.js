var gulp = require("gulp");
var gulpVersion = require("./plugin/onemap-verison.js");
var gulpif = require("gulp-if");
var clean = require("gulp-clean");
var zip = require("gulp-zip");
var through = require("through2");
var gulpIgnore = require("gulp-ignore");

var config = {
    // 项目根路径
    // srcRoot: 'test/',
    // // // 输出路径
    // outRoot: "dist2/",
    outRoot:"E:\\notes\\notes\\software\\apache-tomcat-8.5.57\\webapps\\space\\WEB-INF\\classes\\",
    srcRoot: "E:/notes/work/antu/onemapV5.0/",
    // 匹配符
    srcPattern: [
        "**/*.html",
        "**/*.js",
        "!**/plugin/**/*",
        "!**/thirdpart/**/*",
        "!**/_nuxt/commons/**/*",
    ],
    // 是否zip包输出
    outZipEnable: true,
    // 极简模式，true: 只输出srcPattern匹配的文件
    outAllRepDisable: false,
};
var options = {
    //参数名称
    paramName: "_",
    //文件后缀
    suffix: ["css", "js", "html"],
    // 参数替换还是追加replace append
    mode: "append",
    // version  guid timestamp
    paramType: "timestamp",
    // 匹配模式为 xx [=|+|:] xx/xx.[suffix]
    assignSymbols: ["=", ":", "+"],
    // 只输出内容被修改的文件
    onlyOutChanged: config.outAllRepDisable,
    // 需要排除不添加版本号的链接（针对某些链接添加版本号参数会带来额外影响）
    excludeLinks: ["bootstrap-material-design.min.css"],
    // 大文件提示 单位：kb
    largeSize: 300,
    // 自动跳过大文件
    autoSkipLargeFile: true,
};

function log(message) {
    return through.obj(function (file, enc, callback) {
        process.stdout.write("\r\x1b[K");
        process.stdout.write("out to dist:" + file.path);
        this.push(file);
        return callback();
    });
}
gulp.task("transform", function () {
    if (config.outAllRepDisable) {
        config.srcPattern = config.srcPattern.map((item) => {
            if (item.startsWith("!"))
                return "!" + config.srcRoot + "/" + item.substring(1);
            else return config.srcRoot + "/" + item;
        });
        var stream = gulp
            .src(config.srcPattern)
            .pipe(
                gulpif(
                    ["**/seajsInit.js", "**/initPortal.js"],
                    gulpVersion.seajsVersion(options)
                )
            )
            .pipe(gulpVersion.gulpVersion(options));
        if (config.outZipEnable) {
            stream = stream.pipe(zip("archive.zip"));
        }
        return stream.pipe(gulp.dest(config.outRoot));
    } else {
        var stream = gulp
            .src(config.srcRoot + "/**/*")
            .pipe(
                gulpif(
                    ["**/seajsInit.js", "**/initPortal.js"],
                    gulpVersion.seajsVersion(options)
                )
            )
            .pipe(
                gulpif(
                    config.srcPattern,
                    gulpVersion.gulpVersion(options),
                    log()
                )
            );
        if (config.outZipEnable) {
            stream = stream.pipe(zip("archive.zip"));
        }
        return stream.pipe(gulp.dest(config.outRoot));
    }
});

//清空目标文件
gulp.task("clean", function () {
    return gulp
        .src(config.outRoot, {
            read: false,
            allowEmpty: true,
        })
        .pipe(clean());
});

gulp.task("default", gulp.series("transform"));
