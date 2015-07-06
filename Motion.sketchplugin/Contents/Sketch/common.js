// polyfill common JS browser APIs


// timestamps 
var window = window || {};
var Date = Date || {};
var performance = performance || {};

Date.now = function() {
	return ([NSDate timeIntervalSinceReferenceDate] * 1000);
}

performance.now = function() {
	return ([NSDate timeIntervalSinceReferenceDate] * 1000);
}

window.Date = Date;
window.performance = performance;