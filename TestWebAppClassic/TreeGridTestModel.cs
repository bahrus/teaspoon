using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace TestWebAppClassic
{
    public static class TreeGridTestModel
    {

        public static void CreateNode(List<object[]> Data, int TotalColumns, string ParentText, string ParentID, Stack<int> NodeCount, int Level)
        {
            //var childDataRow = new object[totalColumns];
            //object[] childTreeInfo = { "Child Node " + i + " - " + j, "itm_" + i + "_" + j, treeInfo[1], 1, iLevel3Rows };
            //childDataRow[0] = childTreeInfo;
            //for (int k = 1; k < totalColumns; k++)
            //{
            //    childDataRow[k] = "Child Row " + j + ", Column " + k;
            //}
            //Data.Add(childDataRow);
            if (NodeCount.Count == 0) return;
            var count = NodeCount.Pop();
            string levelPost;
            switch (Level % 10)
            {
                case 1:
                    levelPost = "st";
                    break;
                case 2:
                    levelPost = "nd";
                    break;
                case 3:
                    levelPost = "rd";
                    break;
                default:
                    levelPost = "th";
                    break;

            }
            for (var i = 0; i < count; i++)
            {
                var row = new object[TotalColumns];
                var childID = ParentID + "_" + i;
                var childText = ParentText + " - " + i;
                var numChildren = 0;
                if (NodeCount.Count > 0)
                {
                    numChildren = NodeCount.Peek();
                }
                
                object[] treeNodeInfo = { Level + levelPost + " Level " + childText + " - " + i, childID, ParentID, Level, numChildren};
                row[0] = treeNodeInfo;
                for (int j = 1; j < TotalColumns; j++)
                {
                    row[j] = Level +  levelPost + " Level, Column " + (j - 1);
                }
                Data.Add(row);
                CreateNode(Data, TotalColumns, childText, childID, NodeCount, Level + 1);
            }
            NodeCount.Push(count);
        }

        public static DataTbl GetTreeGrid()
        {
            var dt = new DataTbl
            {
                fields = new List<tspField>(),
                data = new List<object[]>(),
            };
            int iColumns = 2;
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

            var stack = new Stack<int>();
            for (int i = 1; i < 5; i++)
            {
                stack.Push(3);
            }
            //    stack.Push(20);
            //stack.Push(20);
            //stack.Push(20);
            //stack.Push(30);
            CreateNode(dt.data, totalColumns, string.Empty, string.Empty, stack, 0);

            // = 300;// 10;
            //int iLint iLevel1Rowsevel2Rows = 20; // 5;
            //int iLevel3Rows = 20;// 5;
            ////int iLevel4Rows = 20;

            //for (int i = 0; i < iLevel1Rows; i++)
            //{
            //    var dataRow = new object[totalColumns];
            //    object[] treeInfo = {"Tree Label " + i, "itm_" + i, string.Empty, 0, iLevel2Rows };
            //    dataRow[0] = treeInfo;
            //    for (int j = 1; j < totalColumns; j++)
            //    {
            //        dataRow[j] = "Row " + i + ", Column " + j;
            //    }
            //    dt.data.Add(dataRow);
            //    for (int j = 0; j < iLevel2Rows; j++)
            //    {
            //        var childDataRow = new object[totalColumns];
            //        object[] childTreeInfo = { "Child Node " + i + " - " + j, "itm_" + i + "_" + j, treeInfo[1], 1, iLevel3Rows };
            //        childDataRow[0] = childTreeInfo;
            //        for (int k = 1; k < totalColumns; k++)
            //        {
            //            childDataRow[k] = "Child Row " + j + ", Column " + k;
            //        }
            //        dt.data.Add(childDataRow);
            //        for (int k = 0; k < iLevel3Rows; k++)
            //        {
            //            var grandChildDataRow = new object[totalColumns];
            //            object[] grandChildTreeInfo = {"Grand child node " + i + " - " + j + " - " + k, "itm_" + i + "_" + j + "_" + k, childTreeInfo[1], 2, 0};
            //            grandChildDataRow[0] = grandChildTreeInfo;
            //            for (int l = 1; l < totalColumns; l++)
            //            {
            //                grandChildDataRow[l] = "Grand Child Row " + k + ", Column " + l;
            //            }
            //            dt.data.Add(grandChildDataRow);
            //        }
            //    }
            //}
            return dt;
        }
    }
}