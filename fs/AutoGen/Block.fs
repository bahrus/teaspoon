namespace Autogen

open System
open System.Text

module CurlyBraceSyntax =

    type Block =
        interface IDisposable with
            member x.Dispose() = 
                Block._level <- Block._level - 1
                Block.AppendTabs
                Block._sb.AppendLine "}" |> ignore 
     
        [<DefaultValue>]
        [<ThreadStatic>]
        static val mutable private _level : int

        [<DefaultValue>]
        [<ThreadStatic>]
        static val mutable private _sb : StringBuilder

        static member AppendTabs = 
            for i = 0 to Block._level do
                Block._sb.Append "\t" |> ignore

        //static member AppendClosingStatement =
        static member private EnsureNonNullSB = 
        
            Block._sb <- 
                match Block._sb with
                    | null -> new StringBuilder()
                    | _ -> Block._sb

        static member private AppendClosingStatement text =
             Block.EnsureNonNullSB
             Block.AppendTabs
             Block._sb.AppendLine text
    
        static member private AppendStatement text =
            Block.EnsureNonNullSB
            Block.AppendTabs
            Block._sb.AppendLine (text + ";")

        static member private AppendBlankLine =
            Block.EnsureNonNullSB
            Block._sb.AppendLine(String.Empty)

        static member private AppendBlock (text : string) =
            Block.EnsureNonNullSB
            Block._sb.Append text

        new() =
            new Block()

        new(text: string) = 
            Block.EnsureNonNullSB
            Block.AppendTabs
            Block._sb.AppendLine (text + "{") |> ignore
            Block._level <- Block._level + 1
            new Block()

        member x.Text = 
            let resp = 
                match Block._sb with
                    | null -> null
                    | _ -> Block._sb.ToString()
            Block._sb <- null
            resp


    type OpenStatement = 
        {
            Header: string option;
            Body: Statement list;
            Footer: string option;
            Wrapper : string option;
        }
    
    and Statement =
        |OpenStmt       of OpenStatement
        |Line           of string

    let OS (Header : string) (Wrapper : string) (Body: Statement list) (Footer: string) = 
        let ret : OpenStatement = 
            {
                Header = Some(Header);
                Body = Body;
                Footer = Some(Footer);
                Wrapper = Some(Wrapper);
            }
        ret

    let GenerateAssemblyOutput (Namespace: string) (Module: string) (Statement: Statement) =



            