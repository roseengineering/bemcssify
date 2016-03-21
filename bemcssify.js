'use strict';

var through = require('through2');
var css = require('css');
var fs = require('fs');

function toCamel(name) {
    return name.replace(/([a-z])-([a-z])/g, function(str, m1, m2) {
        return m1 + m2.toUpperCase();
    });
}

var transform = function(rules, nobase){
    var ob = {};
    rules.forEach(function(rule){
        if (rule.type === 'rule'){
            rule.selectors.forEach(function(name){
                var group;
                if (/[ *+>~[#]/.test(name)) return;
                group = name.split('.');
                if (group.length !== 2 || group[0] || !group[1]) return;
                name = group[1];

                // we now have the class name
                var i, base, modifier, pseudo = '';
                if ((i = name.indexOf(':')) > 0) {
                    pseudo = name.substr(i);
                    name = name.substr(0, i);
                }
                group = name.split('--');
                base = group[0];
                modifier = group[1];
                if (!modifier) return;
                if (group.length > 2) {
                    name = group.splice(2).map(function(n){
                        return base + '--' + n + pseudo;
                    }).join(' ');
                }
                if (!nobase) name = base + pseudo + ' ' + name;
                ob[toCamel(modifier) + pseudo] = name;
            });
        }
    });

    var str = '{\n';
    for (var key in ob) str += '  "' + key + '": "' + ob[key] + '",\n';
    str += '}';
    return str;
};

var fd;

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
            var data = css.parse(buf.toString());
            this.push(transform(data.stylesheet.rules, opts.n));
        }
        cb();
    })
};
               
