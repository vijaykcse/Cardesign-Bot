import { useState } from "react";
import "./App.css";
import chatLogo from "./assets/chatbot-logo.png";

function App() {
  const [inputMessage, setInputMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSendMessage = async () => {
    if (inputMessage.trim() === "") return;

    const userMessage = { sender: "user", text: inputMessage };
    setChatHistory((prev) => [...prev, userMessage]);
    setInputMessage("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: inputMessage }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      // Clean the response text to remove unwanted characters and prefixes
      const cleanedResponse = data.response
        .replace(/^(?:response:)?\s*/i, "") // Remove 'response:' or 'Answer:' at the start
        .replace(/[\{\}"]/g, "") // Remove {, }, and "
        .replace(/\s+/g, " ") // Replace multiple spaces with a single space
        .trim(); // Trim whitespace

      // Create the bot message
      const botMessage = {
        sender: "bot",
        text: cleanedResponse || "No response available.",
      };
      setChatHistory((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage = {
        sender: "bot",
        text: "Error occurred. Please try again.",
      };
      setChatHistory((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-container">
      <header className="chat-header">
        <img src={chatLogo} className="chat-logo" alt="Chatbot Logo" />
        <h1>Car Design Improvement Model</h1>
      </header>

      <div className="chat-box">
        <div className="chat-history">
          {chatHistory.map((message, index) => (
            <div key={index} className={`chat-message ${message.sender}`}>
              <span>{message.text}</span>
            </div>
          ))}
        </div>

        <div className="chat-input-container">
          <input
            type="text"
            className="chat-input"
            placeholder="Type your message here..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
          />
          <button
            className="send-button"
            onClick={handleSendMessage}
            disabled={loading}
          >
            {loading ? "Sending..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
