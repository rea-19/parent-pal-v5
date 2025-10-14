// Loads header and footer
fetch("/html/include/header.html")
    .then(res => res.text())
    .then(data => {
    document.getElementById("header").innerHTML = data;
});

fetch("/html/include/footer.html")
    .then(res => res.text())
    .then(data => {
    document.getElementById("footer").innerHTML = data;
});