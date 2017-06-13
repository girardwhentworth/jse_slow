// ==UserScript==
// @name         JSE Slow Userscript
// @namespace    http://tampermonkey.net/
// @version      0.1.0
// @description  Test
// @author       You
// @match		 http://ab.entertainmentcrave.com/lp.html*
// @grant        none
// ==/UserScript==

(function() {

	console.log("|--- JS ---| Running on host " + window.location.hostname);

	'use strict';
	var focusLock = false;
	var minutes = 2; //1.75;
	var minute = 60000;
	var inactivityTimer = minute * minutes;
	var isTimeout;
	var startTime, endTime, elapsedTotalSeconds, elapsedSeconds, elapsedMinutes;

	window.addEventListener("focus", function(event) {

		mainFunction();

	});

	//startTimeout();

	window.onLoad = mainFunction();

	// If activityTimer has run out, reload the page
	// (every onFocus will add time to the timer)

	function startTimeout() {
		console.log("|--- JS ---| Initializing the timeout.");
		startTime = new Date();
		var isTimeout = setTimeout(function() {
			calcTimeElapsed();
			document.location.reload(true);
		}, inactivityTimer);
	}


	function calcTimeElapsed() {
		endTime = new Date();
		elapsedTotalSeconds = Math.floor(Math.abs(endTime - startTime) / 1000);
		elapsedMinutes = Math.floor(elapsedTotalSeconds / 60);
		elapsedSeconds = Math.floor(elapsedTotalSeconds % 60);
		console.log("|--- JS ---| Elapsed time is " + elapsedMinutes + ":" + elapsedSeconds);
	}

	function mainFunction() {

		console.log("|--- JS ---| Window has focus; firing main function.");

		// Reset the inactivity timer
		//console.log("|--- JS ---| Clearing the current timeout.");
		//clearTimeout(isTimeout);
		//calcTimeElapsed();
		//console.log("|--- JS ---| Calling the timeout start.");
		//startTimeout();

		// Only run if the focus is not locked
		if (!focusLock) {

			// "Occupied!"
			focusLock = true;

			// Helped finding the right IFRAME to use in the @match
			// console.log("My information:");
			// console.log("  - " + window.location);

			setTimeout(function() {

				console.log("|--- JS ---| Starting main timeout function.");

				// elems = array of all SPAN tags on the page
				// spanID = array of all the SPAN tags that hold the SB Amount
				// sbAmount = array of the integer of the SB Amount

				var elems = document.getElementsByTagName("span"), elemCount=elems.length, spanID = [], i = 0, j = 0, tot = 0, sbAmount = [], maxSB = 0;

				for (i=0,  tot=elemCount; i < tot; i++) {

					if (elems[i].getAttribute("ng-bind") === 'Placement.SBAmount'){

						// Only add the current SPAN to the spanID array if it's one of the ones we want
						spanID.push(elems[i]);
						sbAmount.push(elems[i].textContent);  // Add the SB amount to the array

						if (parseInt(elems[i].textContent) > maxSB) { // check if the SB amount is larger than the current maxSB
							maxSB = parseInt(elems[i].textContent);   // if so, update maxSB
						}
					}
				}

				console.log("|--- JS ---| # of total span elements = " + elemCount);
				console.log("|--- JS ---| # of useful span         = " + spanID.length);
				console.log("|--- JS ---| Most SB available        = " + maxSB);

				// Count down from the largest SB amount found to the smallest
				OuterLoop:
				for (i=maxSB; i >= 0; i--) {

					console.log("|--- JS ---| Checking for links worth " + i + " SB");

					// Loop through all the sbAmount array values
					InnerLoop:
					for (j=0,  tot=sbAmount.length; j < tot; j++) {

						//console.log(sbAmount[j] + " SB for " + elems[j]);

						// If the current sbAmount value is the max
						if(parseInt(sbAmount[j]) == i) {

							// Set the node, localName and HREF attribute for 3 parents up
							var p1node = spanID[j].parentNode,
								p1name = p1node.localName,
								p1attr = p1node.getAttribute("href"),
								p2node = spanID[j].parentNode.parentNode,
								p2name = p2node.localName,
								p2attr = p2node.getAttribute("href"),
								p3node = spanID[j].parentNode.parentNode.parentNode,
								p3name = p3node.localName,
								p3attr = p3node.getAttribute("href"),
								currSB = sbAmount[j];

							// Pick the name and attribute for the correct parent
							var attr = '', node = '';
							switch("a") {

								case p1name:
									attr = p1attr;
									node = p1node;
									break;
								case p2name:
									attr = p2attr;
									node = p2node;
									break;
								case p3name:
									attr = p3attr;
									node = p3node;
									break;
							}

							// Check if the playlist is in the blacklist, and if so, don't execute the code below
							if(!isBlacklisted(attr)) {
								node.click();
								break OuterLoop;
							}
						}
					}
				}

				// List all the SPAN elements we found
				// for (i=0,  tot=elemCount; i < tot; i++) {
				//     console.log(elems[i]);
				// }

				// List all the SB amounts we found
				// for (i=0,  tot=sbAmount.length; i < tot; i++) {
				//     console.log(sbAmount[i]);
				// }

				// remove the lock so it can run the next time it's called
				focusLock = false;
				console.log("|--- JS ---| End of JS Helper Extension");
			}, 10000);
		}
	}

	// FUNCTION check if the playlist link is in the blacklist (these playlists are broken)
	function isBlacklisted(attr){
		// Regex to get playlist value

		// http://player.ngage-media.com/s/?u=546d0961b0926176f4078a97&f=3&s=


		var plist = attr.substring(attr.indexOf("plid=")+5,attr.indexOf("$"));

		// Ngage-media doesn't follow the same 'plid=12345$' so the plist won't be right
		var isNgage = attr.indexOf("ngage-media");
		if (attr.indexOf("ngage-media") != -1) {
			plist = "ngage";
		}

		var ret = '';
		//console.log('|--- JS ---| Found attribute ' + attr);
		//console.log('|--- JS ---| isNgage value is ' + isNgage);
		console.log('|--- JS ---| Found playlist ' + plist);

		switch (plist) {

			case 'ngage':
			case '58d061467591fd923d8b456c':
			case '5939a3ef7591fd70488b4568':
			case '58eff8c57591fdbc348b4568':
			case '5928a1f97591fdf10c8b4568':
			case '58d0613d7591fd923d8b456a':
			case '583e0e2c7591fd19428b4568':
			case '5903953c7591fd35718b4568':
			case '536be5107591fd847d8b456a':
			case '566a0e7b7591fd49728b4568':
			case '55fc58d87591fd064d8b456a':
			case '57b54de67591fd081a8b4568':
			case '5748d08a7591fdfc608b4568':
			case '576af13b7591fd15108b4568':
				console.log("|--- JS ---|   - on the blacklist");
				ret = true;
				break;

			default:
				console.log("|--- JS ---|   - safe playlist");
				ret = false;
		}
		return ret;
	}

	// FUNCTION to open a window (not in use)
	function eventFire(el, etype){
		console.log("|--- JS ---|   (inside eventFire)");
		if (el.fireEvent) {
			el.fireEvent('on' + etype);
		} else {
			var evObj = document.createEvent('Events');
			evObj.initEvent(etype, true, false);
			el.dispatchEvent(evObj);
		}
	}
})();
