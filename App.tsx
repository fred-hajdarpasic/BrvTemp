/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {SafeAreaView, View, Text, StatusBar, FlatList} from 'react-native';

import useUiState from './useUiState';
import useConnected from './useConnected';
import {BrvPeripheral} from './types';
import {styles} from './styles';
import PeripheralDetails from './PeripheralDetails';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Colors from './Colors';
import {Chart} from './Chart';
import AppContext, {Point} from './AppContext';

const App = () => {
    const [isConnected, setIsConnected] = React.useState(false);
    const [blIsOn, setBlIsOn] = React.useState(false);

    const [isCollecting, setIsCollecting] = React.useState(false);

    const [connectedPeripheralId, setConnectedPeripheralId] =
        React.useState('');

    const onStartScanning = () => {
        console.log('App: On start scanning');
        setIsCollecting(false);
        setIsConnected(false);
        setConnectedPeripheralId('');
    };

    const [
        list,
        setList,
        toggleConnection,
        retrieveRssi,
        ScanButton,
        StartStopController,
    ] = useUiState(onStartScanning);

    const onBleStateChanged = (on: boolean) => {
        setBlIsOn(on);
    };

    const [ConnectionIndicator] = useConnected(
        connectedPeripheralId,
        onBleStateChanged,
    );
    const renderItem = (peripheral: BrvPeripheral) => {
        return (
            <PeripheralDetails
                onPress={async () => {
                    await toggleConnection(peripheral);
                    if (connectedPeripheralId) {
                        setConnectedPeripheralId('');
                    } else {
                        setConnectedPeripheralId(peripheral.peripheral.id);
                    }
                    setIsConnected(peripheral.connected);
                }}
                item={peripheral}
                key={peripheral.peripheral.id}
            />
        );
    };

    React.useEffect(() => {
        if (!blIsOn) {
            setIsCollecting(false);
        }
    }, [blIsOn]);
    const {a, b, c, d} = React.useContext(AppContext);

    return (
        <View>
            <StatusBar barStyle="dark-content" />
            <SafeAreaView style={{height: '100%'}}>
                <View style={styles.body}>
                    <View
                        style={{
                            margin: 10,
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                        }}>
                        <View style={{flexGrow: 5}}>
                            <ConnectionIndicator connected={isConnected} />
                        </View>
                        <Text
                            style={{
                                textAlign: 'left',
                                textAlignVertical: 'center',
                                padding: 2,
                                flexGrow: 1,
                            }}
                        />
                        <View style={{flexGrow: 5}}>
                            <ScanButton disabled={!blIsOn} />
                        </View>
                    </View>
                </View>
                <View style={styles.deviceList}>
                    <FlatList
                        style={{margin: 10}}
                        data={list}
                        renderItem={({item}) => renderItem(item)}
                        keyExtractor={item => item.peripheral.id}
                    />
                </View>
                <View style={{flexGrow: 1}}>
                    {/* <View style={{margin: 10}}>
                        <Chart a={a} b={b} />
                    </View>
                    <View style={{margin: 10}}>
                        <Chart a={c} b={d} />
                    </View> */}
                </View>
                <View style={styles.body}>
                    <StartStopController
                        disabled={!isConnected}
                        peripheralId={connectedPeripheralId}
                    />
                </View>
            </SafeAreaView>
        </View>
    );
};

const SLIDING_WINDOW = 4;

const shift = <T extends unknown>(a: T[], p: T) => {
    if (a.length >= SLIDING_WINDOW) {
        const [, ...rest] = a;
        return [...rest, p];
    } else {
        return [...a, p];
    }
};

const AppCtx = () => {
    const [a, setA] = React.useState<Point[]>([]);
    const [b, setB] = React.useState<Point[]>([]);
    const [c, setC] = React.useState<Point[]>([]);
    const [d, setD] = React.useState<Point[]>([]);
    const [isCollecting, setIsCollecting] = React.useState(false);

    const addA = React.useCallback(
        (p: Point) => {
            setA(shift(a, p));
        },
        [a],
    );

    const addB = React.useCallback(
        (p: Point) => {
            setB(shift(b, p));
        },
        [b],
    );

    const addC = React.useCallback(
        (p: Point) => {
            setC(shift(c, p));
        },
        [c],
    );

    const addD = React.useCallback(
        (p: Point) => {
            setD(shift(d, p));
        },
        [d],
    );

    return (
        <AppContext.Provider
            value={{
                a,
                b,
                c,
                d,
                setA,
                setB,
                setC,
                setD,
                addA,
                addB,
                addC,
                addD,
                isCollecting,
                setIsCollecting,
            }}>
            <App />
        </AppContext.Provider>
    );
};

export default AppCtx;
