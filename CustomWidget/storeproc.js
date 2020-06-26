(function() {
    let _shadowRoot;
    let _id;

    let div;
    let Ar = [];
    let widgetName;
    let _message
    let ssocket;
    let socketid;

    let tmpl = document.createElement("template");
    tmpl.innerHTML = `
      <style>
      </style>
    `;

    class StoreProc extends HTMLElement {

        constructor() {
            super();

            _shadowRoot = this.attachShadow({
                mode: "open"
            });
            _shadowRoot.appendChild(tmpl.content.cloneNode(true));

            _id = createGuid();

            //_shadowRoot.querySelector("#oView").id = _id + "_oView";

            this._export_settings = {};
            this._export_settings.socketurl = "";
            this._export_settings.text = "";
            this._export_settings.command = "";
            this._export_settings.name = "";
            this._export_settings.sessionid = "";

            this.addEventListener("click", event => {
                console.log('click');
            });

            this._firstConnection = 0;
            this._firstConnectionUI5 = 0;

        }

        connectedCallback() {
            try {
                if (window.commonApp) {
                    let outlineContainer = commonApp.getShell().findElements(true, ele => ele.hasStyleClass && ele.hasStyleClass("sapAppBuildingOutline"))[0]; // sId: "__container0"

                    if (outlineContainer && outlineContainer.getReactProps) {
                        let parseReactState = state => {
                            let components = {};

                            let globalState = state.globalState;
                            let instances = globalState.instances;
                            let app = instances.app["[{\"app\":\"MAIN_APPLICATION\"}]"];
                            let names = app.names;

                            for (let key in names) {
                                let name = names[key];

                                let obj = JSON.parse(key).pop();
                                let type = Object.keys(obj)[0];
                                let id = obj[type];

                                components[id] = {
                                    type: type,
                                    name: name
                                };
                            }

                            for (let componentId in components) {
                                let component = components[componentId];
                            }

                            let metadata = JSON.stringify({
                                components: components,
                                vars: app.globalVars
                            });

                            if (metadata != this.metadata) {
                                this.metadata = metadata;

                                this.dispatchEvent(new CustomEvent("propertiesChanged", {
                                    detail: {
                                        properties: {
                                            metadata: metadata
                                        }
                                    }
                                }));
                            }
                        };

                        let subscribeReactStore = store => {
                            this._subscription = store.subscribe({
                                effect: state => {
                                    parseReactState(state);
                                    return {
                                        result: 1
                                    };
                                }
                            });
                        };

                        let props = outlineContainer.getReactProps();
                        if (props) {
                            subscribeReactStore(props.store);
                        } else {
                            let oldRenderReactComponent = outlineContainer.renderReactComponent;
                            outlineContainer.renderReactComponent = e => {
                                let props = outlineContainer.getReactProps();
                                subscribeReactStore(props.store);

                                oldRenderReactComponent.call(outlineContainer, e);
                            }
                        }
                    }
                }
            } catch (e) {}
        }

        disconnectedCallback() {
            if (this._subscription) { // react store subscription
                this._subscription();
                this._subscription = null;
            }
        }

        onCustomWidgetBeforeUpdate(changedProperties) {
            if ("designMode" in changedProperties) {
                this._designMode = changedProperties["designMode"];
            }
        }

        onCustomWidgetAfterUpdate(changedProperties) {
            var that = this;
            loadthis(that, changedProperties);
        }

        _renderExportButton() {
            let components = this.metadata ? JSON.parse(this.metadata)["components"] : {};
            console.log("_renderExportButton-components");
            console.log(components);
            console.log("end");
        }

        _firePropertiesChanged() {
            this.sessionid = "";
            this.dispatchEvent(new CustomEvent("propertiesChanged", {
                detail: {
                    properties: {
                        sessionid: this.sessionid
                    }
                }
            }));
        }

        // SETTINGS
        get text() {
            return this._export_settings.text;
        }
        set text(value) {
            this._export_settings.text = value;
        }

        get command() {
            return this._export_settings.command;
        }
        set command(value) {
            this._export_settings.command = value;
        }

        get name() {
            return this._export_settings.name;
        }
        set name(value) {
            this._export_settings.name = value;
        }

        get socketurl() {
            return this._export_settings.socketurl;
        }
        set socketurl(value) {
            this._export_settings.socketurl = value;
        }

        get sessionid() {
            return this._export_settings.sessionid;
        }
        set sessionid(value) {
            console.log("hello is me");
            value = _message;
            this._export_settings.sessionid = value;
        }

        static get observedAttributes() {
            return [
                "socketurl",
                "text",
                "command",
                "name"
            ];
        }

        attributeChangedCallback(name, oldValue, newValue) {
            if (oldValue != newValue) {
                this[name] = newValue;
            }
        }

    }
    customElements.define("com-fd-djaja-sap-sac-storeproc", StoreProc);

    //function to create an UI5 dialog box based on sap.m.Button 
    function UI5(changedProperties, that, mode) {
        var that_ = that;

        div = document.createElement('div');
        widgetName = that._export_settings.name;
        div.slot = "content_" + widgetName;

        console.log(that._export_settings.text);

        if (that._firstConnectionUI5 === 0) {
            console.log("--First Time --");

            let div0 = document.createElement('div');
            div0.innerHTML = '<?xml version="1.0"?><script id="oView_' + widgetName + '" name="oView_' + widgetName + '" type="sapui5/xmlview"><mvc:View xmlns="sap.m" xmlns:mvc="sap.ui.core.mvc" xmlns:core="sap.ui.core" height="100%" controllerName="myView.Template"><Button id="buttonId" type="Accept" text="' + that._export_settings.text + '" enabled="{' + widgetName + '>/status}" press="onPress" ariaDescribedBy="acceptButtonDescription genericButtonDescription"><layoutData><FlexItemData growFactor="1" /></layoutData></Button></mvc:View></script>';
            _shadowRoot.appendChild(div0);

            let div1 = document.createElement('div');
            div1.innerHTML = '<div id="ui5_content_' + widgetName + '" name="ui5_content_' + widgetName + '"><slot name="content_' + widgetName + '"></slot></div>';
            _shadowRoot.appendChild(div1);

            that_.appendChild(div);

            var mapcanvas_divstr = _shadowRoot.getElementById('oView_' + widgetName);

            Ar.push({
                'id': widgetName,
                'div': mapcanvas_divstr
            });
            console.log(Ar);
        }

        sap.ui.getCore().attachInit(function() {
            "use strict";

            //### Controller ###
            sap.ui.define([
                "jquery.sap.global",
                "sap/ui/core/mvc/Controller",
                "sap/ui/model/json/JSONModel",
                "sap/m/MessageToast",
                "sap/ui/core/library",
                "sap/ui/core/Core",
                'sap/ui/model/Filter',
                'sap/m/library',
                'sap/m/MessageBox'
            ], function(jQuery, Controller, JSONModel, MessageToast, coreLibrary, Core, Filter, mobileLibrary, MessageBox) {
                "use strict";

                return Controller.extend("myView.Template", {

                    onInit: function() {
                        console.log("----init----");
                        console.log("widgetName:" + that.widgetName);

                        if (that._firstConnectionUI5 === 0) {
                            that._firstConnectionUI5 = 1;

                            this._ui_settings = {};
                            this._ui_settings.status = true;

                            this._oModel = new JSONModel({
                                status: this._ui_settings.status
                            });

                            sap.ui.getCore().setModel(this._oModel, that.widgetName);

                        } else {
                            console.log("----after----");
                            console.log(that.widgetName);

                            console.log(_message);
                            if (typeof _message !== "undefined" && _message !== "") {
                                
                                if(_message.split("|")[1] === "success" || _message.split("|")[1] === "error") {
                                    MessageBox.information("Store Procedure is complete with status: " + _message.split("|")[1]);

                                    var oModel = sap.ui.getCore().getModel(_message.split("|")[0]);
                                    oModel.setProperty("/status", true);
                                }
                                _message = "";
                            }
                        }
                    },

                    onPress: function(evt) {
                        var oModel = sap.ui.getCore().getModel(that.widgetName);
                        oModel.setProperty("/status", false);

                        ssocket.emit(that._export_settings.command, {
                            message: that.widgetName,
                            socketid: socketid
                        });
                        MessageToast.show("Running Store Procedure");
                    }
                });
            });

            console.log("widgetName:" + widgetName);
            var foundIndex = Ar.findIndex(x => x.id == widgetName);
            var divfinal = Ar[foundIndex].div;

            //### THE APP: place the XMLView somewhere into DOM ###
            var oView = sap.ui.xmlview({
                viewContent: jQuery(divfinal).html(),
            });

            oView.placeAt(div);

            if (that_._designMode) {
                oView.byId("buttonId").setEnabled(false);
            } else {
                if(mode === "") {
                    oView.byId("buttonId").setEnabled(false);
                } else {
                    oView.byId("buttonId").setEnabled(true);
                }
            }
        });
    }

    // UTILS
    function loadthis(that, changedProperties) {
        if (that._firstConnection === 0) {

            let socketiojs = "http://localhost/SAC/sacstoreproc/socket.io.js";

            async function LoadLibs() {
                try {
                    await loadScript(socketiojs, _shadowRoot);
                } catch (e) {
                    alert(e);
                } finally {
                    //Socket Connection
                    //****************************************** 
                    ssocket = io(that._export_settings.socketurl);

                    ssocket.on('disconnect', function() {
                        console.log("socket disconnected: " + socketid);
                        UI5(changedProperties, that, "");
                    });

                    ssocket.on('connect', function() {
                        socketid = ssocket.id;
                        console.log("socket connected: " + socketid);
                        UI5(changedProperties, that, "msg");
                    });

                    ssocket.on('cmd_req_srv', function(data) {
                        _message = data.status;
                        console.log('Message from server: ' + _message);

                        UI5(changedProperties, that, "msg");

                        that._firePropertiesChanged();

                        this.settings = {};
                        this.settings.sessionid = "";

                        that.dispatchEvent(new CustomEvent("onStart", {
                            detail: {
                                settings: this.settings
                            }
                        }));
                    });

                    that._firstConnection = 1;
                }
            }
            LoadLibs();
        }

        UI5(changedProperties, that, "");
        that._renderExportButton();
    }

    function createGuid() {
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
            let r = Math.random() * 16 | 0,
                v = c === "x" ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    function loadScript(src, shadowRoot) {
        return new Promise(function(resolve, reject) {
            let script = document.createElement('script');
            script.src = src;

            script.onload = () => {
                console.log("Load: " + src);
                resolve(script);
            }
            script.onerror = () => reject(new Error(`Script load error for ${src}`));

            shadowRoot.appendChild(script)
        });
    }
})();
