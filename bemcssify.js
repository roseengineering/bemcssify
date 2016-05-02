'use strict';

var through = require('through2');
var css = require('css');
var fs = require('fs');

var fd;

function toCamelCase(name) {
    return name.replace(/([a-z])-([a-z])/g, function(str, m1, m2) {
        return m1 + m2.toUpperCase();
    });
}

var transform = function(rules, nobase){
    var ob = {};
    rules.forEach(function(rule){
        if (rule.type === 'rule'){
            rule.selectors.forEach(function(name){
                if (/[ :*+>~[#]/.test(name)) return;
                var group = name.split('.');
                if (group.length !== 2 || group[0] || !group[1]) return;
                name = group[1];
                group = name.split('--');
                var base = group[0];
                var modifier = group[1];
                if (!modifier) return;
                if (group.length > 2) {
                    name = group.splice(2).map(function(n){
                        return base + '--' + n;
                    }).join(' ');
                }
                if (!nobase) name = base + ' ' + name;
                ob[toCamelCase(modifier)] = name;
            });
        }
    });
    return ob;
};

module.exports = function(file, opts) {
    var ext = '.css',
        list = [];

    return through(function (chunk, enc, cb) {
        list.push(chunk);
        cb()
    }, function(cb){
        var buf = Buffer.concat(list);
        if (file.substr(-ext.length).indexOf(ext)){
            this.push(buf);
        } else {
            if (opts.o) {
                if (!fd) fd = fs.openSync(opts.o, 'w');
                fs.appendFileSync(fd, buf);
            }
            this.push('module.exports = ');
            var ob = css.parse(buf.toString());
            ob = transform(ob.stylesheet.rules, opts.n);
            this.push('{\n');
            for (var key in ob) this.push('  "' + key + '": "' + ob[key] + '",\n');
            this.push('}');
        }
        cb();
    })
};
               
