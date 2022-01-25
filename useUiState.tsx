import BleManager from 'react-native-ble-manager';
import useBleHandleValueForCharacteristic from './useBleHandleValueForCharacteristic';
import {BrvPeripheral} from './types';
const timeout = (ms: number): Promise<void> => {
    return new Promise(resolve => {
        console.log(`Initiating timeout of ${ms} msec.`);
        setTimeout(resolve, ms);
    });
};

const NOTIFY_SERVICE_ID = '18424398-7cbc-11e9-8f9e-2a86e4085a59';
const NOTIFY_CHARACTERISTIC_ID = '772ae377-b3d2-ff8e-1042-5481d1e03456';
const useUiState = () => {
    useBleHandleValueForCharacteristic();
};

export const retrieveServices = async (id: string) => {
    let peripheralData = await BleManager.retrieveServices(id);
    console.log(
        'Retrieved peripheral services',
        JSON.stringify(peripheralData),
    );
};

export const startNotification = async (id: string) => {
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

export const stopNotification = async (id: string) => {
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

export const connect = async (peripheral: BrvPeripheral) => {
    const id = peripheral.peripheral.id;
    await BleManager.connect(id);
    await timeout(100);
    await retrieveServices(id);
    await startNotification(id);
    peripheral.connected = true;
};

export const disconnect = async (peripheral: BrvPeripheral) => {
    const id = peripheral.peripheral.id;
    // await stopNotification(id);
    await BleManager.disconnect(id);
    peripheral.connected = false;
};

export const toggleConnection = async (peripheral: BrvPeripheral) => {
    console.log(`peripheral = ${JSON.stringify(peripheral)}`);
    if (peripheral) {
        if (peripheral.connected) {
            await disconnect(peripheral);
        } else {
            await connect(peripheral);
        }
    }
};

export default useUiState;
