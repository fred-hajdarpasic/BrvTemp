/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */
import React from 'react';

import {Button, TouchableHighlight, View} from 'react-native';
import AppContext from './AppContext';
import Colors from './Colors';

export interface CollectionStartStopControllerProps {
    disabled: boolean;
}

const CollectionStartStopController = (props: CollectionStartStopControllerProps): JSX.Element => {
    const {isCollecting, setIsCollecting} = React.useContext(AppContext);
    return (
        <View>
            <View style={{ margin: 10, flexDirection: 'row', justifyContent: 'space-between'}}>
                <TouchableHighlight style={{flexGrow: 5}}>
                    <Button
                        disabled={isCollecting || props.disabled}
                        color={Colors.green}
                        title="Start"
                        onPress={() => {
                            console.log('Start collection pressed');
                            setIsCollecting(true);
                        }}
                    />
                </TouchableHighlight>
                <Button
                        title="Fred"
                        color={Colors.green}
                        onPress={() => {
                            console.log('Fred');
                        }}
                    />
                <TouchableHighlight style={{flexGrow: 5}}>
                    <Button
                        disabled={!isCollecting || props.disabled}
                        title="Stop"
                        color={Colors.red}
                        onPress={() => {
                            console.log('Stop collection pressed');
                            setIsCollecting(false);
                        }}
                    />
                </TouchableHighlight>
            </View>
        </View>
    );
};

export default CollectionStartStopController;
