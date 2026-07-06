import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Send, Paperclip, Phone, Info, ChevronLeft, CheckCheck } from 'lucide-react';
import { conversations } from '@/data/mockData';

export default function StudentMessages() {
  const { id } = useParams();
  const [selectedConv, setSelectedConv] = useState(id || conversations[0]?.id || '');
  const [messageText, setMessageText] = useState('');
  const [searchText, setSearchText] = useState('');
  const [convList, setConvList] = useState(conversations);

  const activeConversation = convList.find(c => c.id === selectedConv);

  const filteredConvs = convList.filter(c =>
    c.participants[1].name.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !activeConversation) return;
    const newMessage = {
      id: Date.now().toString(),
      conversationId: activeConversation.id,
      senderId: '1',
      senderName: 'Alex Johnson',
      senderAvatar: 'https://i.pravatar.cc/150?u=alex',
      content: messageText,
      timestamp: new Date().toISOString(),
      read: true,
    };
    const updated = convList.map(c =>
      c.id === activeConversation.id
        ? { ...c, messages: [...c.messages, newMessage], lastMessage: messageText, lastMessageTime: new Date().toISOString() }
        : c
    );
    setConvList(updated);
    setMessageText('');
  };

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden" style={{ height: 'calc(100vh - 140px)' }}>
      <div className="flex h-full">
        {/* Sidebar */}
        <div className={`w-80 border-r border-border flex flex-col ${selectedConv ? 'hidden md:flex' : 'flex'} flex-shrink-0`}>
          <div className="p-4 border-b border-border">
            <h2 className="font-semibold mb-3">Messages</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input type="text" value={searchText} onChange={(e) => setSearchText(e.target.value)}
                placeholder="Search conversations..."
                className="w-full pl-9 pr-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/20" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filteredConvs.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setSelectedConv(conv.id)}
                className={`w-full flex items-start gap-3 p-4 hover:bg-muted/50 transition-colors text-left border-b border-border ${
                  selectedConv === conv.id ? 'bg-accent/5 border-r-2 border-r-accent' : ''
                }`}
              >
                <div className="relative flex-shrink-0">
                  <img src={conv.participants[1].avatar} alt="" className="w-10 h-10 rounded-full" />
                  {conv.participants[1].online && (
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-card" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium truncate">{conv.participants[1].name}</p>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                      {new Date(conv.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">{conv.lastMessage}</p>
                </div>
                {conv.unreadCount > 0 && (
                  <span className="w-5 h-5 bg-accent text-white text-[10px] rounded-full flex items-center justify-center flex-shrink-0">
                    {conv.unreadCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        {activeConversation ? (
          <div className={`flex-1 flex flex-col ${!selectedConv ? 'hidden md:flex' : ''}`}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-3">
                <button onClick={() => setSelectedConv('')} className="md:hidden p-1 -ml-1">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="relative">
                  <img src={activeConversation.participants[1].avatar} alt="" className="w-9 h-9 rounded-full" />
                  {activeConversation.participants[1].online && (
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-card" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium">{activeConversation.participants[1].name}</p>
                  <p className="text-xs text-muted-foreground">
                    {activeConversation.participants[1].online ? 'Online' : 'Offline'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button className="p-2 hover:bg-muted rounded-lg transition-colors"><Phone className="w-4 h-4 text-muted-foreground" /></button>
                <button className="p-2 hover:bg-muted rounded-lg transition-colors"><Info className="w-4 h-4 text-muted-foreground" /></button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {activeConversation.messages.map((msg) => {
                const isSent = msg.senderId === '1';
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${isSent ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[70%] ${isSent ? 'message-sent' : 'message-received'} px-4 py-2.5`}>
                      <p className="text-sm">{msg.content}</p>
                      <p className={`text-[10px] mt-1 ${isSent ? 'text-white/70' : 'text-muted-foreground'}`}>
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {isSent && <CheckCheck className="w-3 h-3 inline ml-1" />}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-4 border-t border-border">
              <div className="flex items-center gap-2">
                <button type="button" className="p-2 hover:bg-muted rounded-lg transition-colors"><Paperclip className="w-5 h-5 text-muted-foreground" /></button>
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2.5 bg-muted rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/20"
                />
                <button type="submit" disabled={!messageText.trim()}
                  className="p-2.5 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Send className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold">Select a conversation</h3>
              <p className="text-sm text-muted-foreground mt-1">Choose a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
