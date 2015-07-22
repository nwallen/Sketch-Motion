var MSPERPIXEL = 1; // number of ms that each pixel on the timeline represents
var TIMELINEHEIGHT = 60;
var RESOURCESPATH =  "Motion.sketchplugin/Resources/";
var LEGENDLAYOUT = {
	easeTileHeight : 125,
	easeTileWidth : 125,
	margin: 30,
	rowWidth: 1500,
	textHeight: 50,
};

var ANIMATIONCURVEFILENAME = "easingCurves.png";
var ANIMATIONCURVEOPTIONS = [
	{ease: TWEEN.Easing.Linear.None},
	{ease: TWEEN.Easing.Sinusoidal.In},
	{ease: TWEEN.Easing.Sinusoidal.Out},
	{ease: TWEEN.Easing.Sinusoidal.InOut},
	{ease: TWEEN.Easing.Elastic.In},
	{ease: TWEEN.Easing.Elastic.Out},
	{ease: TWEEN.Easing.Elastic.InOut}
];