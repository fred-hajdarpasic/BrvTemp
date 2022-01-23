import {useEffect} from 'react';
import {NativeModules, NativeEventEmitter} from 'react-native';

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

const useBleHandleValueForCharacteristic = (
    handleUpdateValueForCharacteristic: (data: any) => void,
) => {
    useEffect(() => {
        if (handleUpdateValueForCharacteristic) {
            console.log(
                'BleManagerDidUpdateValueForCharacteristic ... Started',
            );

            const subscription = bleManagerEmitter.addListener(
                'BleManagerDidUpdateValueForCharacteristic',
                handleUpdateValueForCharacteristic,
            );

            console.log(
                'BleManagerDidUpdateValueForCharacteristic ... Completed',
            );
            return () => {
                console.log(
                    'BleManagerDidUpdateValueForCharacteristic cleanup',
                );
                subscription.remove();
            };
        }
    }, [handleUpdateValueForCharacteristic]);
};

export default useBleHandleValueForCharacteristic;
