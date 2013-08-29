using System;
using System.Collections.Generic;
//using CurlyBraceParser.DOM;

public static partial class tsp
{
    public interface IDOMBinder
    {
        Dictionary<string, string> attributes { get; set; }
        bool contentEditable { get; set; }
        Dictionary<string, Func<IElX, string>> dynamicAttributes { get; set; }
        Dictionary<string, Func<IElX, bool>> dynamicClasses { get; set; }
        Dictionary<string, Func<IElX, string>> dynamicStyles { get; set; }
        string[] classes { get; set; }
        string id { get; set; }
        IRenderable[] kids { get; set; }
        IElX[] kidsGet(IElX el);
        Dictionary<string, string> styles { get; set; }
        string tag { get; set; }
        string text { get; set; }
        string textGet(IElX el);
        bool toggleKidsOnParentClick { get; set; }
        bool collapsed { get; set; }
        object dataContext { get; set; }
        ISelectBinder selectSettings { get; set; }
        object container { get; set; }
        object onNotifyAddedToDom(IElX el);
    }
    public interface IRenderable
    {
        IRenderable parentElement { get; set; }
        object doRender(IRenderContext context  = null);
        string ID { get; set; }
    }
    public interface IElX
    {
        IDOMBinder bindInfo { get; set; }
        //HTMLElement el { get; set; }
        IElX[] kidElements { get; set; }
        bool selected { get; set; }
        bool _rendered { get; set; }
        object innerRender(IRenderContextProps settings);
        object removeClass(string className);
        object ensureClass(string className);
    }
    public interface IRenderContext
    {
        string output { get; set; }
        IElX[] elements { get; set; }
        IRenderContextProps settings { get; set; }
    }
    public interface ISelectBinder
    {
        bool selected { get; set; }
        bool selectGet(IElX elX);
        void selectSet(IElX elX, bool newVal);
        string group { get; set; }
        string selClassName { get; set; }
        string partialSelClassName { get; set; }
        string unselClassName { get; set; }
        bool conformWithParent { get; set; }
    }
    public interface IListenForTopic
    {
        string topicName { get; set; }
        bool conditionForNotification(ITopicEvent tEvent);
        void callback(ITopicEvent tEvent);
        IElX elX { get; set; }
        string elXID { get; set; }
    }
    public interface ITopicEvent
    {
        //Event topicEvent { get; set; }
    }
    public interface IRenderContextProps
    {
        string targetDomID { get; set; }
        //HTMLElement targetDom { get; set; }
    }
}
