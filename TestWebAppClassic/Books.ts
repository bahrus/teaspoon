///<reference path="ts/lib/ElX.ts" />

 
module DataExamples {
    export interface IChapter {
        name: string;
        selected?: bool;
    }

    export interface IBook {
        title: string;
        chapters: IChapter[];
    }

    export interface ISubject {
        subject: string;
        books: IBook[];
    }

    export var chapterToLI:  (chapter : IChapter, i : number) => tsp.ElX = (chapter, i) => {
        return tsp.LI({ text: chapter.name, dataContext: chapter,
            selectSettings: {
                selectSet: (elx, newVal) => {
                    var chp = <IChapter> elx.bindInfo.dataContext;
                    chp.selected = newVal;
                }
            }}
        );
    };

    export var chapterToLI2: (chapter: IChapter, i: number) => tsp.ElX = (chapter, i) => {
        return tsp.LI({
            text: chapter.name, dataContext: chapter,
        
        });
    };

     

    export var bookToLI: (book: DataExamples.IBook, i: number) => tsp.ElX = (book, i) => {
        var li = tsp.LI({
            //collapsed:true,
            //toggleKidsOnParentClick:true,
            text: book.title,
            kids: [tsp.UL({
                collapsed:true,
                toggleKidsOnParentClick:true,
                kids: book.chapters.map(DataExamples.chapterToLI),
            })]
        });
        return li;
    };

    export var bookGen : (el: tsp.ElX) => tsp.ElX[] = (el) => {
        var bI = el.bindInfo;
        var subject = <DataExamples.ISubject>bI.dataContext;
        return subject.books.map(DataExamples.bookToLIDyn);
    };

    export var chapterGen: (el: tsp.ElX) => tsp.ElX[] = el => {
        var bI = el.bindInfo;
        var book = <IBook> bI.dataContext;
        return book.chapters.map(chapterToLI);
    };

    export var bookToLIDyn: (book: DataExamples.IBook, i: number) => tsp.ElX = (book, i) => {
        var li = tsp.LI({
            text: book.title,
            kids: [tsp.UL({
                dataContext:book,
                collapsed:true,
                toggleKidsOnParentClick:true,
                kidsGet: chapterGen,
            })]
        });
        return li;
    };

    export function GenerateBooks(noOfBooks: number, noOfChapters: number) : ISubject {
        var json: ISubject = {
            subject: "JavaScript", books: [],
        };
        for (var i = 0; i < noOfBooks; i++) {
            var book: IBook = {
                title: " book " + i, chapters: [],
            };
            json.books.push(book);
            for (var j = 0; j < noOfChapters; j++) {
                var chapter: IChapter = {
                    name: 'chapter ' + j,
                };
                book.chapters.push(chapter);
            }
        }
        return json;
    }
}