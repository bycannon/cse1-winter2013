(function($) {
	// plugin definition
	$.fn.wVideo = function(options) {		
		// build main options before element iteration		
		var defaults = {
			theme: 'simpledark',
			childtheme: ''
		};
		var options = $.extend(defaults, options);
		// iterate and reformat each matched element
		return this.each(function() {
			var $wVideo = $(this);
			var fullscreenMode; // The media is in fullscreen mode
			//create html structure
			//main wrapper
			var $video_wrap = $('<div></div>').addClass('wsjvideo-video-player').addClass(options.theme).addClass(options.childtheme);
			//controls wraper
			var $video_controls = $('<div class="wsjvideo-video-controls"><a class="wsjvideo-video-play" title="Play/Pause"></a><div class="wsjvideo-video-seek"></div><div class="wsjvideo-video-timer">00:00</div><div class="wsjvideo-volume-box"><div class="wsjvideo-volume-slider"></div><a class="wsjvideo-volume-button" title="Mute/Unmute"></a><a class="wsjvideo-volume-button" title="Mute/Unmute"></a></div><a class="wsjvideo-fullscreen-button" title="fullscreen"></a><a class="wsjvideo-chromecast" title="chromecast"></a></div>');						
			$wVideo.wrap($video_wrap);
			$wVideo.before('<div id="playlist"></div>');
			$wVideo.after($video_controls);
			
			//get new elements
			var $video_container 	= 	$wVideo.parent('.wsjvideo-video-player');
			var $ad_container 		= 	$('#adContainer');
			var $video_controls 	= 	$('.wsjvideo-video-controls', $video_container);
			var $wsj_play_btn 		= 	$('.wsjvideo-video-play', $video_container); 
			var $wsj_video_seek 	= 	$('.wsjvideo-video-seek', $video_container);
			var $wsj_video_timer 	= 	$('.wsjvideo-video-timer', $video_container);
			var $wsj_volume 		= 	$('.wsjvideo-volume-slider', $video_container);
			var $wsj_volume_btn 	= 	$('.wsjvideo-volume-button', $video_container);
			var $fullscreenBtn 		= 	$('.wsjvideo-fullscreen-button', $video_container);
			var $chromecastBtn 		= 	$('.wsjvideo-chromecast', $video_container);
			var $isAdvert 			= 	false;
			var $isInitialized 		= 	false;
			var $video_volume 		= 	1;
			var $video_muted 		= 	false;
			var $chromecastMode 	= 	false;

			$wsj_video_seek.width($video_container.width() - 160);
			$(window).resize(resizeFullscreenVideo);
			$video_controls.hide();

			$video_controls.hover(
				function(){ 
					//$wVideo.unbind('mouseleave');
					$video_controls.show();
				}
			);
			$ad_container.mouseenter(
				function(){ 
					$video_controls.show(); 
				}
			);
			$wVideo.mouseenter(
				function(){ 
					$video_controls.show(); 
				}
			);
			$ad_container.hover(
				function(){ 
					$video_controls.show(); 
				}
			);
			$video_controls.mouseleave(
				function(){ $video_controls.hide();}
			);
			$ad_container.mouseleave(
				function(){ $video_controls.hide();}
			);
			$wVideo.mouseleave(
				function(){ $video_controls.hide();}
			);
			
			//$wsj_video_seek.width($video_container.width() - 172);
			
			var durationUpdater;
			var initUpdater;
			
			$chromecastBtn.hide();
			$video_controls.hide(); // keep the controls hidden
						
			var gPlay = function() {
				if($wVideo.prop('paused') == false) {
					$wVideo[0].pause();					
				} else {					
					$wVideo[0].play();				
				}
			};

			$wsj_play_btn.click(gPlay);
			$wVideo.click(gPlay);
			
			$wVideo.bind("isAdChanged", function(evt,isAd){
				
				$isAdvert = isAd;
				try{
				if($isAdvert){
					$(".videoAdUiProgress").show();	
					$wsj_video_seek.slider("disable", true); 
				}else{
					$wsj_video_seek.slider("enable", true); 
				}
				}catch(e){
					
				}

				setDuration();
				
				//console.log($wVideo.prop('duration'));
			});
			/*
			$wVideo.on("receiverChanged", function(evt, isAvailable) {
				if(isAvailable){
					$wsj_video_seek.width($video_container.width() - 190);
					$chromecastBtn.show();
				}else{
					$wsj_video_seek.width($video_container.width() - 160);
					$chromecastBtn.hide();
				}
			});
			*/
			$wVideo.bind("durationchange", function(evt){
				$wsj_video_seek.slider("option", "max", $wVideo.prop('duration'));
			});
			
			$wVideo.bind("endScreenPlay", function(evt){
				$isInitialized = false;
				setDuration();
			});
			
			$wVideo.bind("onAdError", function(evt){
				$isAdvert = false;
				try{
					$wsj_video_seek.slider("enable", true);
				}catch(err){
					
				}
				this.play();
			});
			
			function setDuration(){
				clearTimeout(durationUpdater);

				if($wVideo.prop('readyState') && $isInitialized) {
					if(!$video_muted){
						$wVideo.prop('volume', $video_volume);
					}else{
						$wVideo.prop('volume', 0);
					}

					if($isAdvert){
						$wsj_video_seek.slider("disable", true);
					}else{
						$wsj_video_seek.slider("enable", true);
					}
					$wsj_video_seek.slider("option", "max", $wVideo.prop('duration'));			
				} else {
					durationUpdater = setTimeout(setDuration, 150);
				}
			}
			
			$wVideo.bind('play', function() {
				$wsj_play_btn.addClass('wsjvideo-paused-button');
			});
			
			$wVideo.bind('pause', function() {
				$wsj_play_btn.removeClass('wsjvideo-paused-button');
			});
			
			$wVideo.bind('ended', function() {
				$wsj_play_btn.removeClass('wsjvideo-paused-button');
			});
			
			var seeksliding;			
			var createSeek = function() {
				if($wVideo.prop('readyState')) {
					clearTimeout(initUpdater);
					var video_duration = $wVideo.prop('duration');
					$wsj_video_seek.slider({
						value: 0,
						step: 0.01,
						orientation: "horizontal",
						range: "min",
						max: video_duration,
						animate: true,					
						slide: function(){							
							seeksliding = true;
						},
						stop:function(e,ui){
							seeksliding = false;						
							$wVideo.prop("currentTime",ui.value);
						}
					});
					//$video_controls.show();
					$isInitialized = true;					
				} else {
					initUpdater = setTimeout(createSeek, 150);
				}
			};

			createSeek();
		
			var gTimeFormat=function(seconds){
				var m=Math.floor(seconds/60)<10?"0"+Math.floor(seconds/60):Math.floor(seconds/60);
				var s=Math.floor(seconds-(m*60))<10?"0"+Math.floor(seconds-(m*60)):Math.floor(seconds-(m*60));
				return m+":"+s;
			};
			
			var seekUpdate = function() {
				try{
					var currenttime = $wVideo.prop('currentTime');
					if(!seeksliding) $wsj_video_seek.slider('value', currenttime);
					$wsj_video_timer.text(gTimeFormat(currenttime));
				}catch(e){
						
				}
			};
			
			$wVideo.bind('timeupdate', seekUpdate);	
			
			
			$wsj_volume.slider({
				value: 1,
				orientation: "vertical",
				range: "min",
				max: 1,
				step: 0.05,
				animate: true,
				slide:function(e,ui){
						$wVideo.prop('muted',false);
						$video_volume = ui.value;
						$wVideo.prop('volume',ui.value);
					}
			});
			
			var muteVolume = function() {
				if($wVideo.prop('muted')==true) {
					$wVideo.prop('muted', false);
					$video_muted = false;
					$wsj_volume.slider('value', $video_volume);
					
					$wsj_volume_btn.removeClass('wsjvideo-volume-mute');					
				} else {
					$video_muted = true;
					$wVideo.prop('muted', true);
					$wsj_volume.slider('value', '0');
					
					$wsj_volume_btn.addClass('wsjvideo-volume-mute');
				};
			};
			
			var selectReceiver = function() {
				$("#"+$wVideo.attr('id')).off("chromecastSessionStarted", "**" );
				$("#"+$wVideo.attr('id')).trigger("setReceiver");
				$("#"+$wVideo.attr('id')).on("chromecastSessionStarted", onChromeSessionStarted);
			
			}
			
			function onChromeSessionStarted(e, videoData){
				console.log(videoData);	
			}
			
			$(document).on(screenfull.raw.fullscreenchange, function () {
				var isIE11 = !!navigator.userAgent.match(/Trident.*rv[ :]*11\./);
				if(screenfull.isFullscreen && isIE11)
					$wVideo.attr("controls",true);
				else	
					$wVideo.attr("controls",false);
			});
			
			var goFullscreen = function() {
				screenfull.toggle($wVideo.parent()[0]);
				$wVideo.removeClass('fullscreen-video').attr({
							'width': '100%',
							'height': '100%'
						});
				/*
				if(fullscreenMode) {
					
					if(document.exitFullscreen) {
						document.exitFullscreen();
					  } else if(document.mozCancelFullScreen) {
						document.mozCancelFullScreen();
					  } else if(document.webkitExitFullscreen) {
						document.webkitExitFullscreen();
					  }

					if($wVideo[0].cancelFullScreen) {
						$wVideo[0].cancelFullScreen();
					} else if($wVideo[0].webkitCancelFullScreen) {
						$wVideo[0].webkitCancelFullScreen();
					} else if($wVideo[0].mozCancelFullScreen) {
							$wVideo[0].mozCancelFullScreen();
					} else {
						// if no fullscreen api support, use full-page mode
						$('body').css('overflow', 'auto');
					
						var w = $wVideo.attr('data-width');
						var h = $wVideo.attr('data-height');
					
						$wVideo.removeClass('fullscreen-video').attr({
							'width': w,
							'height': h
						});

						$video_controls.removeClass('fullscreen-controls');
					}
					fullscreenMode = false;
					
				} else {
					
					if(document.requestFullscreen) {
						document.requestFullscreen();
					} else if(document.webkitRequestFullscreen) {
						document.webkitRequestFullscreen();
					} else if(document.mozRequestFullScreen) {
							document.mozRequestFullScreen();
					}
					
					if($wVideo[0].requestFullscreen) {
						$wVideo[0].requestFullscreen();
					} else if($wVideo[0].webkitRequestFullscreen) {
						$wVideo[0].webkitRequestFullscreen();
					} else if($wVideo[0].mozRequestFullScreen) {
							$wVideo[0].mozRequestFullScreen();
					} else {
						$('body').css('overflow', 'hidden');							
					
						$wVideo.addClass('fullscreen-video').attr({							
							width: $(window).width(),
							height: $(window).height()
						});
						try{
						
						}catch(e){}
						$video_controls.addClass('fullscreen-controls');
					}
					
					fullscreenMode = true;
					
				}
				*/
				
			};
			
			function resizeFullscreenVideo(){
				$wsj_video_seek.width($video_controls.width() - 160);
			}
			
			$fullscreenBtn.click(goFullscreen);
			$wsj_volume_btn.click(muteVolume);
			$chromecastBtn.click(selectReceiver);
			
			$wVideo.removeAttr('controls');
			
		});
	};

	$.fn.wVideo.defaults = {		
	};

})(jQuery);

