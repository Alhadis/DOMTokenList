/** DOMTokenList polyfill */
(function(){
	"use strict";

	/*<*/
	var WIN		=	window,
		DOC		=	document,
		OBJ		=	Object,
		NULL	=	null,
		TRUE	=	true,
		FALSE	=	false,

		/** String literals: Munge it up, baby. */
		SPACE			=	" ",
		ELEMENT			=	"Element",
		CREATE_ELEMENT	=	"create"+ELEMENT,
		DOM_TOKEN_LIST	=	"DOMTokenList",
		DEFINE_GETTER	=	"__defineGetter__",
		DEFINE_PROPERTY	=	"defineProperty",
		REL				=	"rel",
		REL_LIST		=	REL+"List",
		DIV				=	"div",
		LENGTH			=	"length",
		CONTAINS		=	"contains",
		APPLY			=	"apply",
		CALL			=	"call",
		CLASS_			=	"class",
		HTML_			=	"HTML",
		METHODS			=	("item "+CONTAINS+" add remove toggle toString toLocaleString").split(SPACE),
		REMOVE			=	METHODS[3],
		PROTOTYPE		=	"prototype",
		/*>*/



		/** Ascertain browser support for Object.defineProperty */
		dpSupport	=	DEFINE_PROPERTY in OBJ || DEFINE_GETTER in OBJ[ PROTOTYPE ] || NULL,


		/** Wrapper for Object.defineProperty that falls back to using the legacy __defineGetter__ method if available. */
		defineGetter	=	function(object, name, fn, configurable){
			if(OBJ[ DEFINE_PROPERTY ])
				OBJ[ DEFINE_PROPERTY ](object, name, {
					configurable:	FALSE === dpSupport ? TRUE : !!configurable,
					get:			fn
				});

			else object[ DEFINE_GETTER ](name, fn);
		},




		/** DOMTokenList interface replacement */
		DOMTokenList	=	function(el, prop){

			var	THIS		=	this,

				/** Private variables */
				tokens		=	[],
				tokenMap	=	{},
				length		=	0,
				maxLength	=	0,
				lastValue,


				reindex		=	function(){

					/** Define getter functions for array-like access to the tokenList's contents. */
					if(length >= maxLength)
						for(; maxLength < length; ++maxLength) (function(i){
							defineGetter(THIS, i, function(){
								preop[CALL](THIS);
								return tokens[i];
							}, FALSE);
						})[CALL](THIS, maxLength);
				},



				/** Helper function called at the start of each class method. Internal use only. */
				preop	=	function(){
					var args	=	arguments,
						rSpace	=	/\s+/,
						error, i;

					/** Validate the token/s passed to an instance method, if any. */
					if(args[ LENGTH ])
						for(i = 0; i < args[ LENGTH ]; ++i)
							if(rSpace.test(args[i])){
								error		=	new SyntaxError('String "' + args[i] + '" ' + CONTAINS + ' an invalid character');
								error.code	=	5;
								error.name	=	"InvalidCharacterError";
								throw error;
							}
		

					/** Check if the subject attribute of the target element has changed since the tokenList was last used. If so, repopulate the internal token lists. */
					if(lastValue !== el[prop]){
						tokens		=	("" + el[prop]).replace(/^\s+|\s+$/g, "").split(rSpace);
						tokenMap	=	{};
						for(i = 0; i < tokens[ LENGTH ]; ++i)
							tokenMap[tokens[i]]	=	TRUE;
						length	=	tokens[ LENGTH ];
						reindex[CALL](THIS);
					}
				};
	
	
	
			/** Populate our internal token lists if the targeted attribute of the subject element isn't empty. */
			preop[CALL](THIS);
	
	
	
			/** Returns the number of tokens in the underlying string. Read-only. */
			defineGetter(THIS, LENGTH, function(){
				preop[CALL](THIS);
				return length;
			});
	
	
			/** Override the default toString/toLocaleString methods to return a space-delimited list of tokens when typecast. */
			THIS[ METHODS[6] /** toLocaleString */ ] =
			THIS[ METHODS[5] /** toString		*/ ] = function(){
				preop[CALL](THIS);
				return tokens.join(SPACE);
			};



			/** Returns an item in the list by its index (or undefined if the number is greater than or equal to the length of the list) */
			THIS.item	=	function(idx){
				preop[CALL](THIS);
				return tokens[idx];
			};


			/** Returns TRUE if the underlying string contains `token`; otherwise, FALSE. */
			THIS[ CONTAINS ]	=	function(token){
				preop[CALL](THIS);
				return !!tokenMap[token];
			};
	
	
	
			/** Adds one or more tokens to the underlying string. */
			THIS.add	=	function(){
				preop[APPLY](THIS, args = arguments);

				for(var args, token, i = 0, l = args[ LENGTH ]; i < l; ++i){
					token	=	args[i];
					if(!tokenMap[token]){
						tokens.push(token);
						tokenMap[token]	=	TRUE;
					}
				}
	
				/** Update the targeted attribute of the attached element if the token list's changed. */
				if(length !== tokens[ LENGTH ]){
					length		=	tokens[ LENGTH ] >>> 0;
					el[prop]	=	tokens.join(SPACE);
					reindex[CALL](THIS);
				}
			};



			/** Removes one or more tokens from the underlying string. */
			THIS[ REMOVE ]	=	function(){
				preop[APPLY](THIS, args = arguments);

				/** Build a hash of token names to compare against when recollecting our token list. */
				for(var args, ignore = {}, i = 0, t = []; i < args[ LENGTH ]; ++i){
					ignore[args[i]]	=	TRUE;
					delete tokenMap[args[i]];
				}
	
				/** Run through our tokens list and reassign only those that aren't defined in the hash declared above. */
				for(i = 0; i < tokens[ LENGTH ]; ++i)
					if(!ignore[tokens[i]]) t.push(tokens[i]);
	
				tokens	=	t;
				length	=	t[ LENGTH ] >>> 0;
	
				/** Update the targeted attribute of the attached element. */
				el[prop]	=	tokens.join(SPACE);
				reindex[CALL](THIS);
			};



			/** Adds or removes a token depending on whether it's already contained within the token list. */
			THIS.toggle	=	function(token, force){
				preop[APPLY](THIS, [token]);
	
				/** Token state's being forced. */
				if(undefined !== force){
					if(force)	{	THIS.add(token);		return TRUE;	}
					else		{	THIS[ REMOVE ](token);	return FALSE;	}
				}
	
				/** Token already exists in tokenList. Remove it, and return FALSE. */
				if(tokenMap[token]){
					THIS[ REMOVE ](token);
					return FALSE;
				}

				/** Otherwise, add the token and return TRUE. */
				THIS.add(token);
				return TRUE;
			};


			/** Mark our newly-assigned methods as non-enumerable. */
			(function(o, defineProperty){
				if(defineProperty)
					for(var i = 0; i < 7; ++i)
						defineProperty(o, METHODS[i], {enumerable: FALSE});
			}(THIS, OBJ[ DEFINE_PROPERTY ]));

			return THIS;
		},



		/** Polyfills a property with a DOMTokenList */
		addProp	=	function(o, name, attr){

			defineGetter(o[PROTOTYPE], name, function(){
				var	tokenList,
					cork	=	"__",
					cork	=	cork + DEFINE_PROPERTY + name + cork,
					THIS	=	this;

				if(THIS[cork]) return tokenList;

				THIS[cork]	=	TRUE;


				/** IE8 can't define properties on native JavaScript objects, so we'll use a retarded hack instead. */
				if(FALSE === dpSupport){

					var	mirror = addProp.mirror		=	addProp.mirror || DOC[ CREATE_ELEMENT ](DIV),
						reflections					=	mirror.childNodes,
						REFLECTED_ELEMENT			=	"_ER",

						/** Iterator variables */
						l	= reflections[ LENGTH ],
						i	= 0,
						visage;

					for(; i < l; ++i)
						if(reflections[i][ REFLECTED_ELEMENT ] === THIS){
							visage	=	reflections[i];
							break;
						}

					/** Couldn't find an element's reflection inside the mirror. Materialise one. */
					if(!visage){
						visage	=	DOC[ CREATE_ELEMENT ](DIV);
						mirror.appendChild(visage);
					}

					tokenList	=	DOMTokenList[CALL](visage, THIS, attr);
				}

				else tokenList = new DOMTokenList(THIS, attr);


				defineGetter(THIS, name, function(){ return tokenList; });
				delete THIS[cork];

				return tokenList;
			}, TRUE);
		};


	/** No discernible DOMTokenList support whatsoever. Time to remedy that. */
	if(!WIN[ DOM_TOKEN_LIST ]){

		/** Ensure the browser allows Object.defineProperty to be used on native JavaScript objects. */
		if(dpSupport)
			try{ defineGetter({}, "support"); }
			catch(e){ dpSupport = FALSE; }


		DOMTokenList.polyfill	=	TRUE;
		WIN[ DOM_TOKEN_LIST ]	=	DOMTokenList;

		addProp( WIN[ ELEMENT ], CLASS_+"List",	CLASS_+"Name");			/* Element.classList */
		addProp( WIN[ HTML_+ "Link"		+ ELEMENT ], REL_LIST, REL);	/* HTMLLinkElement.relList */
		addProp( WIN[ HTML_+ "Anchor"	+ ELEMENT ], REL_LIST, REL);	/* HTMLAnchorElement.relList */
		addProp( WIN[ HTML_+ "Area"		+ ELEMENT ], REL_LIST, REL);	/* HTMLAreaElement.relList */
	}
}());
