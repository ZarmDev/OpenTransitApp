import { View, StyleSheet, Dimensions } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
// import ServiceAlerts from '@/components/ServiceAlerts';
import * as FileSystem from 'expo-file-system';
import { unzip } from 'react-native-zip-archive'
import { WebView } from 'react-native-webview';
import { html } from '../webviewcontent'
import * as Location from 'expo-location';
import { DraggableContainer } from '@/components/DraggableContainer';

// ## INTERFACES ##
// AI + me :)
interface LocationObject {
  coords: {
    latitude: number;
    longitude: number;
    altitude: number | null;
    accuracy: number | null;
    altitudeAccuracy: number | null;
    heading: number | null;
    speed: number | null;
  };
  mocked?: boolean;
  timestamp: number;
}

// ## VARIABLES ##
var shapeData: string[] = [];
var stopData: string[] = [];
var roundedStopData: string[][] = [];

// thanks AI
// function distance(lat : Number, long : Number) {
//   const latDifference = lat[0] - long[0];
//   const lonDifference = lat[1] - long[1];
//   return Math.sqrt(latDiff * latDiff + lonDiff * lonDiff);
// }

function getNearbyStops(coords: LocationObject["coords"]) {
  let stops = [];
  if (stopData.length != 0) {
    let precision = 2;
    // keep it in the memory to save performance
    if (roundedStopData.length == 0) {
      for (var i = 1; i < stopData.length; i++) {
        let split = stopData[i].split(',')
        let latlng = [split[2], split[3]].map((coord) => parseFloat(coord).toFixed(precision))
        roundedStopData.push(latlng)
      }
    }
    let roundedCoords = [coords["latitude"], coords["longitude"]].map((i) => parseFloat(i.toFixed(precision)));
    for (var i = 0; i < roundedStopData.length; i++) {
      // let latSame = roundedStopData[i][0] == roundedCoords[0];
      // let longSame = roundedStopData[i][1] == roundedCoords[1];
      let acceptableDifference = 0.1;
      let currRoundedStopData = roundedStopData[i];
      // if the latitude/longitude is close enough by the acceptableDifference (plus or minus range)
      let latMinus = (Number(currRoundedStopData[0]) - acceptableDifference);
      let latPlus = (Number(currRoundedStopData[0]) + acceptableDifference);
      let longMinus = (Number(currRoundedStopData[1]) - acceptableDifference);
      let longPlus = (Number(currRoundedStopData[1]) + acceptableDifference);

      let inRangeLat = (latMinus <= roundedCoords[0]) && (latPlus >= roundedCoords[0])
      let inRangeLong = (longMinus <= roundedCoords[1]) && (longPlus >= roundedCoords[1])
      // if ((latSame && longSame)) {
      if (inRangeLat && inRangeLong) {
        let stopname = stopData[i].split(',')[1]
        stops.push(stopname)
      }
    }
    return stops
  }
  return `Failed ${stopData.length != 0} ${roundedStopData.length == 0}`
}

