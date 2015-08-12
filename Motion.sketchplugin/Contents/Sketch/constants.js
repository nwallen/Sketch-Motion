var MSPERPIXEL = 1; // number of ms that each pixel on the timeline represents
var RESOURCESPATH =  "Motion.sketchplugin/Resources/";
var TIMELINELAYOUT = {
    height: 95,
    margin: 40,
    verticalSpacing: 40,
    timeMarkInterval: 100,
} 
var LEGENDLAYOUT = {
    curveTileHeight : 125,
    curveTileWidth : 125,
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
var EASINGCURVES = [
    { curve:TWEEN.Easing.Linear.None, name:"Linear" },
    { curve:TWEEN.Easing.Linear.None, name:"Linear" },
    { curve:TWEEN.Easing.Linear.None, name:"Linear" },
    { curve:TWEEN.Easing.Linear.None, name:"Linear" },
    { curve:TWEEN.Easing.Linear.None, name:"Linear" },
    { curve:TWEEN.Easing.Linear.None, name:"Linear" },
    { curve:TWEEN.Easing.Linear.None, name:"Linear" },
    { curve:TWEEN.Easing.Linear.None, name:"Linear" },
    { curve:TWEEN.Easing.Linear.None, name:"Linear" },
    { curve:TWEEN.Easing.Linear.None, name:"Linear" } 
]
var ANIMATIONCURVEOPTIONS = [
    {type: "ease", name:"Easing Curve 1", color: "#66c2a5"},
    {type: "ease", name:"Easing Curve 2", color: "#fc8d62"},
    {type: "ease", name:"Easing Curve 3", color: "#8da0cb"},
    {type: "ease", name:"Easing Curve 4", color: "#e78ac3"},
    {type:"popSpring", name:"POP spring 1", color: "#a6d854"},
    {type:"popSpring", name:"POP spring 2", color: "#ffd92f"},
    {type:"popSpring", name:"POP spring 3", color: "#e5c494"},
    {type:"popSpring", name:"POP spring 4", color: "#b3b3b3"}
];
var TIMELINECOLORS = {
    background: "#C7C5C5",
    block: "#FAFAFA",
    blockBorder: "#A6A6A6",
    text: "#A6A6A6",
    highlight: "#76F6B3"
}
var EASINGCONFIGLAYOUT = {
    cellSize: 300,
    cellMargin: 20,
    margin: 150,
    columns: 3
}
var EASINGCONFIGCOLORS = {
    cell: "#CCCCCC"
}
var POPCONFIGLAYOUT = {
    cellSize: 25,
    margin: 50,
}
var POPCONFIGCOLORS = {
    background:"#50E3C2",
    grid:"#666666"
}