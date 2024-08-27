# OpenTransit
A transit app for NYC.

It was built for Cider and also to learn React Native.
(the circle is just an example location)
# Video
https://github.com/user-attachments/assets/1f0ac708-ebd4-4770-9491-4a5f7c80ac2a
# Try it out!
https://github.com/ZarmDev/staticTransitApp/blob/main/README.md
# What it uses
- The transitHelper library (https://github.com/ZarmDev/transitHelper).
- Openstreetmap data
- Leaflet.js
- It uses React WebView to render the map

# Thanks
All the unzip code is thanks to this github repo: (I couldn't figure it out for days because of the errors, so I love this repo)
https://github.com/wodin/expo-zip-example/blob/main/App.js

A lot of AI was used btw

Originally, I was trying to use the react-native-maps library but I really didn't want to pay Google Maps so
thanks OpenStreetMaps!

# How to run this?
## Web
Doesn't work because it uses native modules like react-native-zip-archive.
## Android
1. Clone the repo
2. Run ```npx eas build --profile=development --platform=android``` to build the android folder
To do this locally:
- On Linux just add --local to the previous command (```npx eas build --profile=development --platform=android --local```) 
- On Windows, run ```npx expo prebuild```, then, ```cd android```, and finally run ```./gradlew build```
### Android - On a real android device
When this finishes, move app/build/outputs/apk/debug or app/build/outputs/apk/release to the "Downloads" folder on your android tablet and then open the APK file on your android device. (Note: You need to allow apps from unknown sources. It should give you a message on how to do that if you try running the APK without adding that setting)
### Android - On a emulator
Not sure, will update later.
## Apple
Not sure, will update later.

# Why dev build?
https://github.com/mockingbot/react-native-zip-archive?tab=readme-ov-file#for-expo-users

# Cider
✅Your app must be open-source, original, unique & built using either React Native or SwiftUI
✅It is recommended to use #arcade to log your progress while building the app.
❌Your app must have 25 users using your app while it's in TestFlight.
✅The app should solve a real problem or add significant value to the users' lives. Describe how the app will impact its users and what specific issues it addresses.
❌The app should have at least five unique screens (e.g., home, profile, settings, notifications, and a feature-specific screen).
❌The app must include at least three core features that work together to create a cohesive experience. For example, a social network app could include user profiles, a news feed, and direct messaging.
✅The app must have some sort of data management system, using either local storage, cloud databases, or APIs.
❔The app could involve integrating with external APIs, or using advanced features of React Native or SwiftUI.
❌The app should have a clean, user-friendly design that is easy to navigate and visually appealing.
The app must be submitted by August 31st, 2024 to be considered for the grant.

# NOTE FOR MYSELF
**Instaling native modules require a new native build**
https://stackoverflow.com/questions/41871519/leaflet-js-quickest-path-with-custom-points
https://stackoverflow.com/questions/43167417/calculate-distance-between-two-points-in-leaflet
# Performance optimizations (part 1)
1. Make it so it get's the location every x seconds
2. Change the x seconds to every 500 seconds
3. In the setInterval, just keep how it is but set a
new location every x seconds
4. Maybe only run this setInterval when the map has loaded
(create a variable to check when map is loaded)
setInterval(() => {
    var run = '';
    // setHtmlContent(String(location))
    if (location != null) {
      let coords = location["coords"]
      run = `
        window.locationPos = [${coords["latitude"]}, ${coords["longitude"]}]
        true;
      `;
      if (webref.current) {
        webref.current.injectJavaScript(run);
      }
    }
  }, 100);

# Performance optimizations (part 2)
In the future, use setIntervals to communicate between
the HTML file and the React project.
For example, if a stop is clicked on the map, send the
postMessage to React native end
If a stop is clicked from the react native end, then
put a setinterval in the html file to check for
the current stop clicked and if a certain stop is clicked
zoom in and show the distance from your location whatever

Maybe in this code, try to compare the location to avoid
setting the view over and over again
if (window.locationPos != null) {
                map.setView(window.locationPos, 26);
            }

# Interesting... (AI code)
```
import { readFileSync } from 'fs';
import { parse } from 'csv-parse/sync';
import { Graph } from 'graphlib';

// Step 1: Parse the GTFS data
const stops = parse(readFileSync('stops.txt'), { columns: true });
const stopTimes = parse(readFileSync('stop_times.txt'), { columns: true });
const trips = parse(readFileSync('trips.txt'), { columns: true });
const routes = parse(readFileSync('routes.txt'), { columns: true });

// Step 2: Build a graph from the GTFS data
const graph = new Graph();

stops.forEach((stop: any) => {
    graph.setNode(stop.stop_id, { lat: stop.stop_lat, lon: stop.stop_lon });
});

stopTimes.forEach((stopTime: any) => {
    const tripId = stopTime.trip_id;
    const stopId = stopTime.stop_id;
    const nextStopTime = stopTimes.find((st: any) => st.trip_id === tripId && st.stop_sequence === stopTime.stop_sequence + 1);
    if (nextStopTime) {
        graph.setEdge(stopId, nextStopTime.stop_id, { tripId });
    }
});

// Step 3: Implement Dijkstra's algorithm to find the shortest path
function dijkstra(graph: Graph, start: string, end: string) {
    const distances: { [key: string]: number } = {};
    const previous: { [key: string]: string | null } = {};
    const queue: string[] = [];

    graph.nodes().forEach(node => {
        distances[node] = Infinity;
        previous[node] = null;
        queue.push(node);
    });

    distances[start] = 0;

    while (queue.length > 0) {
        const node = queue.reduce((minNode, node) => distances[node] < distances[minNode] ? node : minNode);
        queue.splice(queue.indexOf(node), 1);

        if (node === end) {
            const path = [];
            let currentNode: string | null = end;
            while (currentNode) {
                path.unshift(currentNode);
                currentNode = previous[currentNode];
            }
            return path;
        }

        graph.neighbors(node).forEach(neighbor => {
            const alt = distances[node] + 1; // Assuming each edge has a weight of 1
            if (alt < distances[neighbor]) {
                distances[neighbor] = alt;
                previous[neighbor] = node;
            }
        });
    }

    return null; // No path found
}

// Step 4: Query the graph to find the route from x to y
const startStopId = 'start_stop_id'; // Replace with actual start stop ID
const endStopId = 'end_stop_id'; // Replace with actual end stop ID
const route = dijkstra(graph, startStopId, endStopId);

console.log(route);
```
