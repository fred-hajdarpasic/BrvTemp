/* eslint-disable prettier/prettier */
import React, { useEffect } from 'react';
import { NativeModules, NativeEventEmitter, Platform, PermissionsAndroid } from 'react-native';

import BleManager from 'react-native-ble-manager';
import { Peripheral } from 'react-native-ble-manager';
const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

const useInitBle = (
    handleDiscoverPeripheral: (peripheral: Peripheral) => void,
    handleDisconnectedPeripheral: (data: any) => void,
    handleStopScan: () => void) => {
    const [bleStarted, setBleStarted] = React.useState(false);

    useEffect(() => {
        (async () => {
            console.log('BLE Manager  ... Starting');
            await BleManager.start({ showAlert: true });
            console.log('BLE Manager ... Started');
            setBleStarted(true);
        })();
    }, []);

    useEffect(() => {
        if (bleStarted) {
            console.log('BT Counter initialisation ... Started');
            const discoverListener = bleManagerEmitter.addListener('BleManagerDiscoverPeripheral', handleDiscoverPeripheral);
            const stopScanListener = bleManagerEmitter.addListener('BleManagerStopScan', handleStopScan);
            const disconnectListener = bleManagerEmitter.addListener('BleManagerDisconnectPeripheral', handleDisconnectedPeripheral);

            if (Platform.OS === 'android' && Platform.Version >= 23) {
                PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION).then((checkPermissionResult) => {
                    if (checkPermissionResult) {
                        console.log('Permission is OK');
                    } else {
                        PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION).then((requestPermissionResult) => {
                            if (requestPermissionResult) {
                                console.log('User accept');
                            } else {
                                console.log('User refuse');
                            }
                        });
                    }
                });
            }
            console.log('BT Counter initialisation ... Completed');
            return (() => {
                console.log('BT listener cleanup');
                discoverListener.remove();
                stopScanListener.remove();
                disconnectListener.remove();
            });
        }
    }, [handleDiscoverPeripheral, handleDisconnectedPeripheral, handleStopScan, bleStarted]);
};

export default useInitBle;
