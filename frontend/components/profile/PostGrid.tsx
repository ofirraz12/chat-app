import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  Image,
} from "react-native";
import DraggableFlatList, { RenderItemParams } from "react-native-draggable-flatlist";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { responsiveHeight as RH, responsiveWidth as RW } from "react-native-responsive-dimensions";
import { icons } from "@/lib/consts";
import { useAuth } from "@/context/authContext";
import { getAllItemsByUser, updateFolder, deleteItem } from "@/api/userGridApi";
import Notebook from "./Notebook"; // ✅ Import the Notebook component
import { useFocusEffect } from "@react-navigation/native";
import CostumeButton from "../general/CustomeButton";

/* ------------------ *
 *   Type & Data      *
 * ------------------ */
type ItemType = {
  id: number;
  title: string;
  type: "folder" | "notebook";
  parent_id: number | null;
};

/* ------------------------------------------------------ *
 * 1) PARENT COMPONENT: PostGrid                          *
 * ------------------------------------------------------ */
export function PostGrid() {
  const { user } = useAuth();
  const userId = user?.id;
  const [data, setData] = useState<ItemType[]>([]);
  const [currentParent, setCurrentParent] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"all" | "folders" | "notes">("all");
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedNotebook, setSelectedNotebook] = useState<number | null>(null);

  /** ✅ Extracted fetchData function */
  const fetchData = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const fetchedItems = await getAllItemsByUser(userId);
      setData(fetchedItems); // ✅ Update state with new data
    } catch (error) {
      console.error("Failed to fetch items:", error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  /** ✅ Automatically fetch data when the screen is focused */
  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  /** ✅ Manually refresh data when a notebook is closed */
  const handleCloseNotebook = () => {
    setSelectedNotebook(null); 
    fetchData(); // ✅ Refresh the list when closing a notebook
  };

  /** ✅ Delete a folder and refresh the list */
  const handleDeleteFolder = async () => {
    if (!userId || !currentParent) return;
    try {
      setLoading(true);
      await deleteItem(userId, currentParent);
      setData((prevData) => prevData.filter((item) => item.id !== currentParent));
      setCurrentParent(null);
      fetchData(); // ✅ Refresh the list after deletion
    } catch (error) {
      console.error("Error deleting folder:", error);
    } finally {
      setLoading(false);
    }
  };

  /** ✅ Filter items dynamically */
  const filteredItems = useMemo(() => {
    return data
      .filter((item) => {
        if (item.parent_id !== currentParent) return false;
        if (searchQuery && !item.title.toLowerCase().includes(searchQuery.toLowerCase())) {
          return false;
        }
        if (activeTab === "folders" && item.type !== "folder") return false;
        if (activeTab === "notes" && item.type !== "notebook") return false;
        return true;
      })
      .map((item) => ({ ...item }));
  }, [data, currentParent, searchQuery, activeTab]);

  /** ✅ Handle opening a notebook or navigating into a folder */
  const handleItemPress = useCallback((item: ItemType) => {
    if (item.type === "folder") {
      setCurrentParent(item.id);
    } else if (item.type === "notebook") {
      setSelectedNotebook(item.id);
    }
  }, []);

  /** ✅ Go back to the previous folder */
  const goBack = useCallback(() => {
    const parentItem = data.find((item) => item.id === currentParent);
    setCurrentParent(parentItem ? parentItem.parent_id : null);
  }, [data, currentParent]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        {selectedNotebook !== null ? (
          <Notebook notebookId={selectedNotebook} onClose={handleCloseNotebook} />
        ) : (
          <>
            <TextInput
              style={styles.searchBar}
              placeholder="Search notes or collections..."
              placeholderTextColor="#888"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />

            <View style={styles.tabs}>
              {["All", "Folders", "Notes"].map((tab) => (
                <TouchableOpacity
                  key={tab}
                  style={[styles.tab, activeTab === tab.toLowerCase() && styles.activeTab]}
                  onPress={() => setActiveTab(tab.toLowerCase() as "all" | "folders" | "notes")}
                >
                  <Text style={styles.tabText}>{tab}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {currentParent !== null && (
              <View style={styles.folderControls}>
                <TouchableOpacity style={styles.backButton} onPress={goBack}>
                  <Text style={styles.backText}>⬅ Back</Text>
                </TouchableOpacity>

                <CostumeButton
                  onPress={handleDeleteFolder}
                  className={{ TouchableOpacity: "", Text: "" }}
                  icon={icons.binIcon}
                  iconWindStyle="self-center justify-center right-2"
                  iconStyle={{
                    width: RW(8),
                    height: RH(4),
                    resizeMode: "contain",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                />
              </View>
            )}

            {loading ? (
              <ActivityIndicator size="large" color="#000" />
            ) : (
              <DraggableFlatList
                data={filteredItems} // ✅ Correct prop name
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item, drag, isActive }) => (
                  <TouchableOpacity
                    style={[styles.item, isActive && styles.draggingItem]}
                    onPress={() => handleItemPress(item)}
                    onLongPress={drag}
                  >
                    <Image source={item.type === "folder" ? icons.folderIcon : icons.notebookIcon} style={styles.icon} />
                    <Text style={styles.text}>{item.title}</Text>
                  </TouchableOpacity>
                )}
                onDragEnd={({ data }) => console.log(data)} // Handle reordering here
                nestedScrollEnabled
                contentContainerStyle={{ paddingBottom: RH(15) }}
              />

            )}
          </>
        )}
      </View>
    </GestureHandlerRootView>
  );
}

/* ------------------ *
 *       STYLES       *
 * ------------------ */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f4f4",
    paddingHorizontal: RW(5),
    paddingTop: RH(2),
  },
  searchBar: {
    width: "100%",
    height: RH(5),
    backgroundColor: "#fff",
    borderRadius: RW(2),
    paddingHorizontal: RW(4),
    fontSize: RH(2),
    marginBottom: RH(1),
    borderWidth: 1,
    borderColor: "#ddd",
  },
  tabs: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: RH(2),
  },
  tab: {
    paddingVertical: RH(1),
    paddingHorizontal: RW(6),
    borderRadius: RW(3),
    backgroundColor: "#ddd",
  },
  activeTab: {
    backgroundColor: "#737373",
  },
  tabText: {
    fontSize: RH(2),
    color: "#000",
    fontWeight: "500",
  },
  backButton: {
    marginBottom: RH(2),
    paddingVertical: RH(1),
    paddingHorizontal: RW(4),
    backgroundColor: "#ddd",
    borderRadius: RW(2),
    alignSelf: "flex-start",
  },
  backText: {
    fontSize: RH(2),
    color: "#333",
  },
  item: { // ✅ Fixed missing style
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: RH(2),
    marginVertical: RH(1),
    borderRadius: RW(3),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  draggingItem: { // ✅ Fixed missing style
    backgroundColor: "#ddd",
  },
  text: { // ✅ Fixed missing style
    fontSize: RH(2.2),
    fontWeight: "500",
  },
  icon: { // ✅ New style for icons
    width: RW(8), // Adjust as needed
    height: RH(4), // Adjust as needed
    marginRight: RW(3),
  },
  folderControls: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: RH(2),
  }
});


export default PostGrid;
