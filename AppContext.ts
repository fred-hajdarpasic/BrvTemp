import React from 'react';
import {BrvPeripheral} from './types';

export interface Point {
    x: string;
    y: number;
}

export interface AppContextType {
    a: Point[];
    setA: React.Dispatch<React.SetStateAction<Point[]>>;
    b: Point[];
    setB: React.Dispatch<React.SetStateAction<Point[]>>;
    c: Point[];
    setC: React.Dispatch<React.SetStateAction<Point[]>>;
    d: Point[];
    setD: React.Dispatch<React.SetStateAction<Point[]>>;
    addA: (p: Point) => void;
    addB: (p: Point) => void;
    addC: (p: Point) => void;
    addD: (p: Point) => void;
    isCollecting: boolean;
    setIsCollecting: React.Dispatch<React.SetStateAction<boolean>>;
    list: any[];
    setList: React.Dispatch<React.SetStateAction<any[]>>;
    peripherals: Map<string, BrvPeripheral>;
}

const AppContext = React.createContext<AppContextType>({
    a: [],
    setA: () => {},
    b: [],
    setB: () => {},
    c: [],
    setC: () => {},
    d: [],
    setD: () => {},
    addA: () => {},
    addB: () => {},
    addC: () => {},
    addD: () => {},
    isCollecting: false,
    setIsCollecting: () => {},
    list: [],
    setList: () => {},
    peripherals: new Map<string, BrvPeripheral>(),
});

export default AppContext;
