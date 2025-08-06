import { useState, useEffect, useCallback, useRef } from 'react';

interface Message {
  id: number;
  content: string;
  timestamp: string;
  sender: string;
  [key: string]: any;
}

interface PaginationState {
  messages: Message[];
  hasMore: boolean;
  loading: boolean;
  error: string | null;
  currentPage: number;
  totalMessages: number;
}

interface PaginationOptions {
  pageSize?: number;
  initialLoad?: boolean;
  cacheSize?: number;
  prefetchThreshold?: number;
}

const DEFAULT_PAGE_SIZE = 20;
const DEFAULT_CACHE_SIZE = 100;
const DEFAULT_PREFETCH_THRESHOLD = 5;

export const useMessagePagination = (
  chatId: string,
  options: PaginationOptions = {}
) => {
  const {
    pageSize = DEFAULT_PAGE_SIZE,
    initialLoad = true,
    cacheSize = DEFAULT_CACHE_SIZE,
    prefetchThreshold = DEFAULT_PREFETCH_THRESHOLD
  } = options;

  const [state, setState] = useState<PaginationState>({
    messages: [],
    hasMore: true,
    loading: false,
    error: null,
    currentPage: 0,
    totalMessages: 0
  });

  const messageCache = useRef<Map<string, Message[]>>(new Map());
  const loadingRef = useRef(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const topElementRef = useRef<HTMLDivElement | null>(null);

  // Simulate API call to fetch messages
  const fetchMessages = useCallback(async (page: number, size: number): Promise<{
    messages: Message[];
    hasMore: boolean;
    total: number;
  }> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

    // Generate mock messages for demonstration
    const totalMockMessages = 150;
    const startIndex = page * size;
    const endIndex = Math.min(startIndex + size, totalMockMessages);
    
    const messages: Message[] = [];
    for (let i = startIndex; i < endIndex; i++) {
      const messageId = totalMockMessages - i; // Reverse order (newest first)
      messages.push({
        id: messageId,
        content: `This is message #${messageId}. Lorem ipsum dolor sit amet, consectetur adipiscing elit.`,
        timestamp: new Date(Date.now() - i * 60000).toISOString(),
        sender: i % 3 === 0 ? 'AI Assistant' : i % 2 === 0 ? 'User' : 'Partner',
        type: 'text',
        reactions: [],
        isRead: true
      });
    }

    return {
      messages,
      hasMore: endIndex < totalMockMessages,
      total: totalMockMessages
    };
  }, []);

  // Load messages for a specific page
  const loadMessages = useCallback(async (page: number, append: boolean = true) => {
    if (loadingRef.current) return;

    loadingRef.current = true;
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const cacheKey = `${chatId}_${page}`;
      let result;

      // Check cache first
      if (messageCache.current.has(cacheKey)) {
        const cachedMessages = messageCache.current.get(cacheKey)!;
        result = {
          messages: cachedMessages,
          hasMore: page < Math.ceil(state.totalMessages / pageSize) - 1,
          total: state.totalMessages
        };
      } else {
        result = await fetchMessages(page, pageSize);
        
        // Cache the result
        messageCache.current.set(cacheKey, result.messages);
        
        // Limit cache size
        if (messageCache.current.size > cacheSize / pageSize) {
          const firstKey = messageCache.current.keys().next().value;
          messageCache.current.delete(firstKey);
        }
      }

      setState(prev => ({
        ...prev,
        messages: append ? [...prev.messages, ...result.messages] : result.messages,
        hasMore: result.hasMore,
        loading: false,
        currentPage: page,
        totalMessages: result.total
      }));

      // Prefetch next page if close to threshold
      if (result.hasMore && append) {
        const remainingMessages = result.messages.length;
        if (remainingMessages <= prefetchThreshold) {
          setTimeout(() => loadMessages(page + 1, true), 100);
        }
      }

    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load messages'
      }));
    } finally {
      loadingRef.current = false;
    }
  }, [chatId, pageSize, cacheSize, prefetchThreshold, fetchMessages, state.totalMessages]);

  // Load more messages (for infinite scroll)
  const loadMore = useCallback(() => {
    if (state.hasMore && !state.loading) {
      loadMessages(state.currentPage + 1, true);
    }
  }, [state.hasMore, state.loading, state.currentPage, loadMessages]);

  // Refresh messages (reload from beginning)
  const refresh = useCallback(() => {
    setState(prev => ({
      ...prev,
      messages: [],
      currentPage: 0,
      hasMore: true,
      error: null
    }));
    
    // Clear cache for this chat
    const keysToDelete = Array.from(messageCache.current.keys()).filter(key => 
      key.startsWith(`${chatId}_`)
    );
    keysToDelete.forEach(key => messageCache.current.delete(key));
    
    loadMessages(0, false);
  }, [chatId, loadMessages]);

  // Add new message (for real-time updates)
  const addMessage = useCallback((message: Message) => {
    setState(prev => ({
      ...prev,
      messages: [message, ...prev.messages],
      totalMessages: prev.totalMessages + 1
    }));

    // Update cache
    const firstPageKey = `${chatId}_0`;
    if (messageCache.current.has(firstPageKey)) {
      const cachedMessages = messageCache.current.get(firstPageKey)!;
      const updatedMessages = [message, ...cachedMessages];
      
      // Keep only pageSize messages in first page cache
      if (updatedMessages.length > pageSize) {
        updatedMessages.splice(pageSize);
      }
      
      messageCache.current.set(firstPageKey, updatedMessages);
    }
  }, [chatId, pageSize]);

  // Update existing message
  const updateMessage = useCallback((messageId: number, updates: Partial<Message>) => {
    setState(prev => ({
      ...prev,
      messages: prev.messages.map(msg => 
        msg.id === messageId ? { ...msg, ...updates } : msg
      )
    }));

    // Update in cache
    for (const [key, cachedMessages] of messageCache.current.entries()) {
      if (key.startsWith(`${chatId}_`)) {
        const updatedMessages = cachedMessages.map(msg => 
          msg.id === messageId ? { ...msg, ...updates } : msg
        );
        messageCache.current.set(key, updatedMessages);
      }
    }
  }, [chatId]);

  // Remove message
  const removeMessage = useCallback((messageId: number) => {
    setState(prev => ({
      ...prev,
      messages: prev.messages.filter(msg => msg.id !== messageId),
      totalMessages: prev.totalMessages - 1
    }));

    // Remove from cache
    for (const [key, cachedMessages] of messageCache.current.entries()) {
      if (key.startsWith(`${chatId}_`)) {
        const filteredMessages = cachedMessages.filter(msg => msg.id !== messageId);
        messageCache.current.set(key, filteredMessages);
      }
    }
  }, [chatId]);

  // Set up intersection observer for infinite scroll
  const setupInfiniteScroll = useCallback((element: HTMLDivElement | null) => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    if (!element) return;

    topElementRef.current = element;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && state.hasMore && !state.loading) {
          loadMore();
        }
      },
      {
        root: null,
        rootMargin: '100px',
        threshold: 0.1
      }
    );

    observerRef.current.observe(element);
  }, [state.hasMore, state.loading, loadMore]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  // Initial load
  useEffect(() => {
    if (initialLoad && chatId) {
      refresh();
    }
  }, [chatId, initialLoad, refresh]);

  // Jump to message (useful for search results or replies)
  const jumpToMessage = useCallback(async (messageId: number) => {
    // First check if message is already loaded
    const existingMessage = state.messages.find(msg => msg.id === messageId);
    if (existingMessage) {
      return existingMessage;
    }

    // Calculate approximate page for this message
    const estimatedPage = Math.floor((state.totalMessages - messageId) / pageSize);
    
    try {
      setState(prev => ({ ...prev, loading: true }));
      
      // Load the page containing this message
      const result = await fetchMessages(estimatedPage, pageSize);
      const targetMessage = result.messages.find(msg => msg.id === messageId);
      
      if (targetMessage) {
        // Replace current messages with this page
        setState(prev => ({
          ...prev,
          messages: result.messages,
          currentPage: estimatedPage,
          hasMore: result.hasMore,
          loading: false
        }));
        
        return targetMessage;
      } else {
        throw new Error('Message not found');
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to jump to message'
      }));
      return null;
    }
  }, [state.messages, state.totalMessages, pageSize, fetchMessages]);

  // Get pagination stats
  const getStats = useCallback(() => {
    return {
      loadedMessages: state.messages.length,
      totalMessages: state.totalMessages,
      currentPage: state.currentPage,
      totalPages: Math.ceil(state.totalMessages / pageSize),
      cacheSize: messageCache.current.size,
      hasMore: state.hasMore,
      loading: state.loading
    };
  }, [state, pageSize]);

  return {
    // State
    messages: state.messages,
    hasMore: state.hasMore,
    loading: state.loading,
    error: state.error,
    
    // Actions
    loadMore,
    refresh,
    addMessage,
    updateMessage,
    removeMessage,
    jumpToMessage,
    setupInfiniteScroll,
    
    // Utils
    getStats
  };
};