// flattening artwork for faster animation

var flattenArtwork = function(container){
    var layers = container.layers();
    var layersToFlatten = [];
    for(var i=0; i < layers.count(); i++){
        var layer = layers.objectAtIndex(i);
        // unregister all symbol instances to avoid replacing original artwork with flattened artwork
        if(layer.isSymbol()){
            doc.documentData().layerSymbols().unregisterInstance(layer);
        }
        if(layer.isMemberOfClass(MSLayerGroup)){
            flattenArtwork(layer);
        }
        else {
            layersToFlatten.push(layer);
        }
    }
    
    if(layersToFlatten.length > 0){
        replaceLayersWithImage(layersToFlatten, container);
    }
}

var replaceLayersWithImage = function(layers, container){
    var tempPath = NSTemporaryDirectory();
    var exportDebugPath = pluginPath + '/temp/';
    var string = [[NSProcessInfo processInfo] globallyUniqueString];
    var imageExportPath = [tempPath stringByAppendingPathComponent: string];

    var fileManger = [NSFileManager defaultManager]
    [fileManger createDirectoryAtPath:imageExportPath withIntermediateDirectories:true attributes:nil error:nil]

    // add artboard to export
    var tempExportArtboard = [MSArtboardGroup new]
    updateFrame({
        x:10000,
        y:10000,
        width:10000,
        height:10000
    }, tempExportArtboard)
    doc.currentPage().addLayers([tempExportArtboard]);
    // add a group to hold artwork
    var exportGroup = tempExportArtboard.addLayerOfType('group');
    // set frame to 1x1 so that it snaps to artworks
    updateFrame({
        width:1,
        height:1
    }, exportGroup)
    // place duplicate artwork in export group (sizes to match artwork)
    for(var l=0; l < layers.length; l++){
        var thisLayer = layers[l];
        var layerCopy = thisLayer.copy();
        exportGroup.addLayers([layerCopy]);
        thisLayer.removeFromParent();
    }
    // match artboard size to export group
    updateFrame({
        width: exportGroup.absoluteDirtyRect().size.width,
        height: exportGroup.absoluteDirtyRect().size.height
    }, tempExportArtboard)
    // export artboard
    var filename = imageExportPath + container.name() + '-flattened.png';
    [doc saveArtboardOrSlice:tempExportArtboard toFile:filename];
    tempExportArtboard.removeFromParent();
    // add exported image to original player
    var flattenedImage = addImage(filename, container, container.name() + '-flattened');
    updateFrame({
        x:0,
        y:0
    }, flattenedImage)
    // remove temporary files
    [fileManger removeItemAtPath:imageExportPath error:nil]  
}