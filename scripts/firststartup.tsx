import { ThemedText } from '@/components/ThemedText';
import React, { useState, useEffect, useRef } from 'react';
import { Text, View, StyleSheet, Dimensions } from 'react-native';
import * as FileSystem from 'expo-file-system';

var progress = ''

export default function FirstStartup() {
    const [hasGTFSDownloaded, setGTFSDownloaded] = useState(false);
    const [hasUnZipped, setUnzipped] = useState(false);

    // where we should find the zip folder and unzip it
    const uri = FileSystem.cacheDirectory + "google_transit.zip";
    // where we an put the unzipped folder
    const targetPath = FileSystem.cacheDirectory + "google_transit";

    // First, create a folder called google_transit in the cache and download the zip
    // Should have a file at cache/google_transit/google_transit.zip
    async function downloadGTFSData() {
        const zipUrl = "http://web.mta.info/developers/data/nyct/subway/google_transit.zip";

        // Check if zip was downloaded
        doesFileExist(uri).then(async (isFile) => {
            if (isFile) {
                progress = ("ZIP file already downloaded!")
                setGTFSDownloaded(true);
            } else {
                progress = ("Downloading zip...")
                await createDirectory(targetPath)
                FileSystem.downloadAsync(zipUrl, uri)
                    .then(({ uri }) => {
                        progress = `Finished downloading to ${uri}`;
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
            targetPath
        );
        setEntries(entries);
    }

    async function doesFileExist(uri: any) {
        const result = await FileSystem.getInfoAsync(uri);
        return result.exists && !result.isDirectory;
    }

    async function listDirectoryContents(targetPath: any) {
        try {
            const contents = await FileSystem.readDirectoryAsync(targetPath);
            return contents
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
        // progress = ('unzipping faolder...')
        // try {
        // const initialFileCount = await countFilesInDirectory(targetPath);
        // progress = (`Initial file count: ${initialFileCount}`);
        const filesFound = await countFilesInDirectory(targetPath);
        if (filesFound == 10) {
            progress = `${filesFound}`;
            setUnzipped(true)
            return
        }

        const path = await unzip(uri, targetPath, "UTF-8");
        progress = (`unzip completed ${path} contents: ${await listDirectoryContents(targetPath)}`);

        // const finalFileCount = await countFilesInDirectory(targetPath);
        // progress = (`Final file count: ${finalFileCount}`);
        // await readCacheDirectory(setEntries); 
        progress = `Getting neccessary files... ${path} ${await doesFileExist(targetPath + '/stops.txt')}`
        // ## Add train lines to the stops file!!! ##
        const stopData = await FileSystem.readAsStringAsync(targetPath + '/stops.txt')
        progress = `Done with stops.txt ${path} ${await doesFileExist(targetPath + '/shapes.txt')}`
        const shapeData = await FileSystem.readAsStringAsync(targetPath + '/shapes.txt')
        progress = "Finished reading neccessary files. Running addTrainLinesToStopsFile."
        setTimeout(async () => {
            const z = await addTrainLinesToStopsFile(stopData, shapeData, targetPath + '/stops2.txt')
            progress = "Success!"
            setUnzipped(true)
        }, 1000)
        // } catch (error) {
        //   console.error('Error during unzipping:', error);
        //   progress = 'Error during unzipping:' + error
        // }
        // listDirectoryContents(targetPath);
    }

    useEffect(() => {
        if (hasGTFSDownloaded) {
            unzipFolder()
        }
    }, [hasGTFSDownloaded])
    return (
        <View>
            <ThemedText>Welcome to OpenTransitApp!</ThemedText>

        </View>
    );
}