[![Build Status](https://travis-ci.org/murger/domster.svg?branch=master)](https://travis-ci.org/murger/domster)
[![Coverage Status](https://coveralls.io/repos/github/murger/domster/badge.svg?branch=master&service=github)](https://coveralls.io/github/murger/domster?branch=master)

With performance in mind; domster utilises built-in APIs whilst providing
a jQuery-like experience under 2kb. Forfeiting newer methods in favour of
older and better optimised ones, it queries the DOM a lot faster than
anything else.

Suitable for IE9+\
https://jsperf.com/domster-vs-qsa

Use it via `npm i domster` or `<script src="//unpkg.com/domster"></script>`\
If you encounter a bug or require additional functionality, please let us know.

## Traversal
* get
* size (length)
* each
* is
* has
* first
* last
* find
* filter
* parent
* children
* siblings

## Mutation
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

## Style
* style (css)
* width
* height
* position
* offset
* hasClass
* addClass
* removeClass
* toggleClass

## Events
* on
* once (one)
* off
* trigger

## Utility
* each
* type
* extend