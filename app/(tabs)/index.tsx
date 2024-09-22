import { Text, View, StyleSheet, Dimensions } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import * as FileSystem from 'expo-file-system';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import { Asset, useAssets } from 'expo-asset';
import { ThemedText } from '@/components/ThemedText';
import * as tH from '../tH'

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
var isFirstRender = true;
var htmlContent = ''
const htmlFileUri = FileSystem.cacheDirectory + 'leaflet_map.html'

// thanks AI
// function distance(lat : Number, long : Number) {
//   const latDifference = lat[0] - long[0];
//   const lonDifference = lat[1] - long[1];
//   return Math.sqrt(latDiff * latDiff + lonDiff * lonDiff);
// }

function GenerateLeafletMap() {
  const [htmlFile, err] = useAssets(require('../../assets/leaflet_map.html'))
  const [html, setHtml] = useState("no html");
  const [stopFile, err3] = useAssets(require('../../assets/trains/google_transit/stops2.txt'))
  const [shapeFile, err4] = useAssets(require('../../assets/trains/google_transit/shapes.txt'))
  // const [bundleFile, err5] = useAssets(require('../../assets/bundle'))

  async function getHTMLContents() {
    // progress = `html: ${JSON.stringify(htmlFile)} ${htmlFile[0].localUri}`
    if (htmlFile && htmlFile[0].localUri) {
      await FileSystem.readAsStringAsync(htmlFile[0].localUri).then((data) => {
        setHtml(data);
      });
    }
  }

  useEffect(() => {
    if (htmlFile) {
      getHTMLContents()
    }
  }, [htmlFile])

  async function main() {
    // progress = `stopFile: ${JSON.stringify(stopFile)}`
    if (stopFile && stopFile[0].localUri) {
      // progress = "Got stop file "  + err4
      let localStopUri = stopFile[0].localUri;
      // progress = `${localStopUri} WOW`
      await FileSystem.readAsStringAsync(localStopUri)
        .then((data) => {
          // progress = data.slice(0, 10)
          stopData = data.split('\n');
        })
        .catch((error) => {
          // progress = ('Failed to get stopData')
          console.log(error);
        });
      if (shapeFile && shapeFile[0].localUri) {
        // progress = "got shape file"
        let localShapeUri = shapeFile[0].localUri;
        await FileSystem.readAsStringAsync(localShapeUri)
          .then(async (data) => {
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
                } else if (lineSplit[i].includes('let allTrainStopCoordinates')) {
                  let firstP = lineSplit[i].indexOf('(');
                  let firstPart = lineSplit[i].slice(0, firstP + 1)
                  let secondPart = ');'
                  // modify the line to have the data injected
                  lineSplit[i] = `${firstPart}${JSON.stringify(stopData)}${secondPart}`;
                  // console.log(firstPart, secondPart)
                }
              }
              htmlContent = lineSplit.join('\n').replace('■', '\n')
              await FileSystem.writeAsStringAsync(htmlFileUri, htmlContent, { encoding: 'utf8' })
              progress = "Wrote HTML content!"
            }
          })
          .catch((error) => {
            // progress = ('Failed to get shapeData')
            console.log(error);
          });
      }
    } else {
      progress = `Bruh ${err3}`
    }
  }

  useEffect(() => {
    if (html != 'no html' && stopFile && shapeFile) {
      progress = "Running main"
      main()
    }
  }, [html, stopFile, shapeFile]);

  return <ThemedText>Loading...</ThemedText>;
}

