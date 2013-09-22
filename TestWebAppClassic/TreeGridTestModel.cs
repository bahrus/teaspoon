using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace TestWebAppClassic
{
    public static class TreeGridTestModel
    {
        public static DataTbl GetTreeGrid()
        {
            var dt = new DataTbl
            {
                fields = new List<tspField>(),
                data = new List<object[]>(),
            };
            int iColumns = 10;
            dt.fields.Add(new tspField
            {
                isTreeNodeInfo = true,
                name = "TreeInfo",
            });
            
            for (int i = 0; i < iColumns; i++)
            {
                
                var dc = new tspField
                {
                    name = "Column " + i,
                };
                dt.fields.Add(dc);
            }
            var totalColumns = dt.fields.Count;
            int iLevel1Rows = 10;
            int iLevel2Rows = 5;
            int iLevel3Rows = 5;
            for (int i = 0; i < iLevel1Rows; i++)
            {
                var dataRow = new object[totalColumns];
                object[] treeInfo = {"Tree Label " + i, "itm_" + i, string.Empty, 0, iLevel2Rows };
                dataRow[0] = treeInfo;
                for (int j = 1; j < totalColumns; j++)
                {
                    dataRow[j] = "Row " + i + ", Column " + j;
                }
                dt.data.Add(dataRow);
                for (int j = 0; j < iLevel2Rows; j++)
                {
                    var childDataRow = new object[totalColumns];
                    object[] childTreeInfo = { "Child Node " + i + " - " + j, "itm_" + i + "_" + j, treeInfo[1], 1, iLevel3Rows };
                    childDataRow[0] = childTreeInfo;
                    for (int k = 1; k < totalColumns; k++)
                    {
                        childDataRow[k] = "Child Row " + j + ", Column " + k;
                    }
                    dt.data.Add(childDataRow);
                    for (int k = 0; k < iLevel3Rows; k++)
                    {
                        var grandChildDataRow = new object[totalColumns];
                        object[] grandChildTreeInfo = {"Grand child node " + i + " - " + j + " - " + k, "itm_" + i + "_" + j + "_" + k, childTreeInfo[1], 2, 0};
                        grandChildDataRow[0] = grandChildTreeInfo;
                        for (int l = 1; l < totalColumns; l++)
                        {
                            grandChildDataRow[l] = "Grand Child Row " + k + ", Column " + l;
                        }
                        dt.data.Add(grandChildDataRow);
                    }
                }
            }
            return dt;
        }
    }
}