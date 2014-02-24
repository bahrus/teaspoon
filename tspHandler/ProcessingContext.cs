using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace tspHandler
{
    public class ProcessingContext
    {

        public dynamic Model { get; set; }

        public List<ModelScriptPostProcessingInfo> ModelScriptPostProcessingInfos { get; set; }

        public List<ModelScriptPostProcessingInfo> ModelScriptPostProcessingInfosNN
        {
            get
            {
                if (ModelScriptPostProcessingInfos == null) ModelScriptPostProcessingInfos = new List<ModelScriptPostProcessingInfo>();
                return ModelScriptPostProcessingInfos;
            }
        }

        public Dictionary<string, List<HtmlNodeFacade>> IFrameMergingNodes { get; set; }

        public Dictionary<string, List<HtmlNodeFacade>> IFrameMergingNodesNN
        {
            get
            {
                if (IFrameMergingNodes == null) IFrameMergingNodes = new Dictionary<string, List<HtmlNodeFacade>>();
                return IFrameMergingNodes;
            }
        }

        public Dictionary<string, AttributeChanges> AttributeChanges { get; set; }

        public Dictionary<string, AttributeChanges> AttributeChangesNN{

            get
            {
                if (AttributeChanges == null) AttributeChanges = new Dictionary<string, AttributeChanges>();
                return AttributeChanges;
            }
    
        }

        private int uniqueCount = 0;

        public string GetOrCreateID(HtmlNodeFacade node)
        {
            if (string.IsNullOrEmpty(node.id))
            {
                node.id = "DBS_" + uniqueCount++;
            }
            return node.id;
        }
    }

    public class ModelScriptPostProcessingInfo{
        public HtmlNodeFacade Node { get; set; }
        public string CSFilter { get; set; }
        public object Model { get; set; }
        public string JSONifiedModel { get; set; }
        public bool NeededForClient { get; set; }
        public bool IsDumbedDown { get; set; }
        public string StaticMethodString { get; set; }
    }

    public class AttributeChange
    {
        public string OriginalValue { get; set; }
    }

    public class AttributeChanges : Dictionary<string, AttributeChange>
    {
        public List<string> ClassesToRemove { get; set; }

        public List<string> ClassesToRemoveNN
        {
            get
            {
                if (ClassesToRemove == null) ClassesToRemove = new List<string>();
                return ClassesToRemove;
            }
        }
    }
}
