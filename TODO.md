Consider using https://github.com/allartk/leaflet.offline to allow it to render offline...
``` (AI)
import React, { useEffect, useState } from 'react';
import { WebView } from 'react-native-webview';
import StaticServer from 'react-native-static-server';
import { Asset } from 'expo-asset';

const App = () => {
  const [serverUrl, setServerUrl] = useState(null);

  useEffect(() => {
    const startServer = async () => {
      const htmlAsset = Asset.fromModule(require('./path/to/leaflet_img_map.html'));
      await htmlAsset.downloadAsync();

      const server = new StaticServer(8080, htmlAsset.localUri.replace('file://', ''), { localOnly: true });
      server.start().then(url => {
        setServerUrl(url);
      });

      return () => {
        server.stop();
      };
    };

    startServer();
  }, []);

  if (!serverUrl) {
    return null; // or a loading spinner
  }

  return (
    <WebView source={{ uri: `${serverUrl}/leaflet_img_map.html` }} />
  );
};

export default App;
```
Then, use this to serve the img to the HTML file

OR split up the image base data into like 100 parts and then write a script that injects window.imgData{i} for each part and then have the HTML file receive each part and wait until the previous one is done until it's 100 parts received
(lazy loading/tcp idea lol)
!!!!!!!
https://medium.com/@filipedegrazia/embedding-a-local-website-on-your-expo-react-native-project-eea322738872#:~:text=Thankfully%2C%20that%20is%20very%20easy.%20The%20assets%20are,%28Careful%2C%20don%E2%80%99t%20write%20assets%29%2C%20and%20Expo.Asset.fromModule%28require%28%E2%80%98.%2FpathToFile.html%27%29%29.localUri%20returns%20asset%3A%2F%2F%2FnameOfFile.html.
https://stackoverflow.com/questions/71477024/expo-webview-load-local-html-file