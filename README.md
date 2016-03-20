

bemcssify
==========

Use this browserify transform to bundle your CSS files together.

Each time you require a unique CSS file using this transform, the contents of the 
file are appended to the CSS output file.  The name of this output file is passed
as an argument to the transform.  To bundle your CSS into one 
file use the '-o outfile' option.  If this argument is not given, 
no CSS will be bundled.  

Upon being required, the transform will parse 
the CSS file and return a javascript object of the BEM CSS modifiers contained
within.  Each BEM modifier that is found is first camel cased and then presented as a property
of the returned object.  The value of the property is the full BEM class name 
concatenated with the non-modifier version of the BEM class name.

For example the CSS rule,

```
    .btn__text--big {}
```

will be returned by require as:

```
    {
        big: "btn__text btn__text--big",
        ...
    }
```

The inclusion of the non-modifier name can be disabled
with the '-n' argument.

The value of a modifier property can also be "composed".

If the transform finds a "multi-modifier" BEM class name,
the first modifier found will be considered the modifier property. 
While the second and subsequent modifiers will compose the 
value of the property.

So the CSS rule,

```
    .btn--big-green--big--green {}
```

will be placed on the return object as:

```
    {
        bigGreen: "btn btn--big btn--green",
        ...
    }
```
   
See the directory "example" for a sample browserify build.

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



