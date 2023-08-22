Shopify.queryParams = {};

if (location.search.length) {
  var params = location.search.substr(1).split('&');

  for (var i = 0; i < params.length; i++) {
    var keyValue = params[i].split('=');

    if (keyValue.length) {
      Shopify.queryParams[decodeURIComponent(keyValue[0])] = decodeURIComponent(keyValue[1]);
    }
  }
}



class SortBy extends HTMLElement {
  constructor() {
    super();
    this.elem = this.querySelector("select")
  }

  connectedCallback() {
    this.elem.addEventListener("change", () => this.handleChange())
  }


  disconnectedCallback() {
    this.elem.removeEventListener("change", () => this.handleChange())
  }

  handleChange() {
    var value = this.elem.value;
    console.log(value)
    Shopify.queryParams.sort_by = value;
    location.search = new URLSearchParams(Shopify.queryParams).toString();

  }

}

customElements.define("sort-by", SortBy)



class CollapsibleContent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
        <slot></slot>
      `;
  }
}

class CollapsibleButton extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
        <slot></slot>
      `;
  }


  connectedCallback() {
    this.addEventListener("click", () => this.handleClick());
  }
  disconnectedCallback() {
    this.addEventListener("click", () => this.handleClick());
  }



  handleClick() {
    const targetId = this.getAttribute('target-id');
    const content = document.querySelector(`[data-id="${targetId}"]`);
    if (content) {
      content.classList.toggle('en-active');
      this.classList.toggle('en-opened')
      if (content.style.maxHeight) {
        content.style.maxHeight = null;
      } else

        if (content.getAttribute("data-height")) {
          content.style.maxHeight = parseInt(content.getAttribute("data-height")) + 'px';
        }
        else {
          content.style.maxHeight = content.scrollHeight + 'px';
        }
    }
  }

}

customElements.define('collapsible-content', CollapsibleContent);
customElements.define('collapsible-button', CollapsibleButton);



class RemoveFilter extends HTMLElement {
  constructor() {
    super();
    this.url = this.getAttribute('data-url');
  }

  connectedCallback() {
    this.addEventListener("click", () => this.handleClick());
  }
  disconnectedCallback() {
    this.addEventListener("click", () => this.handleClick());
  }




  handleClick() {
    this.productsOverlayGrid = document.querySelector('#products-grid-overlay');
    this.productsGrid = document.querySelector('#products-grid');
    this.productsOverlayGrid.classList.add('bg-[rgba(var(--backgroundColor))]', 'z-[101]');
    this.filterComponent = document.querySelector('#en-filters');
    fetch(this.url)
      .then((response) => response.text())
      .then((data) => {
        const html = new DOMParser().parseFromString(data, 'text/html');
        this.productsGrid.innerHTML = html.getElementById('products-grid').innerHTML;
        this.filterComponent.innerHTML = html.getElementById('en-filters').innerHTML;
        window.history.replaceState({}, '', this.url);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      })
      .finally(() => {
        document.querySelector('#products-grid-overlay').classList.remove('bg-[rgba(var(--backgroundColor))]', 'z-[101]');
      });
  }
}

customElements.define('remove-filter', RemoveFilter);

