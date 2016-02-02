/**
 * Adds classList support for SVGElements if needed.
 *
 * This file should be loaded before token-list.js, although it isn't reliant on it.
 */
(function(){
	"use strict";
	
	var W3      = "http://www.w3.org/";
	var NS_SVG  = W3 + "2000/svg";
	var NS_HTML = W3 + "1999/xhtml";
	var CORKED  = "__CORKED";
	var SVG     = window.SVGElement;

	/** No classList support in SVG elements */
	if(SVG && !("classList" in document.createElementNS(NS_SVG, "g"))){
		
		/** Stop IE10-11 choking on token-list.js when running it from inside an SVG document */
		var div = document.createElement("div");
		if(null === div.namespaceURI && !div.classList){
			var createElement = document.createElement;
			document.createElement = function(name){
				if("DIV" === (name || "").toUpperCase())
					return document.createElementNS(NS_HTML, name);
				return createElement.apply(document, arguments);
			};
		}
		
		
		var mirror, reflections;
		Object.defineProperty(SVG.prototype, "classList", {
			get: function(){
				var THIS = this;
				
				/** This is the first time we're accessing an SVG element's classes */
				if(!mirror){
					mirror      = document.createElementNS(NS_HTML, "div");
					reflections = mirror.children;
					
					/** Set a listener to respond to changes in the reflection's classes list */
					mirror.addEventListener("DOMAttrModified", function(e){
						var target    = e.target;
						var reflected = target.__R;
						
						/** Update the SVG element's class attribute */
						if("class" === e.attrName && reflected){
							reflected[CORKED] = true;
							reflected.setAttribute("class", target.className);
							delete reflected[CORKED];
						}
					});
				}
				
				/** Locate this element's reflection */
				for(var visage, i = 0, l = reflections.length; i < l; ++i){
					visage = reflections[i];
					if(visage.__R === THIS) break;
					else visage = 0;
				}
				
				/** No reflection found. Materialise one. */
				if(!visage){
					visage = document.createElementNS(NS_HTML, "div");
					visage.className = THIS.getAttribute("class");
					mirror.appendChild(visage);
					visage.__R = THIS;
					
					/** Can't be too careful */
					var setAttr = THIS.setAttribute;
					THIS.setAttribute = function(name, value){
						if("class" === name && !THIS[CORKED])
							visage.className = value;
						setAttr.call(THIS, name, value);
					};
				}
				
				return visage.classList;
			}
		});
		
	}
}());
