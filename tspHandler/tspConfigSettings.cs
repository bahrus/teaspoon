using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Text;

namespace tspHandler
{
    public class tspServerSideIncludeSection : ConfigurationSection
    {
        public const string selector = "selector";

        [ConfigurationProperty(selector, DefaultValue = "iframe[data-mode='server-side-only']", IsRequired = false)]
        public string Selector {
            get
            {
                return this[selector] as string;
            }
            set
            {
                this[selector] = value;
            }
        }
    }
}
