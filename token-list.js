/** DOMTokenList polyfill */

if(!window.DOMTokenList)
(function(){


	/** Ascertain browser support for Object.defineProperty */
	var dpSupport	=	"defineProperty" in Object || "__defineGetter__" in Object.prototype || null;


	/** Wrapper for Object.defineProperty that falls back to using the legacy __defineGetter__ method if available. */
	var defineGetter	=	function(object, name, fn, configurable){
		if(Object.defineProperty)
			Object.defineProperty(object, name, {
				configurable:	false === dpSupport ? true : !!configurable,
				get:			fn
			});

		else object.__defineGetter__(name, fn);
	};


	/** Ensure the browser allows Object.defineProperty to be used on native JavaScript objects. */
	if(dpSupport)
		try{ defineGetter({}, "support"); }
		catch(e){ dpSupport = false; }



	var DOMTokenList	=	function(el, prop){

		/** Private variables */
		var tokens		=	[],
			tokenMap	=	{},
			length		=	0,
			maxLength	=	0,
			lastValue,


		reindex		=	function(){

			/** Define getter functions for array-like access to the tokenList's contents. */
			if(length >= maxLength){
				for(; maxLength < length; ++maxLength){

					(function(i){
						defineGetter(this, i, function(){ preop.call(this); return tokens[i]; }, false);
					}).call(this, maxLength);
				}
			}
		},

		
		/** Helper function called at the start of each class method. Internal use only. */
		preop	=	function(){
			var i;

			/** Validate the token/s passed to an instance method, if any. */
			if(arguments.length){
				for(i = 0; i < arguments.length; ++i)
					if(/\s/.test(arguments[i])){
						var error	=	new SyntaxError('String "' + arguments[i] + '" contains an invalid character');
						error.code	=	5;
						error.name	=	"InvalidCharacterError";
						throw error;
					}
			}


			/** Check if the subject attribute of the target element has changed since the tokenList was last used. If so, repopulate the internal token lists. */
			if(lastValue !== el[prop]){
				tokens		=	("" + el[prop]).replace(/^\s+|\s+$/g, "").split(/\s+/);
				tokenMap	=	{};
				for(var i = 0; i < tokens.length; ++i)
					tokenMap[tokens[i]]	=	true;
				length	=	tokens.length;
				reindex.call(this);
			}
		};



		/** Populate our internal token lists if the targeted attribute of the subject element isn't empty. */
		preop.call(this);



		/** Returns the number of tokens in the underlying string. Read-only. */
		defineGetter(this, "length", function(){ preop.call(this); return length; });


		/** Override the default toString method to return a space-delimited list of tokens when typecast. */
		this.toLocaleString	=
		this.toString		=	function(){
			preop.call(this);
			return tokens.join(" ");
		};



		/** Returns an item in the list by its index (or undefined if the number is greater than or equal to the length of the list) */
		this.item	=	function(idx){
			preop.call(this);
			return tokens[idx];
		};


		/** Returns TRUE if the underlying string contains `token`; otherwise, FALSE. */
		this.contains	=	function(token){
			preop.call(this);
			return !!tokenMap[token];
		};



		/** Adds one or more tokens to the underlying string. */
		this.add	=	function(){
			preop.apply(this, arguments);
			
			for(var token, i = 0; i < arguments.length; ++i){
				token	=	arguments[i];
				if(!tokenMap[token]){
					tokens.push(token);
					tokenMap[token]	=	true;
				}
			}

			/** Update the targeted attribute of the attached element if the token list's changed. */
			if(length !== tokens.length){
				length		=	tokens.length >>> 0;
				el[prop]	=	tokens.join(" ");
				reindex.call(this);
			}
		};


		/** Removes one or more tokens from the underlying string. */
		this.remove	=	function(){
			preop.apply(this, arguments);

			/** Build a hash of token names to compare against when recollecting our token list., */
			for(var ignore = {}, i = 0; i < arguments.length; ++i){
				ignore[arguments[i]]	=	true;
				delete tokenMap[arguments[i]];
			}

			/** Run through our tokens list and reassign only those that aren't defined in the hash declared above. */
			for(var t = [], i = 0; i < tokens.length; ++i)
				if(!ignore[tokens[i]]) t.push(tokens[i]);

			tokens	=	t;
			length	=	t.length >>> 0;

			/** Update the targeted attribute of the attached element. */
			el[prop]	=	tokens.join(" ");
			reindex.call(this);
		};


		/** Adds or removes a token depending on whether it's already contained within the token list. */
		this.toggle	=	function(token, force){
			preop.apply(this, [token]);

			/** Token state's being forced. */
			if(undefined !== force){
				if(force)	{	this.add(token);	return true;	}
				else		{	this.remove(token);	return false;	}
			}

			/** Token already exists in tokenList. Remove it, and return FALSE. */
			if(tokenMap[token]){
				this.remove(token);
				return false;
			}

			/** Otherwise, add the token and return TRUE. */
			this.add(token);
			return true;
		};


		/** Mark our newly-assigned methods as non-enumerable. */
		(function(o, defineProperty){
			if(defineProperty)
				for(var methods	= "item contains add remove toggle toString toLocaleString".split(" "), i = 0; i < 7; ++i)
					defineProperty(o, methods[i], {enumerable: false});
		}(this, Object.defineProperty));
		return this;
	};

	DOMTokenList.polyfill	=	true;
	window.DOMTokenList		=	DOMTokenList;



	/** Polyfill our properties */
	var addProp	=	function(o, name, attr){

		defineGetter(o.prototype, name, function(){
			var tokenList, cork = "__defining_" + name + "__";
			if(this[cork]) return tokenList;

			this[cork]	=	true;


			/** IE8 can't define properties on native JavaScript objects, so we'll use a retarded hack instead. */
			if(false === dpSupport){

				var	mirror = addProp.mirror		=	addProp.mirror || document.createElement("div"),
					reflections					=	mirror.childNodes,
					
					/** Iterator variables */
					l	= reflections.length,
					i	= 0,
					visage;

				for(; i < l; ++i)
					if(reflections[i].reflectedElement === this){
						visage	=	reflections[i];
						break;
					}

				/** Couldn't find an element's reflection inside the mirror. Materialise one. */
				if(!visage){
					visage	=	document.createElement("div");
					/*visage.IE8_GETTER_REFLECTION	=	this;*/
					mirror.appendChild(visage);
				}

				tokenList	=	DOMTokenList.call(visage, this, attr);
			}

			else tokenList	=	new DOMTokenList(this, attr);


			defineGetter(this, name, function(){ return tokenList; });
			delete this[cork];

			return tokenList;
		}, true);
	};

	addProp( Element,			"classList",	"className");
	addProp( HTMLLinkElement,	"relList",		"rel");
	addProp( HTMLAnchorElement,	"relList",		"rel");
	addProp( HTMLAreaElement,	"relList",		"rel");
}());