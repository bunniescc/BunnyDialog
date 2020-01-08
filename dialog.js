'use strict';
(function () {
    class BunnyDialog extends HTMLElement {
        constructor() {
            super();
        }

        get visible() {
            return this.hasAttribute("visible");
        }

        set visible(value) {
            if (value) {
                this.setAttribute("visible", "");
            } else {
                this.removeAttribute("visible");
            }
        }

        get title() {
            return this.getAttribute('title') || '';
        }

        set title(value) {
            this.setAttribute('title', value);
        }

        get ok() {
            return this.getAttribute('ok')
        }

        set ok(value) {
            this.setAttribute('ok', value);
        }

        get cancel() {
            return this.getAttribute('cancel')
        }

        set cancel(value) {
            this.setAttribute('cancel', value);
        }

        connectedCallback() {
            this._render();
            this._attachEventHandlers();
        }

        static get observedAttributes() {
            return ["visible", "title", "ok", "cancel"];
        }

        attributeChangedCallback(name, oldValue, newValue) {
            if (name === "ok" && this.shadowRoot) {
                let $btn = this.shadowRoot.querySelector('.ok');
                if (!$btn) {
                    $btn = document.createElement('button');
                    $btn.classList.add('ok');
                    $btn.addEventListener('click', e => this.close('ok'));
                    this.shadowRoot.querySelector('.button-container').prepend($btn);
                }
                if (newValue === "") {
                    $btn.style.display = 'none';
                } else {
                    $btn.innerText = newValue;
                    $btn.style.display = '';
                }
            }
            if (name === "cancel" && this.shadowRoot) {
                let $btn = this.shadowRoot.querySelector('.cancel');
                if (!$btn) {
                    $btn = document.createElement('button');
                    $btn.classList.add('cancel');
                    $btn.addEventListener('click', e => this.close('cancel'));
                    this.shadowRoot.querySelector('.button-container').append($btn);
                }
                if (newValue === "") {
                    $btn.style.display = 'none';
                } else {
                    $btn.innerText = newValue;
                    $btn.style.display = '';
                }
            }
            if (name === "title" && newValue && this.shadowRoot) {
                this.shadowRoot.querySelector(".title").textContent = newValue;
            }
            if (name === "visible" && this.shadowRoot) {
                if (newValue === null) {
                    this.shadowRoot.querySelector(".wrapper").classList.remove("visible");
                    this.dispatchEvent(new CustomEvent("close"));
                } else {
                    this.shadowRoot.querySelector(".wrapper").classList.add("visible");
                    this.dispatchEvent(new CustomEvent("open"))
                }
            }
        }

        _render() {
            const wrapperClass = this.visible ? "wrapper visible" : "wrapper";
            const container = document.createElement("div");
            const yesBtn = this.ok ? `<button class='ok'>${this.ok}</button>` : '';
            const cancelBtn = this.cancel ? `<button class='cancel'>${this.cancel}</button>` : '';
            container.innerHTML = `
<style>
.wrapper {
    position: fixed;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(120,120,120,0.5);
    opacity: 0;
    visibility: hidden;
    transform: scale(1.1);
    transition: visibility 0s linear .25s,opacity .25s 0s,transform .25s;
    z-index: 1;
}
.visible {
    opacity: 1;
    visibility: visible;
    transform: scale(1);
    transition: visibility 0s linear 0s,opacity .25s 0s,transform .25s;
}
.modal {
    font-size: 14px;
    padding: 16px;
    background-color: white;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%,-50%);
    border-radius: 8px;
    min-width: 300px;
    box-shadow: rgb(85, 85, 85) 0 0 5px;
}
.title {
    font-size: 18px;
}
.button-container {
    text-align: right;
}
button {
    padding: 6px 4px;
    border-radius: 5px;
    border: lightgray 1px solid;
    background: lightgrey;
    color: white;
    font-size: 12px;
    width: 55px;
    margin: 6px 4px;
    outline: none;
}
button:hover {
    border: gray 1px solid;
    background: gray;
}
button:active {
    border: gray 1px solid;
    background: gray;
}
button.ok{
    border: deepskyblue 1px solid;
    background: deepskyblue;
}
button:hover.ok {
    border: dodgerblue 1px solid;
    background: dodgerblue;
    outline: none;
}
button:active.ok {
    border: lightblue 1px solid;
    background: lightblue;
}
</style>
<div class='${wrapperClass}'>
    <div class='modal'>
        <span class='title'>${this.title}</span>
        <div class='content'>
            <slot></slot>
        </div>
        <div class='button-container'>${yesBtn}${cancelBtn}</div>
    </div>
</div>
`;
            const shadowRoot = this.attachShadow({mode: 'open'});
            shadowRoot.appendChild(container);
        }

        show(okEvent, cancelEvent) {
            this.visible = true;
            this.okEvent = okEvent;
            this.cancelEvent = cancelEvent;
        }

        close(event) {
            this.removeAttribute("visible");
            if (event === "ok" && this.okEvent && typeof this.okEvent === "function") {
                this.okEvent();
            }
            if (event === "cancel" && this.cancelEvent && typeof this.cancelEvent === "function") {
                this.cancelEvent();
            }
            this.dispatchEvent(new CustomEvent(event));
        }

        _attachEventHandlers() {
            const wrapper = this.shadowRoot.querySelector('.wrapper');
            const cancelButton = this.shadowRoot.querySelector(".cancel");
            const okButton = this.shadowRoot.querySelector(".ok");
            this.shadowRoot.addEventListener('click', ev => {
                if (ev.target === wrapper) this.close('cancel');
            });
            if (cancelButton) cancelButton.addEventListener('click', e => this.close('cancel'));
            if (okButton) okButton.addEventListener('click', e => this.close('ok'));
        }
    }

    window.customElements.define('bunny-dialog', BunnyDialog);
})();
