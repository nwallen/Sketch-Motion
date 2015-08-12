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
var EASINGCURVES = [
    { curve:TWEEN.Easing.Linear.None, name:"Linear" },
    { curve:TWEEN.Easing.Quadratic.In, name:"Quad In" },
    { curve:TWEEN.Easing.Quadratic.Out, name:"Quad Out" },
    { curve:TWEEN.Easing.Quadratic.InOut, name:"Quad InOut" },
    { curve:TWEEN.Easing.Cubic.In, name:"Cubic In" },
    { curve:TWEEN.Easing.Cubic.Out, name:"Cubic Out" },
    { curve:TWEEN.Easing.Cubic.InOut, name:"Cubic InOut" },
    { curve:TWEEN.Easing.Quartic.In, name:"Quart In" },
    { curve:TWEEN.Easing.Quartic.Out, name:"Quart Out" },
    { curve:TWEEN.Easing.Quartic.InOut, name:"Quart InOut" },
    { curve:TWEEN.Easing.Quintic.In, name:"Quint In" },
    { curve:TWEEN.Easing.Quintic.Out, name:"Quint Out" },
    { curve:TWEEN.Easing.Quintic.InOut, name:"Quint InOut" },
    { curve:TWEEN.Easing.Sinusoidal.In, name:"Sine In" },
    { curve:TWEEN.Easing.Sinusoidal.Out, name:"Sine Out" },
    { curve:TWEEN.Easing.Sinusoidal.InOut, name:"Sine InOut" },
    { curve:TWEEN.Easing.Exponential.In, name:"Expo In" },
    { curve:TWEEN.Easing.Exponential.Out, name:"Expo Out" },
    { curve:TWEEN.Easing.Exponential.InOut, name:"Expo InOut" },
    { curve:TWEEN.Easing.Circular.In, name:"Circ In" },
    { curve:TWEEN.Easing.Circular.Out, name:"Circ Out" },
    { curve:TWEEN.Easing.Circular.InOut, name:"Circ InOut" },
    { curve:TWEEN.Easing.Elastic.In, name:"Elastic In" },
    { curve:TWEEN.Easing.Elastic.Out, name:"Elastic Out" },
    { curve:TWEEN.Easing.Elastic.InOut, name:"Elastic InOut" },
    { curve:TWEEN.Easing.Back.In, name:"Back In" },
    { curve:TWEEN.Easing.Back.Out, name:"Back Out" },
    { curve:TWEEN.Easing.Back.InOut, name:"Back InOut" },
    { curve:TWEEN.Easing.Bounce.In, name:"Bounce In" },
    { curve:TWEEN.Easing.Bounce.Out, name:"Bounce Out" },
    { curve:TWEEN.Easing.Bounce.InOut, name:"Bounce InOut" },        
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
    cellSize: 200,
    cellMargin: 20,
    margin: 200,
    columns: 6
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