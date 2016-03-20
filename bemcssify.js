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
                if (/[ *+>~[#]/.test(name)) return;
                name = name.split('.');
                if (name.length !== 2 || name[0] || !name[1]) return;
                name = name[1];

                // we now have the class name
                var i, bem, base, modifier, pseudo = '';
                if ((i = name.indexOf(':')) > 0) {
                    pseudo = name.substr(i);
                    name = name.substr(0, i);
                }
                bem = name.split('--');
                base = bem[0];
                modifier = bem[1];
                if (!modifier) return;
                if (bem.length > 2) {
                    name = bem.splice(2).map(function(n){
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
               
