var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var tsp;
(function (tsp) {
    function InputElementChangeHandler(tEvent) {
        var ie = tEvent.elX;
        var newValue = (ie.type === InputElement.type_checkbox ? tEvent.event.target['checked'] : tEvent.event.target['value']);
        if(newValue === null || !ie) {
            return;
        }
        ie.bindInfo.valueSet(ie, newValue);
    }
    var InputElement = (function (_super) {
        __extends(InputElement, _super);
        function InputElement(bindInfo) {
                _super.call(this, bindInfo);
            this.bindInfo = bindInfo;
            bindInfo.tag = "input";
            this.type = bindInfo.type ? bindInfo.type : InputElement.type_text;
            delete bindInfo.type;
            if(bindInfo.valueGet) {
                this.value = bindInfo.valueGet(this);
            } else {
                this.value = bindInfo.value;
            }
            if(bindInfo.disabledGet) {
                this.disabled = bindInfo.disabledGet(this);
            } else {
                if(bindInfo.disabled) {
                    this.disabled = true;
                }
            }
            if(bindInfo.valueSet) {
                tsp._.addWindowEventListener({
                    elX: this,
                    callback: InputElementChangeHandler,
                    topicName: 'change'
                });
            }
        }
        InputElement.type_button = 'button';
        InputElement.type_checkbox = 'checkbox';
        InputElement.type_color = 'color';
        InputElement.type_date = 'date';
        InputElement.type_datetime = 'datetime';
        InputElement.type_datetime_local = 'datetime-local';
        InputElement.type_email = 'email';
        InputElement.type_file = 'file';
        InputElement.type_hidden = 'hidden';
        InputElement.type_image = 'image';
        InputElement.type_month = 'month';
        InputElement.type_number = 'number';
        InputElement.type_password = 'password';
        InputElement.type_radio = 'radio';
        InputElement.type_range = 'range';
        InputElement.type_reset = 'reset';
        InputElement.type_search = 'search';
        InputElement.type_submit = 'submit';
        InputElement.type_tel = 'tel';
        InputElement.type_text = 'text';
        InputElement.type_time = 'time';
        InputElement.type_url = 'url';
        InputElement.type_week = 'week';
        InputElement.prototype.notifyDisabledChange = function () {
            if(!this._rendered) {
                return;
            }
            var bI = this.bindInfo;
            if(!bI.disabledGet) {
                return;
            }
            var newVal = bI.disabledGet(this);
            var h = this.el;
            if(h.disabled === newVal) {
                return;
            }
            h.disabled = newVal;
        };
        Object.defineProperty(InputElement.prototype, "value", {
            get: function () {
                return this.bindInfo.attributes['value'];
            },
            set: function (val) {
                var bI = this.bindInfo;
                if(this.type === InputElement.type_checkbox) {
                    if(val) {
                        this.setAttr('checked', 'checked');
                    } else {
                        this.removeAttr('checked');
                    }
                } else {
                    if(val) {
                        this.setAttr('value', val);
                    }
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(InputElement.prototype, "disabled", {
            get: function () {
                if(this._rendered) {
                    var el = this.el;
                    return el.disabled;
                }
                var s = this.getAttr('disabled');
                return s != null && s.length > 0;
            },
            set: function (val) {
                if(this._rendered) {
                    var el = this.el;
                    el.disabled = val;
                    return;
                }
                if(val) {
                    this.setAttr('disabled', 'disabled');
                } else {
                    this.removeAttr('disabled');
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(InputElement.prototype, "type", {
            get: function () {
                return this.getAttr('type');
            },
            set: function (val) {
                this.setAttr('type', val);
            },
            enumerable: true,
            configurable: true
        });
        return InputElement;
    })(tsp.ElX);
    tsp.InputElement = InputElement;    
    var InputLabelElement = (function (_super) {
        __extends(InputLabelElement, _super);
        function InputLabelElement(bindInfo) {
                _super.call(this, bindInfo);
            this.bindInfo = bindInfo;
            bindInfo.tag = 'label';
            this.forId = bindInfo.forElX.ID;
            delete bindInfo.forElX;
        }
        Object.defineProperty(InputLabelElement.prototype, "forId", {
            get: function () {
                return this.bindInfo.attributes['for'];
            },
            set: function (sVal) {
                if(sVal) {
                    this.bindInfo.attributes['for'] = sVal;
                }
            },
            enumerable: true,
            configurable: true
        });
        return InputLabelElement;
    })(tsp.ElX);
    tsp.InputLabelElement = InputLabelElement;    
})(tsp || (tsp = {}));
//@ sourceMappingURL=InputElement.js.map
