using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Text;

namespace tspHandler
{
    public class tspConfigSettings : ConfigurationSection
    {
        public const string _serverSideIncludeSelectorKey = "serverSideIncludeSelector";
       // private const string server

        [ConfigurationProperty(_serverSideIncludeSelectorKey, DefaultValue = "iframe[data-mode='server-side-only']", IsRequired = false)]
        public string ServerSideIncludeSelector {
            get
            {
                return this[_serverSideIncludeSelectorKey] as string;
            }
            set
            {
                this[_serverSideIncludeSelectorKey] = value;
            }
        }

        //public bool SupportServerSideForms
        //{
        //    get
        //    {
        //        return this
        //    }
        //}
        
    }
}
