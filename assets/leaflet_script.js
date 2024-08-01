window.onload = function () {
    var map = L.map('map').setView([37.78825, -122.4324], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
        maxZoom: 18,
    }).addTo(map);

    console.log('test')
}