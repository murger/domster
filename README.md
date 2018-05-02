[![Build Status](https://travis-ci.org/murger/domster.svg?branch=master)](https://travis-ci.org/murger/domster)
[![NPM Version](https://img.shields.io/npm/v/domster.svg)](https://www.npmjs.com/package/domster)

With performance in mind; domster utilises built-in APIs while providing
a jQuery-like experience around 2kb. Forfeiting newer methods in favour of
older and better optimised ones, it queries the DOM a lot faster than
anything else.

Suitable for IE9+\
https://jsperf.com/domster-vs-qs

Use it via `npm i domster` or `<script src="//unpkg.com/domster"></script>`\
If you encounter a bug or require additional functionality, please let us know.

## Traversal
* get
* size (length)
* each
* is
* not
* has
* eq
* first
* last
* parent
* children
* siblings
* find
* filter

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