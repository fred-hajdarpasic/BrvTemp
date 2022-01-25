import React from 'react';
import {Point} from './AppContext';
import {LineChart} from 'react-native-chart-kit';
import {Dimensions} from 'react-native';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const Chart = (props: {a: Point[]; b: Point[]}) => {
    let sampleData = React.useMemo(() => {
        return {
            labels: props.a.map(p => p.x),
            datasets: [
                {
                    data: props.a.map(p => p.y),
                },
                {
                    data: props.b.map(p => p.y),
                },
            ],
        };
    }, [props.a, props.b]);
    if (props.a.length > 0 && props.b.length > 0) {
        return (
            <LineChart
                data={sampleData}
                width={Dimensions.get('screen').width} // from react-native
                height={220}
                // yAxisLabel="$"
                yAxisSuffix="°C"
                yAxisInterval={1} // optional, defaults to 1
                chartConfig={{
                    backgroundColor: '#e26a00',
                    backgroundGradientFrom: '#fb8c00',
                    backgroundGradientTo: '#ffa726',
                    decimalPlaces: 2, // optional, defaults to 2dp
                    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                    labelColor: (opacity = 1) =>
                        `rgba(255, 255, 255, ${opacity})`,
                    style: {
                        borderRadius: 16,
                    },
                    propsForDots: {
                        r: '6',
                        strokeWidth: '2',
                        stroke: '#ffa726',
                    },
                }}
                bezier
            />
        );
    } else {
        return null;
    }
};
