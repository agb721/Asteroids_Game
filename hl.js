"use strict";

/*
 * Spellen Maken Helper Library  Version 0.00
 * 
 * 
 * TODO clean this up, and maybe move it to the doc page
 * Talk about how this is written:
 * Readability for folks who are new coders or unfamiliar with JavaScript the highest priority
 * NOT written for performance, or to be elegant or as an example of good coding practice
 * This is written so that what the code is doing is as transparent as possible, so it's
 *  easy to edit or replace with one's own code.
 * 
 * Input uses KeyboardEvent.key values, meaning that key position will depend on players
 *  keyboard layout, and that holding SHIFT will result in different values.  I went this
 *  way because I believe it's the simplest to grasp (even though it's not robust). If
 *  you don't like this behavior, you'll probably want to use KeyboardEvent.code instead
 * 
 * Document how keyCatcher and keyState work.  keyCatcher is NOT unset when a keyup event
 *  happens, so that if a player just TAPS a key really quick and the keyup happens before
 *  the next mainLoop, hlKeyHeld still returns true for that key.  Instead, keyState is
 *  used to track both keyups and downs, and at the end of each mainLoop call the keyCatcher
 *  is purged and then updated with the values of keyState.
 * 
 * Note that initMainLoop can take user data, in case they want to avoid using global
 *  variables.  Give example
 */

// Function "prototypes".  These are all defined in the anonymous function below
// TODO comment each of these like in a .h file; put them in the order that they're likely to be called in
var hlInitCanvas; // need to call, etc.  returns canv if direct drawing desired
var hlStartMainLoop;
var hlStopMainLoop;
var hlGetPeriod;
var hlClear;
var hlDrawRect;
var hlDrawCircle;
var hlDrawText;
var hlMouseX; // returns last mouse x coordinate, in canvas coordinates
var hlMouseY;
var hlKeyHeld; // takes KeyboardEvent.key value as arg; link to mdn doco


