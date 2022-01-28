import React from 'react';
import {Point} from './AppContext';
import {LineChart} from 'react-native-chart-kit';
import {Dimensions, Text} from 'react-native';

export interface ChartData {
    a: Point[];
    b: Point[];
    c: Point[];
    d: Point[];
}

export interface ChartProps {
    chartData: ChartData;
}

export const Chart = (props: ChartProps) => {
    let sampleData = React.useMemo(() => {
        return {
            labels: props.chartData.a.map((p, i) => (i % 4 === 0 ? p.x : '')),
            datasets: [
                {
                    data: props.chartData.a.map(p => p.y),
                    color: (opacity = 1) => `rgba(255,0,0,${opacity})`,
                },
                {
                    data: props.chartData.b.map(p => p.y),
                    color: (opacity = 1) => `rgba(0,0,102,${opacity})`,
                },
                {
                    data: props.chartData.c.map(p => p.y),
                    color: (opacity = 1) => `rgba(0,102,0,${opacity})`,
                },
                {
                    data: props.chartData.d.map(p => p.y),
                    color: (opacity = 1) => `rgba(0,0,0,${opacity})`,
                },
            ],
            legend: ['Tip [°C]', 'Body [°C]', 'Chip [°C]', 'Battery [%]'],
        };
    }, [props]);
    if (props.chartData.a.length > 0) {
        const tip = props.chartData.a[props.chartData.a.length - 1].y;
        const body = props.chartData.b[props.chartData.b.length - 1].y;
        const chip = props.chartData.c[props.chartData.c.length - 1].y;
        const battery = props.chartData.d[props.chartData.d.length - 1].y;
        return (
            <>
                <LineChart
                    data={sampleData}
                    width={Dimensions.get('screen').width - 16} // from react-native
                    height={220}
                    // yAxisLabel="$"
                    // yAxisSuffix=""
                    yAxisInterval={1} // optional, defaults to 1
                    chartConfig={{
                        backgroundColor: '#e26a00',
                        backgroundGradientFrom: '#fb8c00',
                        backgroundGradientTo: '#ffa726',
                        decimalPlaces: 2, // optional, defaults to 2dp
                        color: (opacity = 1) =>
                            `rgba(255, 255, 255, ${opacity})`,
                        labelColor: (opacity = 1) =>
                            `rgba(255, 255, 255, ${opacity})`,
                        style: {
                            borderRadius: 16,
                        },
                        propsForDots: {
                            r: '3',
                            strokeWidth: '2',
                            stroke: '#ffa726',
                        },
                    }}
                    bezier
                />
                <Text>
                    Tip: {tip}, Body: {body}, Chip: {chip}, Battery: {battery}
                </Text>
            </>
        );
    } else {
        return null;
    }
};
