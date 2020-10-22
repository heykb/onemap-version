var uglifyJS = require("uglify-js");
function Stack() {
    this.items = [];
    this.push = function (element) {
        this.items.push(element);
    };
    this.pop = function () {
        return this.items.pop();
    };
    this.top = function () {
        return this.items[this.items.length - 1];
    };
    this.isEmpty = function () {
        return !this.items.length;
    };
    this.clear = function () {
        this.items = [];
    };
    this.size = function () {
        return this.items.length;
    };
}
function addSeajsConfigMap(contents, opts) {
    var index = contents.indexOf("seajs.config(");
    if (index != -1) {
        const stack = new Stack();
        stack.push("(");
        var backContent = contents.substring(index + 13);
        contents = contents.substring(0, index);
        let i = 0;
        for (; i < backContent.length; ++i) {
            if (backContent[i] == "(") {
                stack.push("(");
            }
            if (backContent[i] == ")") {
                stack.pop();
            }
            if (stack.size() <= 0) break;
        }
        if (stack.size() == 0) {
            console.log("\x1B[35m[changed] \x1B[0m");
            let configString = backContent.substring(0, i);
            var exclude = JSON.stringify(opts.excludeLinks);
            contents +=
                `var _config_=${configString},_config_=jQuery.extend(!0,_config_,{map:[function(f){var n=${exclude};if(new RegExp("(.+\\\\.(js|css|html))(\\\\?.*)*$","ig").test(f)){for(var s,i=RegExp.$1,e=0;e<n.length;++e)if(""!=n[e].trim()&&i.endsWith(n[e]))return f;-1!=f.indexOf("?")?(s=f.substring(f.indexOf("?")+1)).includes("${opts.paramName}=${opts.version}")||(f=f.substring(0,f.indexOf("?")+1)+"${opts.paramName}=${opts.version}&"+s):f+="?${opts.paramName}=${opts.version}"}return f}]});seajs.config(_config_);`
                +addSeajsConfigMap(backContent.substring(i + 1), opts);
        } else {
            console.error("[seajs.config 括号不匹配]");
        }
    }

    return contents;
}
module.exports = addSeajsConfigMap;
