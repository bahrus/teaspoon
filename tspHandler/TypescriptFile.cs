using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using ClassGenMacros;

namespace tspHandler
{
    public class TypescriptFile : IComparable<TypescriptFile>
    {
        public string DocumentFilePath { get; set; }

        public TypescriptFile(string documentFilePath)
        {
            //TODO:  Prevent circular references
            this.DocumentFilePath = documentFilePath;
            var fi = new FileInfo(documentFilePath);
            if(!fi.Exists) return;
            var sr = new StreamReader(documentFilePath);
            while (sr.Peek() != -1)
            {
                string line = sr.ReadLine().Trim();
                if (line.Length == 0) continue;
                if (!line.StartsWith("///<reference"))
                {
                    break;
                }
                string afterPathEquals = line.SubstringAfter("=");
                string beforeclosedBracket = afterPathEquals.SubstringBefore("/>");
                string path = beforeclosedBracket.Trim().Trim('\'').Trim('\"');
                string newPath = documentFilePath.NavigateTo(path);
                var tfChild = new TypescriptFile(newPath);
                this.DependenciesNN.Add(tfChild);
            }
        }

        public List<TypescriptFile> Dependencies { get; set; }

        public List<TypescriptFile> DependenciesNN
        {
            get
            {
                if (Dependencies == null) Dependencies = new List<TypescriptFile>();
                return Dependencies;
            }
        }

        public override string ToString()
        {
            return this.DocumentFilePath;
        }

        private int? _level;
        public int Level
        {
            get
            {
                if (_level != null) return (int) _level;
                if (this.Dependencies == null)
                {
                    _level = 0;
                    return (int) _level;
                }
                _level = this.Dependencies.Count + this.Dependencies.Sum(tsf => tsf.Level);
                return (int) _level;
            }
        }


        public int CompareTo(TypescriptFile other)
        {
            //var lhs = this.Dependencies == null ? 0 : this.Dependencies.Count;
            //var rhs = other.Dependencies == null ? 0 : other.Dependencies.Count;
            //return lhs.CompareTo(rhs);
            return this.Level.CompareTo(other.Level);
        }
    }
}
