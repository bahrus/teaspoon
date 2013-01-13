var tsp;
(function (tsp) {
    (function (_) {
        ; ;
        (function (EnvironmentOptions) {
            EnvironmentOptions._map = [];
            EnvironmentOptions._map[0] = "Browser";
            EnvironmentOptions.Browser = 0;
            EnvironmentOptions._map[1] = "WebServer";
            EnvironmentOptions.WebServer = 1;
        })(_.EnvironmentOptions || (_.EnvironmentOptions = {}));
        var EnvironmentOptions = _.EnvironmentOptions;
        ; ;
        _.runtimeEnvironment = {
            environment: window.alert ? EnvironmentOptions.Browser : EnvironmentOptions.WebServer
        };
        _.objectLookup = {
        };
        _.SVObjectChangeListeners = {
        };
        _.BVObjectChangeListeners = {
        };
        function getUID() {
            counter++;
            return "Dh_" + counter;
        }
        _.getUID = getUID;
        var counter = 0;
        function GUID(obj) {
            var id = obj.DhID;
            if(!id) {
                id = getUID();
                obj.DhID = id;
                _.objectLookup[id] = obj;
            }
            return id;
        }
        _.GUID = GUID;
        function cleanUp(d) {
            var all = d.all;
            if(!all) {
                all = d.getElementsByTagName('*');
            }
            for(var i = 0, n = all.length; i < n; i++) {
                var elT = all[i];
                var elX = _.objectLookup[elT.id];
                delete elX.kids;
                if(elT.id) {
                    delete _.objectLookup[elT.id];
                }
            }
        }
        _.cleanUp = cleanUp;
        function ListenForSVChange(listener) {
            var obj = listener.obj;
            var objId = GUID(obj);
            var propName = getStringPropName(listener.getter);
            var lID = objId + "." + propName;
            if(!_.SVObjectChangeListeners[lID]) {
                _.SVObjectChangeListeners[lID] = [];
            }
            _.SVObjectChangeListeners[lID].push(listener.callback);
        }
        _.ListenForSVChange = ListenForSVChange;
        function ListenForBVChange(listener) {
            var obj = listener.obj;
            var objId = GUID(obj);
            var propName = getBoolPropName(listener.getter);
            var lID = objId + "." + propName;
            if(!_.BVObjectChangeListeners[lID]) {
                _.BVObjectChangeListeners[lID] = [];
            }
            _.BVObjectChangeListeners[lID].push(listener.callback);
        }
        _.ListenForBVChange = ListenForBVChange;
        function setBV(BVSetter) {
            var obj = BVSetter.obj;
            BVSetter.setter(obj, BVSetter.val);
            if(obj.DhID) {
                var propName = getBoolPropName(BVSetter.getter);
                var lID = obj.DhID + "." + propName;
                var listeners = _.BVObjectChangeListeners[lID];
                if(listeners) {
                    for(var i = 0, n = listeners.length; i < n; i++) {
                        var callback = listeners[i];
                        callback(BVSetter.val);
                    }
                }
            }
        }
        _.setBV = setBV;
        function setSV(SVSetter) {
            var obj = SVSetter.obj;
            SVSetter.setter(obj, SVSetter.val);
            if(obj.DhID) {
                var propName = getStringPropName(SVSetter.getter);
                var lID = obj.DhID + "." + propName;
                var listeners = _.SVObjectChangeListeners[lID];
                if(listeners) {
                    for(var i = 0, n = listeners.length; i < n; i++) {
                        var callback = listeners[i];
                        callback(SVSetter.val);
                    }
                }
            }
        }
        _.setSV = setSV;
        var betweenString = (function () {
            function betweenString(val, searchStart) {
                this.val = val;
                this.searchStart = searchStart;
            }
            betweenString.prototype.and = function (searchEnd) {
                var posOfStart = this.val.indexOf(this.searchStart);
                if(posOfStart === -1) {
                    return '';
                }
                var posOfEnd = this.val.indexOf(searchEnd, posOfStart);
                if(posOfEnd === -1) {
                    return this.val.substring(posOfStart);
                }
                return this.val.substring(posOfStart + this.searchStart.length, posOfEnd);
            };
            return betweenString;
        })();
        _.betweenString = betweenString;        
        function getStringPropName(getter) {
            var s = getter.toString();
            var s2 = new _.betweenString(s, '.').and(';');
            return s2;
        }
        _.getStringPropName = getStringPropName;
        function getBoolPropName(getter) {
            var s = getter.toString();
            var s2 = new _.betweenString(s, '.').and(';');
            return s2;
        }
        _.getBoolPropName = getBoolPropName;
    })(tsp._ || (tsp._ = {}));
    var _ = tsp._;
})(tsp || (tsp = {}));
//@ sourceMappingURL=_.js.map
