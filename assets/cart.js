function formatMoney(format){
  var Shopify = Shopify || {};
// ---------------------------------------------------------------------------
// Money format handler
// ---------------------------------------------------------------------------
Shopify.money_format = "${{amount}}";
Shopify.formatMoney = function(cents, format) {
  if (typeof cents == 'string') { cents = cents.replace('.',''); }
  var value = '';
  var placeholderRegex = /\{\{\s*(\w+)\s*\}\}/;
  var formatString = (format || this.money_format);

  function defaultOption(opt, def) {
     return (typeof opt == 'undefined' ? def : opt);
  }

  function formatWithDelimiters(number, precision, thousands, decimal) {
    precision = defaultOption(precision, 2);
    thousands = defaultOption(thousands, ',');
    decimal   = defaultOption(decimal, '.');

    if (isNaN(number) || number == null) { return 0; }

    number = (number/100.0).toFixed(precision);

    var parts   = number.split('.'),
        dollars = parts[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1' + thousands),
        cents   = parts[1] ? (decimal + parts[1]) : '';

    return dollars + cents;
  }

  switch(formatString.match(placeholderRegex)[1]) {
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
}



// AddtoCart 

const addToCartForms = document.querySelectorAll('form[action="/cart/add"]');
addToCartForms.forEach((form) => {
  form.addEventListener("submit", async (event) => {
    // Prevent normal submission
    event.preventDefault();

    form.querySelector('button[type="submit"]').innerHTML = "Adding..."

    // Submit form with ajax
    await fetch("/cart/add", {
      method: "post",
      body: new FormData(form),
    });

    // Get new cart object
    const res = await fetch("/cart.json");
    const cart = await res.json();

    // Update cart count
    document.querySelectorAll(".cart-count").forEach((el) => {
      el.textContent = cart.item_count;
    });

    // Display message
    form.querySelector('button[type="submit"]').innerHTML = "Add to cart"
    document.querySelector('.en-collapsible.en-cart-collapsible').click();
  });
});



// Upadate PlusMinus Buttons


const cartQuantitySelectorButtons = document.querySelectorAll(".cart-quantity-selector button")
console.log(cartQuantitySelectorButtons)
cartQuantitySelectorButtons.forEach((button) => {
  button.addEventListener("click", (event) => {
    event.preventDefault()
    const input = button.parentElement.querySelector("input")
    let value = Number(input.value)
    const isPlus = button.classList.contains("plus")
    const key = button.closest(".cart-item").getAttribute("data-key")
    if (isPlus) {
      input.value = value + 1;
      changeItemQuantity(key, value+1)
    }else if(value >1){
      input.value = value -1;
      changeItemQuantity(key, value-1)
    }
  })
})

async function changeItemQuantity(key, quantity) {
  console.log(key, quantity);

  const response = await fetch("/cart/change.js", {
    method: "post",
    headers: {
      "Content-Type" : "application/json"
    },
    body: JSON.stringify({
      id: key,
      quantity,
    }),
  });


  const data = await response.json();

  const format = document.querySelector('[data-money-format]').getAttribute('data-money-format')
  console.log(format)
  const totalDiscount = formatMoney(data.total_discount, format);
  const totalPrice = formatMoney(data.total_price, format);

  const item = data.items.find(item => item.key === key)


  const itemPrice = formatMoney(item.final_line_price, format);


  document.querySelector("#total-discount").textContent = totalDiscount;

  document.querySelector("#total-price").textContent = totalPrice;

  document.querySelector(`[data-key="${key}"] .line-item-price`).textContent = itemPrice;


  console.log(document.querySelector(`[data-key="${key}"] .line-item-price`))


}