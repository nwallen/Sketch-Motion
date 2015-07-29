// useful functions

// finding elements

var filterLayersByName = function(name, layerSet){
    var layers = [];
    for(var l=0; l < [layerSet count]; l++){
        var layer = layerSet.objectAtIndex(l);
        var children = layer.children();
        for(var c=0; c < [children count]; c++){
            var child = children[c];
            if(child.name() == name){
                layers.push(layer);
                continue;
            }
        }
    }
    return layers;
}

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

var findTextWithName = function(name, container){
    var children = container.children();
    var layers = [];
    for(var c=0; c < [children count]; c++){
        var child = children[c];
        if(child.name() == name && child.isMemberOfClass(MSTextLayer)){
            layers.push(child);
        }
    }
    return layers;
}

var findImageWithName = function(name, container){
    var children = container.children();
    var layers = [];
    for(var c=0; c < [children count]; c++){
        var child = children[c];
        if(child.name() == name && child.isMemberOfClass(MSBitmapLayer)){
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

// naming functions

var deDupeGroupNames = function(container){
    var increments = {};
    var children = container.children();
    for(var i=0; i < children.count(); i++){
        var child = children.objectAtIndex(i);
        if(child.isMemberOfClass(MSLayerGroup)){
            groups = findLayerGroupsWithName(child.name(), container);
            if(groups.length > 1){
                for(var g=0; g < groups.length; g++){
                    var group = groups[g];
                    group.setName(group.name() + " copy " + g)
                }
            }
        }
    }
    return children;
}

var getLegendName = function(animationName){
    return stripTagSymbols(animationName) + " detected transitions";
}

var getTransitionName = function(animationName, startKeyframeIndex, endKeyframeIndex){
    return stripTagSymbols(SM.animations[animationName].keyframes[startKeyframeIndex].layer.name()) + " > " + stripTagSymbols(SM.animations[animationName].keyframes[endKeyframeIndex].layer.name());
}

var getCurveSelectorName = function(transitionName){
    return transitionName + " curveSelector";
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

// working with styles
// TODO: Add style get helpers

var updateLayerProperties = function(properties, layer){
    if(!layer) return
    var frame = layer.rect();
    if(properties.x != undefined){
        frame.origin.x = properties.x;
    }
    if(properties.y != undefined){
        frame.origin.y = properties.y;
    }
    if(properties.height != undefined){
        frame.size.height = properties.height;
    }
    if(properties.width != undefined){
        frame.size.width = properties.width;
    }
    if(properties.rotation != undefined){
        layer.setRotation(properties.rotation);
    }
    layer.setRect(frame);
    var style = layer.style();
    if(properties.opacity != undefined){
        style.contextSettings().opacity = properties.opacity;
    }
    layer.setStyle(style);
}

var updateFrame = function(frame, layer) {
    if(frame.width != undefined){
        layer.frame().setWidth(frame.width);
    }
    if(frame.height != undefined){
        layer.frame().setHeight(frame.height);
    }
    if(frame.x != undefined){
        layer.frame().setX(frame.x);
    }
    if(frame.y != undefined){
        layer.frame().setY(frame.y);
    }
}

var updateShapeStyle = function(style, shape) {
    // fill
    if(style.fill != undefined){
        var shapeFills = shape.style().fills().array();
        // shape has a fill
        if(shapeFills.count() > 0){
            shapeFills[0].setColor(MSColor.colorWithSVGString(style.fill));
        }
        else {
            var newFill = shape.style().fills().addNewStylePart();
            newFill.setColor(MSColor.colorWithSVGString(style.fill));
        }
    }
    // border
    if(style.border != undefined){
        var shapeBorders = shape.style().borders().array();
        // shape has a fill
        if(shapeBorders.count() > 0){
            if(style.border.color != undefined){
                shapeBorders[0].setColor(MSColor.colorWithSVGString(style.border.color));
            }
            if(style.border.thickness != undefined){
                shapeBorders[0].setThickness(parseFloat(style.border.thickness));
            }
        }
        else {
            var newBorder = shape.style().borders().addNewStylePart();
            if(style.border.color != undefined){
                newBorder.setColor(MSColor.colorWithSVGString(style.border.color));
            }
            if(style.border.thickness != undefined){
                newBorder.setThickness(parseFloat(style.border.thickness));
            }
        }
    }
    // TODO: Add all other style properities
    
}

var updateTextStyle = function(style, text) {
    if(text &&  text.isMemberOfClass(MSTextLayer)){
        if(style.color != undefined){
            text.textColor = MSColor.colorWithSVGString(style.color);
        }
        if(style.size != undefined){
            text.fontSize = style.size;
        }
        if(style.font != undefined){
            text.fontPostscriptName = style.font;
        }
    }
    // TODO: Add all other style properities
}

var addImage = function(imagePath, container, name) {
    var image = [[NSImage alloc] initWithContentsOfFile:imagePath]; 
    var layerName = name || "image";
    var imageLayer = [MSBitmapLayer new];
    container.addLayers([imageLayer]);

    imageLayer.setConstrainProportions(false);
    imageLayer.setRawImage_convertColourspace_collection(image, false, doc.documentData().images());
    imageLayer.setName(name);
    imageLayer.frame().setWidth(image.size().width);
    imageLayer.frame().setHeight(image.size().height);
    imageLayer.setConstrainProportions(true);

    return imageLayer;
}

var createCircle = function(frame, style){
    var ovalShape = MSOvalShape.alloc().init();
    ovalShape.frame = MSRect.rectWithRect(NSMakeRect(0,0,100,100));
    if(frame) updateFrame(frame, ovalShape);

    var shapeGroup = MSShapeGroup.shapeWithPath(ovalShape);
    var fill = shapeGroup.style().fills().addNewStylePart();
    fill.color = MSColor.colorWithSVGString("#dd2020");
    if(style) updateShapeStyle(style, shapeGroup);

    return shapeGroup;
}

var generateGrid = function(config, style){
    var group = [MSLayerGroup new];
    updateFrame({
        width: config.columns * config.size,
        height: config.rows * config.size
    }, group)
    
    for(var r=0; r < config.rows; r++){
        var row = group.addLayerOfType('rectangle');
        updateFrame({
            y: config.size * r,
            width: group.frame().width(),
            height: config.size
        }, row)
        if(style) updateShapeStyle(style, row);
    }

    for(var c=0; c < config.columns; c++){
        var column = group.addLayerOfType('rectangle');
        updateFrame({
            x: config.size * c,
            width: config.size,
            height: group.frame().height()
        }, column)
        if(style) updateShapeStyle(style, column);
    }
    
    return group
}

// number padding

var numberPad = function(number, padding) {
    var output = number + '';
    while (output.length < padding) {
        output = '0' + output;
    }
    return output;
}

// mixed name sorting
// http://www.bennadel.com/blog/2495-user-friendly-sort-of-alpha-numeric-data-in-javascript.htm

var normalizeMixedDataValue = function( value ){
    var padding = "000000000000000";
    value = value.replace(
        /(\d+)((\.\d+)+)?/g,
        function( $0, integer, decimal, $3 ) {
            if ( decimal !== $3 ) {
                return(
                    padding.slice( integer.length ) +
                    integer +
                    decimal
                );
            }
            decimal = ( decimal || ".0" );
            return(
                padding.slice( integer.length ) +
                integer +
                decimal +
                padding.slice( decimal.length )
            );
        }
    );
    return( value );
}

// objects

var countObjectKeys = function(thisObject){
    var count = 0;
    for (k in thisObject) if (thisObject.hasOwnProperty(k)) count++;
    return count;
}


// Only used for debugging. Very helpful for object introspection
// https://github.com/tylergaw/day-player/blob/master/lib/utils.js
var dump = function(obj) {
    log("#####################################################################################")
    log("## Dumping object " + obj )
    log("## obj class is: " + [obj className])
    log("#####################################################################################")
    log("obj.properties:")
    log([obj class].mocha().properties())
    log("obj.propertiesWithAncestors:")
    log([obj class].mocha().propertiesWithAncestors())
    log("obj.classMethods:")
    log([obj class].mocha().classMethods())
    log("obj.classMethodsWithAncestors:")
    log([obj class].mocha().classMethodsWithAncestors())
    log("obj.instanceMethods:")
    log([obj class].mocha().instanceMethods())
    log("obj.instanceMethodsWithAncestors:")
    log([obj class].mocha().instanceMethodsWithAncestors())
    log("obj.protocols:")
    log([obj class].mocha().protocols())
    log("obj.protocolsWithAncestors:")
    log([obj class].mocha().protocolsWithAncestors())
    log("obj.treeAsDictionary():")
    log(obj.treeAsDictionary())
}