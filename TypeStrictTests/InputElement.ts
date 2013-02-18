///<reference path="_.ts" />
///<reference path="ElX.ts" />

module tsp {
    export interface IInputBinder extends IDOMBinder {
        disabled?: bool;
        disabledGet? (ie: InputElement): bool;

        type?: string;
        value?: string;
        valueGet? (ie: InputElement): string;
        valueSet? (ie: InputElement, newVal: string): void;
        checkedValueSet? (ie: InputElement, oldVal: string, newVal: string): void;
    }

    export function Input(bindInfo: IInputBinder): InputElement {
        return new InputElement(bindInfo);
    }

    export function LabelForInput(bindInfo: IInputLabelBinder): InputLabelElement {
        return new InputLabelElement(bindInfo);
    }

    export interface IInputLabelBinder extends IDOMBinder {
        forElX: ElX;
    }

    function InputElementChangeHandler(tEvent: ITopicEvent) {
        var ie = <InputElement> tEvent.elX;
        var newValue = (ie.type === InputElement.type_checkbox ? tEvent.event.target['checked'] : tEvent.event.target['value']);

        if (newValue === null || !ie) return;
        ie.bindInfo.valueSet(ie, newValue);
    }

    export class InputElement extends ElX {

        public static type_button: string = 'button';
        public static type_checkbox: string = 'checkbox';
        public static type_color: string = 'color';
        public static type_date: string = 'date';
        public static type_datetime: string = 'datetime';
        public static type_datetime_local: string = 'datetime-local';
        public static type_email: string = 'email';
        public static type_file: string = 'file';
        public static type_hidden: string = 'hidden';
        public static type_image: string = 'image';
        public static type_month: string = 'month';
        public static type_number: string = 'number';
        public static type_password: string = 'password';
        public static type_radio: string = 'radio';
        public static type_range: string = 'range';
        public static type_reset: string = 'reset';
        public static type_search: string = 'search';
        public static type_submit: string = 'submit';
        public static type_tel: string = 'tel';
        public static type_text: string = 'text';
        public static type_time: string = 'time';
        public static type_url: string = 'url';
        public static type_week: string = 'week';


        constructor(public bindInfo: IInputBinder) {
            super(bindInfo);
            bindInfo.tag = "input";
            this.type = bindInfo.type ? bindInfo.type : InputElement.type_text;
            delete bindInfo.type;
            if (bindInfo.valueGet) {
                this.value = bindInfo.valueGet(this);
            } else {
                this.value = bindInfo.value;
            }
            if (bindInfo.disabledGet) {
                this.disabled = bindInfo.disabledGet(this);
            } else {
                if (bindInfo.disabled) {
                    this.disabled = true;
                }
            }
            if (bindInfo.valueSet) {
                addWindowEventListener({
                    elX: this,
                    callback: InputElementChangeHandler,
                    topicName: 'change',
                });
            }

        }

        public notifyDisabledChange() {
            if (!this._rendered) return;
            var bI = this.bindInfo;
            if (!bI.disabledGet) return;
            var newVal = bI.disabledGet(this);
            var h: HTMLElement = this.el;
            if (h.disabled === newVal) return;
            h.disabled = newVal;
        }


        get value(): string {
            return this.bindInfo.attributes['value'];
        }

        set value(val: string) {
            var bI = this.bindInfo;
            if (this.type === InputElement.type_checkbox) {
                if (val) {
                    this.setAttr('checked', 'checked');
                } else {
                    this.removeAttr('checked');
                }
            } else {
                if (val) {
                    this.setAttr('value', val);
                    //this.bindInfo.attributes['value'] = val;
                }
            }
        }

        get disabled(): bool {
            if (this._rendered) {
                var el = this.el;
                return el.disabled;
            }
            var s = this.getAttr('disabled');
            return s != null && s.length > 0;
        }

        set disabled(val: bool) {
            if (this._rendered) {
                var el = this.el;
                el.disabled = val;
                return;
            }
            if (val) {
                this.setAttr('disabled', 'disabled');
            } else {
                this.removeAttr('disabled');
            }
        }

        get type(): string {
            return this.getAttr('type');
        }

        set type(val: string) {
            this.setAttr('type', val);
        }
    }

    export class InputLabelElement extends ElX {
        constructor(public bindInfo: IInputLabelBinder) {
            super(bindInfo);
            bindInfo.tag = 'label';
            this.forId = bindInfo.forElX.ID;
            delete bindInfo.forElX;
        }

        //private _forElXID: string;

        get forId(): string {
            return this.bindInfo.attributes['for'];
        }

        set forId(sVal: string) {
            if (sVal) {
                this.bindInfo.attributes['for'] = sVal;
            }
        }
    }
}