(function()
{
	// Variables
	var canvInitialized = false; // to warn if called more than once
	var keyCatcher = {};
	var keyState = {};
	var lastMouseX = 0; // last caught X coordinate of the mouse
	var lastMouseY = 0; // last caught Y coordinate of the mouse
	var afReq;          // last animation frame request
	var afPeriod;       // the frequency with which the game loop is being executed

	function warn(warningText)
	{
		/*
		Prints warnings.  Uses an intrusive "alert" by default;
		if you find this annoying, feel free to delete the alert
		and use the console line instead (just remember to keep
		an eye on your console when debugging).
		*/
		// TODO have a bool passed to init canvas that converts alert -> console?

		alert("HL warning: "+warningText);
		//console.log("Warning: "+warningText);
	}

	function error(errorText)
	{
		/*
		Prints errors.  Uses an intrusive "alert" by default;
		if you find this annoying, feel free to delete the alert
		and use the console line instead (just remember to keep
		an eye on your console when debugging).
		*/

		alert("HL error: "+errorText);
		//console.log("Error: "+errorText);
	}

	// Define all canvas-requiring functions to emit an error if they're called
	//  before hlInitCanvas has been called
	hlClear = function(){ warn("Calls to hlClear won't do anything until hlInitCanvas has been called"); };
	hlDrawRect = function(){ warn("Calls to hlDrawRect won't do anything until hlInitCanvas has been called"); };
	hlDrawText = function(){ warn("Calls to hlDrawText won't do anything until hlInitCanvas has been called"); };
	hlMouseX = function(){ warn("Calls to hlMouseX won't do anything until hlInitCanvas has been called"); };
	hlMouseY = function(){ warn("Calls to hlMouseY won't do anything until hlInitCanvas has been called"); };


	// Define hlInitCanvas & canvas requiring functions

	hlInitCanvas = function(canvWidth, canvHeight)
	{
		/* Injects a canvas into the html body
		 * Defines Draw functions
		 */

		// Check validity of arguments
		if(typeof canvHeight!=="number"){error("the \"canvHeight\" argument for \"hlClear\" has to be a number");return;}
		if(typeof canvWidth!=="number"){error("the \"canvWidth\" argument for \"hlClear\" has to be a number");return;}

		// Emit warning if hlInitCanvas has already been called
		if(canvInitialized)
		{
			warn("hlInitCanvas has been called more than once.  This will result in unusable canvases littering the page.");
		}
		canvInitialized = true;

		// Create & Inject canvas element
		// These few lines of code are sort of specific to how HTML5 works; for more
		//  info, look up DOM manipulation (TODO put good MDN Link if there is one)
		var canv = document.createElement("canvas"); // creates a canvas DOM element
		canv.width = canvWidth;   // note that this is a property of the canvas, NOT it's style
		canv.height = canvHeight;
		canv.style.display = "block"; // so the canvas can be centered
		canv.style.margin = "auto";  // centers the canvas
		if(document.body) document.body.prepend(canv);
		else window.addEventListener("load", function(){ document.body.prepend(canv); });


		// Define drawing functions
		
		hlClear = function(color = "black")
		{
			if(typeof color!=="string"){error("the \"color\" argument for \"hlClear\" has to be a string");return;}

			canv.getContext("2d").clearRect(0, 0, canvWidth, canvHeight);
			canv.style.backgroundColor = color;
		};

		hlDrawRect = function(x, y, width, height, color)
		{
			if(typeof x!=="number"){error("the \"x\" argument for \"hlDrawRect\" has to be a number");return;}
			if(typeof y!=="number"){error("the \"y\" argument for \"hlDrawRect\" has to be a number");return;}
			if(typeof width!=="number"){error("the \"width\" argument for \"hlDrawRect\" has to be a number");return;}
			if(typeof height!=="number"){error("the \"height\" argument for \"hlDrawRect\" has to be a number");return;}
			if(typeof color!=="string"){error("the \"color\" argument for \"hlDrawRect\" has to be a string");return;}

			// TODO add check if color invalid, print error if so and ax f0f below and in clear
			var ctx = canv.getContext("2d");
			ctx.fillStyle = color;
			ctx.fillRect(x-width/2, canvHeight-height/2-y, width, height);
			ctx.fillStyle = "#f0f"; // To make color errors more obvious
		};

		hlDrawCircle = function(x, y, radius, color)
		{
			if(typeof x!=="number"){error("the \"x\" argument for \"hlDrawCircle\" has to be a number");return;}
			if(typeof y!=="number"){error("the \"y\" argument for \"hlDrawCircle\" has to be a number");return;}
			if(typeof radius!=="number"){error("the \"radius\" argument for \"hlDrawCircle\" has to be a number");return;}
			if(typeof color!=="string"){error("the \"color\" argument for \"hlDrawCircle\" has to be a string");return;}

			// TODO add check if color invalid, print error if so and ax f0f below and in clear
			var ctx = canv.getContext("2d");
			ctx.fillStyle = color;
			ctx.beginPath();
			ctx.arc(x, canvHeight-y, radius, 0, 2*Math.PI);
			ctx.fill();
			ctx.fillStyle = "#f0f"; // To make color errors more obvious
		};

		hlDrawText = function(x, y, text, color = "white", size = 20, align = "left")
		{
			if(typeof x!=="number"){error("the \"x\" argument for \"hlDrawText\" has to be a number");return;}
			if(typeof y!=="number"){error("the \"y\" argument for \"hlDrawText\" has to be a number");return;}
			if(typeof color!=="string"){error("the \"color\" argument for \"hlDrawText\" has to be a string");return;}
			if(typeof size!=="number"){error("the \"size\" argument for \"hlDrawText\" has to be a number");return;}
			if(typeof align!=="string"){error("the \"align\" argument for \"hlDrawText\" has to be a string");return;}

			var ctx = canv.getContext("2d");
			ctx.fillStyle = color;
			ctx.textAlign = align;
			ctx.font = size+"px monospace";
			ctx.fillText(text, x, canvHeight-y);
			ctx.fillStyle = "#f0f"; // To make color errors more obvious

		}


		// Update lastMouseX/Y coordinates on mousemove events

		canv.addEventListener("mousemove", function(e)
		{
			var cr = canv.getBoundingClientRect();
			lastMouseX = e.clientX-cr.x;
			lastMouseY = canvHeight-(e.clientY-cr.y);
		});


		// Getter functions

		hlMouseX = function()
		{
			if(afReq==null)
			{
				warn("hlMouseX only works when a game loop has been started by hlStartMainLoop.");
				return false;
			}
			return lastMouseX;
		};

		hlMouseY = function()
		{
			if(afReq==null)
			{
				warn("hlMouseY only works when a game loop has been started by hlStartMainLoop.");
				return false;
			}

			return lastMouseY;
		};


		// Set background color to default
		hlClear();


		return canv;

	}


	// Game loop functions

	hlStartMainLoop = function(loopFunction, period = 0.016, data = null)
	{
		/*
		 * TODO rewrite or scratch all comments in here
		 * This function ensures that the main loop runs at a fixed rate
		 * 
		 * Rate is determined by the period argument (defaults to ~60 fps)
		 * Note the the "prevTime" variable stores the time when the last
		 *  update should have happened ideally; it does NOT store the time
		 *  for when loopFunction executed last.
		 * The "maxLag" constant determines how much "slack" to allow between
		 *  prevTime and the current time.  Since this is written to allow for
		 *  both physics and rendering updates to happen in the main loop, this
		 *  is CURRENTLY (1.9) limited to under two frames worth of time, so it
		 *  doesn't waste time rendering multiple frames consecutively.
		 *  TODO maybe put this below next to maxLag
		 *  TODO maybe if lag is 2+ frames big, set some variable which is
		 *  checked in draw calls, so can catch up with physics without
		 *  drawing unnecessarily?
		 */

		if(typeof loopFunction!=="function"){error("the \"loopFunction\" argument for \"hlStartMainLoop\" has to be a function");return;}
		if(typeof period!=="number"){error("the \"period\" argument for \"hlStartMainLoop\" has to be a number");return;}
		if(typeof data!=="object"){error("the \"data\" argument for \"hlStartMainLoop\" has to be a object");return;}

		if(afReq!=null)
		{
			warn("hlStartMainLoop has already been called; call hlStopMainLoop to stop the current loop.");
			return;
		}

		afPeriod = period;
		const maxLag = 1.9*period; // maximum amount of lag that will be compensated for, in seconds
		var prevTime; // time when the last update is considered to have happened

		function onFrame(currTime)
		{
			afReq = window.requestAnimationFrame(onFrame);

			// Adjust prevTime so lag never exceeds maxLag
			if(currTime-prevTime >= 1000*maxLag)
				prevTime = currTime - 1000*maxLag;

			// Execute mainLoop until LAG IS LESS THAN PERIOD TODO
			while(currTime-prevTime >= 1000*period)
			{
				// TODO double check that keyboard event handling is never multithreaded
				//  and that it's impossible for keystroke to get lost between key check
				//  in the loopFunction and the keyCatcher purge below
				loopFunction(data);
				prevTime+= 1000*period;
				keyCatcher = {};
				for(var k in keyState) if(keyState[k]) keyCatcher[k] = true;
			}

		}
		prevTime = performance.now() - period;
		onFrame();

	};

	hlStopMainLoop = function()
	{
		if(afReq==null)
		{
			warn("hlStopMainLoop has been called when no loop is currently executing.");
			return;
		}

		cancelAnimationFrame(afReq);
		afReq = null;

	};

	hlGetPeriod = function()
	{
		if(afReq==null)
		{
			warn("hlGetPeriod has been called when no loop is currently executing; returning 0.");
			return 0;
		}

		return afPeriod;

	};


	// Keyboard handling

	window.addEventListener("keydown",function(e)
	{
		// TODO figure out how to bind shifted keys together;
		//  atm key down -> shift down -> key up -> shift up results in "stuck" key
		keyCatcher[e.key] = true;
		keyState[e.key] = true;
	});

	window.addEventListener("keyup",function(e)
	{
		keyState[e.key] = false;
	});

	window.addEventListener("blur",function()
	{
		keyCatcher = {};
		keyState = {};
	});

	hlKeyHeld = function(key)
	{
		if(typeof key!=="string"){error("the \"key\" argument for \"hlKeyHeld\" has to be a string");return;}

		if(afReq==null)
		{
			warn("hlKeyHeld only works when a game loop has been started by hlStartMainLoop.");
			return false;
		}

		return (key in keyCatcher);
	};


})();

