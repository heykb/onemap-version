"use strict";
var through = require("through2");
var assign = require("object-assign");
var gutil = require("gulp-util");
var pkg = require(process.cwd() + "/package.json");
var addSeajsConfigMap = require("./seajs-version.js");
var minimatch = require("minimatch");

// plugin name
const PLUGIN_NAME = "gulp-version-num";

// default parameter
var defaults = {
    paramName: "v",
    paramType: "version",
    suffix: ["css", "js"],
    assignSymbols: ["="],
    excludeLinks: [],
    onlyOutChanged: true,
    largeSize: 200,
    autoSkipLargeFile: false,
    mode: "replace", // 'replace: replace version from the old version; append: append version information after the old version using &'
};

/**
 * Short unique id generator
 */
var ShortId = function () {
    var lastTime;

    this.next = function () {
        var d = new Date();
        var thisTime =
            (d.getTime() - Date.UTC(d.getUTCFullYear(), 0, 1)) * 1000;
        while (lastTime >= thisTime) {
            thisTime++;
        }
        lastTime = thisTime;
        return thisTime.toString(16);
    };
};

function gulpVersion(options) {
    // merge
    var opts = assign(defaults, options);
    var shortId = new ShortId();

    // switch a parameter
    switch (opts.paramType) {
        case "version":
            opts.version = pkg.version;
            break;
        case "guid":
            opts.version = shortId.next();
            break;
        case "timestamp":
            opts.version = Date.now();
            break;
    }

    var assignSymbols = opts.assignSymbols;
    //([\w-"']+[\s]*[=]{1}[\s]*".+)(\.css|js|html)(\?([^&"']+(?:&[^&"']+)*))?(")
    var regex = new RegExp(
        "(([\\w-\"']+)[\\s]*([" +
            assignSymbols.join("|") +
            ']){1}[\\s]*"(.+?(\\.css|js|html)))(\\?([^&"\']+(?:&[^&"\']+)*))?(")',
        "ig"
    );
    // 单引号 fix:if user use single quotes for quote js css file,only use regex above may cause wrong regex
    var regex2 = new RegExp(
        "(([\\w-\"']+)[\\s]*([" +
            assignSymbols.join("|") +
            "]){1}[\\s]*'(.+?(\\.css|js|html)))(\\?([^&\"']+(?:&[^&\"']+)*))?(')",
        "ig"
    );
    var regex3 = new RegExp(
        "(([\\w-\"']+)[\\s]*([" +
            assignSymbols.join("|") +
            "]){1}[\\s]*`(.+?(\\.css|js|html)))(\\?([^&\"']+(?:&[^&\"']+)*))?(`)",
        "ig"
    );
    // bootstrap-material-design.min.css
    console.log(
        "([\\w-\"'`]+[\\s]*[" +
            assignSymbols.join("|") +
            "]{1}\\s*`.+)(\\." +
            opts.suffix.join("|") +
            ")(\\?([^&\"'`]+(?:&[^&\"'`]+)*))?(`)"
    );
    var stream = through.obj(function (file, enc, cb) {
        if (file.isNull()) {
            this.push(file);
            return cb();
        }

        if (file.isStream()) {
            this.emit(
                "error",
                new gutil.PluginError(PLUGIN_NAME, "Streaming not supported")
            );
            return cb();
        }
        process.stdout.write("\r\x1b[K");
        process.stdout.write(`progress on: ${file.path} ... `);
        if (file.stat.size / 1000 > opts.largeSize) {
            process.stdout.write("\x1B[31m[large file] \x1B[0m");
            if (opts.autoSkipLargeFile) {
                process.stdout.write("\x1B[31m[skiped] \x1B[0m\n");
                if (!opts.onlyOutChanged) {
                    this.push(file);
                }
                return cb();
            }
        }

        var contents = file.contents.toString();
        var matched = false;
        // replace
        contents = contents.replace(regex, function (
            match,
            $1,
            left,
            mid,
            path,
            suffix,
            suffixRight,
            param,
            $7
        ) {
            for (var i = 0; i < opts.excludeLinks.length; ++i) {
                if (path.endsWith(opts.excludeLinks[i])) {
                    process.stdout.write(
                        `\x1B[34m[eclude link:${match}] \x1B[0m`
                    );
                    return match;
                }
            }

            matched = true;
            var version;
            // append parameter
            if (param != undefined) {
                if (opts.mode == "replace") {
                    // replace version
                    version = "?" + opts.paramName + "=" + opts.version;
                } else {
                    // append version
                    version =
                        "?" + opts.paramName + "=" + opts.version + "&" + param;
                }
            } else {
                version = "?" + opts.paramName + "=" + opts.version;
            }
            return $1 + version + $7;
        });
        // 单引号处理
        contents = contents.replace(regex2, function (
            match,
            $1,
            left,
            mid,
            path,
            suffix,
            suffixRight,
            param,
            $7
        ) {
            for (var i = 0; i < opts.excludeLinks.length; ++i) {
                if (path.endsWith(opts.excludeLinks[i])) {
                    console.log(`\x1B[34m[eclude link:${match}] \x1B[0m`);
                    return match;
                }
            }

            matched = true;
            var version;
            // append parameter
            if (param != undefined) {
                if (opts.mode == "replace") {
                    // replace version
                    version = "?" + opts.paramName + "=" + opts.version;
                } else {
                    // append version
                    version =
                        "?" + opts.paramName + "=" + opts.version + "&" + param;
                }
            } else {
                version = "?" + opts.paramName + "=" + opts.version;
            }
            return $1 + version + $7;
        });
        contents = contents.replace(regex3, function (
            match,
            $1,
            left,
            mid,
            path,
            suffix,
            suffixRight,
            param,
            $7
        ) {
            for (var i = 0; i < opts.excludeLinks.length; ++i) {
                if (path.endsWith(opts.excludeLinks[i])) {
                    console.log(`\x1B[34m[eclude link:${match}] \x1B[0m`);
                    return match;
                }
            }

            matched = true;
            var version;
            // append parameter
            if (param != undefined) {
                if (opts.mode == "replace") {
                    // replace version
                    version = "?" + opts.paramName + "=" + opts.version;
                } else {
                    // append version
                    version =
                        "?" + opts.paramName + "=" + opts.version + "&" + param;
                }
            } else {
                version = "?" + opts.paramName + "=" + opts.version;
            }
            return $1 + version + $7;
        });
        if ((opts.onlyOutChanged && matched) || !opts.onlyOutChanged) {
            file.contents = Buffer.from(contents);
            this.push(file);
            if (matched) {
                console.log("\x1B[32m[changed] \x1B[0m");
            } else {
                console.log("\x1B[33m[not changed but out] \x1B[0m");
            }
        } else {
            console.log("\x1B[33m[not changed] \x1B[0m");
        }
        return cb();
    });

    return stream;
}

