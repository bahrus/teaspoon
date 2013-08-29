using System;
using System.Collections.Generic;
//using CurlyBraceParser.DOM;

public static partial class tsp
{
    public class Renderable_IRenderable : IRenderable
    {

        

        public IRenderable parentElement { get; set; }
        

        public object doRender(IRenderContext context)
        {
            throw new NotImplementedException();
        }

        public string ID { get; set; }

        public static IRenderable Create(IRenderable parentElement, string ID)
        {
            var returnObj = new Renderable_IRenderable
            {
                parentElement = parentElement,
                ID = ID,
            };
            return returnObj;
        }
    }

    
}
