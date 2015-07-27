![intro](http://nwallen.github.io/Sketch-Motion/static/Sketch-Motion-Intro.gif)

Plugin to quickly create, preview, and export motion designs ... in [Sketch](http://bohemiancoding.com/sketch/). 

**Warning**
Early proof-of-concept version tested in sketch 3.3.3 -- use at your own risk

## What's it for?
UIs need motion. On Web, on mobile, on anything with a screen: motion illustrates and delights. There are [many](https://facebook.github.io/origami/) [excellent](http://www.pixate.com/) [tools](http://framerjs.com/) for creating interactive, animated prototypes. However, if you're designing in Sketch, motion currently means a context switch to another application, which slows down your ability to iterate. The intent of Sketch Motion is to provide a lightweight, coding-free method to explore motion ideas *in Sketch* with no context switch. It's not going to replace After Effects or Origami, but it will help you try out motion ideas *fast*. Here are some ways you might use Sketch Motion:

- Explore several UI transitions before jumping into a dedicated prototyping tool
- Create animated GIFs for use in an Invision, Flinto, or Marvel clickable prototype
- Create animated assets like loaders

## How it works
Sketch Motion builds on how you might intially spec out an animation in Sketch: creating a series of artboards to document the animation's key moments. To animate, simply point Sketch Motion at these "keyframe" artboards. It will generate a smooth animation, which you can preview in Sketch or export as an animated GIF. 

The plugin automatically provides artboards to adjust the timing and easing of each animation. Animations are modular -- allowing you to duplicate and composite them together.

**A simple animation**

![capture](http://nwallen.github.io/Sketch-Motion/static/quickUsageCapture.gif)

## Installation
1. **[Download a Release](https://github.com/nwallen/Sketch-Motion/releases)** and unzip
2. Open Sketch and select `Plugins ▸ Reveal Plugins Folder...` from the menu bar
3. Copy the `Sketch Motion` directory into the plugins folder
4. Locate the `GIFX` file and double-click (if prompted, give GIFX permission to run)

## Usage

**Define Animation Keyframes**

![keyframes](http://nwallen.github.io/Sketch-Motion/static/keyframes.png)

 - Animations are referenced with "tags". A tag is any word wrapped in curly braces e.g. an animation called "example" would use the tag `{example}`
 - Tag the names of the artboards to include them as keyframes in an animation: e.g. artboards named `{example} 1`, `{example} 2` would compose an "example" animation.
 - Tagged artboards play in alphabetical order based on their names
 - You may freely add and remove tagged artboards -- the plugin will adjust

**Create Transitions**

![transition groups](http://nwallen.github.io/Sketch-Motion/static/transitionGroups.png)

- Animation transitions are automatically created by comparing groups **with the same name** on tagged artboards
- Differences in these properties are animated : `position` `size` `rotation` `opacity`
- The name of the group does not matter -- just that it is the same on all tagged artboards
- Multiple groups with the same name on the same artboard are automatically given a unique name
- The group must exist on the first artboard -- otherwise it will not be included in the animation


**Add a Player**

![player](http://nwallen.github.io/Sketch-Motion/static/player.png)

- Animations are played via "players". Create a player by tagging a group with the name of the animation you would like to play: e.g. renaming `myGroup ▸ myGroup {example}` creates a player for the "loader" animation
- To play the animation select the artboard containing the tagged group by clicking its name. Then select `Plugins ▸ Motion ▸ Animate` from the Sketch toolbar or use the keyboard shortcut `control` + `⌘ command` + `a` 
- The animation will play. Two additional artboards will be added to your document (the "Timeline" and the "Legend") which you may use to adjust the animation
- You can add multiple players to an artboard -- for the same or different animations

**Adjust Timing with the Timeline**

![timeline](http://nwallen.github.io/Sketch-Motion/static/timeline.png)

- Each block on the timeline represents a transition between tagged artboards
- Edit the width of a block to change the duration of the transition `1 pixel = 1 millisecond`
- Adding spacing between blocks will add delay between animations `1 pixel = 1 millisecond` of delay
- The sequence of the animations cannot be changed on the timeline 

**Adjust Curves with the Legend**

![legend](http://nwallen.github.io/Sketch-Motion/static/legend.png)

- The legend lists all detected transitions in a single animation 
- To change the easing of an animation `⌘ command` + click the box showing the easing curve. Drag to the left or right. On previewing the animation, the new easing curve will be applied.

**Export a GIF**
- To export a GIF of an animation select an artboard containing a player(s) by clicking its name. Then select `Plugins ▸ Motion ▸ Export GIF` from the Sketch toolbar or use the keyboard shortcut `control` + `⌘ command` + `e` 
- Follow the prompts

## Resources
[See the Gallery](https://github.com/nwallen/Sketch-Motion-Gallery/) for examples.

## Feedback
Please add an issue to this repository to report problems or make suggestions for the development of this plugin. You can also find me on Twitter [@nawt](https://twitter.com/nawt)

## Props
- GIF Generation - Nathan Rutzky https://github.com/nathco/Generate-GIF
- Tweens - https://github.com/tweenjs/tween.js/
- The Sketch Team - http://bohemiancoding.com/sketch/
