// useful functions

var findLayerGroupsWithName = function(name, container){
    var children = container.children();
    var layers = [];
    for(var c=0; c < [children count]; c++){
        var child = children[c];
        if(child.name() == name && child.isMemberOfClass(MSLayerGroup)){
            layers.push(child);
        }
    }
    return layers;
}

var findShapeWithName = function(name, container){
    var children = container.children();
    var layers = [];
    for(var c=0; c < [children count]; c++){
        var child = children[c];
        if(child.name() == name && child.isMemberOfClass(MSShapeGroup)){
            layers.push(child);
        }
    }
    return layers;
}

var findArtboardsWithName = function(name, container, artboardArray){
    var children = container.children();
    var layers = artboardArray || [];
    for(var c=0; c < [children count]; c++){
        var child = children[c];
        if(child.name() == name && child.isMemberOfClass(MSArtboardGroup)){
            layers.push(child);
        }
    }
    return layers;
}

var getArtboardsWithNameInDocument = function(layerName){
	var layers = [];
    var pages = doc.pages();
    for(var p=0; p < [pages count]; p++){
        var page = pages.objectAtIndex(p);
       	layers = findArtboardsWithName(layerName, page, layers);
    }
    return layers;
}

var artboardWithNameExistsInDocument = function(layerName){
	var layerExists = null;
    var artboards = getArtboardsWithNameInDocument(layerName)
    if(artboards.length > 0){
        layerExists = true;
    }
    return layerExists;
}

var getLegendName = function(animationName){
	return stripTagSymbols(animationName) + " detected transitions";
}

var getTransitionName = function(animationName, startKeyframeIndex, endKeyframeIndex){
	return stripTagSymbols(animations[animationName].keyframes[startKeyframeIndex].layer.name()) + " > " + stripTagSymbols(animations[animationName].keyframes[endKeyframeIndex].layer.name());
}

var checkForAnimationReference = function(layerName) {
    return layerName.match(/\{(\S+)\}/g);
}

var stripTagSymbols = function(string) {
	return string.replace(/{|}/g, '');	
}

var animationTimelineName = function(animationName) {
    return stripTagSymbols(animationName) + " timeline";
}

var updateShapeFill = function(HEX, layerName, container) {
	var shapes = findShapeWithName(layerName, container);
	var shapeFills = shapes[0].style().fills().array();
	// shape has a fill
	if(shapeFills[0]){
		shapeFills[0].setColor(MSColor.colorWithSVGString(HEX));
	}
	
}