function LeafletMap(props: any) {
  const webref = useRef<WebView>(null);
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
  const [iconData, setIconData] = useState<string[]>([]);

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
      progress = "Got the assets!"
      getIconUris()
    } else {
      progress = String(err2)
    }
  }, [iconAssets])

  async function getLocation() {
    // progress = ("Permission granted?")
    let { status } = await Location.requestForegroundPermissionsAsync();
    // progress = (status)
    if (status !== 'granted') {
      // progress = ('Permission to access location was denied');
      // Use example location then...
      return { coords: { latitude: 40.71775244918452, longitude: -73.9990371376651 } }
    }

    let expoLocationData: LocationObject = await Location.getCurrentPositionAsync({});
    return expoLocationData
  };

  async function updateWebView() {
    let expoLocationData = await getLocation()
    var run = '';
    // progress = "No location found..."
    // progress = (JSON.stringify(expoLocationData))
    if (expoLocationData != null) {
      let coords = expoLocationData["coords"]
      if (isFirstRender) {
        progress = "Done with first render"
        run = `
          window.iconFileLocations = ${JSON.stringify(iconData)}
          window.userLocation = [${coords["latitude"]}, ${coords["longitude"]}];
          true;
        `;
        isFirstRender = false;
      } else {
        progress = "Not first render"
        run = `
          window.userLocation = [${coords["latitude"]}, ${coords["longitude"]}];
          true;
        `;
      }
      // setReRender("z")
      if (webref.current) {
        webref.current.injectJavaScript(run);
      }
      setReRender('z')
    }
  }

  // async function listDirectoryContents(targetPath: any) {
  //   try {
  //     const contents = await FileSystem.readDirectoryAsync(targetPath);
  //     return contents
  //     // console.log('Directory contents:', contents);
  //   } catch (error) {
  //     // console.error('Error reading directory:', error);
  //   }
  // }

  // async function test() {
  //   let c = await listDirectoryContents(FileSystem.cacheDirectory)
  //   if (c) {
  //     progress = JSON.stringify(c) 
  //   }
  // }
  useEffect(() => {
    // progress = "Wait it worked?"
    if (iconData.length != 0 && isFirstRender) {
      progress = "Running updateWebView"
      updateWebView()
      setInterval(updateWebView, 10000)
      // test()
    }
  }, [iconData])

  return <WebView
    onMessage={async (event) => {
      alert(event.nativeEvent.data);
      const eventData = event.nativeEvent.data.slice(1,)
      const eventType = event.nativeEvent.data[0]
      progress = eventData
      // Arrivals (TODO)
      if (eventType === 'A') {
        const targetStopID = eventData.split('|')[0]
        const direction = ""
        const date = Date.now()
        const trainLine = eventData.split('|')[1]
        const realtime = await tH.getTrainArrivals(trainLine, targetStopID, date, direction);
        progress = JSON.stringify(realtime);
        props.arrivalCallback(realtime)
      }
    }}
    originWhitelist={['*']}
    ref={webref}
    source={{ html: htmlContent }}
    style={{ flex: 1 }} />;
};

type ShouldInsertDataType = boolean | null;

export default function HomeScreen() {
  const [mapHeight, setMapHeight] = useState(Dimensions.get('window').height * 0.5);
  const [p, setP] = useState('')
  const [shouldInsertData, setShouldInsertData] = useState<ShouldInsertDataType>(null);
  const [arrivals, setArrivals] = useState([]);

  async function checkIfHTMLFileExists() {
    const exists = await doesFileExist(htmlFileUri);
    if (exists) {
      setShouldInsertData(false)
      htmlContent = await FileSystem.readAsStringAsync(htmlFileUri, { encoding: 'utf8' })
    } else {
      setShouldInsertData(true)
    }
  }

  useEffect(() => {
    setMapHeight(Dimensions.get('window').height * 0.5);
    checkIfHTMLFileExists()
  }, []);

  async function doesFileExist(uri: any) {
    const result = await FileSystem.getInfoAsync(uri);
    return result.exists && !result.isDirectory;
  }

  var startupHelper = setInterval(() => {
    if (htmlContent != '') {
      setShouldInsertData(false)
      clearInterval(startupHelper)
    }
  }, 100)

  setInterval(() => {
    setP(progress)
  }, 500)

  return (
    <View>
      <View style={{ height: mapHeight }}>
        {shouldInsertData ? <GenerateLeafletMap /> : <LeafletMap arrivalCallback={(c: any) => {setArrivals(c)}} />}
      </View>
      <ThemedText>Progress: {p}</ThemedText>
      <ThemedText>Arrivals:</ThemedText>
      <ThemedText>{JSON.stringify(arrivals)}</ThemedText>
    </View>
  );
}

// const styles = StyleSheet.create({
//   // container: {
//   //   flex: 1
//   // },
// });