const LeafletMap = () => {
  // var htmlContent = assets ? assets : null;
  const [htmlContent, setHtmlContent] = useState(`<h1>Loading...</h1>`);
  const [entries, setEntries] = useState([]);
  const [downloaded, setDownloaded] = useState(false);
  // AI (<LocationObject | null>(null); <- what???)
  const [location, setLocation] = useState<LocationObject | null>(null);

  const webref = useRef<WebView>(null);
  const uri = FileSystem.cacheDirectory + "google_transit/google_transit.zip";

  async function createDirectory(path: any) {
    try {
      await FileSystem.makeDirectoryAsync(path, { intermediates: true });
      console.log(`Directory created at ${path}`);
    } catch (error) {
      console.error('Error creating directory:', error);
    }
  }

  async function readCacheDirectory(setEntries: any) {
    const entries = await FileSystem.readDirectoryAsync(
      FileSystem.cacheDirectory + "google_transit"
    );
    setEntries(entries);
  }

  async function isFileAsync(uri: any) {
    const result = await FileSystem.getInfoAsync(uri);
    return result.exists && !result.isDirectory;
  }

  async function listDirectoryContents(targetPath: any) {
    try {
      const contents = await FileSystem.readDirectoryAsync(targetPath);
      console.log('Directory contents:', contents);
    } catch (error) {
      console.error('Error reading directory:', error);
    }
  }
  async function countFilesInDirectory(directory: string): Promise<number> {
    const files = await FileSystem.readDirectoryAsync(directory);
    return files.length;
  }

  async function main() {
    // where we want to put the unzipped folder
    const targetPath = FileSystem.cacheDirectory + "google_transit/";
    setHtmlContent('unzipping folder...')
    try {
      const initialFileCount = await countFilesInDirectory(targetPath);
      setHtmlContent(`Initial file count: ${initialFileCount}`);

      const path = await unzip(uri, targetPath, "UTF-8");
      setHtmlContent(`unzip completed at ${path}`);

      const finalFileCount = await countFilesInDirectory(targetPath);
      setHtmlContent(`Final file count: ${finalFileCount}`);

      await readCacheDirectory(setEntries); // Ensure readCacheDirectory is awaited if it's async
    } catch (error) {
      console.error('Error during unzipping:', error);
    }
    listDirectoryContents(targetPath);

    await FileSystem.readAsStringAsync(targetPath + "/stops.txt")
      .then((data) => {
        stopData = data.split('\n');
      })
      .catch((error) => {
        console.log(error);
      });

    await FileSystem.readAsStringAsync(targetPath + "/shapes.txt")
      .then((data) => {
        // console.log('stops.txt' + data);
        shapeData = data.split('\n');
        // inject data into html at var trainLineFunc = await getTrainLineShapes();
        let lineSplit = html.split('\n')
        for (var i = 0; i < lineSplit.length; i++) {
          if (lineSplit[i].includes('<script src="./bundle.js">')) {

          }
          else if (lineSplit[i].includes('var trainLineShapes')) {
            let firstP = lineSplit[i].indexOf('(');
            let firstPart = lineSplit[i].slice(0, firstP + 1)
            let secondPart = ');'
            // modify the line to have the data injected
            lineSplit[i] = `${firstPart}\`${data}\`${secondPart}`;
            console.log(firstPart, secondPart)
          } else if (lineSplit[i].includes('var trainLineCoords')) {
            let firstP = lineSplit[i].indexOf('(');
            let firstPart = lineSplit[i].slice(0, firstP + 1)
            let secondPart = ');'
            // modify the line to have the data injected
            lineSplit[i] = `${firstPart}\`${stopData}\`${secondPart}`;
            console.log(firstPart, secondPart)
          }
        }
        // console.log(lineSplit.join('\n'))
        setHtmlContent(lineSplit.join('\n'))
      })
      .catch((error) => {
        console.log(error);
      });
  }

  useEffect(() => {
    createDirectory(FileSystem.cacheDirectory + "google_transit")
    const zipUrl = "http://web.mta.info/developers/data/nyct/subway/google_transit.zip";

    isFileAsync(uri).then((isFile) => {
      if (isFile) {
        setHtmlContent("ZIP already downloaded")
        console.log("ZIP file already downloaded");
        setDownloaded(true);
      } else {
        setHtmlContent("Downloading zip...")
        FileSystem.downloadAsync(zipUrl, uri)
          .then(({ uri }) => {
            console.log("Finished downloading to", uri);
            setDownloaded(true);
          })
          .catch((error) => {
            console.error(error);
          });
      }
    });
  }, []);

  useEffect(() => {
    if (downloaded) {
      main()
    }
  }, [downloaded]);

  async function getLocation() {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      // setHtmlContent('Permission to access location was denied');
      return;
    }

    let expoLocationData: LocationObject = await Location.getCurrentPositionAsync({});
    // if (expoLocationData != null) {
    //   let coords = expoLocationData["coords"]
    //   let latlng = [coords["latitude"], coords["longitude"]]
    // }
    setLocation(expoLocationData)
  };

  // For some reason we should use setInterval this way with async functions. I'm not sure why.
  useEffect(() => {
    const intervalId = setInterval(async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        // setHtmlContent('Permission to access location was denied');
        return;
      }

      let expoLocationData: LocationObject = await Location.getCurrentPositionAsync({});
      setLocation(expoLocationData)
    }, 1000);

    // clear when component un mounts? Not sure
    return () => clearInterval(intervalId);
  }, []);

  setInterval(async () => {
    var run = '';
    // setHtmlContent(JSON.stringify(location))
    if (location != null) {
      let coords = location["coords"]
      let nearbyStops = getNearbyStops(coords);
      // setHtmlContent(String(nearbyStops))
      run = `
        window.nearbyStops = [${nearbyStops}];
        window.locationPos = [${coords["latitude"]}, ${coords["longitude"]}];
        true;
      `;
      setHtmlContent(run)
      if (webref.current) {
        webref.current.injectJavaScript(run);
      }
    }
  }, 3000);

  return <WebView originWhitelist={['*']} ref={webref} source={{ html: htmlContent }} style={{ flex: 1 }} />;
};

export default function HomeScreen() {
  const [draggableHeight, setDraggableHeight] = useState(Dimensions.get('window').height * 0.5);
  const [mapHeight, setMapHeight] = useState(Dimensions.get('window').height * 0.5);

  useEffect(() => {
    setMapHeight(Dimensions.get('window').height - draggableHeight);
  }, [draggableHeight]);

  function handleTapOutsideView() {
    // console.log(draggableHeight, 'dh')
    setDraggableHeight(Dimensions.get('window').height * 0.2)
  }

  return (
    <View>
      <View style={{ height: mapHeight }}>
        <LeafletMap />
      </View>
      <DraggableContainer height={draggableHeight} setHeight={setDraggableHeight}></DraggableContainer>
    </View>
  );
}

// const styles = StyleSheet.create({
//   // container: {
//   //   flex: 1
//   // },
// });
