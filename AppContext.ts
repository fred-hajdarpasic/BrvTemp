import React from 'react';
import {ChartData} from './Chart';
import {BrvPeripheral} from './types';

export interface Point {
    x: string;
    y: number;
}

export interface AppContextType {
    chartData: ChartData;
    setChartData: React.Dispatch<React.SetStateAction<ChartData>>;
    isCollecting: boolean;
    setIsCollecting: React.Dispatch<React.SetStateAction<boolean>>;
    isScanInProgress: boolean;
    setIsScanInProgress: React.Dispatch<React.SetStateAction<boolean>>;
    list: any[];
    setList: React.Dispatch<React.SetStateAction<any[]>>;
    peripherals: Map<string, BrvPeripheral>;
}

const AppContext = React.createContext<AppContextType>({
    chartData: {a: [], b: [], c: [], d: []},
    setChartData: () => {},
    isCollecting: false,
    setIsCollecting: () => {},
    isScanInProgress: false,
    setIsScanInProgress: () => {},
    list: [],
    setList: () => {},
    peripherals: new Map<string, BrvPeripheral>(),
});

export default AppContext;
