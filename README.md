

bemcssify
==========

Use this browserify transform to bundle your CSS files together.

For every CSS file required with this transform, the contents of the 
file are appended to the output file given by the '-o outfile' 
tranform option.   If this argument is not given, no CSS will be bundled together.  

If the '-i' option is given, only the names of the CSS files required
are written to the '-o' output file. 

For each CSS file required the transform will parse 
the file and return a javascript object of the BEM classes
contained inside.  

The value of each property added is the full BEM class name 
concatenated with the non-modifier version of the BEM class name
in selector form.

The key of each property added is the BEM class name camel cased but
without the base.  The '--' separator is replaced with '__'.

So for example the CSS rule,

```
    .btn__text--big { /* .. */ }
```

will be returned by require on the object as:

```
    {
        text__big: ".btn__text.btn__text--big",
        ...
    }
```

The non-modifier BEM class name (btn__text in the above example) 
can be excluded using the '-n' argument.

Installation
=============

To install from github.com you can use:

```
    $ npm install roseengineering/bemcssify
```

Examples
===========

To bundle your required CSS files into index.css you can use:

```
    $ browserify -t [ bemcssify -o index.css ] js/app.js -o index.js
```

To disable the inclusion of non-modifier BEM class names as
well as turn off CSS bundling you can use:

```
    $ browserify -t [ bemcssify -n ] js/app.js -o index.js
```



