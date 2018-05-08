[![Build Status](https://travis-ci.org/murger/domster.svg?branch=master)](https://travis-ci.org/murger/domster)

With performance in mind, domster employs built-in selectors for a jQuery-like
experience at 2kb. Forfeiting newer methods in favour of older and better
optimised ones, it queries the DOM a lot faster than anything else.

Suitable for IE9+\
https://jsperf.com/domster-vs-qs

Use it via `npm i domster` or `<script src="//unpkg.com/domster"></script>`\
If you encounter a bug or require additional functionality, please let us know.

## Traversal
* get
* size (length)
* each
* is
* has
* not
* eq
* first
* last
* parent
* children
* siblings
* find
* filter

> `.is()` and `.has()` implementations differ from jQuery,\
> both methods accept elements or a selector and return a boolean.

## Mutation
* before
* after
* append
* prepend
* replaceWith
* clone
* remove
* empty
* html
* text
* val
* data
* attr
* removeAttr

## Style
* style (css)
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