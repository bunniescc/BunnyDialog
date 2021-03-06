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

        get message() {
            return this.getAttribute('message') || '';
        }

        set message(value) {
            this.setAttribute('message', value);
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

        get theme() {
            return this.getAttribute('theme') || '';
        }

        set theme(value) {
            this.setAttribute('theme', value);
        }

        get cappuccino() {
            return this.getAttribute('cappuccino') || 'https://c.bunnies.cc/src/cappuccino.css';
        }

        set cappuccino(value) {
            this.setAttribute('cappuccino', value);
        }

        connectedCallback() {
            this._render();
            this._attachEventHandlers();
        }

        static get observedAttributes() {
            return ["visible", "title", "message", "theme", "ok", "cancel"];
        }

        attributeChangedCallback(name, oldValue, newValue) {
            if (name === "ok" && this.shadowRoot) {
                let $btn = this.shadowRoot.querySelector('.ok');
                if (!$btn) {
                    $btn = document.createElement('button');
                    $btn.classList.add('ok', 'bcu', 'btn', this.theme);
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
                    $btn.classList.add('cancel', 'bcu', 'btn', 'outline', this.theme);
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
            if (name === "theme" && this.shadowRoot) {
                this.shadowRoot.querySelectorAll(".bcu.btn").forEach(b => {
                    if (oldValue) b.classList.remove(oldValue);
                    if (newValue) b.classList.add(newValue);
                });
            }
            if (name === "title" && this.shadowRoot && (newValue || newValue === "")) {
                this.shadowRoot.querySelector(".title").textContent = newValue;
            }
            if (name === "message" && this.shadowRoot && (newValue || newValue === "")) {
                this.shadowRoot.querySelector(".message").textContent = newValue;
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
            const yesBtn = this.ok ? `<button class='ok bcu btn ${this.theme}'>${this.ok}</button>` : '';
            const cancelBtn = this.cancel ? `<button class='cancel bcu btn outline ${this.theme}'>${this.cancel}</button>` : '';
            container.innerHTML = `
<link rel="stylesheet" href="${this.cappuccino}">
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
    z-index: 100;
}
.visible {
    opacity: 1;
    visibility: visible;
    transform: scale(1);
    transition: visibility 0s linear 0s,opacity .25s 0s,transform .25s;
}
.modal {
    font-size: 1rem;
    padding: 0.75rem;
    background-color: white;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%,-50%);
    border-radius: 0.25rem;
    min-width: 18rem;
    box-shadow: rgb(85, 85, 85) 0 0 0.5rem;
}
.title {
    font-size: 1.5rem;
}
.message {
    font-size: 1rem;
}
.title:not(:empty) + .message{
    margin-top: 0.5rem;
}
.content {
    margin-top: 0.5rem;
    margin-bottom: 1rem;
}
.button-container {
    text-align: right;
}
.bcu.btn + .bcu.btn{
    margin-left: 0.25rem;
}
</style>
<div class='${wrapperClass}'>
    <div class='modal'>
        <span class='title'>${this.title}</span>
        <div class="message">${this.message}</div>
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
