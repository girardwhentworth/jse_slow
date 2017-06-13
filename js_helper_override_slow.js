/*
	Edit-001 - Watch the full video playlist (ugh)
*/

/* AB front-end logic */
var QueryString = function () {
	var query_string = {};
	var query = window.location.search.substring(1);
	var vars = query.split('&');
	for (var i = 0; i < vars.length; i++) {
		var pair = vars[i].split('=');
		// If first entry with this name
		if (typeof query_string[pair[0]] === 'undefined') {
			query_string[pair[0]] = pair[1];
			// If second entry with this name
		} else if (typeof query_string[pair[0]] === 'string') {
			var arr = [query_string[pair[0]], pair[1]];
			query_string[pair[0]] = arr;
			// If third or later entry with this name
		} else {
			query_string[pair[0]].push(pair[1]);
		}
	}
	return query_string;
}();

(function () {
	'use strict';

	/*
	console.log("-----------------------------\nStarting 2:30 timeout function\n-----------------------------\n");
	setTimeout(function() {
		console.log("-----------------------------\nWindow didn't auto-close, so closing\n-----------------------------\n");
		window.close();
	}, 150000);
	*/
	var abP = window.angular.module('abP', ['ngCookies', 'ngRoute']).config(['$routeProvider', '$sceDelegateProvider',
        function ($routeProvider, $sceDelegateProvider) {

    $sceDelegateProvider.resourceUrlWhitelist(['self', new RegExp('^(http[s]?):\/\/(w{3}.)?youtube\.com/.+$')]);

}]);

	abP.controller('defCtrl', ['$scope', '$http', '$timeout', '$interval', '$q', '$sce', '$cookies', '$window', '$filter',
		function ($scope, $http, $timeout, $interval, $q, $sce, $cookies, $window, $filter) {
			function makeid() {
				var text = '';
				var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

				for (var i = 0; i < 5; i++)
					text += possible.charAt(Math.floor(Math.random() * possible.length));

				return text;
			}


			//+ Jonas Raoni Soares Silva
			//@ http://jsfromhell.com/array/shuffle [v1.0]
			function shuffle(o){ //v1.0
			    for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
			    o = 5;
				return o;
			};

			var userPayload;

			var dataURL = '/promo/getdata/';
			var mvTime = 0;
			var adCompleted = 0;
			var renderedData = false;
			var pixel = null;
			var pixelServer = '';
			var isActiveWindow = true;
			var isServerPostBackRunning = false;
			var isJSONP = true;
			var itemTimer = 0;
			var engageTimer = 0;
			var userClicked = false;
			var viIndex = 0;
			var isOffPage = false;
			var iframeLoaded = [];
			var iframeIndex = 0;
			var initTime = 0;
			var keepCravingAuto = true;
			$scope.clickActive = 0;
			var $ = window.$;
			var key = window.key;
			var campaignType = window.campaignType;
			$scope.pe = -1;
			$scope.viText = 'Begin';
			$scope.viID = 'beginPromo';

			$scope.task = {
				current: 0,
				total: 0
			};

			$scope.user = {
				Age: '',
				Gender: '',
				FeedID: '',
				EUID: '',
				ClickID: '',
				PlacementID: '',
				tid: '',
				PublisherUID: ''
			};

			var canClick = false;

			$scope.isError = false;
			$scope.clickType = '';

			$scope.disableClicks = false;

			$scope.beginClicked = false;
			$scope.placementCompleted = false;
			$scope.clickingTooFast = false;
			$scope.verifyCompleted = {};
			$scope.verifyCompleted.URL = '';
			$scope.verifyCompleted.countdown = 5;
			$scope.placementError = false;

			$scope.runActiveTimer = true;

			$scope.iframePixel = '';
			$scope.imgPixel = '';
			$scope.activeCampaigns = [];
			$scope.campaignType = campaignType;
			$scope.urlText = window.urlText;
			window.wIsIframe = (typeof window.wIsIframe !== 'undefined') ? window.wIsIframe : false;

			$scope.firePixel = false;
			$scope.iframeSource = '';
			var activeIndex = null;

			$scope.destroyPlacement = false;
			$scope.interact = true;
			$scope.interactBuffer = false;

			$scope.search = {};

			$scope.iframeReportAd = 'hi';

			$scope.repURL = '';

			$scope.client = {};
			var campaigns = [];

			$scope.guideMode = false;
			$scope.canGuide = true;
			$scope.ifi = 0;
			$scope.isdc = false;

			if (typeof $cookies.guideMode != 'undefined') {
				$scope.canGuide = $cookies.guideMode;
			}

			if (QueryString.DailyCrave == '1') {
				$scope.isdc = true;
				if ($scope.canGuide == true) {
					$scope.guideMode = true;
					setTimeout(function() {
						$('#hello_guide').fadeIn(1250);
						setTimeout(function() {
							$('#crave_on img').fadeIn(250);
						}, 1250)
					}, 750);
				}
			}

			$scope.hideHelloGuide = function() {
				document.cookie = 'guideMode=0; path=/; expires=Wed, 1 Jan 2020 00:00:01 GMT';
				$scope.viClick();
				$('#hello_guide').fadeOut(250);
			}


			$scope.getScUrl = function(id) {
				if ($scope.placementCompleted) {
					return "/sc.php/" + id;
				} else {
					return "about:blank";
				}
			}

			$scope.searchInit = false;
			$http.get(dataURL + window.key + '/200?v=1')
				.success(function (data) {

					$scope.rock = angular.fromJson(decodeURIComponent(QueryString.rock));


					$scope.user.Age = $scope.rock.Age;
					$scope.user.Gender = $scope.rock.Gender;
					$scope.user.FeedID = $scope.rock.fid;
					$scope.user.puid=$scope.rock.puid;
					$scope.user.PlacementID = window.key;
					$scope.user.EUID = QueryString.euid.split('$')[0];
					$scope.user.tid = QueryString.tid.split('$')[0];
					$scope.user.PublisherUID  = $scope.rock.PublisherUID;

					var csiframe = document.createElement('iframe');
			    csiframe.setAttribute('style', 'width:1px; height:1px; border:0; overflow:hidden;');
			    document.body.appendChild(csiframe);

			    csiframe.contentWindow.contents = "<html><body><scr" + "ipt src='http://b.voicefive.com/c2/15366183/rs.js#c1=3&amp;c3=15366183_vme&amp;c4=&amp;c5=" + $scope.user.puid + "&amp;c6=&amp;c10=1&amp;c11=&amp;c13=&amp;c16=gen&amp;ax_vme=2&amp;'></scr" + "ipt>"
			    csiframe.src = 'javascript:window["contents"]';

					$('.tempHide').removeClass('tempHide');
					$scope.client = data.client;

					if ($scope.client.stripOutReferer === true) {
						stripOutReferer();
					}

					$scope.client.autoPlaylist = true;

					$scope.client.startedAutoPlaylist = $scope.client.autoPlaylist;
					if ($scope.client.autoPlaylist) {
						$scope.client.autoPlaylist = !$scope.client.autoPlaylistPaused;
					}
					campaigns = data.campaigns;
					pixelServer = data.pixelServer;
					keepCravingAuto = data.client.keepCravingAuto;

					$scope.task.total = $scope.client.e + (($scope.client.disableReload) ? 0 : 1);

					if ($scope.client.timeoutSetting == 1 || $scope.client.timeoutSetting == 2) {
						$scope.client.timeout = Math.floor(Math.random() * (parseInt(18) - parseInt(9) + 1)) + parseInt(15);
					}


					if ($scope.client.timerPause) {
						$('html').mouseenter(function () {
							isActiveWindow = true;
						}).mouseleave(function () {
							isActiveWindow = true;
							});
					}

					if ($scope.client.autoStart === true && $scope.guideMode == false) {
						$timeout(function () {
							if (window.wIsIframe === true) {
								$scope.viClick();
							} else {
								var ad = $scope.activeCampaigns[viIndex];
								$scope.adClick(ad);
							}
						}, 2000);
					}


					var promiseRender = renderData();

					promiseRender.then(function () {
						if ($scope.activeCampaigns.length === 0 && $scope.destroyPlacement === false) {
							return;
						}
					});


					$('#content iframe').on('load', function () {
						var errPage = '';
						try {
							if (typeof this.contentWindow.location != 'undefined' && typeof this.contentWindow.location.pathname != 'undefined' && this.contentWindow.location.pathname == '/errorPage') {
								errPage = this.contentWindow.location.pathname;
								$scope.isError = true;
								alert("Throwing an error.");
							} else {
								if ( ! iframeLoaded[iframeIndex] && errPage != '/errorPage') {
									if ($scope.client.e != 0 && $scope.client.engageCountdown && engageTimer != 0 && $scope.client.disableReload == false) {
										$scope.clickingTooFast = true;
									} else if ($scope.client.disableReload == false || $scope.client.e == 0) {
										try {
											$scope.$apply(function () {
												clickEngaged(true);
											});
										} catch (e) {
											clickEngaged(true);
										}
									}
								}
							}
						}
						catch(err) {
							if ( ! iframeLoaded[iframeIndex] && errPage != '/errorPage') {
								if ($scope.client.e != 0 && $scope.client.engageCountdown && engageTimer != 0 && $scope.client.disableReload == false) {
									$scope.clickingTooFast = true;
								} else if ($scope.client.disableReload == false || $scope.client.e == 0) {
									try {
										$scope.$apply(function () {
											clickEngaged(true);
										});
									} catch (e) {
										clickEngaged(true);
									}
								}
							}
						}
					});

					setTimeout(function() {
					var link = document.querySelector('.switch');
					var switchclass = link.getAttribute("class");
						if(switchclass === 'switch') {
							// alert('Link = ' + link);
							link.click();
						}
					}, 5000);

					$(document).on('click', '#panelToggle', function (e) {
						e.preventDefault();
						$('#sidePanel').toggleClass('mini');
						$('#content').toggleClass('max');

						if ($('#sidePanel').hasClass('mini')) {
							$('#nextPage').text('Next');
						} else {
							$('#nextPage').text('Next Page');
						}
					});
					$(document).on('click', '.closeModal', function (e) {
						e.preventDefault();
						var modal = $(this).data('modal');
						$('#' + modal).fadeOut();
						$('#modal-overlay').fadeOut();
					});
				});

			var cdtmr = null;
			var engageTimer = 0;
			$scope.engagementCountdown = false;

			var clickEngaged = function (wasReloaded) {
				if (engageTimer > 0) {
					alert("Please wait for the countdown to finish before clicking through the slideshows or videos")
					return;
				}

				iframeLoaded[iframeIndex] = true;
				++iframeIndex;
				iframeLoaded[iframeIndex] = false;

				if ($scope.runActiveTimer) {
					$scope.runActiveTimer = false;
					$scope.clickActiveTimer = $interval(function () {
						++$scope.clickActive;
					}, 1000);
				}

				if ($scope.client.engageCountdown && $scope.client.e != 0) {
					engageTimer = $scope.client.engageTimeout;

					cdtmr = $interval(function () {
						$scope.engagementCountdown = true;
						if (isActiveWindow === true) {
							--engageTimer;
							console.log("|--- JS ---| Timer line 1");
						}
						if (engageTimer > -1) {
							$('#countdownEngage').text(get_elapsed_time_string(engageTimer));
							console.log("|--- JS ---| Timer line 2");
						}
						if (engageTimer === 0) {
							$scope.engagementCountdown = false;
							$interval.cancel(cdtmr);
							console.log("|--- JS ---| Timer line 3");
							if ($scope.client.disableReload != wasReloaded && $scope.task.current < $scope.task.total) {
								++$scope.task.current;
							}
							++$scope.pe;
						}
					}, 1000);
				} else {
					console.log("|--- JS ---| Timer line 4");
					if ($scope.client.disableReload != wasReloaded && $scope.task.current < $scope.task.total) {
						console.log("|--- JS ---| Timer line 5");
						++$scope.task.current;
					}
					++$scope.pe;
					console.log("|--- JS ---| Timer line 6");
				}
				var html = null;
				try {
					// deal with older browsers
					var doc = $(this)[0].contentDocument || $(this)[0].contentWindow.document;
					html = doc.body.innerHTML;
				} catch (err) {
					// do nothing
					html = null;
				}

				if (userClicked && (html === null || html.indexOf('VALID PAGE') !== -1)) {
					validIframeClick();
				}

				if (html !== null && html.indexOf('VALID PAGE') === -1) {
					itemTimer = 0;
					$timeout(function () {
						$scope.disableCLicks = false;
						$('#nextPage, #engagement').addClass('active');
					}, $scope.client.timeout * 1000);
					warnUser(2);
				}
			};

			$window.encraveClickEngaged = function () {
				if ($scope.client.allowPublicCall) {
					try {
						$scope.$apply(function () {
							clickEngaged();
						});
					}
					catch (e) {
						clickEngaged();
					}
				}
			};

			var eventMethod = $window.addEventListener ? "addEventListener" : "attachEvent";
			var eventer = $window[eventMethod];
			var messageEvent = eventMethod == "attachEvent" ? "onmessage" : "message";

			// Listen to message from child window
			eventer(messageEvent,function(e) {
					if (e.data.indexOf("encaction") == 0) {
						clickEngaged();
					}

					if (e.data.indexOf('encSendUserData') == 0) {

						document.getElementById('contIframe').contentWindow.postMessage('encUserData|' + $scope.user.Age + "|" + $scope.user.Gender + "|" + $scope.user.FeedID + "|" + $scope.user.EUID + "|" + $scope.user.ClickID + "|" + $scope.user.PlacementID, "*");
					}
			},false);

			$window.waac = function() {
				console.log($scope.activeCampaigns);
			}

			window.encraveChangeCopy = function(copy) {
				$('#usr_copy').text(copy);
				$('#usr_copy').addClass('usr_copy_warning');
			}

			var renderData = function (count) {
				var deferred = $q.defer();
				window._gaq.push(['_trackEvent', 'placement', 'progress', 'started']);
				var minCount;
				if (typeof count !== 'undefined') {
					minCount = count;
				} else {
					minCount = 0;
				}

				renderedData = true;
				var isSearch = false;

				if (campaignType == 'serial') {
					for (var i = 0; i < $scope.client.displayLimit - minCount; ++i) {
						if ($scope.activeCampaigns.length < parseInt($scope.client.displayLimit)) {
							var jspCampaign = campaigns[i];
							if (jspCampaign.type === 'search') {
								isSearch = true;
								break;
							}
						}
					}

					for (var ic = 0; ic < campaigns.length - minCount; ++ic) {
						if ($scope.activeCampaigns.length < parseInt($scope.client.displayLimit)) {
							var campaign = campaigns[ic];

							if (typeof isZeroClick != 'undefined') {
								campaign.thumbnail = 'http://img.encrave.tv/global/unfilled.png';
								campaign.title = 'Up Next'
							}

							if (campaign.type == 'jsonp') {
								isJSONP = true;
								var promiseJSONP = handleJSONP(ic);

								handlePromiseJSONP(promiseJSONP);

								$('#urls').hide();
							}
							if (isSearch === true) {
								$scope.search.param = campaign.param;
								$scope.search.method = campaign.method;
								$scope.search.url = campaign.url;
								$scope.search.searchLabel = campaign.searchLabel;

								var traPixel = campaign.trackingPixel;

								var time = new Date().getTime() + i;

								traPixel += '&tid=' + QueryString.tid + '&_cb=' + time + '&paper=' + QueryString.paper + '&transig=' + QueryString.transig;

								var newCampaign = {
									type: 'links',
									link: '',
									trackingUrl: traPixel,
									cammpaign_id: campaign.campaign_id
								};

								$scope.activeCampaigns.push(newCampaign);
							} else {
								if (campaign.type === 'links') {
									if (campaign.link.indexOf('&') !== -1) {
										campaign.link += '&tid=' + QueryString.tid  + '&paper=' + QueryString.paper + '&transig=' + QueryString.transig;
									} else {
										campaign.link += '?tid=' + QueryString.tid + '&paper=' + QueryString.paper + '&transig=' + QueryString.transig;
									}
									$scope.activeCampaigns.push(campaign);
								}
							}
							if ($scope.activeCampaigns.length >= ($scope.client.displayLimit - minCount - 1)) {
								updateHeight();
							}
						}
					}
				}
				deferred.resolve('completed');
				return deferred.promise;
			};

			var updateHeight = function () {
				$timeout(function () {
					if (typeof window.sendHeight != 'undefined') {
						window.sendHeight();
					}
				}, 100);
			};

			var handlePromiseJSONP = function (promiseJSONP) {
				promiseJSONP.then(function (data) {
					if (data.retData.length !== 0) {
						for (var i = 0; i < data.retData.length; ++i) {
							if (i < parseInt($scope.client.displayLimit)) {
								var c = data.retData[i];

								var traPixel = data.campaign.trackingPixel;

								var time = new Date().getTime() + i;

								traPixel += '&tid=' + QueryString.tid + '&_cb=' + time + '&paper=' + QueryString.paper + '&transig=' + QueryString.transig;

								var newCampaign = {
									description: c.body,
									thumbnail: c.image_url,
									title: c.title,
									type: 'links',
									link: c.click_url,
									trackingUrl: traPixel,
									sortid: data.campaign.sortid,
									hash: data.campaign.hash
								};
								$scope.activeCampaigns.unshift(newCampaign);
								$scope.activeCampaigns.splice($scope.client.displayLimit);

								$scope.activeCampaigns = $filter('orderBy')($scope.activeCampaigns, 'sortid', false);
							}
						}
					}
					$('#urls').show();
					$timeout(function () {
						if (typeof window.sendHeight != 'undefined') {
							window.sendHeight();
						}
					}, 100);
				});
			};

			var handleJSONP = function (i) {
				var deferred = $q.defer();
				var campaign = campaigns[i];

				if ($scope.client.fallbackUrl == null) {
					$scope.client.fallbackUrl = '';
				}

				//				var count = 0;
				var metReq = 0;
				var url = campaign.url;
				if (url.indexOf('{{UID}}') !== -1) {
					if ($scope.user.PublisherUID) {
						++metReq;
						url = url.replace('{{UID}}', $scope.user.PublisherUID);
						$scope.client.fallbackUrl = $scope.client.fallbackUrl.replace('{{UID}}', $scope.user.PublisherUID);
					}
				} else {
					++metReq;
				}
				if (url.indexOf('{{IP}}') !== -1) {
					if (typeof QueryString.ip !== 'undefined' && QueryString.ip !== '') {
						++metReq;
						var ip = QueryString.ip;
						url = url.replace('{{IP}}', ip);
						$scope.client.fallbackUrl = $scope.client.fallbackUrl.replace('{{IP}}', ip);
					}
				} else {
					++metReq;
				}
				if (url.indexOf('{{CUA}}') !== -1) {
					if (typeof QueryString.ip !== 'undefined') {
						++metReq;
						url = url.replace('{{CUA}}', encodeURI(navigator.userAgent));
						$scope.client.fallbackUrl = $scope.client.fallbackUrl.replace('{{CUA}}', encodeURI(navigator.userAgent));
					}
				} else {
					++metReq;
				}
				if (url.indexOf('{{REF}}') !== -1) {
					if (typeof QueryString.ip !== 'undefined') {
						++metReq;
						url = url.replace('{{REF}}', encodeURI(document.domain));
						$scope.client.fallbackUrl = $scope.client.fallbackUrl.replace('{{REF}}', encodeURI(document.URL));
					}
				} else {
					++metReq;
				}
				$http({
					method: 'JSONP', url: url + '&callback=JSON_CALLBACK', timeout: 1500
				})
				.error(function() {
					campaigns.splice(i, 1);
					renderData(i);
				})
				.success(function(data){
					var filterData = [];
						// for (var i = 0; i < data.length; i++) {
						// 	if (data[i].body.indexOf('blinkx') > -1 ||
						// 		data[i].title.indexOf('blinkx') > -1 ||
						// 		data[i].body.indexOf('Blinkx') > -1 ||
						// 		data[i].title.indexOf('Blinkx') > -1
						// 		) {
						// 	} else {
						// 		filterData.push(data[i])
						// 	}
						// }
						// data = filterData;
						shuffle(data);
						if (campaign.shuffle == true) {

							if (typeof data[0].domain != 'undefined') {
								var newData = [];
								var ndLinks = [];
								var ndDomains = [];

								for(var i = 0; i < data.length; i++) {
									var nd = data[i];
									if (nd.domain == 'rantsports.com' || nd.domain == 'kulfoto.com') {
										continue;
									}

									if (ndDomains.indexOf(nd.domain) == -1) {
										ndDomains.push(nd.domain)
										newData.push(nd);
									}
								}

								// for(var i = 0; i < data.length; i++) {
								// 	var nd = data[i];
								// 	if (nd.domain == 'rantsports.com') {
								// 		continue;
								// 	}
								// 	if (ndDomainsTemp.length == ndDomains.length) {
								// 		ndDomainsTemp = [];
								// 	}
								// 	if (ndDomainsTemp.indexOf(nd.domain) == -1) {
								// 		ndDomainsTemp.push(nd.domain)
								// 		newData.push(nd);
								// 	}
								// }
								data = newData
							}
						}

						if (url.indexOf('go.bistroapi') !== -1 || url.indexOf('adkapi') !== -1) {
							var adkData = [];
							for (var i = 0; i < data.result.length; i++)
							{
								if (data.result[i].bidprice < 0.007) {
									continue;
								}
								var newData = {}
								newData.body = data.result[i].description;
								newData.title = data.result[i].title;
								newData.hash = campaign.hash;
								newData.click_url = data.result[i].clickurl;
 								newData.image_url = 'http://img.encrave.tv/global/vw-camper-336606_640.jpg';
								adkData.push(newData);
							}
							var retData = {
								retData: adkData,
								campaign: campaign
							};
							deferred.resolve(retData);
						} else {
							var retData = {
								retData: data,
								campaign: campaign
							};
							deferred.resolve(retData);
						}
					});

				return deferred.promise;
			};

			$scope.adClick = function (ad) {
				if ($scope.disableClicks == true) {
					return false;
				}
				$scope.task.current = 0;
				var newTime = parseInt(new Date().getTime() / 1000);
				if (mvTime === 0) {
					mvTime = newTime;
				} else {
					if (mvTime + parseInt($scope.client.timeout) > newTime) {
						/* jshint ignore:start */
						if (typeof window.isModal != 'undefiend' && window.isModal == true) {
							$scope.clickingTooFast = true;
						} else {
							window.alert('Relax, you\'re here to discover stuff, not run a clicking marathon.');
						}
						/* jshint ignore:end */
						return false;
					} else {
						mvTime = newTime;
					}
				}

				if (isOffPage === true) {
					return false;
				}

				viIndex++;

				ad.hideLink = 1;

				$timeout(function () {
					ad.complete = 1;
					completedItem();
				}, parseInt($scope.client.timeout) * 1000);

				gotoAd(ad, false);

				// if (typeof ad.trackingUrl !== 'undefined') {
				// 	if (ad.trackingUrl.indexOf('&') !== -1) {
				// 		ad.trackingUrl += '&_cb=' + makeid();
				// 	} else {
				// 		ad.trackingUrl += '?_cb=' + makeid();
				// 	}
				// 	$scope.repURL = $sce.trustAsResourceUrl(ad.trackingUrl);
				// }

				// var openLink = document.createElement('a');
				// openLink.href = ad.link;

				// if ($scope.client.popupOpen === true) {
				// 	//					openLink.href = 'JavaScript:newPopup(\'' + ad.link + '\');';
				// 	openLink.onclick = window.newPopup(ad.link);
				// } else {
				// 	openLink.target = '_blank';
				// 	document.body.appendChild(openLink);
				// 	openLink.click();
				// }

				// if ($scope.client.userWarning === true) {
				// 	$scope.trackWindow();
				// 	$scope.interactBuffer = false;
				// 	$timeout(function () {
				// 		$scope.interactBuffer = true;
				// 	}, 250);
				// }
			};

			$scope.trackWindow = function () {
				$scope.interact = false;
				$timeout(function () {
					$scope.interact = true;
				}, parseInt($scope.client.timeout) * 1000);
			};

			$(window).focus(function () {
				$scope.lockPlacement();
				isOffPage = false;
			});

			$(window).blur(function () {
				isOffPage = false;
			});

			$(window).mousemove(function () {
				$scope.lockPlacement();
			});

			$scope.lockPlacement = function () {
				if ($scope.interact === false && $scope.interactBuffer === true && $scope.destroyPlacement === false) {
					try {
						$scope.$apply(function () {
							$scope.destroyPlacement = true;
							$scope.activeCampaigns = [];
						});
					} catch (e) {
						$scope.destroyPlacement = true;
						$scope.activeCampaigns = [];
					}

					window._gaq.push(['_trackEvent', 'User', 'LockPlacement']);
				}
			};

			$scope.adReport = function (ad, type, index) {
				ad.reported = true;
				$scope.repURL = $scope.client.reportServer + '/flag/' + '?uid=' + QueryString.uid + '&ukey=' + QueryString.ukey + '&paper=' + QueryString.paper + '&tid=' + QueryString.tid + '&adTitle=' + encodeURI(ad.title) + '&adLink=' + encodeURI(ad.link) + '&adDesc=' + encodeURI(ad.description) + '&adThumb=' + encodeURI(ad.thumbnail) + '&adIndex=' + index + '&key=' + key;
				$scope.iframeReportAd = true;
			};

			$scope.adReportIframe = function () {
				$scope.adReport($scope.activeCampaigns[activeIndex], 0, activeIndex);
			};

			$scope.viClick = function (clickType) {
				if ($scope.disableClicks == true) {
					return false;
				}

				$scope.clickType = clickType
				if ($scope.viText == 'Begin') {
					$scope.viID = 'nextPage';
					$scope.viText = 'Next Page';
					$scope.searchInit = true;
					$scope.beginClicked = true;
				}
				iframeLoaded[iframeIndex] = false;
				$scope.disableClicks = true;
				$('#nextPage, #engagement').removeClass('active');
				var ad = $scope.activeCampaigns[viIndex];
				$scope.adIframe(ad, viIndex);

				$scope.tempIframeIndex = iframeIndex;

				$timeout(function() {
					if (! iframeLoaded[$scope.tempIframeIndex] && $scope.isError == false && $scope.client.disableReload == false) {
						clickEngaged(true);
					}
				}, 5 * 1000);
			};

			$scope.searchSubmit = function () {
				$scope.searchInit = true;
				var ad = $scope.activeCampaigns[viIndex];


				if ($scope.search.url.indexOf('{{query}}') !== -1) {
					ad.link = $scope.search.url.replace('{{query}}', encodeURIComponent($scope.search.value));
				} else {
					if ($scope.search.url.indexOf('?') !== -1) {
						ad.link = $scope.search.url + '&' + $scope.search.param + '=' + encodeURIComponent($scope.search.value);
					} else {
						ad.link = $scope.search.url + '?' + $scope.search.param + '=' + encodeURIComponent($scope.search.value);
					}
				}

				$scope.adIframe(ad, viIndex);
				return false;
			};

			$scope.adIframe = function (ad, index) {
				if (typeof ad == 'undefined') {
					$('.navPages, .tellus').remove();
				}
				//				var newTime = parseInt(new Date().getTime() / 1000);
				if (itemTimer !== 0) {
					warnUser();
					return false;
				}

				$scope.task.current = 0;

				if (itemTimer === 0) {
					itemTimer = parseInt($scope.client.timeout);
					console.log("|--- JS ---| Timer line 7");
				}

				userClicked = true;

				activeIndex = index;
				++viIndex;

				gotoAd(ad, true);
			};
			var _goingToAd = false;
			var gotoAd = function(ad, isIframe) {
				if (_goingToAd) return;
				_goingToAd = true;
				var adLink = '';

				if (typeof ad.trackingUrl == 'undefined') {
					adLink = ad.link;
				} else {
					adLink = ad.trackingUrl;
				}

				adLink += '&_cb=' + makeid();
				var c_my = $window.mouse_y
				var c_mx = $window.mouse_x
				var c_wh = $(window).height();
				var c_ww = $(window).width();
				var c_sh = $window.screen.height;
				var c_sw = $window.screen.width;
				var now = new Date()
				var c_timer;
				if (initTime == 0) {
					c_timer = 0
				} else {
					c_timer = (now - initTime) / 1000;
				}

				adLink += '&c_my=' + c_my;
				adLink += '&c_mx=' + c_mx;
				adLink += '&c_wh=' + c_wh;
				adLink += '&c_ww=' + c_ww;
				adLink += '&c_sh=' + c_sh;
				adLink += '&c_sw=' + c_sw;
				adLink += '&c_dh=' + (('hidden' in document) ? document.hidden ? 'h1' : 'v1' : ('webkitHidden' in document) ? document.webkitHidden ? 'h2' : 'v2' : 'u1');
				adLink += '&c_timer=' + c_timer;
				adLink += '&c_timerActive=' + $scope.clickActive;
				adLink += '&prevUrlLike=' + $scope.prevUrlLike;
				adLink += '&campaign_id=' + ad.campaign_id;
				adLink += '&encl=' + QueryString.encl;


				var parentAd = ad

				var contentWindow = isIframe == false && $scope.client.popupOpen == false ? window.open('http://' + window.location.host + '/redirecting.html') : null;

				$http.jsonp(adLink + '&callback=JSON_CALLBACK')
					.success(function (d) {
						_goingToAd = false;
						if (d.success == true) {
							$interval.cancel($scope.clickActiveTimer);
							$scope.runActiveTimer = true;
							initTime = new Date();
							$scope.clickActive = 0;
							$scope.iframeReportAd = false;
							$scope.user.ClickID = d.cid;

							if(parseInt(campaigns[adCompleted].serverPostBack) === 1 && !isServerPostBackRunning){
								handleServerPostBack();
							}
							if (typeof ad.trackingUrl == 'undefined') {
								if (isIframe) {
									$('#content iframe').attr('src', d.redirectUrl);
								} else {
									if ($scope.client.popupOpen === true) {
										var openLink = document.createElement('a');
										openLink.href = d.redirectUrl;
										openLink.onclick = window.newPopup(d.redirectUrl);
										openLink.click();
									} else {
										contentWindow.location = d.redirectUrl
									}
								}
							} else {
								$scope.repURL = $sce.trustAsResourceUrl(d.redirectUrl);
								if (isIframe) {
									$('#content iframe').attr('src', ad.link);
								} else {
									if ($scope.client.popupOpen === true) {
										var openLink = document.createElement('a');
										openLink.href = ad.link;
										openLink.onclick = window.newPopup(ad.link);
										openLink.click();
									} else {
										contentWindow.location = ad.link;
									}
								}
							}
						} else {
							d.errorMsg = d.errorMsg || "ServerError"
							var errorPage;
							if(d.errorMsg == "ConcurrentClicking") {
								errorPage = 'http://' + window.location.host + '/redirecting.html';
							} else {
								errorPage = 'http://' + window.location.host + '/encrave_error.html?errorMsg=' + d.errorMsg;
							}
							if (isIframe) {
								$('#content iframe').attr('src', errorPage);
							} else {
								if ($scope.client.popupOpen === true) {
									var openLink = document.createElement('a');
									openLink.href = errorPage;
									openLink.onclick = window.newPopup(errorPage);
									openLink.click();
								} else {
									contentWindow.location = errorPage
								}
							}
						}
					}).error(function(d, status){
						_goingToAd = false;
						if (contentWindow) {
							contentWindow.close();
							contentWindow = null;
						}
					});
			}

			function handleServerPostBack(){
				isServerPostBackRunning = true;
				var serverPostBackWaitTime = ($scope.client.minTimeout == null)? 10000: (parseInt($scope.client.minTimeout) * 1000);

				$timeout( function(){
					var serverPostBackTimer = $interval(function () {
						var serverPostBackUrl =  $scope.client.trackingURL + 'f/t/pollEngaged?cid=' + $scope.user.ClickID + '&tid=' + QueryString.tid + '&paper=' + QueryString.paper + '&_cb=' + makeid()  + "&encl=" + QueryString.encl;

						$http({method: 'JSONP', url: serverPostBackUrl + '&callback=JSON_CALLBACK', timeout: 3000})
						.success(function (data) {
							if(data.ecount === 1 ){
								$interval.cancel(serverPostBackTimer);
								isServerPostBackRunning = false;
								$scope.task.current = $scope.task.total;
								itemTimer = 1;
								clickEngaged();
							}
						});
					}, 2500);
				},serverPostBackWaitTime);
			}

			var get_elapsed_time_string = function(total_seconds) {
				function pretty_time_string(num) {
					return (num < 10 ? '0' : '') + num;
				}

				var hours = Math.floor(total_seconds / 3600);
				total_seconds = total_seconds % 3600;

				var minutes = Math.floor(total_seconds / 60);
				total_seconds = total_seconds % 60;

				var seconds = Math.floor(total_seconds);

				hours = pretty_time_string(hours);
				minutes = pretty_time_string(minutes);
				seconds = pretty_time_string(seconds);

				var currentTimeString = minutes + ':' + seconds;

				return currentTimeString;
			}

			var validIframeClick = function () {
				$('.navPages').removeClass('active');

				userClicked = false;

				$('.url-index-' + activeIndex).addClass('current');
				$('.url-index-' + activeIndex + ' .url-link').remove();

				if (activeIndex == $scope.activeCampaigns.length - 1) {
					$('.tellus').remove();
					if ( $scope.isdc == false) {
						$('.navPages').remove();
					}
				}

				var ad = $scope.activeCampaigns[activeIndex];

				// if (typeof ad.trackingUrl !== 'undefined') {
				// 	if (ad.trackingUrl.indexOf('&') !== -1) {
				// 		ad.trackingUrl += '&_cb=' + makeid();
				// 	} else {
				// 		ad.trackingUrl += '?_cb=' + makeid();
				// 	}
				// 	// try {
				// 	// 	$scope.$apply(function () {
				// 	// 		$scope.repURL = ad.trackingUrl;
				// 	// 	});
				// 	// } catch (e) {
				// 		$scope.repURL = $sce.trustAsResourceUrl(ad.trackingUrl);
				// 	// }
				// }

				ad.active = 1;
				if (typeof isZeroClick !== 'undefined') {
					ad.title = 'Watching'
				}

				canClick = false;

				var cdtmr = $interval(function () {
					$scope.ifi = iframeIndex;
					if (isActiveWindow === true) {
						--itemTimer;
					}
					if (itemTimer > -1) {
						$('#countdown').text(get_elapsed_time_string(itemTimer));
					}
					if (itemTimer === 0) {
						if ($scope.client.e !== 0 && $scope.task.total !== 0 && $scope.task.total !== $scope.task.current) {
							++itemTimer;
						} else {

							if ($scope.task.total === $scope.task.current && $scope.client.e !== 0 && parseInt(ad.serverPostBack) !== 1) {
								var pingUrl = $scope.client.trackingURL + 'f/t/trackEngage?tid=' +  QueryString.tid + '&cid=' + $scope.user.ClickID+ '&paper=' + QueryString.paper  + "&encl=" + QueryString.encl;
								$http.jsonp(pingUrl + '&callback=JSON_CALLBACK')
									.success(function () {
									});
							}
							if ($scope.guideMode == true && iframeIndex == 1) {
								$scope.clickLinksInfo = true;
							}
							$('.url-index-' + activeIndex).addClass('complete');
							$('.url-index-' + activeIndex).removeClass('current');
							$scope.disableClicks = false;
							$('#nextPage, #engagement').addClass('active');
							canClick = true;
							$interval.cancel(cdtmr);
							ad.complete = 1;
							if (typeof isZeroClick !== 'undefined') {
								ad.thumbnail = 'http://img.encrave.tv/global/filled.png';
								ad.title = 'Watched';
							}
							completedItem();
						}
					}
				}, 1000);

			};

			var stripOutReferer = function (){
				var meta = document.createElement('meta');
				meta.name = "referrer";
				meta.content = "no-referrer";
				document.getElementsByTagName('head')[0].appendChild(meta);
			}

			var completedItem = function () {
				itemTimer = 0;
				$scope.pe = -1;
				adCompleted = adCompleted + 1;
				var percentage = (100 / $scope.activeCampaigns.length);

				$('#progBar').animate({
					width: (adCompleted * percentage) + '%'
				});

				if ($scope.client.timeoutSetting == 2) {
					$scope.client.timeout = Math.floor(Math.random() * (parseInt(18) - parseInt(9) + 1)) + parseInt(5);
				}

				//Edit-001
				if (adCompleted == $scope.activeCampaigns.length) {
					completedPromo();
				} else if ($scope.client.autoPlaylist === true) {
					$timeout(function () {
						if (window.wIsIframe === true) {
							$scope.prevUrlLike = 'a';
							$scope.viClick();
						} else {
							var ad = $scope.activeCampaigns[viIndex];
							$scope.adClick(ad);
						}
					}, 500);
				}
			};

			var completedPromo = function () {
					$timeout(function() {
							var waitForJSONP = false;

							if (typeof QueryString.tid !== 'undefined' &&
								typeof QueryString.paper !== 'undefined') {
								waitForJSONP = true;
								var pixelURL = pixelServer + 'f/t/pixel?tid=' + QueryString.tid + '&paper=' + QueryString.paper + '&rock=' + QueryString.rock  + "&encl=" + QueryString.encl;

								$http.jsonp(pixelURL + '&callback=JSON_CALLBACK')
									.success(function (d) {
										  $('#complete').fadeIn();
											$scope.firePixel = true;

											if (typeof window.isModal != 'undefined' && window.isModal == true && typeof QueryString.isPub == 'undefined') {
												$scope.verifyCompleted = d;
												$scope.placementCompleted = true;
												$scope.verifyCompleted.URL = d.KeepCraving;
												$scope.verifyCompleted.countdown = 5;

												if(keepCravingAuto){
													 var keepCravingAutoTimer = $interval(function () {
														$scope.verifyCompleted.countdown = $scope.verifyCompleted.countdown - 1;

														if($scope.verifyCompleted.countdown == 0){
															$window.location.href = $scope.verifyCompleted.URL;
														}
													}, 1000);
												}
											}

										/* else {
											var errorMessages = {
												MissingParameter: 'The requested page is invalid. one or more of the required parameters are missing',
												Mobile: 'This activity is currently unavailable on mobile, please try again on a desktop or laptop computer',
												ServerError: 'A server error has occured',
												BadRequest:'The requested page is invalid. Bad Request',
												RequestExpired: 'The requested page has expired',
												Unavailable: 'This activity is currently unavailable',
												ClientMismatch: 'The system detected a browser mismatch during the activity',
												UrlNotFound: 'The requested URL was not found',
												TranCompleted: 'This activity has already been completed',
												ConcurrentClicking: 'You\'re craving too many things at once',
												InvalidRequest:'The requested URL is invalid',
												ClicksRequired:'This activity was not fully completed',
												InvalidElapsedTime: 'You\'re craving too quickly'
											};
											var errorMsg = errorMessages[d.errorMsg] || "There was an error processing your requests";
											$scope.placementCompleted = true;
											$scope.placementError = true;

											$scope.placementErrorMsg = errorMsg;
										}
										*/
									});
							}

							if (waitForJSONP === false) {
								$('#complete').fadeIn();
								$scope.firePixel = true;
								$('#finished').addClass('complete');
								$('.tellus').remove();
								if ($scope.isdc == false) {
									$('.navPages').remove();
								}
							}
							showCompleted();
							window._gaq.push(['_trackEvent', 'placement', 'progress', 'completed']);

						$scope.client.completed = true;
						if (typeof QueryString.noCookies == 'undefined') {
							$cookies.guideMode = false;
						}
					}, 2000);
			};

			var showCompleted = function () {
				if ($scope.guideMode == false) {
					$('#urls.v2, #fs.v2, #startUrls.v2, #countdown.v2').hide();
				} else {
					$('#urls.v2, #fs.v2, #countdown.v2').hide();
				}
				$('#activityCompleted').show();
				if ($('#sidePanel').length === 1 && typeof window.isIframev2 == 'undefined') {
					var bodyWidth = $('body').width();
					var bodyHeight = $('body').height();
					$('#success').css('left', ((bodyWidth / 2) - ($('#success').width() / 2)) + 'px');
					$('#success').css('top', ((bodyHeight / 2) - (($('#success').height() + parseInt($('#success').css('padding-bottom'))) / 2)) + 'px');
					$('#success').show();
					$('#modal-overlay').fadeIn();
				}

				setTimeout(function() {
					window.close();
				}, 5000);
			};

			var warnUser = function (level) {
				if ($('#sidePanel').length === 1) {
					switch (level) {
						default:
					case 1:
					case 2:
						if (typeof window.isModal != 'undefiend' && window.isModal == true) {
							$scope.clickingTooFast = true;
						} else {
							$('#notification span').text('We understand that you are in a rush, but discovering stuff is more fun when you take your time. Give it a try.');
						}
						break;
					}

					var bodyWidth = $('body').width();
					var bodyHeight = $('body').height();
					$('#notification').css('left', ((bodyWidth / 2) - ($('#notification').width() / 2)) + 'px');
					$('#notification').css('top', ((bodyHeight / 2) - (($('#notification').height() + parseInt($('#notification').css('padding-bottom'))) / 2)) + 'px');
					$('#notification').show();
					$('#modal-overlay').fadeIn();
				} else {
					if (typeof window.isModal != 'undefiend' && window.isModal == true) {
						$scope.clickingTooFast = true;
					} else {
						window.alert('Relax, you\'re here to discover stuff, not run a clicking marathon.');
					}
				}
			};
		}
	]);

	window.newPopup = function (url) {
		window.open(
			url, 'popUpWindow', 'height=' + screen.height + ',width=' + screen.width + ',left=0,top=0,resizable=yes,scrollbars=yes,toolbar=yes,menubar=no,location=no,directories=no,status=yes');
	};

	window.$(document).ready(function () {
		window.$('body').on('contextmenu', function () {
			return false;
		});
	});
})(window);

var mouse_x = 0;
var mouse_y = 0;
$('body').mousemove(function(e){
	mouse_x = e.pageX;
	mouse_y = e.pageY;
});
