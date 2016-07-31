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
            rule.selectors.forEach(function(sel){
                var m, name, base, modifier, key;
                if (/[ :*+>~[#]/.test(sel)) return;

                // get class name
                m = sel.split('.');
                if (m.length !== 2) return;
                name = m[1];

                // get key
                m = name.split('__');
                if (m.length !== 2) return;
                key = m[1];

                // get block
                m = name.split('--');
                base = m[0];
                modifier = m[1];

                if (!nobase && modifier) sel += '.' + base;
                ob[toCamelCase(key.replace('--', '__'))] = sel;
            });
        }
    });
    return ob;

};

module.exports = function(file, opts) {
    var ext = '.css',
        list = [];

    if (opts.o && !fd) fd = fs.openSync(opts.o, 'w');

    return through(function (chunk, enc, cb) {
        list.push(chunk);
        cb()
    }, function(cb){
        var buf = Buffer.concat(list);
        if (file.substr(-ext.length).indexOf(ext)){
            this.push(buf);
        } else {
            if (opts.o) {
                if (opts.i) {
                    fs.appendFileSync(fd, file + '\n');
                } else {
                    fs.appendFileSync(fd, buf);
                }
            }
            var ob = css.parse(buf.toString());
            ob = transform(ob.stylesheet.rules, opts.n);
            this.push('module.exports = {\n');
            for (var key in ob) this.push('  "' + key + '": "' + ob[key] + '",\n');
            this.push('}');
        }
        cb();
    })
};
               
