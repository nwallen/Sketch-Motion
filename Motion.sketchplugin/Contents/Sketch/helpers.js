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

var checkForAnimationReference = function(layerName) {
    return layerName.match(/\{(\S+)\}/g);
}