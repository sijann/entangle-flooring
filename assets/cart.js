
function formatMoney(cents, format) {
  if (typeof cents == 'string') { cents = cents.replace('.', ''); }
  var value = '';
  var placeholderRegex = /\{\{\s*(\w+)\s*\}\}/;
  var formatString = (format || this.money_format);

  function defaultOption(opt, def) {
    return (typeof opt == 'undefined' ? def : opt);
  }

  function formatWithDelimiters(number, precision, thousands, decimal) {
    precision = defaultOption(precision, 2);
    thousands = defaultOption(thousands, ',');
    decimal = defaultOption(decimal, '.');

    if (isNaN(number) || number == null) { return 0; }

    number = (number / 100.0).toFixed(precision);

    var parts = number.split('.'),
      dollars = parts[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1' + thousands),
      cents = parts[1] ? (decimal + parts[1]) : '';

    return dollars + cents;
  }

  switch (formatString.match(placeholderRegex)[1]) {
    case 'amount':
      value = formatWithDelimiters(cents, 2);
      break;
    case 'amount_no_decimals':
      value = formatWithDelimiters(cents, 0);
      break;
    case 'amount_with_comma_separator':
      value = formatWithDelimiters(cents, 2, '.', ',');
      break;
    case 'amount_no_decimals_with_comma_separator':
      value = formatWithDelimiters(cents, 0, '.', ',');
      break;
  }

  return formatString.replace(placeholderRegex, value);
};




// AddtoCart 

const addToCartForms = document.querySelectorAll('form[action="/cart/add"]');
addToCartForms.forEach((form) => {
  form.addEventListener("submit", async (event) => {
    // Prevent normal submission
    event.preventDefault();
    form.querySelector('button[type="submit"]').innerHTML = "Adding..."

    // Submit form with ajax
    fetch("/cart/add", {
      method: "post",
      body: new FormData(form),
    }).then((response) => response.text())
    .then((responseText) => {
      const html = new DOMParser().parseFromString(responseText, 'text/html');
      let elem = document.getElementById("main-nav") 
      elem.innerHTML = html.getElementById("main-nav").innerHTML
      // elem.querySelectorAll('script').forEach((oldScriptTag) => {
      //   console.log(oldScriptTag)
      //   const newScriptTag = document.createElement('script');
      //   Array.from(oldScriptTag.attributes).forEach((attribute) => {
      //     newScriptTag.setAttribute(attribute.name, attribute.value);
      //   });
      //   newScriptTag.appendChild(document.createTextNode(oldScriptTag.innerHTML));
      //   oldScriptTag.parentNode.replaceChild(newScriptTag, oldScriptTag);
      // });
      document.querySelector('.js-menu__open').click();
    }).finally(()=>{
      form.querySelector('button[type="submit"]').innerHTML = "Add to Cart";
    });
  })
});



// Upadate PlusMinus Buttons

const removeFromCartButtons = document.querySelectorAll(".remove-from-cart")
removeFromCartButtons.forEach((button) => {
  button.addEventListener("click", (e) => {
    e.preventDefault()
    const key = button.closest(".cart-item").getAttribute("data-key");
    changeItemQuantity(key, 0);
  })
})
const cartQuantitySelectorButtons = document.querySelectorAll(".cart-quantity-selector button")
const cartInputFields = document.querySelectorAll(".cart-quantity-selector input")

cartInputFields.forEach((input) => {
  input.addEventListener("change", () => {
    let value = Number(input.value)
    const key = input.closest(".cart-item").getAttribute("data-key")
    changeItemQuantity(key, value)
  })
})

cartQuantitySelectorButtons.forEach((button) => {
  button.addEventListener("click", (event) => {
    event.preventDefault()
    const input = button.parentElement.querySelector("input")
    let value = Number(input.value)
    const isPlus = button.classList.contains("plus")
    const key = button.closest(".cart-item").getAttribute("data-key")
    if (isPlus) {
      input.value = value + 1;
      changeItemQuantity(key, value + 1)
    } else if (value > 1) {
      input.value = value - 1;
      changeItemQuantity(key, value - 1)
    }
  })
})

async function changeItemQuantity(key, quantity) {

  document.querySelector(`[data-key="${key}"] .plus`).disabled = true;
  document.querySelector(`[data-key="${key}"] .minus`).disabled = true;
  document.querySelector(`[data-key="${key}"] input`).disabled = true;

  document.querySelector(`[data-key="${key}"] .line-item-price`).classList.add("hidden");
  document.querySelector(`[data-key="${key}"] .spinner--overlay`).classList.remove("hidden");
  const response = await fetch("/cart/change.js", {
    method: "post",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      id: key,
      quantity,
    }),
  });


  const data = await response.json();

  const format = document.querySelector('[data-money-format]').getAttribute('data-money-format')
  const totalDiscount = formatMoney(data.total_discount, format);
  const totalPrice = formatMoney(data.total_price, format);
  console.log(data)

  let itemPrice = 0
  let finalLinePrice;
  if (quantity !== 0) {
    const item = data.items.find(item => item.key === key)
    itemPrice = formatMoney(item.final_line_price, format);
    finalLinePrice = formatMoney(item.final_price, format);
  }


  const itemsInCart = data.item_count;


  document.querySelector(".cart-count").textContent = itemsInCart;

  // document.querySelector("#total-discount").textContent = totalDiscount;

  document.querySelector("#total-price").textContent = totalPrice;

  // Update final line price
  document.querySelector(`[data-key="${key}"] .final-line-price`).textContent = finalLinePrice;

  // Update final Price
  document.querySelector(`[data-key="${key}"] .line-item-price`).textContent = itemPrice;



  document.querySelector(`[data-key="${key}"] .line-item-price`).classList.remove("hidden");
  document.querySelector(`[data-key="${key}"] .spinner--overlay`).classList.add("hidden");
  document.querySelector(`[data-key="${key}"] .plus`).disabled = false;
  document.querySelector(`[data-key="${key}"] .minus`).disabled = false;
  document.querySelector(`[data-key="${key}"] input`).disabled = false;

  if (quantity === 0) {
    document.querySelector(`[data-key="${key}"]`).remove();
  }

  if (itemsInCart === 0) {
    document.querySelector('.cart-has-item').classList.add("hidden")
    document.querySelector('.cart-no-item').classList.remove("hidden")
  }

}


// Quantity Button Custom Element
class QuantityButton extends HTMLElement {
  constructor() {
    super();
    this.addEventListener("click", this.onClick.bind(this));
  }

  onClick() {
    const input = this.parentElement.querySelector("input");
    let value = Number(input.value);
    const isPlus = this.classList.contains("plus");
    const key = this.closest(".cart-item").getAttribute("data-key");

    if (isPlus) {
      input.value = value + 1;
      changeItemQuantity(key, value + 1);
    } else if (value > 1) {
      input.value = value - 1;
      changeItemQuantity(key, value - 1);
    }
  }
}

// Remove from Cart Button Custom Element
class RemoveFromCartButton extends HTMLElement {
  constructor() {
    super();
    this.addEventListener("click", this.onClick.bind(this));
  }

  onClick(event) {
    event.preventDefault();
    const key = this.closest(".cart-item").getAttribute("data-key");
    changeItemQuantity(key, 0);
  }
}

// Define the custom elements
customElements.define("quantity-button", QuantityButton);
customElements.define("remove-from-cart", RemoveFromCartButton);
