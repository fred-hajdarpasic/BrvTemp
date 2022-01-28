/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {
    SafeAreaView,
    View,
    Text,
    StatusBar,
    FlatList,
    ActivityIndicator,
} from 'react-native';

import useUiState, {toggleConnection} from './useUiState';
import ConnectionIndicator from './ConnectionIndicator';
import {BrvPeripheral} from './types';
import {styles} from './styles';
import PeripheralDetails from './PeripheralDetails';
import AppContext, {Point} from './AppContext';
import CollectionStartStopController from './CollectionStartStopController';
import ScanButton from './ScanButton';
import {Chart, ChartData, ChartProps} from './Chart';

const App = () => {
    const {peripherals, list, setList, isScanInProgress} =
        React.useContext(AppContext);
    const [isConnected, setIsConnected] = React.useState(false);
    const [isChangingConnection, setIsChangingConnection] =
        React.useState(false);
    const [blIsOn, setBlIsOn] = React.useState(false);

    const [isCollecting, setIsCollecting] = React.useState(false);

    const [connectedPeripheralId, setConnectedPeripheralId] =
        React.useState('');

    const onStartedScanning = React.useCallback(() => {
        console.log('App: On start scanning');
        setIsCollecting(false);
        setIsConnected(false);
        setConnectedPeripheralId('');
    }, []);

    const onStoppedScanning = React.useCallback(() => {
        console.log('App: On start scanning');
        setIsCollecting(false);
        setIsConnected(false);
        setConnectedPeripheralId('');
    }, []);

    useUiState();

    const renderItem = React.useCallback(
        (peripheral: BrvPeripheral) => {
            return (
                <PeripheralDetails
                    onPress={async () => {
                        setIsChangingConnection(true);
                        await toggleConnection(peripheral);
                        setIsChangingConnection(false);
                        const id = peripheral.peripheral.id;
                        let p = peripherals.get(id);
                        if (p) {
                            peripherals.set(id, p);
                            setList(Array.from(peripherals.values()));
                        }
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
        },
        [connectedPeripheralId, peripherals, setList],
    );

    React.useEffect(() => {
        if (!blIsOn) {
            setIsCollecting(false);
        }
    }, [blIsOn]);
    const {chartData} = React.useContext(AppContext);

    const onBleStateChanged = React.useCallback((on: boolean) => {
        setBlIsOn(on);
    }, []);

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
                        <ConnectionIndicator
                            connected={isConnected}
                            preipheralId={connectedPeripheralId}
                            onBleStateChanged={onBleStateChanged}
                        />
                        {(!blIsOn ||
                            isScanInProgress ||
                            isChangingConnection) && (
                            <ActivityIndicator size="small" color="#0000ff" />
                        )}
                        <ScanButton
                            disabled={!blIsOn}
                            onStartedScanning={onStartedScanning}
                            onStopppedScannning={onStoppedScanning}
                        />
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
                    <View style={{margin: 10}}>
                        <Chart chartData={chartData} />
                    </View>
                </View>
                <View style={styles.body}>
                    <CollectionStartStopController disabled={!isConnected} />
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
    const [chartData, setChartData] = React.useState<ChartData>({
        a: [],
        b: [],
        c: [],
        d: [],
    });

    const [isCollecting, setIsCollecting] = React.useState(false);
    const [isScanInProgress, setIsScanInProgress] = React.useState(false);
    const [list, setList] = React.useState([] as any[]);
    const peripherals = React.useMemo(
        () => new Map<string, BrvPeripheral>(),
        [],
    );

    return (
        <AppContext.Provider
            value={{
                chartData,
                setChartData,
                isCollecting,
                setIsCollecting,
                isScanInProgress,
                setIsScanInProgress,
                list,
                setList,
                peripherals,
            }}>
            <App />
        </AppContext.Provider>
    );
};

export default AppCtx;
