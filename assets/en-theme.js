// Collapsible content 
class CollapsibleContent extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      this.shadowRoot.innerHTML = `
        <style>
          /* Your styling for the content */
        </style>
        <slot></slot>
      `;
    }
  }
  
  class CollapsibleButton extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      this.shadowRoot.innerHTML = `
        <style>
          /* Your styling for the button */
        </style>
        <slot></slot>
      `;
  
      this.addEventListener('click', () => {
        const targetId = this.getAttribute('target-id');
        const content = document.querySelector(`[data-id="${targetId}"]`);
        if (content) {
          content.classList.toggle('en-active');
          if (content.style.maxHeight) {
            content.style.maxHeight = null;
          } else {
            content.style.maxHeight = content.scrollHeight + 'px';
          }
        }
      });
    }
  }
  
  customElements.define('collapsible-content', CollapsibleContent);
  customElements.define('collapsible-button', CollapsibleButton);
  


const inputs = document.querySelectorAll('.form-control input');
const labels = document.querySelectorAll('.form-control label');

labels.forEach(label => {
    label.innerHTML = label.innerText
        .split('')
        .map((letter, idx) => `<span>${letter}</span>`)
        .join('');
});

window.addEventListener("beforeunload", function () {
    document.body.classList.add("animate-out");
});



let quickAddOpeners = document.querySelectorAll('.quick-add');

quickAddOpeners.forEach((opener) => {
    opener.addEventListener('click', () => {
        console.log(opener.getAttribute('data-product-url'));
    });
});

function showQuickAdd(opener) {
    fetch(opener.getAttribute('data-product-url'))
        .then((response) => response.text())
        .then((responseText) => {
            console.log(responseText)
            const responseHTML = new DOMParser().parseFromString(responseText, 'text/html');
            const productElement = responseHTML.querySelector('section[id^="MainProduct-"]');
            let id = "QuickAddInfo-"+ opener.getAttribute('data-id').replace(" ", "")
            console.log(id)
            const targetElement = document.getElementById()
            console.log(targetElement, "----targetElelment------")
            targetElement.innerHTML = productElement.innerHTML;

            document.getElementById(`QuickAdd-${opener.getAttribute('data-id')}`).classList.remove("hidden")
           

            if (window.Shopify && Shopify.PaymentButton) {
                Shopify.PaymentButton.init();
            }
        })
        .finally(() => {
        });
}