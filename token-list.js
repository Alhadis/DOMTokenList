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
		UNDEF,
		/*>*/

		/** Munge the hell out of our string literals. Saves a tonne of space after compression. */
		SPACE			=	" ",
		ELEMENT			=	"Element",
		CREATE_ELEMENT	=	"create"+ELEMENT,
		DOM_TOKEN_LIST	=	"DOMTokenList",
		DEFINE_GETTER	=	"__defineGetter__",
		DEFINE_PROPERTY	=	"defineProperty",
		CLASS_			=	"class",
		LIST			=	"List",
		CLASS_LIST		=	CLASS_+LIST,
		REL				=	"rel",
		REL_LIST		=	REL+LIST,
		DIV				=	"div",
		LENGTH			=	"length",
		CONTAINS		=	"contains",
		APPLY			=	"apply",
		HTML_			=	"HTML",
		METHODS			=	("item "+CONTAINS+" add remove toggle toString toLocaleString").split(SPACE),
		ADD				=	METHODS[2],
		REMOVE			=	METHODS[3],
		TOGGLE			=	METHODS[4],
		PROTOTYPE		=	"prototype",



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
								preop();
								return tokens[i];
							}, FALSE);

						})(maxLength);
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
						reindex();
					}
				};
	
	
	
			/** Populate our internal token list if the targeted attribute of the subject element isn't empty. */
			preop();
	
	
	
			/** Returns the number of tokens in the underlying string. Read-only. */
			defineGetter(THIS, LENGTH, function(){
				preop();
				return length;
			});
	
	
			/** Override the default toString/toLocaleString methods to return a space-delimited list of tokens when typecast. */
			THIS[ METHODS[6] /** toLocaleString */ ] =
			THIS[ METHODS[5] /** toString		*/ ] = function(){
				preop();
				return tokens.join(SPACE);
			};



			/** Returns an item in the list by its index (or undefined if the number is greater than or equal to the length of the list) */
			THIS.item	=	function(idx){
				preop();
				return tokens[idx];
			};


			/** Returns TRUE if the underlying string contains `token`; otherwise, FALSE. */
			THIS[ CONTAINS ]	=	function(token){
				preop();
				return !!tokenMap[token];
			};
	
	
	
			/** Adds one or more tokens to the underlying string. */
			THIS[ADD]	=	function(){
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
					reindex();
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
				reindex();
			};



			/** Adds or removes a token depending on whether it's already contained within the token list. */
			THIS[TOGGLE]	=	function(token, force){
				preop[APPLY](THIS, [token]);

				/** Token state's being forced. */
				if(UNDEF !== force){
					if(force)	{	THIS[ADD](token);		return TRUE;	}
					else		{	THIS[REMOVE](token);	return FALSE;	}
				}
	
				/** Token already exists in tokenList. Remove it, and return FALSE. */
				if(tokenMap[token]){
					THIS[ REMOVE ](token);
					return FALSE;
				}

				/** Otherwise, add the token and return TRUE. */
				THIS[ADD](token);
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
				var	THIS = this,
					tokenList,

				/** Prevent this from firing twice for some reason. What the hell, IE. */
				gibberishProperty			=	DEFINE_GETTER + DEFINE_PROPERTY + name;
				if(THIS[gibberishProperty]) return tokenList;
				THIS[gibberishProperty]		=	TRUE;


				/**
				 * IE8 can't define properties on native JavaScript objects, so we'll use a retarded hack instead.
				 *
				 * What this is doing is creating a dummy element ("reflection") inside a detached phantom node ("mirror")
				 * that serves as the target of Object.defineProperty instead. While we could simply use the subject HTML
				 * element instead, this would conflict with element types which use indexed properties (such as forms and
				 * select lists).
				 */
				if(FALSE === dpSupport){

					var	mirror = addProp.mirror		=	addProp.mirror || DOC[ CREATE_ELEMENT ](DIV),
						reflections					=	mirror.childNodes,

						/** Iterator variables */
						l	= reflections[ LENGTH ],
						i	= 0,
						visage;

					for(; i < l; ++i)
						if(reflections[i]._R === THIS){
							visage	=	reflections[i];
							break;
						}

					/** Couldn't find an element's reflection inside the mirror. Materialise one. */
					visage || (visage = mirror.appendChild(DOC[ CREATE_ELEMENT ](DIV)));

					tokenList = DOMTokenList.call(visage, THIS, attr);
				}

				else tokenList = new DOMTokenList(THIS, attr);


				defineGetter(THIS, name, function(){ return tokenList; });
				delete THIS[gibberishProperty];

				return tokenList;
			}, TRUE);
		},

		dummyNode,
		dummyNodeClasses;


	/** No discernible DOMTokenList support whatsoever. Time to remedy that. */
	if(!WIN[ DOM_TOKEN_LIST ]){

		/** Ensure the browser allows Object.defineProperty to be used on native JavaScript objects. */
		if(dpSupport)
			try{ defineGetter({}, "support"); }
			catch(e){ dpSupport = FALSE; }


		DOMTokenList.polyfill	=	TRUE;
		WIN[ DOM_TOKEN_LIST ]	=	DOMTokenList;

		addProp( WIN[ ELEMENT ], CLASS_LIST,	CLASS_+"Name");			/* Element.classList */
		addProp( WIN[ HTML_+ "Link"		+ ELEMENT ], REL_LIST, REL);	/* HTMLLinkElement.relList */
		addProp( WIN[ HTML_+ "Anchor"	+ ELEMENT ], REL_LIST, REL);	/* HTMLAnchorElement.relList */
		addProp( WIN[ HTML_+ "Area"		+ ELEMENT ], REL_LIST, REL);	/* HTMLAreaElement.relList */
	}


	/** Possible support, but let's check for bugs. */
	else{
		dummyNode			=	DOC[ CREATE_ELEMENT ](DIV);
		dummyNodeClasses	=	dummyNode[CLASS_LIST];

		/** Check if the "force" option of .toggle is supported. */
		if(dummyNodeClasses[TOGGLE](PROTOTYPE, FALSE)){

			WIN[DOM_TOKEN_LIST][PROTOTYPE][TOGGLE]	=	function(token, force){
				var THIS	=	this;
				THIS[(force = UNDEF === force ? !THIS.contains(token) : force) ? ADD : REMOVE](token);
				return !!force;
			};
		}
	}
}());
