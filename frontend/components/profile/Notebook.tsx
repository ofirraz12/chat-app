import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import Markdown from "react-native-markdown-display";
import { getItemContent, updateNotebook, deleteItem } from "@/api/userGridApi";
import { useAuth } from "@/context/authContext";
import { icons } from "@/lib/consts";
import CostumeButton from "@/components/general/CustomeButton";

interface NotebookProps {
  notebookId: number;
  onClose: () => void;
}

const Notebook: React.FC<NotebookProps> = ({ notebookId, onClose }) => {
  const { user } = useAuth();
  const userId = user?.id;

  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  useEffect(() => {
    if (!userId || !notebookId) return;

    setLoading(true);
    setError(null);

    const fetchNotebook = async () => {
      try {
        const data = await getItemContent(userId, notebookId);
        setTitle(data.item.title || "Untitled Notebook");
        setContent(data.item.text_content || "");
      } catch (err) {
        setError("Failed to load notebook.");
      } finally {
        setLoading(false);
      }
    };

    fetchNotebook();
  }, [userId, notebookId]);

  const handleSave = async () => {
    if (!userId) return;
    try {
      setSaving(true);
      await updateNotebook(userId, notebookId, title, content, false);
      setSuccessMessage("Notebook saved successfully!");
      setTimeout(() => setSuccessMessage(null), 2000);
    } catch (err) {
      setError("Failed to save notebook.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!userId) return;
    try {
      await deleteItem(userId, notebookId);
      onClose();
    } catch (err) {
      setError("Failed to delete notebook.");
    }
  };

  if (loading) return <ActivityIndicator size="large" color="#000" />;
  if (error) return <Text style={{ color: "red", textAlign: "center" }}>{error}</Text>;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {successMessage && <Text style={styles.successMessage}>{successMessage}</Text>}

        <TextInput
          style={styles.titleInput}
          value={title}
          onChangeText={setTitle}
          placeholder="Notebook Title"
        />

        {isEditing ? (
          <TextInput
            style={styles.textArea}
            value={content}
            onChangeText={setContent}
            placeholder="Start writing..."
            multiline
            autoFocus
          />
        ) : (
          <View style={styles.markdownContainer}>
            <TouchableOpacity onPress={() => setIsEditing(true)}>
              <Markdown>{String(content.trim() || "*Tap to edit...*")}</Markdown>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <View style={styles.buttonContainer}>
        <View style={styles.saveCloseContainer}>
          <CostumeButton
            Title="Save"
            onPress={handleSave}
            className={{
              TouchableOpacity: "bg-blue-500 px-4 py-2 rounded",
              Text: "text-white text-lg",
            }}
          />
          <CostumeButton
            Title="Close"
            onPress={onClose}
            className={{
              TouchableOpacity: "bg-red-500 px-4 py-2 rounded",
              Text: "text-white text-lg",
            }}
          />
        </View>
        <CostumeButton
          onPress={handleDelete}
          icon={icons.binIcon}
          className={{
            TouchableOpacity: "bg-transparent p-3",
            Text: "",
          }}
          iconWindStyle="self-center justify-center"
          iconStyle={{
            width: 30,
            height: 30,
            resizeMode: "contain",
          }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  titleInput: {
    fontSize: 20,
    fontWeight: "bold",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    marginBottom: 10,
    padding: 5,
  },
  textArea: {
    fontSize: 16,
    minHeight: 325,
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    textAlignVertical: "top",
    backgroundColor: "#f9f9f9",
  },
  markdownContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    minHeight: 325,
    backgroundColor: "#f9f9f9",
  },
  buttonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: "#ccc",
  },
  saveCloseContainer: {
    flexDirection: "row",
    gap: 10,
  },
  successMessage: {
    color: "green",
    textAlign: "center",
    fontSize: 16,
    marginBottom: 10,
    fontWeight: "bold",
  },
});

export default Notebook;
