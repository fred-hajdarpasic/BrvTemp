import {Peripheral} from 'react-native-ble-manager';

export interface BrvPeripheral {
    peripheral: Peripheral;
    connected: boolean;
}