class FilterForm extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
          <slot></slot>
        `;
    this.inputs = this.querySelectorAll('input');
    this.handleFormChange = this.handleFormChange.bind(this);
    this.setupEventListeners();
  }

  connectedCallback() {
    this.querySelector('form').addEventListener('submit', (event) => {
      event.preventDefault();
      this.handleFormChange();
    });
  }

  setupEventListeners() {
    this.inputs.forEach((input) => {
      input.addEventListener('change', this.handleFormChange);
    });
  }

  handleFormChange() {
    this.productsGrid = document.querySelector('#products-grid');
    this.filterComponent = document.querySelector('#active-filters');
    const formData = new FormData(this.querySelector('form'));
    const formString = new URLSearchParams(formData).toString();
    const url = `${window.location.pathname}?section_id=en-collection-products-grid&${formString}`;
    document.querySelector('#products-grid-overlay').classList.add('bg-[rgba(var(--backgroundColor))]', 'z-[101]');
    fetch(url)
      .then((response) => response.text())
      .then((data) => {
        const html = new DOMParser().parseFromString(data, 'text/html');
        this.productsGrid.innerHTML = html.getElementById('products-grid').innerHTML;
        this.filterComponent.innerHTML = html.getElementById('active-filters').innerHTML;
        this.updateURL(`${window.location.pathname}?${formString}`);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      })
      .finally(() => {
        document.querySelector('#products-grid-overlay').classList.remove('bg-[rgba(var(--backgroundColor))]', 'z-[101]');
      });
  }

  updateURL(url) {
    window.history.replaceState({}, '', url);
  }
}

customElements.define('filter-form', FilterForm);


class PriceRange extends HTMLElement {
  constructor() {
    super();
    this.range1 = this.querySelector('#range1');
    this.range2 = this.querySelector('#range2');
    this.slider1 = this.querySelector('#slider-1');
    this.slider2 = this.querySelector('#slider-2');
  }


  connectedCallback() {
    this.slider1.addEventListener('input', () => this.changeRange1());
    this.slider2.addEventListener('input', () => this.changeRange2());
    this.range1.addEventListener('input', () => this.changeSlide1());
    this.range2.addEventListener('input', () => this.changeSlide2());
  }
  disconnectedCallback() {
    this.slider1.removeEventListener('input', () => this.changeRange1());
    this.slider2.removeEventListener('input', () => this.changeRange2());
    this.range1.removeEventListener('input', () => this.changeSlide1());
    this.range2.removeEventListener('input', () => this.changeSlide2());
  }


  changeSlide1() {
    if (this.range1.value <= parseInt(this.range2.value)) {
      this.slider1.value = parseInt(this.range1.value);
    } else {
      this.range1.value = parseInt(this.range2.value) - 1;
    }
  }

  changeSlide2() {
    if (parseInt(this.range2.value) > this.range1.value) {
      this.slider2.value = parseInt(this.range2.value);
    } else {
      this.range2.value = parseInt(this.range1.value) + 1;
    }
  }

  changeRange1() {
    if (parseInt(this.slider1.value) <= parseInt(this.slider2.value)) {
      this.range1.value = parseInt(this.slider1.value);
    } else {
      this.slider1.value = parseInt(this.slider2.value) - 1;
    }
  }

  changeRange2() {
    if (parseInt(this.slider2.value) > parseInt(this.slider1.value)) {
      this.range2.value = parseInt(this.slider2.value);
    } else {
      this.slider2.value = parseInt(this.slider1.value) + 1;
    }
  }
}

customElements.define('price-range', PriceRange);



class ModelViewer extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
          <slot></slot>
        `;

    this.closeButton = this.querySelector("#model-close")
    this.openButton = this.querySelector("#model-open")
    this.model = this.querySelector("model-viewer")
    this.modelOverlay = this.querySelector("#model-overlay");



  }


  connectedCallback() {
    this.closeButton.addEventListener("click", () => this.closeModel())
    this.openButton.addEventListener("click", () => this.openModel())
  }

  disconnectedCallback() {
    this.closeButton.removeEventListener("click", () => this.closeModel())
    this.openButton.removeEventListener("click", () => this.openModel())
  }

  openModel() {
    this.model.style.pointerEvents = "all"
    this.openButton.classList.add("hidden")
    this.closeButton.classList.remove("hidden")
    this.modelOverlay.classList.add("hidden");
  }


  closeModel() {
    this.model.style.pointerEvents = "none";
    this.closeButton.classList.add("hidden");
    this.openButton.classList.remove("hidden")
    this.modelOverlay.classList.remove("hidden");
  }
}

customElements.define("en-model-viewer", ModelViewer)


