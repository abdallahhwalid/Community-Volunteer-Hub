import { useState, useEffect } from 'react';
import ChatWindow from '../components/ChatWindow';

export default function MessagesPage() {
  const [conversations, setConversations]   = useState([]);
  const [selectedConvo, setSelectedConvo]   = useState(null);
  const [loading, setLoading]               = useState(true);
  const [currentUserId, setCurrentUserId]   = useState(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const response = await fetch('/messages/api');
      const data     = await response.json();

      if (data.success && data.messages.length > 0) {
        // ── Determine currentUserId from the API session ──
        // We fetch /api/profile to get the logged-in user's id reliably
        let userId = null;
        try {
          const profileRes  = await fetch('/api/profile');
          const profileData = await profileRes.json();
          userId = profileData?.user?._id || null;
        } catch {
          // fallback: try to infer from messages (less reliable)
          const first = data.messages[0];
          userId = first?.receiver?._id;
        }

        setCurrentUserId(userId);
        const grouped = groupConversations(data.messages, userId);
        setConversations(grouped);
      }
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const groupConversations = (messages, userId) => {
    const map = {};
    messages.forEach(msg => {
      const senderId   = msg.sender?._id;
      const receiverId = msg.receiver?._id;
      const other      = senderId === userId ? msg.receiver : msg.sender;
      if (!other) return;

      const otherId = other._id;
      if (!map[otherId]) {
        map[otherId] = {
          id:          otherId,
          userId:      otherId,
          name:        other.name,
          messages:    [],
          lastMessage: '',
          time:        '',
          unread:      0
        };
      }
      map[otherId].messages.push(msg);
      map[otherId].lastMessage = msg.content || '📎 Attachment';
      map[otherId].time        = new Date(msg.createdAt).toLocaleDateString();
      if (!msg.isRead && receiverId === userId) {
        map[otherId].unread++;
      }
    });
    return Object.values(map);
  };

  return (
    <div style={styles.container}>

      {/* ── SIDEBAR ── */}
      <div style={styles.sidebar}>
        <h2 style={styles.sidebarTitle}>💬 Messages</h2>

        {loading && <p style={{ padding: '15px', color: '#94A3B8' }}>Loading...</p>}

        {!loading && conversations.length === 0 && (
          <p style={{ padding: '15px', color: '#94A3B8', fontSize: '14px' }}>
            No conversations yet.
          </p>
        )}

        {conversations.map((convo) => (
          <div
            key={convo.id}
            style={{
              ...styles.convoItem,
              backgroundColor: selectedConvo?.id === convo.id ? '#EEF2FF' : 'white'
            }}
            onClick={() => setSelectedConvo({ ...convo, currentUserId })}
          >
            <div style={styles.avatar}>{convo.name?.[0]?.toUpperCase()}</div>
            <div style={styles.convoInfo}>
              <div style={styles.convoHeader}>
                <span style={styles.convoName}>{convo.name}</span>
                <span style={styles.convoTime}>{convo.time}</span>
              </div>
              <div style={styles.convoFooter}>
                <span style={styles.lastMessage}>{convo.lastMessage}</span>
                {convo.unread > 0 && (
                  <span style={styles.badge}>{convo.unread}</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── CHAT AREA ── */}
      <div style={styles.chatArea}>
        {selectedConvo ? (
          <ChatWindow conversation={selectedConvo} />
        ) : (
          <div style={styles.placeholder}>
            <div style={{ fontSize: '48px', opacity: 0.3 }}>💬</div>
            <p>Select a conversation to start chatting</p>
          </div>
        )}
      </div>

    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    height: '100vh',
    fontFamily: 'sans-serif'
  },
  sidebar: {
    width: '300px',
    borderRight: '1px solid #E2E8F0',
    overflowY: 'auto',
    backgroundColor: '#F8FAFC'
  },
  sidebarTitle: {
    padding: '20px',
    margin: 0,
    borderBottom: '1px solid #E2E8F0',
    color: '#1E3A8A',
    fontSize: '17px',
    fontWeight: '700'
  },
  convoItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '14px 16px',
    cursor: 'pointer',
    borderBottom: '1px solid #F1F5F9',
    transition: 'background 0.15s'
  },
  avatar: {
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    backgroundColor: '#1E3A8A',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: '17px',
    marginRight: '12px',
    flexShrink: 0
  },
  convoInfo:   { flex: 1, overflow: 'hidden' },
  convoHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '4px' },
  convoName:   { fontWeight: '700', fontSize: '14px', color: '#1E293B' },
  convoTime:   { fontSize: '11px', color: '#94A3B8' },
  convoFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  lastMessage: {
    fontSize: '12px',
    color: '#64748B',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    flex: 1
  },
  badge: {
    backgroundColor: '#1E3A8A',
    color: 'white',
    borderRadius: '50%',
    width: '20px',
    height: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '11px',
    fontWeight: '700',
    flexShrink: 0,
    marginLeft: '6px'
  },
  chatArea: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column'
  },
  placeholder: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#94A3B8',
    fontSize: '15px',
    gap: '12px'
  }
};
