﻿using System.CodeDom.Compiler;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Runtime.InteropServices.WindowsRuntime;
using ClassGenMacros;


namespace InterfaceTestLibrary
{

    
    public static partial class LibA
    {

        [AutoGenerateDefaultCSharpImplementation]
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

            //InterfaceTestLibrary.Ext.A.ExtensionLib ExtA { get; set; }

            //InterfaceTestLibrary.Ext.B.ExtensionLib ExtB { get; set; }

            
            
        }

        
    }

    [AutoGenerateProperties(AssociatedType =  typeof(LibA.InterfaceA))]
    public partial class ClassA
    {
        public string StringPropX { get; set; }
    }

    [AutoGenerateNamingClass]
    public class NamesOfElements
    {

        public const string Canvas = "canvas";

        public const string Div = "div";
    }

    [AutoGenerateExtensionMethods(AssociatedType = typeof(LibA.InterfaceA))]
    public class ExtensionLib
    {
        public virtual void DoA(LibA.InterfaceA iA)
        {
            
        }

        public void Create(LibA.InterfaceA iA, Elements.DivString Div)
        {
        }

        public void Create(LibA.InterfaceA iA, Elements.CanvasString Canvas)
        {
        }

        public List<LibA.InterfaceA> CreateMultiple(string name, LibA.InterfaceA iA)
        {
            return null;
        }

        public void IgnoreThis(string name, object test) { }
    }

    [AutoGenerateExtensionMethods(AssociatedType = typeof(LibA.InterfaceA))]
    public class ExtensionLib2 : ExtensionLib
    {
        public override void DoA(LibA.InterfaceA iA)
        {
            base.DoA(iA);
        }
    }
}
