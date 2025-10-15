
var $window = $(window), gardenCtx, gardenCanvas, $garden, garden;
var clientWidth = $(window).width();
var clientHeight = $(window).height();

$(function () {
    // setup garden
	$loveHeart = $("#loveHeart");
	var offsetX = $loveHeart.width() / 2;
	var offsetY = $loveHeart.height() / 2 - 55;
	$garden = $("#garden");
	gardenCanvas = $garden[0];
	// keep canvas size in sync with the heart container and account for devicePixelRatio for crispness
	var cssWidth = $garden.width();
	var cssHeight = $garden.height();
	var ratio = window.devicePixelRatio || 1;
	gardenCanvas.width = Math.round(cssWidth * ratio);
	gardenCanvas.height = Math.round(cssHeight * ratio);
	gardenCanvas.style.width = cssWidth + 'px';
	gardenCanvas.style.height = cssHeight + 'px';
	// scale context to match ratio
	gardenCtx = gardenCanvas.getContext("2d");
	gardenCtx.scale(ratio, ratio);
    gardenCtx.globalCompositeOperation = "lighter";
    garden = new Garden(gardenCtx, gardenCanvas);
	

    // renderLoop
    setInterval(function () {
        garden.render();
    }, Garden.options.growSpeed);
});

$(window).resize(function() {
    var newWidth = $(window).width();
    var newHeight = $(window).height();
    if (newWidth != clientWidth && newHeight != clientHeight) {
        location.replace(location);
    }
});

function getHeartPoint(angle) {
	var t = angle / Math.PI;
	var x = 19.5 * (16 * Math.pow(Math.sin(t), 3));
	var y = - 20 * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
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
			if (distance < Garden.options.bloomRadius.max * 1.3) {
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
			showMessages();
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
	adjustWordsPosition();
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
	$('#loveu').fadeIn(3000, function(){
		// start the snake-like glow after it's visible
		setTimeout(function(){
			$('#loveu').addClass('glow-animate');
		}, 400);
	});
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