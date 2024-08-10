let html = `<!DOCTYPE html>
<html>

<head>
    <title>Leaflet Map</title>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css" />
    <script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>
    <script src="./bundle.js"></script>
    <!-- <script src="https://cdn.jsdelivr.net/gh/ZarmDev/transitHelper@latest/dist/bundle.js"></script> -->
    <!-- <script src="https://cdn.jsdelivr.net/gh/ZarmDev/transitHelper/dist/bundle.js"></script> -->
    <script src="./out.js"></script>
    <style>
        .custom-icon {
            position: relative;
        }

        .custom-icon img {
            position: absolute;
        }
    </style>
</head>

<body>
    <p id="testing">Testing</p>
    <p id="ns">Ns</p>
    <label for="key">Bus api key</label>
    <input id="busApiKey" name="key" type="text">
    <div id="map" style="height: 600px;"></div>
    <script>
        const testing = document.getElementById('testing')
        const ns = document.getElementById('ns')
        const busInput = document.getElementById('busApiKey')
        // chambers street example
        let exampleLocation = [40.71427000, -74.00597000]
        var map = L.map('map').setView(exampleLocation, 13);
        var nearbyBusStopCoords = null;

        setInterval(() => {
            ns.innerText = window.nearbyStops
            testing.innerText = window.locationPos
            if (window.locationPos != null) {
                map.setView(winndow.locationPos, 26);
            }
        }, 1000)
        async function test() {
            var trainLineShapes = await getTrainLineShapes(outputShapes().split('\n'));
            // var trainLineCoords = await getAllTrainStopCoordinates(outputStops());
            let processedTrainStopData = await processTrainStopData(outputTrainStops().split('\n'));
            let processedBusStopData = await processBusStopData(outputMBusStops().split('\n'));
            var nearbyTrainLineCoords = await getNearbyStops(processedTrainStopData, exampleLocation, 0.004);
            // var nearbyBusStopCoords = await getNearbyStops(processedBusStopData, exampleLocation, 0.004);
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

            function renderMarkers(providedCoords) {
                // Render train coordinates
                let tLCVals = Object.values(providedCoords)
                let tlcKeys = Object.keys(providedCoords)
                // Last value is null
                for (var i = 0; i < tLCVals.length; i++) {
                    // console.log(tLCVals[i])
                    let latlng = tLCVals[i]["coordinates"];
                    // var myIcon = L.icon({
                    //     iconUrl: './svg/1.svg',
                    //     iconSize: [20, 77],
                    //     iconAnchor: [22, 94],
                    //     popupAnchor: [-3, -76],
                    //     // shadowUrl: 'my-icon-shadow.png',
                    //     // shadowSize: [68, 95],
                    //     // shadowAnchor: [22, 94]
                    // });
                    // let marker2 = L.marker(latlng).addTo(map);
                    let stopname = tLCVals[i]["stopname"]
                    let stopID = tlcKeys[i]
                    let trainLines = tLCVals[i]["trainLine"]
                    stopID = stopID.slice(0, stopID.length - 1)
                    var marker = null;
                    if (trainLines) {
                        let splitTrainLines = trainLines.split('-');
                        let iconHTML = '';
                        let filepath = './svg'
                        for (var j = 0; j < splitTrainLines.length; j++) {
                            iconHTML += '<img src="' + filepath + '/' + splitTrainLines[j] + '.svg"' + 'style="position: absolute; width: 20px; height: 20px; left: ${j * 20}px;">';
                        }
                        var customIcon = L.divIcon({
                            className: 'custom-icon',
                            // Doing this because if you use a tick backslash it will break it in webviewcontent.js
                            html: [
                '<div style="position: relative; width: 40px; height: 20px;>',
                    String(iconHTML),
                    '<div style="position: absolute; top: 20px; left: 0; width: 100%; text-align: center; font-size: 12px;">',
                        String(stopname),
                    '</div>',
                '</div>'].join('\n'),
                            iconSize: [0, 0] // Adjust the size as needed
                        });
                        marker = L.marker(latlng, { icon: customIcon }).addTo(map);
                        // doesn't matter which train line - they are all grouped together
                        let trainLine = trainLines[0];
                        marker.on('click', async function (stopID, stopname, trainLine) {
                            const targetStopID = stopID
                            const direction = ""
                            const date = Date.now()
                            // const realtime = await getTrainArrivals(trainLine, targetStopID, date, direction);
                            // console.log(realtime)
                            // alert(realtime)
                        }.bind(null, stopID, stopname, trainLine));
                    } else {
                        console.log(stopname)
                        var busIcon = L.icon({
                            iconUrl: './busSvgs/' + '' + '.svg',
                            iconSize: [0, 0],
                            iconAnchor: [22, 94],
                            popupAnchor: [-3, -76],
                            // shadowUrl: 'my-icon-shadow.png',
                            // shadowSize: [68, 95],
                            // shadowAnchor: [22, 94]
                        });
                        marker = L.marker(latlng, { icon: busIcon }).addTo(map);
                    }
                    // marker.bindTooltip(stopname)
                }
            }

            renderTrainLineShapes();
            renderMarkers(nearbyTrainLineCoords);
            renderMarkers(nearbyBusStopCoords);
            L.circle(exampleLocation, { radius: 200 }).addTo(map);
        }

        const latSpan = "0.005";
        const lonSpan = "0";
        busInput.addEventListener('change', async () => {
            let busApiKey = busInput.value;
            nearbyBusStopCoords = await getNearbyBusStops(exampleLocation, latSpan, lonSpan, busApiKey);
            test();
        })
    </script>
</body>

</html>`
let js = ``
export { html }