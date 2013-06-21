///<reference path="ts/lib/_.ts" />

module PropTests {

    // Class

    export interface ITest1 {
        Prop1: string;
    }

    export class Test1 implements ITest1 {
        // Constructor
        constructor() {
        }


        private _prop1: string;

        get Prop1(): string {
            return this._prop1;
        }

        set Prop1(val: string) {
            this._prop1 = val;
        }
    }


    export interface ITest2 {
        Prop2: string;
        BinaryProp1?: bool;
        NumberProp1?: number;
        NumberProp2?: number;
    }

    export class Test2 {
        constructor(private Prop2Data: ITest2) {
            
            this.Prop2Bind = new tsp._.Binder<ITest2, string>({
                getter: itest2 => itest2.Prop2,
                setter: (itest2, val) => itest2.Prop2 = val,
                obj: Prop2Data,
            });

            this.BinaryProp1Bind = new tsp._.Binder<ITest2, bool>({
                getter: itest2 => itest2.BinaryProp1,
                setter: (itest2, val) => itest2.BinaryProp1 = val,
                obj: Prop2Data,
            });
        }

        public counter: number = 0;

        public Prop2Bind: tsp._.Binder<ITest2, string>;

        public get Prop2(): string {
            this.counter++;
            return this.Prop2Bind.value;
        }


        set Prop2(val: string) {
            this.Prop2Bind.value = val;
        }

        //#region BinaryProp1

        public BinaryProp1Bind: tsp._.Binder<ITest2, bool>;
        public get BinaryProp1(): bool {
            return this.BinaryProp1Bind.value;
        }

        

        public set BinaryProp1(bVal: bool) {
            this.BinaryProp1Bind.value = bVal;
        }

        
        //#endregion

        //#region NumberPrp1
        public get NumberProp1(): number {
            return this.Prop2Data.NumberProp1;
        }

        public NumberProp1Setter = (obj: Test2, v: number) => {
            obj.Prop2Data.NumberProp1 = v;
        };

        public set NumberProp1(val: number) {
            tsp._.setNV({ setter: this.NumberProp1Setter, getter: this.NumberProp1Getter, obj: this, val: val, });
        }

        public NumberProp1Getter = (obj: Test2): number => {
            return obj.NumberProp1;
        }

        //#endregion

        
         //#region NumberProp2
        public get NumberProp2(): number {
            return this.Prop2Data.NumberProp2;
        }

        public NumberProp2Setter = (obj: Test2, v: number) => {
            obj.Prop2Data.NumberProp2 = v;
        };

        public set NumberProp2(val: number) {
            tsp._.setNV({ setter: this.NumberProp2Setter, getter: this.NumberProp2Getter, obj: this, val: val, });
        }

        public NumberProp2Getter = (obj: Test2): number => {
            return obj.NumberProp2;
        }

        //#endregion


    }

}