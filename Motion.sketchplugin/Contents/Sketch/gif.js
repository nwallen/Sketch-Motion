// GIF Export
// Adapted from github.com/nathco/Generate-GIF

var gifx, gifPath, tempPath, string, gifsetPath;
var gifSetIndex;
var gifFileManager;
//var exportDebugPath;

var initGIFexport = function() {
	log('init GIF')
	gifx = pluginPath + "GIFX";
	gifPath = savePath();
	tempPath = NSTemporaryDirectory();
	var string = [[NSProcessInfo processInfo] globallyUniqueString];
	gifsetPath = [tempPath stringByAppendingPathComponent: string + @".gifset"];
	exportDebugPath = pluginPath + '/temp/';

	gifFileManager = [NSFileManager defaultManager]
    [gifFileManager createDirectoryAtPath:gifsetPath withIntermediateDirectories:true attributes:nil error:nil]

    gifSetIndex = 1;
}

var exportArtboardToGIFset = function(artboard){
	var artboardName = artboard.name();
	var gifFileComponent = gifSetIndex + ".png";
    var fileName = [gifsetPath stringByAppendingPathComponent: gifFileComponent]
    log(fileName);
    [doc saveArtboardOrSlice:artboard toFile:fileName]
    var debug = exportDebugPath + gifFileComponent
    [doc saveArtboardOrSlice:artboard toFile:debug] 
    gifSetIndex ++;
}

var createGIF = function() {
	log('createGIF')
	var convertTask = [[NSTask alloc] init]
    var createsTask = [[NSTask alloc] init]
    var convertGIF = "find \"" + gifsetPath + "\" -name '*.png' -exec sips -s format gif -o {}.gif {} \\;"
    var option = "find \"" + gifsetPath + "\" -name '*.png.gif' -execdir bash -c '\"" + gifx + "\" -l -d 100 '*.png.gif' -o \"" + gifPath + "\"' \\;"

    [convertTask setLaunchPath:@"/bin/bash"]
    [convertTask setArguments:["-c", convertGIF]]
    [convertTask launch]
    [convertTask waitUntilExit]
    [createsTask setLaunchPath:@"/bin/bash"]
    [createsTask setArguments:["-c", option]]
    [createsTask launch]
    [createsTask waitUntilExit]

    if ([createsTask terminationStatus] == 0) {
        
        [doc showMessage:@"Export Complete..."]
        
    } else {
        
        var error = [[NSTask alloc] init]
        
        [error setLaunchPath:@"/bin/bash"]
        [error setArguments:["-c", "afplay /System/Library/Sounds/Basso.aiff"]]
        [error launch]
        [doc showMessage:@"Export Failed..."]
    } 
 
    [gifFileManager removeItemAtPath:gifsetPath error:nil]  
}

var savePath =  function() {
    var filePath = [doc fileURL] ? [[[doc fileURL] path] stringByDeletingLastPathComponent] : @"~"
    var fileName = [[doc displayName] stringByDeletingPathExtension]
    var savePanel = [NSSavePanel savePanel]
    
    [savePanel setTitle:@"Export Animated GIF"]
    [savePanel setNameFieldLabel:@"Export To:"]
    [savePanel setPrompt:@"Export"]
    [savePanel setAllowedFileTypes: [NSArray arrayWithObject:@"gif"]]
    [savePanel setAllowsOtherFileTypes:false]
    [savePanel setCanCreateDirectories:true]
    [savePanel setDirectoryURL:[NSURL fileURLWithPath:filePath]]
    [savePanel setNameFieldStringValue:fileName]

    if ([savePanel runModal] != NSOKButton) {
        exit
    } 
    
    return [[savePanel URL] path]
}