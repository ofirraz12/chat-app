// SideMenu.tsx
import React from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';

type Item = {
  Id: string;
  name: string;
};

type SideMenuProps = {
  List: Item[];
  onSelect: (sessionId: string) => void;
  onClose: () => void;
};

const SideMenu: React.FC<SideMenuProps> = ({ List, onSelect, onClose }) => {
  return (
    <View style={styles.menuContainer}>
      <FlatList
        data={List}
        keyExtractor={(item) => item.Id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => { onSelect(item.Id); onClose(); }}>
            <View style={styles.Item}>
              <Text style={styles.Text}>{item.name}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
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
    backgroundColor: '#ddd',
    padding: 16,
    zIndex: 10,
  },
  Item: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  Text: {
    fontSize: 16,
    color: '#333',
  },
});
