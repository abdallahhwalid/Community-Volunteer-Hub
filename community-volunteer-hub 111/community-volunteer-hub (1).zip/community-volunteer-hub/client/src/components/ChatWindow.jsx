import { useState } from 'react';

export default function ChatWindow({ conversation }) {
  const [messages, setMessages] = useState(conversation.messages || []);
  const [newMessage, setNewMessage] = useState('');
  const [error, setError] = useState('');

  const sendMessage = async () => {
    if (!newMessage.trim()) {
      setError('Message cannot be empty');
      return;
    }
    setError('');

    try {
      const response = await fetch('/messages/api/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiverId: conversation.userId,
          content: newMessage.trim()
        })
      });

      const data = await response.json();

      if (data.success) {
        setMessages([...messages, data.message]);
        setNewMessage('');
      } else {
        setError(data.error || 'Failed to send message');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    }
  };

  const markAsRead = async (msgId) => {
    try {
      await fetch(`/messages/${msgId}/read`, { method: 'PUT' });
      setMessages(messages.map(m => m._id === msgId ? { ...m, isRead: true } : m));
    } catch (err) {
      console.error('Failed to mark as read');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') sendMessage();
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.avatar}>{conversation.name[0]}</div>
        <span style={styles.name}>{conversation.name}</span>
      </div>

      <div style={styles.messages}>
        {messages.length === 0 && (
          <p style={{ textAlign: 'center', color: '#999', marginTop: '20px' }}>
            No messages yet. Start the conversation!
          </p>
        )}
        {messages.map((msg, index) => {
          const isMine = msg.sender?._id === conversation.currentUserId ||
                         msg.mine === true;
          return (
            <div key={msg._id || index} style={{ ...styles.messageWrapper, justifyContent: isMine ? 'flex-end' : 'flex-start' }}>
              <div style={{ ...styles.bubble, backgroundColor: isMine ? '#2d6a2d' : '#f0f0f0', color: isMine ? 'white' : 'black' }}>
                <p style={styles.bubbleText}>{msg.content || msg.text}</p>
                <span style={styles.time}>
                  {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                </span>
                {!isMine && !msg.isRead && (
                  <button onClick={() => markAsRead(msg._id)} style={styles.readBtn}>Mark read</button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {error && <p style={{ color: 'red', padding: '0 15px', fontSize: '13px' }}>{error}</p>}

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
  readBtn: { background: 'none', border: 'none', color: '#aaa', fontSize: '11px', cursor: 'pointer', padding: 0, marginTop: '4px' },
  inputArea: { display: 'flex', padding: '15px', borderTop: '1px solid #ddd', gap: '10px' },
  input: { flex: 1, padding: '10px 15px', borderRadius: '25px', border: '1px solid #ddd', fontSize: '14px', outline: 'none' },
  sendBtn: { padding: '10px 25px', backgroundColor: '#2d6a2d', color: 'white', border: 'none', borderRadius: '25px', cursor: 'pointer', fontWeight: 'bold' },
};