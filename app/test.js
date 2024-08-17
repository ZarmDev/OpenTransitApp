var fs = require('fs')
var tH = require('./other/bundle')
const html = `<!-- key: ■ = newline -->
<!DOCTYPE html>
<html>

<head>
    <title>Leaflet Map</title>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css" />
    <script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>
    <!-- <script src="./bundle.js"></script> -->
    <script src="https://cdn.jsdelivr.net/gh/ZarmDev/transitHelper@experimental/dist/bundle.js"></script>
    <!-- <script src="./out.js"></script> -->
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
        window.userLocation = [40.71775244918452, -73.9990371376651]
        // window.iconFileLocations = ['./1']
        const testing = document.getElementById('testing')
        const ns = document.getElementById('ns')
        const busInput = document.getElementById('busApiKey')
        var map = L.map('map').setView(window.userLocation, 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
            maxZoom: 18,
        }).addTo(map);

        setInterval(() => {
            testing.innerText = window.userLocation
            // ns.innerText = JSON.stringify(window.iconFileLocations)
            // if (window.userLocation != null && map != null) {
            //     map.setView(window.userLocation, 26);
            // }
        }, 1000)
        async function test() {
            var trainLineShapes = await getTrainLineShapes(outputShapes());
            // var trainLineCoords = await getAllTrainStopCoordinates(outputStops());
            let processedTrainStopData = await processTrainStopData(outputTrainStops());
            // const distance = 0.004;
            const distance = 0.01;
            var nearbyTrainLineCoords = await getNearbyStops(processedTrainStopData, window.userLocation, distance);
            const latSpan = "0.005";
            const lonSpan = "0";
            // const nearbyBusStopCoords = await getNearbyBusStops(exampleLocation, latSpan, lonSpan, busInput.value);
            // var nearbyBusStopCoords = await getNearbyStops(processedBusStopData, exampleLocation, 0.004);
            function renderTrainLineShapes() {
                // Render train shapes
                // console.log(trainLineShapes)
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
                        // let iconHTML = '';
                        // for (var j = 0; j < splitTrainLines.length; j++) {
                        //     let filepath = window.iconFileLocations[0]
                        //     // iconHTML += '<img src="' + filepath + '/' + splitTrainLines[j] + '.svg"' + ' style="position: absolute; width: 20px; height: 20px; left: ' + j * 20 + 'px;">';
                        //     iconHTML += '<img src="' + filepath + ' style="position: absolute; width: 20px; height: 20px; left: ' + j * 20 + 'px;">';
                        // }
                        //         var customIcon = L.divIcon({
                        //             className: 'custom-icon',
                        //             // Doing this because if you use a tick backslash it will break it in webviewcontent.js
                        //             html: [
                        // '<div style="position: relative; width: 40px; height: 20px;">',
                        //     String(iconHTML),
                        //     '<div style="position: absolute; top: 20px; left: 0; width: 100%; text-align: center; font-size: 12px;">',
                        //         String(stopname),
                        //     '</div>',
                        // '</div>'].join('■'),
                        //             iconSize: [0, 0] // Adjust the size as needed
                        //         });
                        marker = L.marker(latlng).addTo(map);
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
                        // console.log(stopname)
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
            // renderMarkers(nearbyBusStopCoords);
            L.circle(window.userLocation, { radius: 200 }).addTo(map);
        }

        busInput.addEventListener('change', async () => {
            test();
        })
        test()
    </script>
</body>

</html>`
async function meow() {
    const shapeData = `1..N03R,0,40.702068,-74.013664
1..N03R,1,40.703199,-74.014792
1..N03R,2,40.703226,-74.014820
1..N03R,3,40.703253,-74.014846
1..N03R,4,40.703280,-74.014870
1..N03R,5,40.703307,-74.014893
1..N03R,6,40.703335,-74.014914
1..N03R,7,40.703363,-74.014933
1..N03R,8,40.703391,-74.014952
1..N03R,9,40.703419,-74.014968
1..N03R,10,40.703448,-74.014983
1..N03R,11,40.703477,-74.014997
1..N03R,12,40.703506,-74.015009
1..N03R,13,40.703536,-74.015019
1..N03R,14,40.703566,-74.015028
1..N03R,15,40.703596,-74.015035
1..N03R,16,40.703625,-74.015041
1..N03R,17,40.704168,-74.015122
1..N03R,18,40.704194,-74.015125
1..N03R,19,40.704221,-74.015126
1..N03R,20,40.704247,-74.015127
1..N03R,21,40.704274,-74.015127
1..N03R,22,40.704300,-74.015125
1..N03R,23,40.704327,-74.015123
1..N03R,24,40.704354,-74.015119
1..N03R,25,40.704380,-74.015115
1..N03R,26,40.704407,-74.015109
1..N03R,27,40.704434,-74.015102
1..N03R,28,40.704461,-74.015094
1..N03R,29,40.704487,-74.015086
1..N03R,30,40.704514,-74.015076
1..N03R,31,40.704541,-74.015065
1..N03R,32,40.704568,-74.015052
1..N03R,33,40.705092,-74.014830
1..N03R,34,40.707513,-74.013783
1..N03R,35,40.708242,-74.013471
1..N03R,36,40.710132,-74.012648`.split('\n')
    const stopData = `101,Van Cortlandt Park-242 St,40.889248,-73.898583,1,,1
101N,Van Cortlandt Park-242 St,40.889248,-73.898583,,101,1
101S,Van Cortlandt Park-242 St,40.889248,-73.898583,,101,1
103,238 St,40.884667,-73.900870,1,,1
103N,238 St,40.884667,-73.900870,,103,1
103S,238 St,40.884667,-73.900870,,103,1
104,231 St,40.878856,-73.904834,1,,1
104N,231 St,40.878856,-73.904834,,104,1
104S,231 St,40.878856,-73.904834,,104,1
106,Marble Hill-225 St,40.874561,-73.909831,1,,1
106N,Marble Hill-225 St,40.874561,-73.909831,,106,1
106S,Marble Hill-225 St,40.874561,-73.909831,,106,1
107,215 St,40.869444,-73.915279,1,,1
107N,215 St,40.869444,-73.915279,,107,1
107S,215 St,40.869444,-73.915279,,107,1
108,207 St,40.864621,-73.918822,1,,1
108N,207 St,40.864621,-73.918822,,108,1
108S,207 St,40.864621,-73.918822,,108,1
109,Dyckman St,40.860531,-73.925536,1,,1`.split('\n')
    let lineSplit = html.split('\n')
    for (let i = 0; i < lineSplit.length; i++) {
        lineSplit[i] = lineSplit[i].replace('■', '\\n');
    }
    for (var i = 0; i < lineSplit.length; i++) {
        if (lineSplit[i].includes('var trainLineShapes')) {
            let firstP = lineSplit[i].indexOf('(');
            let firstPart = lineSplit[i].slice(0, firstP + 1)
            let secondPart = ');'
            // modify the line to have the data injected
            lineSplit[i] = `${firstPart}${JSON.stringify(shapeData)}${secondPart}`;
            // console.log(firstPart, secondPart)
        } else if (lineSplit[i].includes('let processedTrainStopData')) {
            let firstP = lineSplit[i].indexOf('(');
            let firstPart = lineSplit[i].slice(0, firstP + 1)
            let secondPart = ');'
            // modify the line to have the data injected
            lineSplit[i] = `${firstPart}${JSON.stringify(stopData)}${secondPart}`;
            // console.log(firstPart, secondPart)
        }
    }
    fs.writeFileSync('./test1491.html', lineSplit.join('\n').replace('■', '\n'))
}
meow()
// console.log(lineSplit.join('\n').replace('■', '\n'))