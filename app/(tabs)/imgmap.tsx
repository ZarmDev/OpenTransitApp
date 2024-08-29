import { Text, View, StyleSheet, Dimensions } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import * as FileSystem from 'expo-file-system';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import { Asset, useAssets } from 'expo-asset';
import { ThemedText } from '@/components/ThemedText';

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
var isFirstRender = false;

// thanks AI
// function distance(lat : Number, long : Number) {
//   const latDifference = lat[0] - long[0];
//   const lonDifference = lat[1] - long[1];
//   return Math.sqrt(latDiff * latDiff + lonDiff * lonDiff);
// }

export default function ImgMap() {
  // var htmlContent = assets ? assets : null;
  const [htmlContent, setHtmlContent] = useState(``);
  // AI (<LocationObject | null>(null); <- what???)
  // const [location, setLocation] = useState<LocationObject | null>(null);
  const [htmlFile, err] = useAssets(require('../../assets/leaflet_img_map.html'))
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
  const [stopFile, err3] = useAssets(require('../../assets/trains/google_transit/stops2.txt'))
  const [shapeFile, err4] = useAssets(require('../../assets/trains/google_transit/shapes.txt'))

  const [imgFile, err5] = useAssets(require('../../assets/images/nyc3.png'))
  const [iconData, setIconData] = useState<string[]>([])
  const [imgData, setImgData] = useState('')

  const webref = useRef<WebView>(null);

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

  async function getIconUris() {
    if (iconAssets && html != 'no html') {
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
    if (iconAssets && html != 'no html') {
      getIconUris()
    }
  }, [iconAssets, html])

  async function getImgFile() {
    if (imgFile && html != 'no html') {
        if (imgFile[0]) {
          let localU = imgFile[0].localUri;
          if (localU) {
            const fileContents = await FileSystem.readAsStringAsync(localU, {
              encoding: FileSystem.EncodingType.Base64,
            })
            setImgData(`data:image/svg+xml;base64,${fileContents}`);
          }
      }
    }
  }

  useEffect(() => {
    if (imgFile) {
      getImgFile()
    }
  }, [imgFile])

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
              // progress = `${shapeData.slice(0, 10)}, ${stopData.slice(0, 10)}`
              setHtmlContent(lineSplit.join('\n').replace('■', '\n'))
              updateWebView()
              // progress= "Updated web view"
              // if (bundleFile && bundleFile[0].localUri) {
              //   let localBundleUri = bundleFile[0].localUri;
              //   const bundle = await FileSystem.readAsStringAsync(localBundleUri)
              //   progress = bundle.slice(0, 100)
              // }
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
    // if zip downloaded + html ready to render
    // if (hasUnZipped && html != 'no html' && iconUriArr.length != 0) {
    // progress = `${hasUnZipped} ${html} ${htmlFile}`
    if (html != 'no html' && iconData.length != 0 && stopFile && shapeFile && imgData != '') {
      // progress = "Running main"
      main()
    }
  }, [html, iconData, stopFile, shapeFile, imgData]);


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
    if (!(html != 'no html' && iconData)) {
      return
    }
    let expoLocationData = await getLocation()
    var run = '';
    // progress = (JSON.stringify(location))
    if (expoLocationData != null) {
      let coords = expoLocationData["coords"]
      // progress = (String(nearbyStops))
      //         window.mapImageData = \`${imgData}\`
      if (isFirstRender) {
        run = `
          window.iconFileLocations = ${JSON.stringify(iconData)}
          window.userLocation = [${coords["latitude"]}, ${coords["longitude"]}];
          window.mapImageData = \`${imgData}\`
          true;
        `;
      } else {
        run = `
          window.userLocation = [${coords["latitude"]}, ${coords["longitude"]}];
          true;
        `;
      }
      setReRender("z")
      if (webref.current) {
        webref.current.injectJavaScript(run);
      }
    }
  }

  setInterval(updateWebView, 10000);

  return <WebView originWhitelist={['*']} ref={webref} source={{ html: htmlContent }} style={{ flex: 1 }} />;
};