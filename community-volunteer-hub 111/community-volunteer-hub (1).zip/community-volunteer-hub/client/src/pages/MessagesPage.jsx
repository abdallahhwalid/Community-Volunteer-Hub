import { useState, useEffect } from 'react';
import ChatWindow from '../components/ChatWindow';

export default function MessagesPage() {
  const [conversations, setConversations] = useState([]);
  const [selectedConvo, setSelectedConvo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const response = await fetch('/messages/api');
      const data = await response.json();

      if (data.success) {
        const grouped = groupConversations(data.messages);
        setConversations(grouped);
        if (data.messages.length > 0) {
          const userId = data.messages[0].receiver?._id;
          setCurrentUserId(userId);
        }
      }
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const groupConversations = (messages) => {
    const map = {};
    messages.forEach(msg => {
      const other = msg.sender?._id === currentUserId ? msg.receiver : msg.sender;
      if (!other) return;
      if (!map[other._id]) {
        map[other._id] = {
          id: other._id,
          userId: other._id,
          name: other.name,
          messages: [],
          lastMessage: '',
          time: '',
          unread: 0
        };
      }
      map[other._id].messages.push(msg);
      map[other._id].lastMessage = msg.content;
      map[other._id].time = new Date(msg.createdAt).toLocaleDateString();
      if (!msg.isRead && msg.receiver?._id === currentUserId) {
        map[other._id].unread++;
      }
    });
    return Object.values(map);
  };

  return (
    <div style={styles.container}>
      <div style={styles.sidebar}>
        <h2 style={styles.sidebarTitle}>Messages</h2>
        {loading && <p style={{ padding: '15px', color: '#999' }}>Loading...</p>}
        {!loading && conversations.length === 0 && (
          <p style={{ padding: '15px', color: '#999' }}>No conversations yet.</p>
        )}
        {conversations.map((convo) => (
          <div
            key={convo.id}
            style={{ ...styles.convoItem, backgroundColor: selectedConvo?.id === convo.id ? '#e8f4e8' : 'white' }}
            onClick={() => setSelectedConvo({ ...convo, currentUserId })}
          >
            <div style={styles.avatar}>{convo.name[0]}</div>
            <div style={styles.convoInfo}>
              <div style={styles.convoHeader}>
                <span style={styles.convoName}>{convo.name}</span>
                <span style={styles.convoTime}>{convo.time}</span>
              </div>
              <div style={styles.convoFooter}>
                <span style={styles.lastMessage}>{convo.lastMessage}</span>
                {convo.unread > 0 && <span style={styles.badge}>{convo.unread}</span>}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={styles.chatArea}>
        {selectedConvo ? (
          <ChatWindow conversation={selectedConvo} />
        ) : (
          <div style={styles.placeholder}>
            <p>Select a conversation to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { display: 'flex', height: '100vh', fontFamily: 'sans-serif' },
  sidebar: { width: '300px', borderRight: '1px solid #ddd', overflowY: 'auto', backgroundColor: '#fafafa' },
  sidebarTitle: { padding: '20px', margin: 0, borderBottom: '1px solid #ddd', color: '#2d6a2d' },
  convoItem: { display: 'flex', alignItems: 'center', padding: '15px', cursor: 'pointer', borderBottom: '1px solid #eee' },
  avatar: { width: '45px', height: '45px', borderRadius: '50%', backgroundColor: '#2d6a2d', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '18px', marginRight: '12px', flexShrink: 0 },
  convoInfo: { flex: 1, overflow: 'hidden' },
  convoHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '4px' },
  convoName: { fontWeight: 'bold', fontSize: '14px' },
  convoTime: { fontSize: '12px', color: '#999' },
  convoFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  lastMessage: { fontSize: '13px', color: '#666', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  badge: { backgroundColor: '#2d6a2d', color: 'white', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', flexShrink: 0 },
  chatArea: { flex: 1, display: 'flex', flexDirection: 'column' },
  placeholder: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', fontSize: '16px' },
};