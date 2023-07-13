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
                content.style.overflowY = "scroll";
            }
        });
    }
}