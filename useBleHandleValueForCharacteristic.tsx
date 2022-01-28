import React, {useEffect} from 'react';
import {NativeModules, NativeEventEmitter} from 'react-native';
import {bytesToString} from 'convert-string';
import AppContext, {Point} from './AppContext';

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

const A: Point[] = [];
const B: Point[] = [];
const C: Point[] = [];
const D: Point[] = [];

let countC = 0;

const SLIDING_WINDOW = 16;

const shift = <T extends unknown>(target: T[], p: T) => {
    if (target.length >= SLIDING_WINDOW) {
        target.shift();
    }
    target.push(p);
};

const useBleHandleValueForCharacteristic = () => {
    const {setChartData, isCollecting} = React.useContext(AppContext);
    const handleUpdateValueForCharacteristic = React.useCallback(
        (data: any) => {
            if (!isCollecting) {
                return;
            }
            const dataAsString = bytesToString(data.value);
            console.log(
                `Recieved ${dataAsString} for characteristic ${data.characteristic}`,
            );
            const [first, second] = dataAsString.split(' ');
            if (first.startsWith('A')) {
                const a = Number(Number(first.replace('A', '')).toFixed(2));
                console.log('a', a);
                const b = Number(Number(second.replace('B', '')).toFixed(2));
                console.log('b', b);
                shift(A, {x: `${countC}`, y: a});
                shift(B, {x: `${countC}`, y: b});
            }
            if (first.startsWith('C')) {
                const c = Number(Number(first.replace('C', '')).toFixed(2));
                console.log('c', c);
                const d = Number(Number(second.replace('D', '')).toFixed(2));
                console.log('d', d);
                shift(C, {x: `${countC}`, y: c});
                shift(D, {x: `${countC}`, y: d});
                countC++;
                setChartData({a: [...A], b: [...B], c: [...C], d: [...D]});
            }
        },
        [setChartData, isCollecting],
    );

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
