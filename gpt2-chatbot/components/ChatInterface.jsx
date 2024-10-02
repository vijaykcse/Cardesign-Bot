import React, { useState } from "react";
import axios from "axios";
import { AiOutlineSend } from "react-icons/ai";
import { MdOutlineFileUpload } from "react-icons/md";

const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [file, setFile] = useState(null);

  // Handle sending messages
  const handleSend = async () => {
    if (!inputMessage.trim()) return;

    // Add user message to state
    const newMessage = { text: inputMessage, sender: "user" };
    setMessages([...messages, newMessage]);

    try {
      // Send user message to backend for GPT-2 response
      const response = await axios.post("http://localhost:5000/api/chat", {
        message: inputMessage,
      });
      const botMessage = { text: response.data.response, sender: "bot" };
      setMessages((prevMessages) => [...prevMessages, botMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
    }

    setInputMessage("");
  };

  // Handle file upload
  const handleFileUpload = async (e) => {
    const uploadedFile = e.target.files[0];
    setFile(uploadedFile);

    const formData = new FormData();
    formData.append("file", uploadedFile);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/upload",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      setMessages([
        ...messages,
        {
          text: `File uploaded successfully: ${response.data.fileName}`,
          sender: "bot",
        },
      ]);
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.chatWindow}>
        {messages.map((message, index) => (
          <div
            key={index}
            style={
              message.sender === "user" ? styles.userMessage : styles.botMessage
            }
          >
            {message.text}
          </div>
        ))}
      </div>
      <div style={styles.inputContainer}>
        <input
          type="file"
          style={{ display: "none" }}
          id="file-upload"
          onChange={handleFileUpload}
        />
        <label htmlFor="file-upload">
          <MdOutlineFileUpload style={styles.uploadIcon} />
        </label>
        <input
          style={styles.input}
          type="text"
          placeholder="Type your message..."
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button style={styles.sendButton} onClick={handleSend}>
          <AiOutlineSend style={styles.sendIcon} />
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    backgroundColor: "#f5f5f5",
  },
  chatWindow: {
    width: "60%",
    height: "70%",
    overflowY: "auto",
    backgroundColor: "white",
    border: "1px solid #ccc",
    borderRadius: "8px",
    padding: "20px",
    marginBottom: "20px",
  },
  inputContainer: {
    display: "flex",
    alignItems: "center",
    width: "60%",
  },
  input: {
    flex: 1,
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    marginRight: "10px",
  },
  sendButton: {
    backgroundColor: "#007bff",
    border: "none",
    borderRadius: "8px",
    padding: "10px",
    cursor: "pointer",
  },
  sendIcon: {
    color: "white",
    fontSize: "24px",
  },
  uploadIcon: {
    fontSize: "24px",
    color: "#007bff",
    cursor: "pointer",
    marginRight: "10px",
  },
  userMessage: {
    backgroundColor: "#007bff",
    color: "white",
    alignSelf: "flex-end",
    borderRadius: "8px",
    padding: "10px",
    margin: "5px 0",
  },
  botMessage: {
    backgroundColor: "#f1f0f0",
    alignSelf: "flex-start",
    borderRadius: "8px",
    padding: "10px",
    margin: "5px 0",
  },
};

export default ChatInterface;
