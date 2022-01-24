import React, {useState, useCallback, Dispatch, SetStateAction} from 'react';

import BleManager from 'react-native-ble-manager';
import {Peripheral} from 'react-native-ble-manager';
import useScanning, {ScanButtonProperties} from './useScanning';
import useInitBle from './useInitBle';
import CollectionStartStopController from './CollectionStartStopController';
import useBleHandleValueForCharacteristic from './useBleHandleValueForCharacteristic';
import {BrvPeripheral} from './types';
const timeout = (ms: number): Promise<void> => {
    return new Promise(resolve => {
        console.log(`Initiating timeout of ${ms} msec.`);
        setTimeout(resolve, ms);
    });
};

const PERIPHERAL_NAME_TO_SEARCH = 'BRV-TEMP';
const NOTIFY_SERVICE_ID = '18424398-7cbc-11e9-8f9e-2a86e4085a59';
const NOTIFY_CHARACTERISTIC_ID = '772ae377-b3d2-ff8e-1042-5481d1e03456';
const useUiState = (
    onStartScanning: () => void,
): [
    any[],
    Dispatch<SetStateAction<any[]>>,
    (peripheral: BrvPeripheral) => void,
    (id: string, p: BrvPeripheral | undefined) => Promise<void>,
    (props: ScanButtonProperties) => JSX.Element,
    (props: {disabled: boolean; peripheralId: string}) => JSX.Element,
] => {
    const peripherals = React.useMemo(
        () => new Map<string, BrvPeripheral>(),
        [],
    );
    const [list, setList] = useState([] as any[]);

    const retrieveServices = async (id: string) => {
        let peripheralData = await BleManager.retrieveServices(id);
        console.log(
            'Retrieved peripheral services',
            JSON.stringify(peripheralData),
        );
    };

    const retrieveRssi = async (
        id: string,
        p: BrvPeripheral | undefined,
    ): Promise<void> => {
        let rssi = await BleManager.readRSSI(id);
        console.log('Retrieved actual RSSI value', rssi);
        p = peripherals.get(id);
        if (p) {
            p.peripheral.rssi = Number.parseFloat('' + rssi);
            peripherals.set(id, p);
            setList(Array.from(peripherals.values()));
        }
    };

    const startNotification = async (id: string) => {
        try {
            await retrieveServices(id);
            console.log('await BleManager.startNotification');
            await BleManager.startNotification(
                id,
                NOTIFY_SERVICE_ID,
                NOTIFY_CHARACTERISTIC_ID,
            );
            console.log('Notification started');
        } catch (error) {
            console.log(error);
        }
    };

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const stopNotification = async (id: string) => {
        try {
            console.log('await BleManager.stopNotification');
            await BleManager.stopNotification(
                id,
                NOTIFY_SERVICE_ID,
                NOTIFY_CHARACTERISTIC_ID,
            );
            await new Promise(resolve => setTimeout(resolve, 1000));
            console.log('Notification stopped');
        } catch (error) {
            console.log(error);
        }
    };

    const connect = async (peripheral: BrvPeripheral) => {
        const id = peripheral.peripheral.id;
        await BleManager.connect(id);
        await timeout(100);
        await retrieveServices(id);
        await startNotification(id);
        peripheral.connected = true;
    };

    const disconnect = async (peripheral: BrvPeripheral) => {
        const id = peripheral.peripheral.id;
        // await stopNotification(id);
        await BleManager.disconnect(id);
        peripheral.connected = false;
    };

    const toggleConnection = async (peripheral: BrvPeripheral) => {
        const id = peripheral.peripheral.id;
        console.log(`peripheral = ${JSON.stringify(peripheral)}`);
        if (peripheral) {
            if (peripheral.connected) {
                await disconnect(peripheral);
            } else {
                await connect(peripheral);
            }
            let p = peripherals.get(id);
            if (p) {
                peripherals.set(id, p);
                setList(Array.from(peripherals.values()));
            }
        }
    };

    const onStartScan = useCallback(() => {
        (async () => {
            peripherals.forEach(async peripheral => {
                if (peripheral.connected) {
                    await disconnect(peripheral);
                }
            });
            peripherals.clear();
            setList([]);
        })();
        onStartScanning();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const [handleStopScan, stopScan, ScanButton] = useScanning(onStartScan);

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

    useInitBle(
        handleDiscoverPeripheral,
        handleDisconnectedPeripheral,
        handleStopScan,
    );
    useBleHandleValueForCharacteristic();

    const StartStopController = (props: {
        disabled: boolean;
        peripheralId: string;
    }): JSX.Element => {
        return <CollectionStartStopController disabled={props.disabled} />;
    };

    return [
        list,
        setList,
        toggleConnection,
        retrieveRssi,
        ScanButton,
        StartStopController,
    ];
};

export default useUiState;
