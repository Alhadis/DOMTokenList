DOMTokenList-Polyfill
=====================

Enables support for the DOMTokenList interface in IE8-9, and fixes buggy implementations in newer browsers.

## What this does:
* Adds seamless, dynamically-updating support for token-lists in IE8-9
* Fixes inability to add/remove multiple tokens in IE10+ ([#920755](https://connect.microsoft.com/IE/Feedback/Details/920755/))
* Adds support for forced toggling if it's missing ([#878564](https://connect.microsoft.com/IE/Feedback/details/878564/))

This polyfill works at feature-level, meaning it doesn't identify shortcomings based on browser vendor or version (though I'm hoping
that's common sense to most developers these days).

## Total size
* 2.32 KBs minified
* 1.21 KB minified & gzipped

## Why should I use yours? Others work fine.
They might, but so far, every one I've encountered has issues working with both the `classList` and `className` attributes simultaneously.

For example, assume the following scenario:
```html
<!DOCTYPE html>
<html class="bar">

<script>
	var root = document.documentElement;
	var rootClasses = root.classList;

	console.log(rootClasses[0]); // Outputs "bar", as expected

	root.className = "foo " + root.className;

	console.log(rootClasses[0]); // Outputs "bar" instead of "foo"
</script>
```
This is an edge case, but expecting developers to avoid the `.className` attribute as well as direct references to token-lists (which might be done for brevity's sake) wasn't enough to satisfy me. I wanted a *true*, transparent, lightweight and dynamic polyfill for the interface I loved so much.
