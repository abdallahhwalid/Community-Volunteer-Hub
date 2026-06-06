import { useState } from 'react';

export default function ChatWindow({ conversation }) {
  const [messages, setMessages] = useState(conversation.messages || []);
  const [newMessage, setNewMessage] = useState('');
  const [error, setError]           = useState('');
  const [sending, setSending]       = useState(false);

  const sendMessage = async () => {
    if (!newMessage.trim()) {
      setError('Message cannot be empty');
      return;
    }
    setError('');
    setSending(true);

    try {
      const response = await fetch('/messages/api/send', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiverId: conversation.userId,
          content:    newMessage.trim()
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
    } finally {
      setSending(false);
    }
  };

  const markAsRead = async (msgId) => {
    try {
      await fetch(`/messages/${msgId}/read`, { method: 'PUT' });
      setMessages(messages.map(m =>
        m._id === msgId ? { ...m, isRead: true } : m
      ));
    } catch {
      console.error('Failed to mark as read');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div style={styles.container}>

      {/* ── Header ── */}
      <div style={styles.header}>
        <div style={styles.avatar}>
          {conversation.name?.[0]?.toUpperCase()}
        </div>
        <div>
          <div style={styles.name}>{conversation.name}</div>
          <div style={styles.status}>Community member</div>
        </div>
      </div>

      {/* ── Messages ── */}
      <div style={styles.messages}>
        {messages.length === 0 && (
          <p style={{ textAlign: 'center', color: '#94A3B8', marginTop: '20px', fontSize: '14px' }}>
            No messages yet. Say hello! 👋
          </p>
        )}

        {messages.map((msg, index) => {
          const isMine =
            msg.sender?._id === conversation.currentUserId ||
            msg.mine === true;

          const time = msg.createdAt
            ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : 'Just now';

          return (
            <div
              key={msg._id || index}
              style={{
                ...styles.messageWrapper,
                justifyContent: isMine ? 'flex-end' : 'flex-start'
              }}
            >
              <div
                style={{
                  ...styles.bubble,
                  backgroundColor: isMine ? '#1E3A8A' : '#F1F5F9',
                  color:           isMine ? 'white'   : '#1E293B',
                  borderBottomRightRadius: isMine ? '4px' : '18px',
                  borderBottomLeftRadius:  isMine ? '18px' : '4px'
                }}
              >
                {/* Text */}
                {(msg.content || msg.text) && (
                  <p style={styles.bubbleText}>{msg.content || msg.text}</p>
                )}

                {/* File attachment */}
                {msg.fileUrl && (() => {
                  const isImage = msg.fileType === 'image' ||
                    /\.(jpg|jpeg|png|gif|webp)$/i.test(msg.fileUrl);
                  const isVideo = msg.fileType === 'video' ||
                    /\.(mp4|mov|avi|webm)$/i.test(msg.fileUrl);

                  if (isImage) return (
                    <img
                      src={msg.fileUrl}
                      alt="attachment"
                      style={{ maxWidth: '200px', borderRadius: '8px', marginTop: '6px', display: 'block' }}
                      onClick={() => window.open(msg.fileUrl, '_blank')}
                    />
                  );
                  if (isVideo) return (
                    <video
                      src={msg.fileUrl}
                      controls
                      style={{ maxWidth: '200px', borderRadius: '8px', marginTop: '6px' }}
                    />
                  );
                  const fname = msg.fileUrl.split('/').pop();
                  return (
                    <a
                      href={msg.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        marginTop: '6px', fontSize: '13px',
                        color: isMine ? 'rgba(255,255,255,0.9)' : '#1E3A8A',
                        textDecoration: 'none'
                      }}
                    >
                      📎 {fname}
                    </a>
                  );
                })()}

                {/* Location */}
                {msg.location && (
                  <div
                    onClick={() => window.open(
                      `https://www.google.com/maps?q=${msg.location.lat},${msg.location.lng}`,
                      '_blank'
                    )}
                    style={{
                      marginTop: '6px', fontSize: '13px', cursor: 'pointer',
                      color: isMine ? 'rgba(255,255,255,0.9)' : '#3B82F6',
                      textDecoration: 'underline'
                    }}
                  >
                    📍 {msg.location.label || 'Shared Location'} — Open in Maps
                  </div>
                )}

                <span style={{ ...styles.time, color: isMine ? 'rgba(255,255,255,0.65)' : '#94A3B8' }}>
                  {time}
                </span>

                {!isMine && !msg.isRead && msg._id && (
                  <button
                    onClick={() => markAsRead(msg._id)}
                    style={styles.readBtn}
                  >
                    Mark read
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Error ── */}
      {error && (
        <p style={{ color: '#EF4444', padding: '0 16px', fontSize: '13px', margin: '4px 0' }}>
          {error}
        </p>
      )}

      {/* ── Input ── */}
      <div style={styles.inputArea}>
        <input
          style={styles.input}
          type="text"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={sending}
        />
        <button
          style={{
            ...styles.sendBtn,
            opacity: sending ? 0.6 : 1,
            cursor:  sending ? 'not-allowed' : 'pointer'
          }}
          onClick={sendMessage}
          disabled={sending}
        >
          {sending ? '...' : '➤'}
        </button>
      </div>

    </div>
  );
}

const styles = {
  container: {
    display:       'flex',
    flexDirection: 'column',
    height:        '100%',
    backgroundColor: '#fff'
  },
  header: {
    display:         'flex',
    alignItems:      'center',
    padding:         '14px 20px',
    borderBottom:    '1px solid #E2E8F0',
    backgroundColor: '#F8FAFC'
  },
  avatar: {
    width:           '42px',
    height:          '42px',
    borderRadius:    '50%',
    backgroundColor: '#1E3A8A',
    color:           'white',
    display:         'flex',
    alignItems:      'center',
    justifyContent:  'center',
    fontWeight:      '700',
    fontSize:        '17px',
    marginRight:     '12px',
    flexShrink:      0
  },
  name:   { fontWeight: '700', fontSize: '15px', color: '#1E293B' },
  status: { fontSize: '12px', color: '#22C55E', marginTop: '2px' },
  messages: {
    flex:          1,
    overflowY:     'auto',
    padding:       '20px',
    display:       'flex',
    flexDirection: 'column',
    gap:           '10px',
    background:    '#F8FAFC'
  },
  messageWrapper: { display: 'flex' },
  bubble: {
    maxWidth:     '62%',
    padding:      '10px 15px',
    borderRadius: '18px',
    wordBreak:    'break-word'
  },
  bubbleText: { margin: '0 0 4px 0', fontSize: '14px', lineHeight: '1.5' },
  time:       { fontSize: '11px', display: 'block', marginTop: '4px' },
  readBtn: {
    background:  'none',
    border:      'none',
    color:       '#94A3B8',
    fontSize:    '11px',
    cursor:      'pointer',
    padding:     0,
    marginTop:   '4px',
    display:     'block'
  },
  inputArea: {
    display:       'flex',
    padding:       '12px 16px',
    borderTop:     '1px solid #E2E8F0',
    gap:           '10px',
    background:    '#fff',
    alignItems:    'center'
  },
  input: {
    flex:         1,
    padding:      '10px 16px',
    borderRadius: '25px',
    border:       '1.5px solid #E2E8F0',
    fontSize:     '14px',
    outline:      'none',
    fontFamily:   'inherit',
    background:   '#F8FAFC'
  },
  sendBtn: {
    width:           '42px',
    height:          '42px',
    borderRadius:    '50%',
    backgroundColor: '#1E3A8A',
    color:           'white',
    border:          'none',
    fontSize:        '18px',
    display:         'flex',
    alignItems:      'center',
    justifyContent:  'center',
    flexShrink:      0,
    fontFamily:      'inherit'
  }
};