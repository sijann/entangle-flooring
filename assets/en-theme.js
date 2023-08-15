// Collapsible content 

var coll = document.getElementsByClassName("en-collapsible");
var i;
if (coll) {
    for (i = 0; i < coll.length; i++) {
        coll[i].addEventListener("click", function () {
            this.classList.toggle("en-active");
            var content = this.nextElementSibling;
            if (content.style.maxHeight) {
                content.style.maxHeight = null;
            } else {
                content.style.maxHeight = content.scrollHeight + "px";
            }
            let closeCollapsibleButton = content.querySelector(".en-collapsible-close")
            if (closeCollapsibleButton) {
                closeCollapsibleButton.addEventListener("click", () => {
                    content.style.maxHeight = null;
                })
            }
        });
    }
}


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