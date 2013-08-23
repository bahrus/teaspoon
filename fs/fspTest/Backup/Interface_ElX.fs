namespace tsp

open System.Collections.Generic

module tsp =
    


    type IRenderContext = 
        abstract member output: string
        //abstract member elements: 
    
        

    type IRenderable =
        abstract member parentElement: IRenderable
        abstract member ID: string
        //abstract member doRender

    //type IElX =
        //inherit IRenderable
        //abstract member el 

    type IDOMBinder =
        abstract member attributes : Dictionary<string, string>
        abstract member contentEditable : bool
        //abstract member dynamicAttributes : Dictionary<string, 