class VariantSelector extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.addEventListener('change', this.onVariantChange);
  }

  disconnectedCallback() {
    this.removeEventListener('change', this.onVariantChange);
  }

  onVariantChange() {
    this.getSelectedOptions();
    this.getSelectedVariant();

    if (this.currentVariant) {
      this.updateURL();
      this.updateFormID();
      this.updatePrice();
      this.updateSKU();
    }
  }

  getSelectedOptions() {
    this.options = Array.from(this.querySelectorAll('input[type="radio"]:checked'), (input) => input.value);
  }

  getVariantJSON() {
    this.variantData = this.variantData || JSON.parse(this.querySelector('[type="application/json"]').textContent);
    return this.variantData;
  }

  getSelectedVariant() {
    this.currentVariant = this.getVariantJSON().find((variant) => {
      const findings = !variant.options
        .map((option, index) => {
          return this.options[index] === option;
        })
        .includes(false);

      if (findings) return variant;
    });
  }

  updateURL() {
    if (!this.currentVariant) return;
    window.history.replaceState({}, '', `${this.dataset.url}?variant=${this.currentVariant.id}`);
  }

  updateFormID() {
    const form_input = document.querySelector('#product-form').querySelector('input[name="id"]');
    form_input.value = this.currentVariant.id;
  }

  updateSKU() {
    console.log(this.currentVariant, '----currentV------');
    const sku = document.querySelector('.sku--text');
    sku.textContent = this.currentVariant.sku;
  }

  updatePrice() {
    fetch(`${this.dataset.url}?variant=${this.currentVariant.id}&section_id=${this.dataset.section}`)
      .then((response) => response.text())
      .then((responseText) => {
        const priceId = `price-${this.dataset.section}`;
        const html = new DOMParser().parseFromString(responseText, 'text/html');

        const cartContent = document.querySelector('#en-cart-drawer');
        const cartContentNew = html.getElementById('en-cart-drawer');
        console.log('-----html-----', html);
        cartContent.innerHTML = cartContentNew.innerHTML;

        const oldPrice = document.getElementById(priceId);
        const newPrice = html.getElementById(priceId);

        if (oldPrice && newPrice) oldPrice.innerHTML = newPrice.innerHTML;

        const buttonsId = `buttons-${this.dataset.section}`;
        const newButtons = html.getElementById(buttonsId);
        const oldButtons = document.getElementById(buttonsId);

        if (oldButtons && newButtons) oldButtons.innerHTML = newButtons.innerHTML;
      });
  }
}

customElements.define('variant-selector', VariantSelector);




class AddtoCartButton extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.addEventListener("click", () => this.handleAddtoCart());
  }

  disconnectedCallback() {
    this.removeEventListener("click", () => this.handleAddtoCart());
  }

  handleAddtoCart() {
    const form = document.querySelector('#product-form'); // Replace with your form selector
    this.innerHTML = "Adding..."

    fetch("/cart/add", {
      method: "post",
      body: new FormData(form),
    })
      .then((response) => response.text())
      .then((responseText) => {
        const html = new DOMParser().parseFromString(responseText, 'text/html');
        const mainNav = document.getElementById("main-nav");
        const newMainNavContent = html.getElementById("main-nav").innerHTML;
        mainNav.innerHTML = newMainNavContent;
        document.querySelector('.js-menu__open').click();
      })
      .catch((error) => {
        console.error("An error occurred:", error);
        // Handle error gracefully, e.g., show an error message
      })
      .finally(() => {
        this.innerHTML = "Add to Cart";
      });
  }
}

customElements.define("add-to-cart", AddtoCartButton);


class ProductForm extends HTMLElement{
  constructor(){
    super()
    this.form = this.querySelector("form");
    this.button = this.querySelector("button")
    this.type = this.getAttribute("data-type")
  }

  connectedCallback(){
    if(this.form && this.button) this.button.addEventListener("click", (e)=> this.addToCart(e))

  }

