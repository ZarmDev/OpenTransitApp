let html = `<!DOCTYPE html>
<html>

<head>
    <title>Leaflet Map</title>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css" />
    <script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>
    <!-- <script src="./bundle.js"></script> -->
    <!-- <script src="https://cdn.jsdelivr.net/gh/ZarmDev/transitHelper@latest/dist/bundle.js"></script> -->
    <script src="https://cdn.jsdelivr.net/gh/ZarmDev/transitHelper/dist/bundle.js"></script>
    <!-- <script src="./out.js"></script> -->
</head>

<body>
    <p id="testing">Testing</p>
    <p id="ns">Ns</p>
    <div id="map" style="height: 600px;"></div>
    <script>
        const testing = document.getElementById('testing')
        const ns = document.getElementById('ns')
        var map = L.map('map').setView([40.71427000, -74.00597000], 13);
        setInterval(() => {
            ns.innerText = window.nearbyStops
            testing.innerText = window.locationPos
            if (window.locatioPos != null) {
                map.setView(winndow.locationPos, 26);
            }
        }, 1000)
        async function test() {
            var trainLineShapes = await getTrainLineShapes(outputShapes());
            var trainLineCoords = await getAllTrainStopCoordinates(outputStops());

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
                maxZoom: 18,
            }).addTo(map);

            function renderTrainLineShapes() {
                // Render train shapes
                console.log(trainLineShapes)
                let TLSKeys = Object.keys(trainLineShapes);
                let TLSVals = Object.values(trainLineShapes);
                for (var i = 0; i < TLSKeys.length; i++) {
                    // console.log(Object.keys(trainLineShapes)[i])
                    // console.log(TLSKeys[i])
                    let currObj = TLSVals[i]
                    let latlngs = currObj["layers"];
                    let color = currObj["color"]
                    if (color == "") {
                        color = 'black';
                    }
                    let test = [];
                    for (var z = 0; z < latlngs.length; z += 2) {
                        test.push(latlngs[z])
                    }
                    var polyline = L.polyline(test, { color: color, smoothFactor: '12.00' }).addTo(map);
                    map.addLayer(polyline);
                    // map.fitBounds(polyline.getBounds());
                }
            }

            function renderMarkers() {
                // Render train coordinates
                let tLCVals = Object.values(trainLineCoords)
                let tlcKeys = Object.keys(trainLineCoords)
                // Last value is null
                for (var i = 0; i < tLCVals.length - 1; i++) {
                    // TODO: will change in the future
                    // console.log(tLCVals[i]["coordinates"]["latitude"], tLCVals[i]["coordinates"]["longitude"])
                    let latlng = [tLCVals[i]["coordinates"]["latitude"], tLCVals[i]["coordinates"]["longitude"]]
                    let marker = L.marker(latlng).addTo(map);
                    // bruh
                    let stopname = tLCVals[i]["stopname"]
                    marker.bindTooltip(stopname)
                }
            }

            renderTrainLineShapes();
            //renderMarkers();
        }

        test();
    </script>
</body>

</html>`
let js = ``
export { html }