import React from 'react';
import { StyleSheet, View } from 'react-native';
import MapLibreGL from '@maplibre/maplibre-react-native';
import { IconRotationAlignmentEnum } from '@maplibre/maplibre-react-native/javascript/utils/MaplibreStyles';

MapLibreGL.setAccessToken(null);
MapLibreGL.setConnected(true);

var emptyMap = `{
    "version": 8,
    "sources": {},
    "layers": []
}`

export default function ImgMap() {
    const longitude = 0.49
    const latitude = 0.2
    return (
        <View style={styles.container}>
            <MapLibreGL.MapView
                style={styles.map}
                styleJSON={emptyMap}
                zoomEnabled={true}
                scrollEnabled={true}
                pitchEnabled={true}
                compassEnabled={true}>
                <MapLibreGL.Camera
                    zoomLevel={16}
                    centerCoordinate={[longitude, latitude]}
                />
                <MapLibreGL.Images
                    images={{
                        customImage: require('../../assets/images/nyc3.png'),
                    }}>
                    <></>
                </MapLibreGL.Images>

                <MapLibreGL.ShapeSource
                    id="source"
                    shape={{
                        type: 'FeatureCollection',
                        features: [
                            {
                                type: 'Feature',
                                geometry: {
                                    type: 'Point',
                                    coordinates: [longitude, latitude],
                                },
                                properties: {
                                    icon: 'customImage'
                                },
                            }
                        ],
                    }}
                >
                    <MapLibreGL.SymbolLayer
                        id="layer"
                        style={{
                            iconImage: 'customImage',
                            iconSize: 1,
                        }}
                    />
                </MapLibreGL.ShapeSource>
            </MapLibreGL.MapView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        flex: 1,
    },
});