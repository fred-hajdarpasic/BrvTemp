/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {Text, NativeModules, NativeEventEmitter} from 'react-native';

import Colors from './Colors';
import useRefreshTimer from './useRefreshTimer';

import BleManager from 'react-native-ble-manager';
const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

const LOW_RSSI_THRESHOLD = -90;
interface ConnectionIndicatorProps {
    connected: boolean;
    preipheralId: string;
    onBleStateChanged: (on: boolean) => void;
}

// const retrieveRssi = async (
//     id: string,
//     p: BrvPeripheral | undefined,
// ): Promise<void> => {
//     let rssi = await BleManager.readRSSI(id);
//     console.log('Retrieved actual RSSI value', rssi);
//     p = peripherals.get(id);
//     if (p) {
//         p.peripheral.rssi = Number.parseFloat('' + rssi);
//         peripherals.set(id, p);
//         setList(Array.from(peripherals.values()));
//     }
// };

export const ConnectionIndicator = (props: ConnectionIndicatorProps) => {
    const [rssi, setRssi] = React.useState(0);
    const [blIsOn, setBlIsOn] = React.useState(false);

    const tickFunction = React.useCallback(async () => {
        try {
            await BleManager.checkState();
        } catch (error) {
            console.log(`Error: ${error}`);
        }
    }, []);

    useRefreshTimer(1000, tickFunction);

    React.useEffect(() => {
        console.log('Props changed - recompute', JSON.stringify(props));
        const handleDidUpdateState = (stateData: any) => {
            // console.log('BLE state = ' + JSON.stringify(stateData));
            if (stateData.state === 'on') {
                setBlIsOn(true);
                props.onBleStateChanged(true);
                if (props.preipheralId) {
                    // console.log('Collecting rssi for peripheral id = ' + preipheralId);
                    BleManager.readRSSI(props.preipheralId)
                        .then((rssiData: any) => {
                            console.log('Current RSSI: ' + rssiData);
                            setRssi(rssiData as number);
                        })
                        .catch(error => {
                            console.log(error);
                        });
                }
            } else {
                setBlIsOn(false);
                props.onBleStateChanged(false);
            }
        };
        const listener = bleManagerEmitter.addListener(
            'BleManagerDidUpdateState',
            handleDidUpdateState,
        );
        return () => {
            listener.remove();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.preipheralId, props.onBleStateChanged]);

    const getColor = React.useCallback(() => {
        if (props.connected) {
            return rssi > LOW_RSSI_THRESHOLD ? Colors.green : Colors.orange;
        } else {
            return blIsOn ? Colors.orange : Colors.red;
        }
    }, [blIsOn, props.connected, rssi]);

    const getTitle = React.useCallback((): string => {
        if (props.connected) {
            return rssi > LOW_RSSI_THRESHOLD ? 'Connected' : `RSSI LOW ${rssi}`;
        } else {
            return blIsOn ? 'NOT CONNECTED' : 'BL IS OFF';
        }
    }, [blIsOn, props.connected, rssi]);

    console.log('Rendering ConnectionIndicator ...');
    return (
        <Text
            style={{
                height: 40,
                textAlign: 'center',
                textAlignVertical: 'center',
                padding: 2,
                flexGrow: 1,
                // backgroundColor: getColor(),
                color: getColor(),
            }}>
            {getTitle()}
        </Text>
    );
};

export default ConnectionIndicator;