function seajsVersion(options) {
    // merge
    var opts = assign(defaults, options);
    var shortId = new ShortId();

    // switch a parameter
    switch (opts.paramType) {
        case "version":
            opts.version = pkg.version;
            break;
        case "guid":
            opts.version = shortId.next();
            break;
        case "timestamp":
            opts.version = Date.now();
            break;
    }
    var stream = through.obj(function (file, enc, cb) {
        process.stdout.write(`seajsversion task on: ${file.path}... `);
        if (file.isNull()) {
            this.push(file);
            return cb();
        }

        if (file.isStream()) {
            this.emit(
                "error",
                new gutil.PluginError(PLUGIN_NAME, "Streaming not supported")
            );
            return cb();
        }
        var contents = file.contents.toString();
        var regex = new RegExp(
            "(<script\\b[^>]*>)([\\s\\S]*?)(<\\/script>)",
            "ig"
        );
        if (file.path.endsWith(".html") || file.path.endsWith(".htm")) {
            contents = contents.replace(regex, function (
                match,
                left,
                script,
                right
            ) {
                if (script.trim() == "") {
                    return match;
                } else {
                    var newScript = addSeajsConfigMap(script, opts);
                    console.log(newScript);
                    return left + newScript + right;
                }
            });
        }
        if (file.path.endsWith(".js")) {
            contents = addSeajsConfigMap(contents, opts);
        }
        file.contents = Buffer.from(contents);
        this.push(file);

        cb();
    });
    return stream;
}

module.exports = { gulpVersion, seajsVersion };
