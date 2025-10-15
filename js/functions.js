
var $window = $(window), gardenCtx, gardenCanvas, $garden, garden;
var clientWidth = $(window).width();
var clientHeight = $(window).height();

$(function () {
    // setup garden
	$loveHeart = $("#loveHeart");
	var offsetX, offsetY;
	$garden = $("#garden");
	gardenCanvas = $garden[0];

	function resizeGardenCanvas(){
		// get computed size of the garden element (CSS-driven)
		var rect = gardenCanvas.getBoundingClientRect();
		var computed = window.getComputedStyle(gardenCanvas);
		var cssWidth = Math.max(parseFloat(computed.width) || rect.width || 1, 1);
		var cssHeight = Math.max(parseFloat(computed.height) || rect.height || 1, 1);
		var ratio = window.devicePixelRatio || 1;
		// set canvas internal pixel size for crisp rendering
		gardenCanvas.width = Math.round(cssWidth * ratio);
		gardenCanvas.height = Math.round(cssHeight * ratio);
		// set canvas element display size to match CSS
		gardenCanvas.style.width = cssWidth + 'px';
		gardenCanvas.style.height = cssHeight + 'px';
		// position behind the words and ensure parent height matches canvas
		gardenCanvas.style.position = 'absolute';
		gardenCanvas.style.top = '0';
		gardenCanvas.style.left = '0';
		gardenCanvas.style.zIndex = '0';
		// set parent height so absolute child doesn't collapse it
		$loveHeart.css('height', cssHeight + 'px');
		// get 2D context and scale to devicePixelRatio
		gardenCtx = gardenCanvas.getContext("2d");
		// reset any existing transform then scale
		gardenCtx.setTransform(ratio, 0, 0, ratio, 0, 0);
		gardenCtx.globalCompositeOperation = "lighter";
		// update offset used by heart point calculations
		offsetX = $loveHeart.width() / 2;
		offsetY = $loveHeart.height() / 2 - 55;
	}

	// initial sizing
	resizeGardenCanvas();
	garden = new Garden(gardenCtx, gardenCanvas);


    // renderLoop
    setInterval(function () {
        garden.render();
    }, Garden.options.growSpeed);
});

$(window).resize(function() {
	// debounce resize to avoid excessive work
	clearTimeout(window._loveResizeTimeout);
	window._loveResizeTimeout = setTimeout(function(){
		clientWidth = $(window).width();
		clientHeight = $(window).height();
		// resize canvas and keep layout stable
		if (typeof resizeGardenCanvas === 'function') resizeGardenCanvas();
	}, 150);
});

function getHeartPoint(angle) {
    var t = angle / Math.PI;
    
    // Dynamic scaling based on viewport
    var scale;
    if (window.innerWidth <= 600) {
        // For mobile: make heart larger while maintaining proportion
        var viewportScale = Math.min(window.innerWidth / 600, window.innerHeight / 800);
        scale = viewportScale * 0.9; // Increased from 0.7 to 0.9 for larger heart
    } else {
        scale = 1; // Default scale for desktop
    }
    
    // Calculate heart coordinates with proper scaling
    var x = 19.5 * (16 * Math.pow(Math.sin(t), 3)) * scale;
    var y = -20 * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * scale;
    
    // Center the heart in the container
    return new Array(offsetX + x, offsetY + y);
}

function startHeartAnimation() {
	var interval = 50;
	var angle = 10;
	var heart = new Array();
	var animationTimer = setInterval(function () {
		var bloom = getHeartPoint(angle);
		var draw = true;
		for (var i = 0; i < heart.length; i++) {
			var p = heart[i];
			var distance = Math.sqrt(Math.pow(p[0] - bloom[0], 2) + Math.pow(p[1] - bloom[1], 2));
			// Scale bloom radius based on viewport size
			var viewportScale = window.innerWidth <= 600 ? 
				Math.min(window.innerWidth / 600, window.innerHeight / 800) : 1;
			var maxRadius = Garden.options.bloomRadius.max * viewportScale;
			if (distance < maxRadius) {
				draw = false;
				break;
			}
		}
		if (draw) {
			heart.push(bloom);
			garden.createRandomBloom(bloom[0], bloom[1]);
		}
		if (angle >= 30) {
			clearInterval(animationTimer);
			// Add slight delay before showing messages on mobile
			setTimeout(showMessages, window.innerWidth <= 600 ? 1000 : 0);
		} else {
			angle += 0.2;
		}
	}, interval);
}

(function($) {
	$.fn.typewriter = function() {
		this.each(function() {
			var $ele = $(this), str = $ele.html(), progress = 0;
			$ele.html('');
			var timer = setInterval(function() {
				var current = str.substr(progress, 1);
				if (current == '<') {
					progress = str.indexOf('>', progress) + 1;
				} else {
					progress++;
				}
				$ele.html(str.substring(0, progress) + (progress & 1 ? '_' : ''));
				if (progress >= str.length) {
					clearInterval(timer);
				}
			}, 75);
		});
		return this;
	};
})(jQuery);

function timeElapse(date){
	// Ensure 'date' is a Date object; if it's a string, try to parse explicitly
	var start;
	if (date instanceof Date) {
		start = date.getTime();
	} else {
		// If date was passed as a string, create Date using ISO-like or locale-safe parsing
		start = (new Date(date)).getTime();
	}
	var now = (new Date()).getTime();
	var seconds = Math.floor((now - start) / 1000);
	var days = Math.floor(seconds / (3600 * 24));
	seconds = seconds % (3600 * 24);
	var hours = Math.floor(seconds / 3600);
	if (hours < 10) {
		hours = "0" + hours;
	}
	seconds = seconds % 3600;
	var minutes = Math.floor(seconds / 60);
	if (minutes < 10) {
		minutes = "0" + minutes;
	}
	seconds = seconds % 60;
	if (seconds < 10) {
		seconds = "0" + seconds;
	}
	var result = "<span class=\"digit\">" + days + "</span> days <span class=\"digit\">" + hours + "</span> hours <span class=\"digit\">" + minutes + "</span> minutes <span class=\"digit\">" + seconds + "</span> seconds"; 
	$("#elapseClock").html(result);
}

function showMessages() {
	// Show messages container immediately on mobile
	if(window.innerWidth <= 600) {
		$('#messages, #loveu').show();
		return;
	}
	// Desktop animation
	$('#messages').fadeIn(5000, function() {
		showLoveU();
	});
}

function adjustWordsPosition() {
	// No-op: positioning is handled by CSS to ensure words remain inside the heart at all sizes.
	return;
}

function adjustCodePosition() {
	// Use transform-based centering to visually center #code without changing layout size.
	var code = $('#code');
	var gardenH = $("#garden").height();
	var codeH = code.height();
	var offset = (gardenH - codeH) / 2;
	code.css({
		transform: 'translateY(' + offset + 'px)'
	});
}

function showLoveU() {
	$('#loveu').fadeIn(3000);
}

// --- Local quick-test (no-op in browser). To run: node js/functions.js ---
if (typeof module !== 'undefined' && module.exports) {
	// When executed under Node, run a small test
	var testDate = new Date(2025, 1, 15, 15, 34, 0);
	// reuse timeElapse logic to compute seconds and output
	var start = testDate.getTime();
	var now = (new Date()).getTime();
	var seconds = Math.floor((now - start) / 1000);
	console.log('seconds since testDate:', seconds);
}