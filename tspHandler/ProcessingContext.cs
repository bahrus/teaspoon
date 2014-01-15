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
}
