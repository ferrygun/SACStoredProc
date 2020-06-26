(function () {
    let tmpl = document.createElement("template");
    tmpl.innerHTML = `
      <style>
          fieldset {
              margin-bottom: 10px;
              border: 1px solid #afafaf;
              border-radius: 3px;
          }
          table {
              width: 100%;
          }
          input, textarea, select {
              font-family: "72",Arial,Helvetica,sans-serif;
              width: 100%;
              padding: 4px;
              box-sizing: border-box;
              border: 1px solid #bfbfbf;
          }
          input[type=checkbox] {
              width: inherit;
              margin: 6px 3px 6px 0;
              vertical-align: middle;
          }
      </style>
      <form id="form" autocomplete="off">
        <fieldset> 
          <legend>General</legend>
          <table>
            <tr>
              <td><label for="Socket URL">Socket URL</label></td>
              <td><input id="socketurl" name="socketurl" type="text"></td>
            </tr>
            <tr>
              <td><label for="Button Text">Button Text</label></td>
              <td><input id="text" name="text" type="text"></td>
            </tr>
            <tr>
              <td><label for=Command">Command</label></td>
              <td><input id="command" name="command" type="text"></td>
            </tr>
            <tr>
              <td><label for="Widget Name">Widget Name</label></td>
              <td><input id="name" name="name" type="text"></td>
            </tr>
          </table>
        </fieldset>
        <button type="submit" hidden>Submit</button>
      </form>
    `;

    class StoreProcAps extends HTMLElement {
        constructor() {
            super();
            this._shadowRoot = this.attachShadow({ mode: "open" });
            this._shadowRoot.appendChild(tmpl.content.cloneNode(true));

            let form = this._shadowRoot.getElementById("form");
            form.addEventListener("submit", this._submit.bind(this));
            form.addEventListener("change", this._change.bind(this));
        }

        connectedCallback() {
        }

        _submit(e) {
            e.preventDefault();
            let properties = {};
            for (let name of StoreProcAps.observedAttributes) {
                properties[name] = this[name];
            }
            this._firePropertiesChanged(properties);
            return false;
        }
        _change(e) {
            this._changeProperty(e.target.name);
        }
        _changeProperty(name) {
            let properties = {};
            properties[name] = this[name];
            this._firePropertiesChanged(properties);
        }

        _firePropertiesChanged(properties) {
            this.dispatchEvent(new CustomEvent("propertiesChanged", {
                detail: {
                    properties: properties
                }
            }));
        }

        get socketurl() {
            return this.getValue("socketurl");
        }
        set socketurl(value) {
            this.setValue("socketurl", value);
        }

        get text() {
            return this.getValue("text");
        }
        set text(value) {
            this.setValue("text", value);
        }

        get command() {
            console.log(this.getValue("command"));
            return this.getValue("command");
        }
        set command(value) {
            this.setValue("command", value);
        }

        get name() {
            return this.getValue("name");
        }
        set name(value) {
            this.setValue("name", value);
        }        

        getValue(id) {
            return this._shadowRoot.getElementById(id).value;
        }
        setValue(id, value) {
            this._shadowRoot.getElementById(id).value = value;
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
    customElements.define("com-fd-djaja-sap-sac-storeproc-aps", StoreProcAps);
})();
