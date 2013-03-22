using System.CodeDom.Compiler;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Runtime.InteropServices.WindowsRuntime;


namespace InterfaceTestLibrary
{

    
    public static partial class LibA
    {
        
        [GeneratedCodeAttribute("tsp", "1")]
        public interface InterfaceA
        {
            [DefaultValue("Hello")]
            string StringProp1 { get; set; }

            [Required]
            string StringProp2 { get; set; }

            [Required]
            string StringProp3 { get; set; }

            
            string StringProp4 { get; set; }

            
            string StringProp5 { get; set; }

            
            string StringProp6 { get; set; }

            string StringProp7 { get; set; }

            InterfaceTestLibrary.Ext.A.ExtensionLib ExtA { get; set; }

            InterfaceTestLibrary.Ext.B.ExtensionLib ExtB { get; set; }
            
        }

        
    }

    [InterfaceImplementedInVersion(typeof(LibA.InterfaceA), 0, 0, 0, 0)]
    public partial class ClassA
    {
        public string StringPropX { get; set; }
    }
}
