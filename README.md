[![Build Status](https://travis-ci.org/murger/domster.svg?branch=master)](https://travis-ci.org/murger/domster)

With performance in mind; domster utilises built-in APIs whilst providing
a jQuery-like experience under 2kb. Forfeiting newer methods in favour of
older and better optimised ones, it queries the DOM a lot faster than
anything else.

Suitable for IE9+\
https://jsperf.com/domster-vs-qsa

Use it via `npm i domster` or `<script src="//unpkg.com/domster"></script>`\
If you require additional functionality, please let us know or simply send a PR.

## API
* type
* extend
* get
* size (length)
* each
* is
* filter
* find
* parent
* children
* siblings
* clone
* remove
* append
* prepend
* empty
* html
* text
* val
* data
* attr
* removeAttr
* style (css)
* width
* height
* position
* offset
* hasClass
* addClass
* removeClass
* toggleClass
* on
* once (one)
* off
* trigger