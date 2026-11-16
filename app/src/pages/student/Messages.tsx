import { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { m } from 'framer-motion';
import { Search, Send, Paperclip, ChevronLeft, Check, CheckCheck, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getMyConversations, getMessages, sendMessage, markMessagesRead, getConversationUnreadCounts } from '@/services/messages';
import { supabase } from '@/lib/supabase';
import { withTimeout } from '@/lib/timeout';
import { toast } from 'sonner';

export default function StudentMessages() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { profile } = useAuth();
  const [selectedConv, setSelectedConv] = useState<string>(id || '');
  const [conversations, setConversations] = useState<any[]>([]);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [messages, setMessages] = useState<any[]>([]);
  const [messageText, setMessageText] = useState('');
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const cancelledRef = useRef(false);

  // Scroll to bottom helper
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load conversations list
  async function loadConversations() {
    try {
      const res = await withTimeout(getMyConversations(), 10000, { data: [] }, 'StudentMessages');
      if (res.data) {
        setConversations(res.data);
        if (!selectedConv && res.data.length > 0) {
          setSelectedConv(res.data[0].id);
        }
      }

      // Which conversations hold the unread messages (list badges).
      const counts = await getConversationUnreadCounts();
      if (!cancelledRef.current) {
        const map: Record<string, number> = {};
        for (const row of counts.data ?? []) map[row.id] = row.unread_count ?? 0;
        setUnreadCounts(map);
      }
    } catch (err) {
      console.error('Error loading conversations:', err);
      toast.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    cancelledRef.current = false;
    loadConversations();
    return () => { cancelledRef.current = true; };
  }, [profile]);

  // Select conversation matching query parameter user ID & internship ID
  useEffect(() => {
    const queryUserId = searchParams.get('userId') || searchParams.get('user_id');
    const queryInternshipId = searchParams.get('internshipId') || searchParams.get('internship_id');
    
    if (queryUserId && queryInternshipId && profile) {
      // First check if we already have it in state
      const match = conversations.find((c: any) => {
        const otherParticipant = c.participants?.find((p: any) => p.user?.id !== profile.id);
        return otherParticipant?.user?.id === queryUserId && c.internship_id === queryInternshipId;
      });
      
      if (match) {
        setSelectedConv(match.id);
      } else {
        // If not in state, try to get or create it on the server
        import('@/services/messages').then(m => {
          m.getOrCreateConversation(queryInternshipId, queryUserId).then(res => {
            if (res.data?.id) {
              // Reload conversations to include the new one
              loadConversations().then(() => {
                setSelectedConv(res.data.id);
              });
            }
          });
        });
      }
    }
  }, [searchParams, conversations.length, profile]);

  // Load messages when selected conversation changes
  useEffect(() => {
    if (!selectedConv) return;

    async function loadMessages() {
      setLoadingMessages(true);
      try {
        const res = await getMessages(selectedConv);
        if (res.data) {
          setMessages(res.data);
          setTimeout(scrollToBottom, 50);
        }
        await markMessagesRead(selectedConv);
        // The list badge for this conversation is now clear.
        setUnreadCounts((prev) => (prev[selectedConv] ? { ...prev, [selectedConv]: 0 } : prev));
      } catch (err) {
        console.error('Error loading messages:', err);
        toast.error('Failed to load messages');
      } finally {
        setLoadingMessages(false);
      }
    }

    loadMessages();

    // Subscribe to new messages in this conversation
    const channel = supabase
      .channel(`room:${selectedConv}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${selectedConv}`,
        },
        async (payload) => {
          // A message from the other person that arrives while the thread is
          // on screen is read immediately — never leave a stuck unread badge.
          const incoming = (payload as { new?: { sender_id?: string } }).new;
          if (incoming?.sender_id && profile && incoming.sender_id !== profile.id && !document.hidden) {
            await markMessagesRead(selectedConv);
            setUnreadCounts((prev) => ({ ...prev, [selectedConv]: 0 }));
          }
          // Re-fetch messages to get full sender profiles. Bypass the cache so
          // the new row isn't swallowed by a stale cached list.
          const res = await getMessages(selectedConv, false);
          if (res.data) {
            setMessages(res.data);
            setTimeout(scrollToBottom, 50);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedConv, profile]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedConv || !profile) return;

    const content = messageText.trim();

    try {
      const { data, error } = await sendMessage({
        conversation_id: selectedConv,
        content,
      });

      if (error) throw error;

      // Clear the input only once the message is confirmed sent
      setMessageText('');

      if (data) {
        setMessages((prev) => [...prev, data]);
        setTimeout(scrollToBottom, 50);
      }

      // Update last message in the conversations list locally
      setConversations((prev) =>
        prev.map((c) =>
          c.id === selectedConv
            ? { ...c, last_message: content, last_message_at: new Date().toISOString() }
            : c
        )
      );
    } catch (err) {
      console.error('Error sending message:', err);
      toast.error('Message not sent. Your text is still here, please try again.');
    }
  };

  if (loading || !profile) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  const activeConversation = conversations.find(c => c.id === selectedConv);
  
  // Find other participant's profile
  const getOtherParticipant = (conv: any) => {
    const participant = conv?.participants?.find((p: any) => p.user?.id !== profile.id);
    return participant?.user || { full_name: 'Unknown User', avatar_url: null, role: 'user' };
  };

  const filteredConvs = conversations.filter((c) => {
    const other = getOtherParticipant(c);
    return other.full_name?.toLowerCase().includes(searchText.toLowerCase());
  });

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
            {filteredConvs.length === 0 ? (
              <p className="text-sm text-muted-foreground p-4 text-center">No conversations found.</p>
            ) : (
              filteredConvs.map((conv) => {
                const other = getOtherParticipant(conv);
                const isSelected = selectedConv === conv.id;
                const unread = unreadCounts[conv.id] ?? 0;
                return (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConv(conv.id)}
                    className={`w-full flex items-start gap-3 p-4 hover:bg-muted/50 transition-colors text-left border-b border-border ${
                      isSelected ? 'bg-accent/5 border-r-2 border-r-accent' : ''
                    }`}
                  >
                    <div className="relative flex-shrink-0">
                      <img src={other.avatar_url || `https://ui-avatars.com/api/?name=${other.full_name}`} alt="" className="w-10 h-10 rounded-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className={`text-sm truncate ${unread > 0 ? 'font-semibold text-foreground' : 'font-medium'}`}>{other.full_name}</p>
                        <span className="flex items-center gap-1.5 flex-shrink-0">
                          {unread > 0 && (
                            <span className="min-w-5 h-5 px-1.5 bg-red-500 text-white text-[10px] font-semibold rounded-full flex items-center justify-center" title={`${unread} unread`}>
                              {unread > 99 ? '99+' : unread}
                            </span>
                          )}
                          {conv.last_message_at && (
                            <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                              {new Date(conv.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                        </span>
                      </div>
                      <p className="text-[10px] text-accent truncate mt-0.5 font-medium">{conv.internship?.title || 'General'}</p>
                      <p className={`text-xs truncate mt-0.5 ${unread > 0 ? 'text-foreground/80' : 'text-muted-foreground'}`}>{conv.last_message || 'Start chatting...'}</p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Chat Area */}
        {selectedConv && activeConversation ? (
          <div className="flex-1 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-3">
                <button onClick={() => setSelectedConv('')} className="md:hidden p-1 -ml-1">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="relative">
                  <img src={getOtherParticipant(activeConversation).avatar_url || `https://ui-avatars.com/api/?name=${getOtherParticipant(activeConversation).full_name}`} alt="" className="w-9 h-9 rounded-full object-cover" />
                </div>
                <div>
                  <p className="text-sm font-medium">{getOtherParticipant(activeConversation).full_name}</p>
                  <p className="text-xs text-muted-foreground">
                    <span className="capitalize">{getOtherParticipant(activeConversation).role}</span>
                    {activeConversation.internship?.title && ` • ${activeConversation.internship.title}`}
                  </p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {loadingMessages ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-6 h-6 animate-spin text-accent" />
                </div>
              ) : messages.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center my-8">No messages yet. Send a message to start the conversation.</p>
              ) : (
                messages.map((msg) => {
                  const isSent = msg.sender_id === profile.id;
                  // Read receipt: the other participant's id appearing in
                  // read_by means they've opened the thread since this message.
                  const otherId = getOtherParticipant(activeConversation)?.id;
                  const isRead = isSent && !!otherId && (msg.read_by ?? []).includes(otherId);
                  return (
                    <m.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${isSent ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[70%] ${isSent ? 'message-sent' : 'message-received'} px-4 py-2.5`}>
                        <p className="text-sm whitespace-pre-line">{msg.content}</p>
                        <p className={`text-[10px] mt-1 ${isSent ? 'text-white/70' : 'text-muted-foreground'} flex items-center justify-end gap-1`}>
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          {isRead ? (
                            <CheckCheck className="w-3 h-3 text-white" aria-label="Read" />
                          ) : isSent ? (
                            <Check className="w-3 h-3 text-white/60" aria-label="Sent" />
                          ) : null}
                        </p>
                      </div>
                    </m.div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
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
