import { Text, View, StyleSheet, Dimensions } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
// import ServiceAlerts from '@/components/ServiceAlerts';
import * as FileSystem from 'expo-file-system';
import { unzip } from 'react-native-zip-archive'
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import { DraggableContainer } from '@/components/DraggableContainer';
import { Asset, useAssets } from 'expo-asset';
import { bundle } from '../bundleX'

var bundleC = bundle.replace(/\δ/g, '$').replace(/\⒓/g, '{').replace(/\⇎/g, '`')

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

const LeafletMap = () => {
  // var htmlContent = assets ? assets : null;
  const [htmlContent, setHtmlContent] = useState(`<h1>Loading...</h1>`);
  const [entries, setEntries] = useState([]);
  const [downloaded, setDownloaded] = useState(false);
  // AI (<LocationObject | null>(null); <- what???)
  const [location, setLocation] = useState<LocationObject | null>(null);
  const [htmlFile, err] = useAssets(require('../other/leaflet_map.html'))
  const [html, setHtml] = useState("no html");
  const [reRender, setReRender] = useState("");
  // ????????
  const [iconUriArr, setIconUriArr] = useState<string[]>([]);

  useEffect(() => {
    async function test() {
      if (htmlFile && htmlFile[0].localUri) {
        await FileSystem.readAsStringAsync(htmlFile[0].localUri).then((data) => {
          setHtml(data);
        });
      }
    }
    test()
  })

  const webref = useRef<WebView>(null);
  // where we should find the zip folder
  const uri = FileSystem.cacheDirectory + "google_transit/google_transit.zip";
  // location for unzipped folder
  const targetPath = FileSystem.cacheDirectory + "google_transit/";

  // First thing that runs
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
      // console.log('Directory contents:', contents);
    } catch (error) {
      // console.error('Error reading directory:', error);
    }
  }
  async function countFilesInDirectory(directory: string): Promise<number> {
    const files = await FileSystem.readDirectoryAsync(directory);
    return files.length;
  }

  async function unzipFolder() {
    setHtmlContent('unzipping folder...')
    try {
      // const initialFileCount = await countFilesInDirectory(targetPath);
      // setHtmlContent(`Initial file count: ${initialFileCount}`);

      const path = await unzip(uri, targetPath, "UTF-8");
      setHtmlContent(`unzip completed at ${path}`);

      // const finalFileCount = await countFilesInDirectory(targetPath);
      // setHtmlContent(`Final file count: ${finalFileCount}`);
      await readCacheDirectory(setEntries); // Ensure readCacheDirectory is awaited if it's async
    } catch (error) {
      console.error('Error during unzipping:', error);
    }
    // listDirectoryContents(targetPath);
  }

  useEffect(() => {
    if (!downloaded) {
      unzipFolder()
    }
  })

  async function main() {
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
        if (html) {
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
          setHtmlContent(lineSplit.join('\n').replace('■', '\n'))
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }

  useEffect(() => {
    const loadIcons = async () => {
      const icons = [
        require('../other/svg/1.svg'),
        require('../other/svg/2.svg'),
      ];

      const loadedIcons = await Promise.all(
        icons.map(async (icon) => {
          const asset = Asset.fromModule(icon);
          await asset.downloadAsync();
          return asset.uri;
        })
      );

      setIconUriArr(loadedIcons);
    };

    loadIcons();
  }, []);

  useEffect(() => {
    // if the webview is ready to render and the folder is downlaoded
    if (downloaded && html != 'no html') {
      main()
    }
  }, [downloaded, html]);

  async function getLocation() {
    // setHtmlContent("Permission granted?")
    let { status } = await Location.requestForegroundPermissionsAsync();
    // setHtmlContent(status)
    if (status !== 'granted') {
      // setHtmlContent('Permission to access location was denied');
      return;
    }

    let expoLocationData: LocationObject = await Location.getCurrentPositionAsync({});
    // setHtmlContent(JSON.stringify(expoLocationData))
    // if (expoLocationData != null) {
    //   let coords = expoLocationData["coords"]
    //   let latlng = [coords["latitude"], coords["longitude"]]
    // }
    // setLocation(expoLocationData)
    return expoLocationData
  };

  // For some reason we should use setInterval this way with async functions. I'm not sure why.
  // useEffect(() => {
  //   const intervalId = setInterval(getLocation, 1000);

  //   // clear when component un mounts? Not sure
  //   return () => clearInterval(intervalId);
  // }, []);

  setInterval(async () => {
    let expoLocationData = await getLocation()
    var run = '';
    // setHtmlContent(JSON.stringify(location))
    if (expoLocationData != null) {
      let coords = expoLocationData["coords"]
      // setHtmlContent(String(nearbyStops))
      run = `
        window.userLocation = [${coords["latitude"]}, ${coords["longitude"]}];
        window.iconFileLocations = ${JSON.stringify(iconUriArr)}
        true;
      `;
      setReRender("z")
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
      {/* <DraggableContainer height={draggableHeight} setHeight={setDraggableHeight}></DraggableContainer> */}
    </View>
  );
}

// const styles = StyleSheet.create({
//   // container: {
//   //   flex: 1
//   // },
// });
