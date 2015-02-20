# tspBuild

This application runs in node.js.  It provides a basis for implementing common tasks during a build.

What makes this build utility unique is it recognizes "build directives" in the html files, 
which allows for custom processing.  How is this useful?  Here's one example -- suppose you
are editing large html files, and you are using an IDE that supports a preview mode, allowing you 
to click on a visual element, and the IDE takes you to the markup responsible for the source. 
Editors such as Dream Weaver and Visual Studio support this feature.  Wouldn't it be nice to be
able to include markup which you can see in the preview, but which disappears during the build?

This application also showcases a proposed subset of typescript which can be used as a basis for 
configuration files.  We called this declarative syntax InertScript.


