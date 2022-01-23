import React, {useState, useCallback, Dispatch, SetStateAction} from 'react';

import BleManager from 'react-native-ble-manager';
import {Peripheral} from 'react-native-ble-manager';
import useScanning, {ScanButtonProperties} from './useScanning';
import useInitBle from './useInitBle';
import useTimer from './useTimer';
import NowCount from './NowCount';
import useBleHandleValueForCharacteristic from './useBleHandleValueForCharacteristic';
import {BrvPeripheral} from './types';
import {bytesToString} from 'convert-string';
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
    isCollecting: boolean,
    isPaused: boolean,
    nowCount: number,
    onStartScanning: () => void,
    onStartCollecting: () => void,
    setNowCount: (count: number) => void,
    onStopCollecting: () => void,
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

    const [force, setForce] = useState(false);
    const [startScreenRefreshTimer, stopScreenRefreshTimer] = useTimer(
        1000,
        () => {
            setForce(!force);
        },
    );

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
        console.log('Connecting to ' + id);
        await BleManager.connect(id);
        console.log('Connected to ' + id);
        await timeout(100);
        /* Test read current RSSI value */
        console.log('Getting services for ' + id);
        await retrieveServices(id);

        console.log('Start notification for ' + id);
        await startNotification(id);
        peripheral.connected = true;
        console.log('Connected to ' + id);
    };

    const disconnect = async (peripheral: BrvPeripheral) => {
        const id = peripheral.peripheral.id;
        console.log('Disconnecting from ' + id);
        // await stopNotification(id);
        await BleManager.disconnect(id);
        peripheral.connected = false;
        console.log('Disconnected from ' + id);
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
        console.log('peripheral', peripheral.id);
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

    const handleUpdateValueForCharacteristic = useCallback(
        (data: any) => {
            const dataAsString = bytesToString(data.value);
            console.log(
                `Recieved ${dataAsString} for characteristic ${data.characteristic}`,
            );
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [isCollecting, isPaused, nowCount],
    );

    useInitBle(
        handleDiscoverPeripheral,
        handleDisconnectedPeripheral,
        handleStopScan,
    );
    useBleHandleValueForCharacteristic(handleUpdateValueForCharacteristic);

    // console.log(`Main screen render getNowCount = ${getNowCount()} isCollecting=${isCollecting()}`);

    React.useEffect(() => {
        if (isCollecting && !isPaused) {
            startScreenRefreshTimer();
        } else {
            stopScreenRefreshTimer();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isCollecting]);

    const NowCountWidget = (props: {
        disabled: boolean;
        peripheralId: string;
    }): JSX.Element => {
        return (
            <NowCount
                started={isCollecting}
                disabled={props.disabled}
                nowCount={nowCount}
                onStartCollecting={async () => {
                    console.log(
                        'NowCountWidget->onStartCollecting:' +
                            props.peripheralId,
                    );
                    onStartCollecting();
                    await startNotification(props.peripheralId);
                }}
                onStopCollecting={async () => {
                    console.log(
                        'NowCountWidget->onStopCollecting:' +
                            props.peripheralId,
                    );
                    onStopCollecting();
                    await stopNotification(props.peripheralId);
                }}
            />
        );
    };

    return [
        list,
        setList,
        toggleConnection,
        retrieveRssi,
        ScanButton,
        NowCountWidget,
    ];
};

export default useUiState;
