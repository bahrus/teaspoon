using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Web;

namespace TestWebAppClassic
{
    public static class DataTableTestModel
    {
        public static DataTable GetTable()
        {
            var dt = new DataTable();
            int iColumns = 200;
            for (int i = 0; i < iColumns; i++)
            {
                var dc = new DataColumn
                {
                    ColumnName = "Column " + i,
                    DataType = typeof(string),
                };
                dt.Columns.Add(dc);
            }
            int iRows = 100000;
            for (int i = 0; i < iRows; i++)
            {
                var dr = dt.NewRow();
                dt.Rows.Add(dr);
                for (int j = 0; j < iColumns; j++)
                {
                    dr[j] = "Row " + i + ", Column " + j;
                }
            }
            return dt;
        }

        public static DataTbl GetTbl()
        {
            var dt = new DataTbl
            {
                fields = new List<tspField>(),
                data = new List<object[]>(),
            };
            int iColumns = 10;
            for (int i = 0; i < iColumns; i++)
            {
                var dc = new tspField
                {
                    name = "Column " + i,
                };
                dt.fields.Add(dc);
            }
            int iRows = 50;
            for (int i = 0; i < iRows; i++)
            {
                var dataRow = new object[iColumns];
                for (int j = 0; j < iColumns; j++)
                {
                    dataRow[j] = "Row " + i + ", Column " + j;
                }
                dt.data.Add(dataRow);
            }
            return dt;
        }
    }

    public class DataTbl
    {
        public List<tspField> fields;

        public List<object[]> data;
    }

    public class tspField
    {
        public string name;
        public bool isPrimaryKey;
        public string header;
        public string footer;
    }
}