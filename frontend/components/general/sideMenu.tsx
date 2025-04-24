import React, { useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, FlatList, StyleSheet, PanResponder, Animated, Dimensions
} from 'react-native';

type Item = {
  Id: string;
  name: string;
};

type SideMenuProps = {
  List: Item[];
  onSelect: (sessionId: string) => void;
  onClose: () => void;
  setMenuVisible: (visible: boolean) => void;
};

const SCREEN_WIDTH = Dimensions.get('window').width;
const MENU_WIDTH = SCREEN_WIDTH * 0.6;

const SideMenu: React.FC<SideMenuProps> = ({ List, onSelect, onClose, setMenuVisible }) => {
  const translateX = useRef(new Animated.Value(MENU_WIDTH)).current;

  // Slide in animation
  useEffect(() => {
    Animated.timing(translateX, {
      toValue: 0,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  // Swipe-to-close
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        // Only allow dragging right (closing)
        if (gestureState.dx > 0) {
          translateX.setValue(gestureState.dx);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx > MENU_WIDTH / 3) {
          // Close if dragged far enough
          Animated.timing(translateX, {
            toValue: MENU_WIDTH,
            duration: 200,
            useNativeDriver: true,
          }).start(() => setMenuVisible(false));
        } else {
          // Snap back if not enough drag
          Animated.timing(translateX, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  return (
    <Animated.View
      style={[styles.menuContainer, { transform: [{ translateX }] }]}
      {...panResponder.panHandlers}
    >
      <FlatList
        data={List}
        keyExtractor={(item) => item.Id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => {
              onSelect(item.Id);
              onClose();
            }}
          >
            <View style={styles.Item}>
              <Text style={styles.Text}>{item.name}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </Animated.View>
  );
};

export default SideMenu;

const styles = StyleSheet.create({
  menuContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: '60%',
    height: '100%',
    backgroundColor: '#F9F9F9',
    padding: 16,
    zIndex: 10,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: -2, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  Item: {
    backgroundColor: '#E3E3E3',
    paddingLeft: 10,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    borderRadius: 15,
  },
  Text: {
    fontSize: 16,
    color: '#333',
  },
});
