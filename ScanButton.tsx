import React, {useState, useCallback} from 'react';
import {View, TouchableHighlight, Text} from 'react-native';

import BleManager, {disconnect, Peripheral} from 'react-native-ble-manager';
import AppContext from './AppContext';

import Colors from './Colors';
import {BrvPeripheral} from './types';
import useInitBle from './useInitBle';

const PERIPHERAL_NAME_TO_SEARCH = 'BRV-TEMP';
const SCAN_DURATION = 20;

export interface ScanButtonProperties {
    disabled: boolean;
    onStartedScanning: () => void;
    onStopppedScannning: () => void;
}

export const ScanButton = (props: ScanButtonProperties): JSX.Element => {
    const {peripherals, setList} = React.useContext(AppContext);
    const [isScanInProgress, setIsScanInProgress] = useState(false);
    const [isScanTransitioning, setIsScanTransitioning] = useState(false);
    const [countValue, setCountValue] = React.useState(SCAN_DURATION);
    const backgroundColor = !props.disabled
        ? !isScanInProgress
            ? Colors.blue
            : Colors.pink
        : Colors.gray;

    React.useEffect(() => {
        let timerid = setInterval(() => {
            console.log('useScanning');
            setCountValue(countValue > 0 ? countValue - 1 : 0);
        }, 1000);
        return () => {
            clearInterval(timerid);
        };
    });

    const title = React.useMemo(() => {
        return !props.disabled
            ? !isScanTransitioning
                ? !isScanInProgress
                    ? 'SCAN BLUETOOTH'
                    : `STOP SCANNING (${countValue})`
                : 'WAIT'
            : 'BL IS OFF';
    }, [countValue, props.disabled, isScanInProgress, isScanTransitioning]);

    const startScan = useCallback(() => {
        setCountValue(20);
        props.onStartedScanning();
        setIsScanInProgress(true);
        setIsScanTransitioning(true);

        peripherals.forEach(async peripheral => {
            if (peripheral.connected) {
                await disconnect(peripheral.peripheral.id);
            }
        });
        peripherals.clear();
        setList([]);

        console.log('Initiating Scanning...');
        BleManager.scan([], SCAN_DURATION, true)
            .then(() => {
                console.log('Peripheral started scanning...');
                setIsScanTransitioning(false);
            })
            .catch(err => {
                setIsScanTransitioning(false);
                console.error(err);
            });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const stopScan = useCallback(() => {
        setCountValue(0);
        setIsScanInProgress(false);
        setIsScanTransitioning(true);
        console.log('Stopping Scanning...');
        BleManager.stopScan()
            .then(() => {
                console.log('Peripheral stopped scanning...');
                setIsScanTransitioning(false);
            })
            .catch(err => {
                setIsScanTransitioning(false);
                console.error(err);
            });
    }, []);

    const handleDiscoverPeripheral = useCallback((peripheral: Peripheral) => {
        if (peripheral.name === PERIPHERAL_NAME_TO_SEARCH) {
            if (!peripherals.get(peripheral.id)) {
                console.log(
                    `Got First ${PERIPHERAL_NAME_TO_SEARCH}, peripheral: ${JSON.stringify(
                        peripheral,
                    )}`,
                );
                console.log(
                    `Adding ${PERIPHERAL_NAME_TO_SEARCH}: ${peripheral.id}`,
                );
                let btPeripheral = {
                    connected: false,
                    peripheral: peripheral,
                } as BrvPeripheral;
                peripherals.set(peripheral.id, btPeripheral);
                stopScan();
                setList(Array.from(peripherals.values()));
            } else {
                // console.log(`SensorTag: id = ${peripheral.id} already in the list.`);
            }
        } else {
            //console.log(`Not SensorTag - ${JSON.stringify(peripheral)}`);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleDisconnectedPeripheral = useCallback((data: any) => {
        let peripheral = peripherals.get(data.peripheral);
        console.log('handleDisconnectedPeripheral', peripheral);
        if (peripheral) {
            peripheral.connected = false;
            peripherals.set(peripheral.peripheral.id, peripheral);
            setList(Array.from(peripherals.values()));
        }
        console.log('Disconnected from ' + data.peripheral);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleStopScan = useCallback(() => {
        console.log('Stopped scanning');
        setIsScanInProgress(false);
        setCountValue(0);
    }, []);

    useInitBle(
        handleDiscoverPeripheral,
        handleDisconnectedPeripheral,
        handleStopScan,
    );

    return (
        // eslint-disable-next-line react-native/no-inline-styles
        <View style={{margin: 10}}>
            <TouchableHighlight
                onPress={() => (!isScanInProgress ? startScan() : stopScan())}
                disabled={props.disabled}>
                <Text
                    // eslint-disable-next-line react-native/no-inline-styles
                    style={{
                        height: 60,
                        textAlign: 'center',
                        textAlignVertical: 'center',
                        padding: 2,
                        flexGrow: 1,
                        backgroundColor: `${backgroundColor}`,
                        color: 'white',
                    }}>
                    {title}
                </Text>
            </TouchableHighlight>
            {/* <Progress.Bar progress={(20 - countValue / 20} width={20} style={{width:'100%'}}/> */}
        </View>
    );
};

export default ScanButton;