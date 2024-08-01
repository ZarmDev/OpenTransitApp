import { View, Animated, Dimensions, PanResponder, StyleSheet } from 'react-native';
import { useRef, useState } from 'react';

const styles = StyleSheet.create({
    // container: {
    //   flex: 1
    // },
    draggableContainer: {
        width: '100%',
        backgroundColor: 'skyblue',
        borderRadius: 10,
    },
});

// heavy use of AI
export function DraggableContainer(props: any) {
    // Suggested by AI - good to keep in mind.
    // const position = useRef(new Animated.ValueXY()).current;
    const [removeAlerts, setRemoveAlerts] = useState(false);
    // Drag gestures
    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onPanResponderMove: (evt, gestureState) => {
                // Calculate the new Y position
                let newG = gestureState.dy;
                let newY = evt.nativeEvent.pageY;

                // if the mouse y is near the height of the screen - the current height of the container
                var collisionArea = props.height;
                const range = 100;
                // console.log(newY > collisionArea - range, newY < collisionArea + range)
                if (!(newY > collisionArea - range && newY < collisionArea + range)) {
                    return false
                }

                // Prevent container from going too far off
                let max = 100;
                if (newY < max) {
                    newY = max;
                }

                let min = 800;
                if (newY > min) {
                    newY = min;
                }

                setRemoveAlerts(true)

                // console.log(newY, 'newY ', newG, 'newG')
                // position.setValue({ x: 0, y: newG - 35});
                // newY -= 40;
                props.setHeight(Dimensions.get('window').height - newY)
            },
            onPanResponderRelease: () => {
                // empty... (when mouse released)
                setRemoveAlerts(false)
            },
        })
    ).current;

    return (
        <View>
            <Animated.View
                style={[
                    styles.draggableContainer,
                    {
                        height: props.height,
                        // transform: [{ translateY: position.y }],
                    },
                ]}
                {...panResponder.panHandlers}
            >
                {removeAlerts ? <></> : <></>}
            </Animated.View>
        </View>
    );
};