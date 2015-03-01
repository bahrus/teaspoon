# tspBuild

This application runs in node.js.  It provides a basis for implementing common tasks during a build.

What makes this build utility unique is it recognizes "build directives" in the html files, 
which allows for custom processing.  How is this useful?  Here's one example -- suppose you
are editing large html files, and you are using an IDE that supports a preview mode, allowing you 
to click on a visual element, and the IDE takes you to the markup responsible for the source. 
Editors such as Dream Weaver and Visual Studio support this feature.  Wouldn't it be nice to be
able to include markup which you can see in the preview, but which disappears during the build?

This application also showcases a proposed subset of valid (compilable with no errors ) TypeScript which can be used as a basis for 
configuration files.  We call this declarative syntax InactiveScript.

The use of the word Inactive in InactiveScript is meant to indicate that an InactiveScript file can be loaded
into memory of a running Javascript Engine (such as node.js), and (mostly) guarantee:

* No impact on any preexisting values in memory, 
* If one puts a breakpoint in the file, the only code which you can step through is setting constants to various values.

An InactiveScript file is a very limited subset of a typescript file.  The following syntax is disallowed:

* parenthesis
    *  By eliminating parenthesis, it eliminates free form code from executing
    *  Exception:  require statements

Eliminating all parenthesis greatly reduces what the file can contain -- no if, for, function calls, or class instantiation, for example.


InactiveScript allows only the following keywords:

* A **const** value declaration within a TypeScript module.  Value must either:
    * be a primitive type, or 
    * reference a function or object assumed to be in memory (from other files), or
    * implement an interface
        * Recursively, when implementing the fields of the interface, the field can follow the same
            pattern, i.e. be a primitive type or referene a function or object, or implement an interface.
* **interface
* **extends** applicable to interfaces.
* **type** - type aliases allowed
* **export**  Exporting constants allows other files to override some or all of them.
* **module**
    * Only one module  per file.
    * The name of the module must match the path 
        to the file name relative to the root folder, substituting the / or \ separator with .  
        This guarantees that one Inactive script file setting a const value
        cannot overwrite others.
* **true**/**false**
* **return**
    *  used for setting lambda expression inside a constant decalarion, as described below
* **try**/**finally**
    * Only around a require statement, allowing for file sharing between a web context and a server context such as node.js.

The following operators are allowed:
* +, *
* => (lambda expression).  The left hand side of the lambda expression can only consist of a single parameter.  
    The right hand side of the lambda expression may only either:
    *  be a value expression in the same line as the =>, with no braces, or
    *  begin with "return {" , followed by some lines of equality setters, where the left hand side of the equality begins with the
       single parameter found in the left hand side of the lambda expression (optionally followed by a . 
        and other sub properties of the parameter)
* =
    * The equals operator will only appear adjacent to a constant declaration, e.g. const myProp = ..., or
    * Inside a lambda expression, as described above.


But limiting what you are allowed to specify in InactiveScript to such a degree, such files should be extremely safe to
modify --  Since there is no code which executes, there is no code which needs to be unit tested.  Applications could
leverage this syntax, and allow for updates to such files in production, just as applications add admin functionality
into production.  In fact, a common task would be to write admin screens which effectively edit these inactive script files.
Keeping the syntax simple, and easy to parse would make writing such admin screens very straightforward.

Since InactiveScript is meant to serve as a kind of DSL for processes, we add some requirements to make readability
as well as parsing simpler:

Examples of **valid** InactiveScript:

1)  **Valid:** Simple const value declaration - primitive, within a module.  (Note -- all subsequent examples will
    be assumed to be within a module definition.  The example  below is valid only if it is defined in a subdirectory
    called tsp (relative to the runtime path), and a file called BuildConfig.ts.

     module tsp.BuildConfig {
        const versionKey = 'version';
     }

2)  **Valid:** const value declaration - aliases to modules or functions (including external to the file)

     const ca = tsp.CommonActions;
     const fsa = tsp.FileSystemActions;
     const da = tsp.DOMActions;
     const dbd = tsp.DOMBuildDirectives 

3)  **Valid:** interface -- pretty much any TypeScript interface is valid:

     export interface ILineParser {
        textToParse?: string;
        state?: ILineParserState;
     }

4)  **Valid:** const interface value declaration, with a sub property which itself is an interface value declaration:

     export const programConfig: IProgramConfig = {
         do: ca.doSequenceOfTypedActions,
         cacheVersionLabel: {
             do: fsa.cacheTextFile,
             fileReaderAction: {
                 do: fsa.readTextFile,
                 rootDirectoryRetriever: fsa.commonHelperFunctions.retrieveWorkingDirectory,
                 relativeFilePath: 'Version.txt',
             },
             cacheKey: versionKey
         },
         ...
     }
5)  **Valid:** lambda expression inside interface value declaration


     <!-- language: lang-js -->
     export var programConfig: IProgramConfig = {

     }