// Fullscreen lib
(function(){"use strict";var e=typeof module!=="undefined"&&module.exports;var t=typeof Element!=="undefined"&&"ALLOW_KEYBOARD_INPUT"in Element;var n=function(){var e;var t;var n=[["requestFullscreen","exitFullscreen","fullscreenElement","fullscreenEnabled","fullscreenchange","fullscreenerror"],["webkitRequestFullscreen","webkitExitFullscreen","webkitFullscreenElement","webkitFullscreenEnabled","webkitfullscreenchange","webkitfullscreenerror"],["webkitRequestFullScreen","webkitCancelFullScreen","webkitCurrentFullScreenElement","webkitCancelFullScreen","webkitfullscreenchange","webkitfullscreenerror"],["mozRequestFullScreen","mozCancelFullScreen","mozFullScreenElement","mozFullScreenEnabled","mozfullscreenchange","mozfullscreenerror"],["msRequestFullscreen","msExitFullscreen","msFullscreenElement","msFullscreenEnabled","MSFullscreenChange","MSFullscreenError"]];var r=0;var i=n.length;var s={};for(;r<i;r++){e=n[r];if(e&&e[1]in document){for(r=0,t=e.length;r<t;r++){s[n[0][r]]=e[r]}return s}}return false}();var r={request:function(e){var r=n.requestFullscreen;e=e||document.documentElement;if(/5\.1[\.\d]* Safari/.test(navigator.userAgent)){e[r]()}else{e[r](t&&Element.ALLOW_KEYBOARD_INPUT)}},exit:function(){document[n.exitFullscreen]()},toggle:function(e){if(this.isFullscreen){this.exit()}else{this.request(e)}},onchange:function(){},onerror:function(){},raw:n};if(!n){if(e){module.exports=false}else{window.screenfull=false}return}Object.defineProperties(r,{isFullscreen:{get:function(){return!!document[n.fullscreenElement]}},element:{enumerable:true,get:function(){return document[n.fullscreenElement]}},enabled:{enumerable:true,get:function(){return!!document[n.fullscreenEnabled]}}});document.addEventListener(n.fullscreenchange,function(e){r.onchange.call(r,e)});document.addEventListener(n.fullscreenerror,function(e){r.onerror.call(r,e)});if(e){module.exports=r}else{window.screenfull=r}})()
