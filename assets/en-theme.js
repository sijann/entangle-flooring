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
            
            if(closeCollapsibleButton){
                closeCollapsibleButton.addEventListener("click", ()=>{
                    content.style.maxHeight = null;
                })
            }
        });

       
    }
}


// Input Field

const inputs = document.querySelectorAll('.form-control input');
const labels = document.querySelectorAll('.form-control label');

labels.forEach(label => {
	label.innerHTML = label.innerText
		.split('')
		.map((letter, idx) => `<span>${letter}</span>`)
		.join('');
});