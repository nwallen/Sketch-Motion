// flattening artwork for faster animation

var flattenArtwork = function(container){
	var layers = container.layers();
	var layersToFlatten = [];
	for(var i=0; i < layers.count(); i++){
		var layer = layers.objectAtIndex(i);
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

    var tempExportArtboard = [MSArtboardGroup new]
    updateFrame({
    	x:10000,
    	y:10000,
    	width:10000,
    	height:10000
    }, tempExportArtboard)
    doc.currentPage().addLayers([tempExportArtboard])

    for(var l=0; l < layers.length; l++){
	    var thisLayer = layers[l];
	    var layerCopy = thisLayer.copy();
	    tempExportArtboard.addLayers([layerCopy]);
	    updateFrame({
	    	x:0,
	    	y:0
	    }, layerCopy)

	    var filename = imageExportPath + thisLayer.name() + '.png';
	    var rect = layerCopy.absoluteDirtyRect();
	    var slice = [MSExportRequest requestWithRect:rect scale:1];
	    [doc saveArtboardOrSlice:slice toFile:filename];
	    var flattenedImage = addImage(filename, container, thisLayer.name() + ' flattened');
	    flattenedImage.setRect(thisLayer.rect());
	    layerCopy.removeFromParent();
	    thisLayer.removeFromParent();
    }
 
 	tempExportArtboard.removeFromParent();
    [fileManger removeItemAtPath:imageExportPath error:nil]  
}