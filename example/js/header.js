
require('btn__price.css');
require('btn__text.css');

var btn = require('btn.css');

var html = '\
<a href="http://css-tricks.com" class="' + btn.bigOrange + '">\
  <span class="btn__price">$3</span>\
  <span class="btn__text">Big button</span>\
</a>';

document.getElementById('header').innerHTML = html;




