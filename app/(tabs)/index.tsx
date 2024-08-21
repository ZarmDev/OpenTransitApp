import { Text, View, StyleSheet, Dimensions } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
// import ServiceAlerts from '@/components/ServiceAlerts';
import * as FileSystem from 'expo-file-system';
import { unzip } from 'react-native-zip-archive'
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import { DraggableContainer } from '@/components/DraggableContainer';
import { Asset, useAssets } from 'expo-asset';
import { addTrainLinesToStopsFile } from '../RNaddInfoToStops'

// var bundleC = bundle.replace(/\δ/g, '$').replace(/\⒓/g, '{').replace(/\⇎/g, '`')

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
var progress = ''

// thanks AI
// function distance(lat : Number, long : Number) {
//   const latDifference = lat[0] - long[0];
//   const lonDifference = lat[1] - long[1];
//   return Math.sqrt(latDiff * latDiff + lonDiff * lonDiff);
// }

const LeafletMap = () => {
  // var htmlContent = assets ? assets : null;
  const [htmlContent, setHtmlContent] = useState(``);
  const [entries, setEntries] = useState([]);
  const [hasGTFSDownloaded, setGTFSDownloaded] = useState(false);
  const [hasUnZipped, setUnzipped] = useState(false);
  // AI (<LocationObject | null>(null); <- what???)
  // const [location, setLocation] = useState<LocationObject | null>(null);
  const [htmlFile, err] = useAssets(require('../../assets/leaflet_map.html'))
  // const [oneT, err2] = useAssets(require('../other/leaflet_map.html'))
  const [html, setHtml] = useState("no html");
  const [reRender, setReRender] = useState("");
  // !!! Generate the require statements using scripts/generateIconFilePaths.js
  const [iconAssets, err2] = useAssets([require('../../assets/images/svg/1.svg'),
  require('../../assets/images/svg/2.svg'),
  require('../../assets/images/svg/3.svg'),
  require('../../assets/images/svg/4.svg'),
  require('../../assets/images/svg/5.svg'),
  require('../../assets/images/svg/6.svg'),
  require('../../assets/images/svg/7.svg'),
  require('../../assets/images/svg/7d.svg'),
  require('../../assets/images/svg/a.svg'),
  require('../../assets/images/svg/b.svg'),
  require('../../assets/images/svg/c.svg'),
  require('../../assets/images/svg/d.svg'),
  require('../../assets/images/svg/e.svg'),
  require('../../assets/images/svg/f.svg'),
  require('../../assets/images/svg/g.svg'),
  require('../../assets/images/svg/h.svg'),
  require('../../assets/images/svg/j.svg'),
  require('../../assets/images/svg/l.svg'),
  require('../../assets/images/svg/m.svg'),
  require('../../assets/images/svg/n.svg'),
  require('../../assets/images/svg/q.svg'),
  require('../../assets/images/svg/r.svg'),
  require('../../assets/images/svg/s.svg'),
  require('../../assets/images/svg/sf.svg'),
  require('../../assets/images/svg/sir.svg'),
  require('../../assets/images/svg/sr.svg'),
  require('../../assets/images/svg/w.svg'),
  require('../../assets/images/svg/z.svg'),
  ]);
  const [iconData, setIconData] = useState<string[]>([])

  const webref = useRef<WebView>(null);
  // where we should find the zip folder and unzip it
  const uri = FileSystem.cacheDirectory + "google_transit/google_transit.zip";
  // where we an put the unzipped folder
  const targetPath = FileSystem.cacheDirectory + "google_transit/";

  async function getHTMLContents() {
    progress = `${htmlFile} ${err}`
    if (htmlFile && htmlFile[0].localUri) {
      await FileSystem.readAsStringAsync(htmlFile[0].localUri).then((data) => {
        setHtml(data);
      });
    }
  }

  useEffect(() => {
    getHTMLContents()
  }, [htmlFile])

  async function getIconUris() {
    if (iconAssets) {
      let iconArr: string[] = [];
      for (var i = 0; i < iconAssets.length; i++) {
        if (iconAssets[i]) {
          let localU = iconAssets[i].localUri;
          if (localU) {
            const fileContents = await FileSystem.readAsStringAsync(localU, {
              encoding: FileSystem.EncodingType.Base64,
            })
            iconArr.push(`data:image/svg+xml;base64,${fileContents}`);
          }
        }
      }
      setIconData(iconArr)
    }
  }

  useEffect(() => {
    if (iconAssets) {
      getIconUris()
    }
  }, [iconAssets])

  // First, create a folder called google_transit in the cache and download the zip
  // Should have a file at cache/google_transit/google_transit.zip
  async function downloadGTFSData() {
    const zipUrl = "http://web.mta.info/developers/data/nyct/subway/google_transit.zip";

    // Btw, zip files are FILES not directories
    doesFileExist(uri).then(async (isFile) => {
      if (isFile) {
        progress = ("ZIP already downloaded")
        // console.log("ZIP file already downloaded");
        setUnzipped(true);
      } else {
        progress = ("Downloading zip...")
        await createDirectory(FileSystem.cacheDirectory + "google_transit")
        await FileSystem.downloadAsync(zipUrl, uri)
          .then(({ uri }) => {
            console.log("Finished downloading to", uri);
            setGTFSDownloaded(true);
          })
          .catch((error) => {
            console.error(error);
          });
      }
    })
  }
  useEffect(() => {
    downloadGTFSData()
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

  async function doesFileExist(uri: any) {
    const result = await FileSystem.getInfoAsync(uri);
    return result.exists && !result.isDirectory;
  }

  // async function listDirectoryContents(targetPath: any) {
  //   try {
  //     const contents = await FileSystem.readDirectoryAsync(targetPath);
  //     // console.log('Directory contents:', contents);
  //   } catch (error) {
  //     // console.error('Error reading directory:', error);
  //   }
  // }

  // async function countFilesInDirectory(directory: string): Promise<number> {
  //   const files = await FileSystem.readDirectoryAsync(directory);
  //   return files.length;
  // }

  async function unzipFolder() {
    progress = ('unzipping folder...')
    try {
      // const initialFileCount = await countFilesInDirectory(targetPath);
      // progress = (`Initial file count: ${initialFileCount}`);

      const path = await unzip(uri, targetPath, "UTF-8");
      progress = (`unzip completed at ${path}`);

      // const finalFileCount = await countFilesInDirectory(targetPath);
      // progress = (`Final file count: ${finalFileCount}`);
      await readCacheDirectory(setEntries); // Ensure readCacheDirectory is awaited if it's async
      progress = "Hanging on addTrainLinesToStopsFile (may take a few minutes...)"
      // ## Add train lines to the stops file!!! ##
      const z = await addTrainLinesToStopsFile(targetPath + 'stops.txt', targetPath + 'shapes.txt', targetPath + 'stops.txt')
      progress = "Success!"
      setUnzipped(true)
    } catch (error) {
      console.error('Error during unzipping:', error);
    }
    // listDirectoryContents(targetPath);
  }

  useEffect(() => {
    if (hasGTFSDownloaded) {
      unzipFolder()
    }
  }, [hasGTFSDownloaded])

  async function main() {
    await FileSystem.readAsStringAsync(targetPath + "/stops.txt")
      .then((data) => {
        stopData = data.split('\n');
      })
      .catch((error) => {
        // progress = ('Failed to get stopData')
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
          setTimeout(updateWebView, 1000)
        }
      })
      .catch((error) => {
        // progress = ('Failed to get shapeData')
        console.log(error);
      });
  }

  useEffect(() => {
    // if zip downloaded + html ready to render
    // if (hasUnZipped && html != 'no html' && iconUriArr.length != 0) {
    progress = `${hasUnZipped} ${html} ${htmlFile}`
    if (hasUnZipped && html != 'no html' && iconData.length != 0) {
      progress = "Running main"
      main()
    }
  }, [hasUnZipped, html, iconData]);

  async function getLocation() {
    // progress = ("Permission granted?")
    let { status } = await Location.requestForegroundPermissionsAsync();
    // progress = (status)
    if (status !== 'granted') {
      // progress = ('Permission to access location was denied');
      return;
    }

    let expoLocationData: LocationObject = await Location.getCurrentPositionAsync({});
    // progress = (JSON.stringify(expoLocationData))
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

  async function updateWebView() {
    if (!(hasUnZipped && html != 'no html' && iconData)) {
      return
    }
    let expoLocationData = await getLocation()
    var run = '';
    // progress = (JSON.stringify(location))
    if (expoLocationData != null) {
      let coords = expoLocationData["coords"]
      // progress = (String(nearbyStops))
      run = `
        window.iconFileLocations = ${JSON.stringify(iconData)}
        window.userLocation = [40.71775244918452, -73.9990371376651];
        true;
      `;
      setReRender("z")
      if (webref.current) {
        webref.current.injectJavaScript(run);
      }
    }
  }

  setInterval(updateWebView, 10000);

  return <WebView originWhitelist={['*']} ref={webref} source={{ html: htmlContent }} style={{ flex: 1 }} />;
};

export default function HomeScreen() {
  const [draggableHeight, setDraggableHeight] = useState(Dimensions.get('window').height * 0.5);
  const [mapHeight, setMapHeight] = useState(Dimensions.get('window').height * 0.5);
  const [p, setP] = useState('')

  useEffect(() => {
    setMapHeight(Dimensions.get('window').height - draggableHeight);
  }, [draggableHeight]);

  function handleTapOutsideView() {
    // console.log(draggableHeight, 'dh')
    setDraggableHeight(Dimensions.get('window').height * 0.2)
  }

  setInterval(() => {
    setP(progress)
  }, 1000)

  return (
    <View>
      <View style={{ height: mapHeight }}>
        <LeafletMap />
      </View>
      <Text>{p}</Text>
      {/* <DraggableContainer height={draggableHeight} setHeight={setDraggableHeight}></DraggableContainer> */}
    </View>
  );
}

// const styles = StyleSheet.create({
//   // container: {
//   //   flex: 1
//   // },
// });
