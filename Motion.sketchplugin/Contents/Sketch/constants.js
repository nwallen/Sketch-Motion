var MSPERPIXEL = 1; // number of ms that each pixel on the timeline represents
var RESOURCESPATH =  "Motion.sketchplugin/Resources/";
var TIMELINELAYOUT = {
    height: 125,
    margin: 120
} 
var LEGENDLAYOUT = {
    easeTileHeight : 125,
    easeTileWidth : 125,
    margin: 60,
    rowWidth: 800,
    textHeight: 50,
};
var LEGENDCOLORS = {
    background: "#747373",
    index: "#FAFAFA",
    info: "#FAFAFA",
    curve: "#FAFAFA",
    highlight: "#76F6B3"
}
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
var TIMELINECOLORS = {
    background: "#C7C5C5",
    block: "#FAFAFA",
    blockBorder: "#A6A6A6",
    text: "#A6A6A6",
    highlight: "#76F6B3"
}
var POPCONFIGLAYOUT = {
    cellSize: 20,
    margin: 50,
}
var POPCONFIGCOLORS = {
    background:"#50E3C2",
    grid:"#3FC7A8"
}