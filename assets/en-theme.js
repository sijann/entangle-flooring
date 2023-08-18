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

// Update sort_by query parameter on select change
document.querySelectorAll('#sort-by').forEach((elem) => {
  elem.addEventListener('change', function (e) {
    var value = e.target.value;
    console.log(value)
    Shopify.queryParams.sort_by = value;
    location.search = new URLSearchParams(Shopify.queryParams).toString();
  });
})



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

    this.addEventListener('click', () => {
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
    });
  }
}

customElements.define('collapsible-content', CollapsibleContent);
customElements.define('collapsible-button', CollapsibleButton);



class RemoveFilter extends HTMLElement {
  constructor() {
    super();
    this.url = this.getAttribute('data-url');

    this.addEventListener('click', this.removeFilter);
  }

  removeFilter() {
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

    this.addEventListeners();
  }

  addEventListeners() {
    this.slider1.addEventListener('input', () => this.changeRange1());
    this.slider2.addEventListener('input', () => this.changeRange2());
    this.range1.addEventListener('input', () => this.changeSlide1());
    this.range2.addEventListener('input', () => this.changeSlide2());
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
  });
});

function showQuickAdd(opener) {
  fetch(opener.getAttribute('data-product-url'))
    .then((response) => response.text())
    .then((responseText) => {
      const responseHTML = new DOMParser().parseFromString(responseText, 'text/html');
      const productElement = responseHTML.querySelector('section[id^="MainProduct-"]');
      let id = "QuickAddInfo-" + opener.getAttribute('data-id').replace(" ", "")
      const targetElement = document.getElementById()
      targetElement.innerHTML = productElement.innerHTML;

      document.getElementById(`QuickAdd-${opener.getAttribute('data-id')}`).classList.remove("hidden")


      if (window.Shopify && Shopify.PaymentButton) {
        Shopify.PaymentButton.init();
      }
    })
    .finally(() => {
    });
}