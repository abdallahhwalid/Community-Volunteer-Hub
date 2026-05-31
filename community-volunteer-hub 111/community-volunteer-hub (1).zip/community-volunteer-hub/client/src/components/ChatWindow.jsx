import { useState } from 'react';

const mockMessages = {
  1: [
    { id: 1, from: 'Ahmed', text: 'Hi! Can you help with the event?', time: '10:20 AM', mine: false },
    { id: 2, from: 'me', text: 'Sure! What do you need?', time: '10:25 AM', mine: true },
    { id: 3, from: 'Ahmed', text: 'Can you help with the event?', time: '10:30 AM', mine: false },
  ],
  2: [
    { id: 1, from: 'Sara', text: 'You were so helpful yesterday!', time: 'Yesterday', mine: false },
    { id: 2, from: 'me', text: 'Happy to help anytime!', time: 'Yesterday', mine: true },
    { id: 3, from: 'Sara', text: 'Thank you so much!', time: 'Yesterday', mine: false },
  ],
  3: [
    { id: 1, from: 'Omar', text: 'When are you available?', time: 'Monday', mine: false },
  ],
};

export default function ChatWindow({ conversation }) {
  const [messages, setMessages] = useState(mockMessages[conversation.id] || []);
  const [newMessage, setNewMessage] = useState('');

  const sendMessage = () => {
    if (!newMessage.trim()) return;
    const msg = {
      id: messages.length + 1,
      from: 'me',
      text: newMessage,
      time: 'Just now',
      mine: true,
    };
    setMessages([...messages, msg]);
    setNewMessage('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') sendMessage();
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.avatar}>{conversation.name[0]}</div>
        <span style={styles.name}>{conversation.name}</span>
      </div>

      {/* Messages */}
      <div style={styles.messages}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              ...styles.messageWrapper,
              justifyContent: msg.mine ? 'flex-end' : 'flex-start',
            }}
          >
            <div
              style={{
                ...styles.bubble,
                backgroundColor: msg.mine ? '#2d6a2d' : '#f0f0f0',
                color: msg.mine ? 'white' : 'black',
              }}
            >
              <p style={styles.bubbleText}>{msg.text}</p>
              <span style={styles.time}>{msg.time}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div style={styles.inputArea}>
        <input
          style={styles.input}
          type="text"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button style={styles.sendBtn} onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}

const styles = {
  container: { display: 'flex', flexDirection: 'column', height: '100%' },
  header: { display: 'flex', alignItems: 'center', padding: '15px 20px', borderBottom: '1px solid #ddd', backgroundColor: '#fafafa' },
  avatar: { width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#2d6a2d', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '16px', marginRight: '12px' },
  name: { fontWeight: 'bold', fontSize: '16px' },
  messages: { flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' },
  messageWrapper: { display: 'flex' },
  bubble: { maxWidth: '60%', padding: '10px 15px', borderRadius: '18px' },
  bubbleText: { margin: '0 0 4px 0', fontSize: '14px' },
  time: { fontSize: '11px', opacity: 0.7 },
  inputArea: { display: 'flex', padding: '15px', borderTop: '1px solid #ddd', gap: '10px' },
  input: { flex: 1, padding: '10px 15px', borderRadius: '25px', border: '1px solid #ddd', fontSize: '14px', outline: 'none' },
  sendBtn: { padding: '10px 25px', backgroundColor: '#2d6a2d', color: 'white', border: 'none', borderRadius: '25px', cursor: 'pointer', fontWeight: 'bold' },
};