  disconnectedCallback(){
    if(this.form && this.button) this.button.removeEventListener("click", (e)=> this.addToCart(e))

  }

  addToCart(e){
    e.preventDefault()
    

    if(this.type == 'quick-add'){
      this.querySelector(".icon-plus").classList.add("hidden")
      this.querySelector(".spinner--overlay").classList.remove("hidden")
    }

    fetch("/cart/add", {
      method: "post",
      body: new FormData(this.form),
    })
      .then((response) => response.text())
      .then((responseText) => {
        const html = new DOMParser().parseFromString(responseText, 'text/html');
        const mainNav = document.getElementById("main-nav");
        const newMainNavContent = html.getElementById("main-nav").innerHTML;
        mainNav.innerHTML = newMainNavContent;
        document.querySelector('.js-menu__open').click();
      })
      .catch((error) => {
        console.error("An error occurred:", error);
        // Handle error gracefully, e.g., show an error message
      })
      .finally(() => {
        if(this.type == 'quick-add'){
          this.querySelector(".icon-plus").classList.remove("hidden")
          this.querySelector(".spinner--overlay").classList.add("hidden")
        }
    
      });

  }

}

customElements.define("product-form", ProductForm)









class QuickAdd extends HTMLElement {
  constructor() {
    super()
  }


  connectedCallback() {
    this.addEventListener("click", (event) => this.handleClick(event))
  }

  disconnectedCallback() {
    this.removeEventListener("click", (event) => this.handleClick(event))
  }

  handleClick(event) {

    console.log(event.target.classList)
    if (event.target.classList.contains("fixed") || event.target.classList.contains("close-modal")) {
      this.classList.toggle("hidden")
      document.body.classList.remove('overflow-hidden');
    }


  }

}

customElements.define("quick-add-modal", QuickAdd)


class QuickAddOpener extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.addEventListener("click", () => this.openQuickAdd(this));
  }

  disconnectedCallback() {
    this.removeEventListener("click", () => this.openQuickAdd(this));
  }

  openQuickAdd = (opener) => {
    this.querySelector(".spinner--overlay").classList.remove("hidden")
    this.querySelector(".icon-link").classList.add("hidden")


    this.targetId = this.getAttribute("target-quickadd-id");
    this.drawer = document.querySelector(`[quickadd-id="${this.targetId}"]`);
    if (this.drawer) {
      fetch(opener.getAttribute('data-product-url'))
        .then((response) => response.text())
        .then((responseText) => {
          const responseHTML = new DOMParser().parseFromString(responseText, 'text/html');
          console.log(responseHTML, "------response-----");
          const productElement = responseHTML.querySelector('section[id^="MainProduct-"]');
          let id = "QuickAddInfo-" + opener.getAttribute('data-id').replace(" ", "");
          const targetElement = document.getElementById(id);
          console.log(targetElement, "------target---------");
          targetElement.innerHTML = productElement.innerHTML;

          // Reinjects the script tags to allow execution.
          targetElement.querySelectorAll('script').forEach((oldScriptTag) => {
            const newScriptTag = document.createElement('script');
            Array.from(oldScriptTag.attributes).forEach((attribute) => {
              newScriptTag.setAttribute(attribute.name, attribute.value);
            });
            newScriptTag.appendChild(document.createTextNode(oldScriptTag.innerHTML));
            oldScriptTag.parentNode.replaceChild(newScriptTag, oldScriptTag);
          });

          if (window.Shopify && Shopify.PaymentButton) {
            Shopify.PaymentButton.init();
          }
        })
        .finally(() => {
          this.drawer.classList.remove("hidden");
          this.querySelector(".spinner--overlay").classList.add("hidden")
          this.querySelector(".icon-link").classList.remove("hidden")
          document.body.classList.add('overflow-hidden')
        });
    }
  }
}

customElements.define("quick-add-opener", QuickAddOpener);




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








