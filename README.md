# API 연동

## 1. 테이블 구조와 ChatType.ts 간의 구조 비교

- 많이 수정됨

```ts
// 1 : 1 채팅을 위한 타입

// 채팅 사용자 장보
export interface ChatUser {
  id: string; // 사용자 고유 식별자 (UUID)
  email: string; // 사용자 이메일 주소
  nickname: string; // 표시용 닉네임
  avatar_url?: string | null; // 프로필 이미지 URL (선택)
}

// 1:1 채팅 정보
export interface DirectChat {
  id: string; // 채팅방 고유 식별자
  user1_id: string; // 참여자 1 ID
  user2_id: string; // 참여자 2 ID
  created_at: string; // 생성시간
  last_message_at: string; // 마지막 메시지 시간
  user1?: ChatUser; // 참여자 1번의 정보
  user2?: ChatUser; // 참여자 2번의 정보
  last_message?: DirectMessage; // 마지막 메시지 정보
}

// 1:1 메시지 타입
export interface DirectMessage {
  id: string; // 메시지 고유 식별자
  chat_id: string; // 채팅방 ID
  sender_id: string; // 발신자 사용자 ID
  content: string; // 메시지 내용
  is_read: boolean; // 읽음 상태
  read_at?: string; // 읽은 시간
  created_at: string; // 전송 시간
  sender?: ChatUser; // 발신자 정보
}

// 메시지의 상세 추가 확장 정보
export interface MessageDetail extends DirectMessage {
  sender: ChatUser;
}

// 채팅방 목록 타입
export interface ChatListItem {
  id: string; // 채팅방 ID
  other_user: ChatUser; // 상대방 사용자 정보
  last_message?: {
    content: string; // 마지막 메시지 내용
    created_at: string; // 작성시간
    sender_nickname: string; // 보낸사람 닉네임
  };
  unread_count: number; // 읽지 않은 메시지 수
}

// 채팅방 생성용
export interface CreateChatData {
  participant_id: string; // 상대방 사용자 ID
}

// 메세지 전송용
export interface CreateMessageData {
  chat_id: string; // 채팅방 ID
  content: string; // 메시지 내용
}

// 메세지 읽음 상태 업데이트용
export interface UpdateMessageReadData {
  message_id: string; // 메시지 ID
  user_id: string; // 사용자 ID
}

// API 응답 래퍼
export interface ChatApiResponse<T> {
  success: boolean; // 성공 여부
  data?: T; // 응답 데이터 (제네릭타입-선택적)
  error?: string; // 에러메시지 (실패시-선택적)
}

// 채팅방 상태 타입
export interface ChatState {
  currentChatId?: string; // 현재 활성 채탱방 ID
  messages: DirectMessage[]; // 메시지 목록
  loading: boolean; // 로딩 상태
  error?: string; // 에러메시지
}

// 채팅방 목록 상태 타입
export interface ChatListState {
  chats: ChatListItem[]; // 채팅방 목록
  loading: boolean; // 로딩 상태
  error?: string; // 에러 메시지
}
```

## 2. API 즉, Service 서비스 실적용 및 변경

- `/src/services/chat/directChatService.ts`

```ts
/**
 * 1 : 1 채팅 서비스 (Supabase 연동 버전)
 *  - 실제 Supabase API를 사용한 채팅 서비스
 *  - 데이터베이스 연동을 통한 실시간 채팅 기능
 *
 * 주요기능
 *  - 채팅방 생성 및 조회
 *  - 메시지 전송 및 조회
 *  - 사용자 검색
 *  - 실시간 메시지 동기화
 *
 * Supabase 테이블 구조
 *  - direct_chats: 1:1 채팅방 정보
 *  - direct_messages: 메시지 정보
 *  - auth.users: 사용자 인증 정보
 */

import { supabase } from '../../lib/supabase';
import type {
  DirectChat,
  ChatApiResponse,
  ChatListItem,
  ChatUser,
  CreateMessageData,
  DirectMessage,
} from '../../types/ChatType';

/**
 * 현재 사용자 정보 가져오기
 */
async function getCurrentUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) {
    throw new Error('사용자가 로그인되지 않았습니다.');
  }
  return user;
}

/**
 * 1 : 1 채팅방 생성 또는 찾기
 * - 사용자가 특정 사용자와 채팅을 시작하려고 할 때 호출
 * - 기존 채팅방이 있으면 재사용, 없으면 새로 생성함.
 * - 중복 채팅방이 생성되지 않도록
 *
 * @param participantId - 채팅방에 참여할 상대방 ID
 */
export async function findOrCreateDirectChat(
  participantId: string,
): Promise<ChatApiResponse<DirectChat>> {
  try {
    const currentUser = await getCurrentUser();

    // 1단계: 기존 채팅방 찾기
    const { data: existingChats, error: findError } = await supabase
      .from('direct_chats')
      .select('*')
      .or(
        `and(user1_id.eq.${currentUser.id},user2_id.eq.${participantId}),and(user1_id.eq.${participantId},user2_id.eq.${currentUser.id})`,
      )
      .limit(1);

    if (findError) {
      console.error('채팅방 검색 오류:', findError);
      return { success: false, error: '채팅방을 찾을 수 없습니다.' };
    }

    if (existingChats && existingChats.length > 0) {
      // 기존 채팅방 발견
      return { success: true, data: existingChats[0] };
    }

    // 2단계: 새 채팅방 생성
    const { data: newChat, error: createError } = await supabase
      .from('direct_chats')
      .insert({
        user1_id: currentUser.id,
        user2_id: participantId,
      })
      .select()
      .single();

    if (createError) {
      // 중복 에러인 경우 기존 채팅방 다시 찾기
      if (createError.code === '23505') {
        const { data: existingChat } = await supabase
          .from('direct_chats')
          .select('*')
          .or(
            `and(user1_id.eq.${currentUser.id},user2_id.eq.${participantId}),and(user1_id.eq.${participantId},user2_id.eq.${currentUser.id})`,
          )
          .single();

        return { success: true, data: existingChat };
      }

      console.error('채팅방 생성 오류:', createError);
      return { success: false, error: '채팅방을 생성할 수 없습니다.' };
    }

    return { success: true, data: newChat };
  } catch (error) {
    console.error('findOrCreateDirectChat 오류:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
    };
  }
}

/**
 * 채팅방 목록 조회
 */
export async function getChatList(): Promise<ChatApiResponse<ChatListItem[]>> {
  try {
    const currentUser = await getCurrentUser();

    // 사용자의 채팅방 목록 조회 (최신 메시지 순)
    const { data: chats, error: chatsError } = await supabase
      .from('direct_chats')
      .select('*')
      .or(`user1_id.eq.${currentUser.id},user2_id.eq.${currentUser.id}`)
      .order('last_message_at', { ascending: false });

    if (chatsError) {
      console.error('채팅방 목록 조회 오류:', chatsError);
      return { success: false, error: '채팅방 목록을 불러올 수 없습니다.' };
    }

    if (!chats || chats.length === 0) {
      return { success: true, data: [] };
    }

    // 각 채팅방의 마지막 메시지와 읽지 않은 메시지 수 조회
    const chatListItems: ChatListItem[] = await Promise.all(
      chats.map(async chat => {
        // 상대방 사용자 ID
        const otherUserId = chat.user1_id === currentUser.id ? chat.user2_id : chat.user1_id;

        // 상대방 사용자 정보 조회 (profiles 테이블에서)
        let otherUserInfo: ChatUser;
        try {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('id, nickname, avatar_url')
            .eq('id', otherUserId)
            .single();

          if (profileError || !profileData) {
            // 조회 실패 시 기본값 사용
            otherUserInfo = {
              id: otherUserId,
              email: `user-${otherUserId}@example.com`,
              nickname: `User ${otherUserId.slice(0, 8)}`,
              avatar_url: null,
            };
          } else {
            // 실제 사용자 정보 사용
            otherUserInfo = {
              id: profileData.id,
              email: `user-${profileData.id}@example.com`,
              nickname: profileData.nickname,
              avatar_url: profileData.avatar_url,
            };
          }
        } catch (error) {
          // 오류 시 기본값 사용
          otherUserInfo = {
            id: otherUserId,
            email: `user-${otherUserId}@example.com`,
            nickname: `User ${otherUserId.slice(0, 8)}`,
            avatar_url: null,
          };
        }

        // 마지막 메시지 조회 (재활성화)
        let lastMessage = null;
        try {
          const { data: lastMessageData, error: lastMessageError } = await supabase
            .from('direct_messages')
            .select('content, created_at, sender_id')
            .eq('chat_id', chat.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          if (!lastMessageError && lastMessageData) {
            lastMessage = lastMessageData;
          }
        } catch (error) {
          // 오류 시 null 유지
        }

        // 읽지 않은 메시지 수 조회 (수정: 상대방이 보낸 메시지 중에서 내가 읽지 않은 메시지)
        let unreadCount = 0;
        try {
          const { count, error: unreadCountError } = await supabase
            .from('direct_messages')
            .select('*', { count: 'exact', head: true })
            .eq('chat_id', chat.id)
            .eq('is_read', false)
            .neq('sender_id', currentUser.id); // 상대방이 보낸 메시지만

          if (!unreadCountError && count !== null) {
            unreadCount = count;
          }
        } catch (error) {
          // 오류 시 0 유지
          unreadCount = 0;
        }

        return {
          id: chat.id,
          other_user: otherUserInfo,
          last_message: lastMessage
            ? {
                content: lastMessage.content,
                created_at: lastMessage.created_at,
                sender_nickname:
                  lastMessage.sender_id === currentUser.id ? '나' : otherUserInfo.nickname,
              }
            : undefined,
          unread_count: unreadCount || 0,
        };
      }),
    );

    return { success: true, data: chatListItems };
  } catch (error) {
    console.error('getChatList 오류:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
    };
  }
}

/**
 * 메세지 전송
 *
 * @param messageData - 전송할 메시지 데이터
 */
export async function sendMessage(
  messageData: CreateMessageData,
): Promise<ChatApiResponse<DirectMessage>> {
  try {
    const currentUser = await getCurrentUser();

    // 0단계: 채팅방 존재 여부 확인
    const { data: chat, error: chatError } = await supabase
      .from('direct_chats')
      .select('id')
      .eq('id', messageData.chat_id)
      .single();

    if (chatError || !chat) {
      console.error('채팅방 조회 오류:', chatError);
      return { success: false, error: '채팅방을 찾을 수 없습니다.' };
    }

    // 1단계: 메시지 저장
    const { data: newMessage, error: messageError } = await supabase
      .from('direct_messages')
      .insert({
        chat_id: messageData.chat_id,
        sender_id: currentUser.id,
        content: messageData.content,
        is_read: false,
      })
      .select()
      .single();

    if (messageError) {
      console.error('메시지 전송 오류:', messageError);
      console.error('오류 코드:', messageError.code);
      console.error('오류 메시지:', messageError.message);
      console.error('오류 세부사항:', messageError.details);
      console.error('오류 힌트:', messageError.hint);
      return { success: false, error: `메시지를 전송할 수 없습니다: ${messageError.message}` };
    }

    // 2단계: 채팅방의 마지막 메시지 시간 업데이트
    const { error: updateError } = await supabase
      .from('direct_chats')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', messageData.chat_id);

    if (updateError) {
      console.error('채팅방 업데이트 오류:', updateError);
      // 메시지는 전송되었으므로 성공으로 처리
    }

    return { success: true, data: newMessage };
  } catch (error) {
    console.error('sendMessage 오류:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
    };
  }
}

/**
 * 메시지 목록 조회
 *
 * @param chatId - 채팅방의 ID
 */
export async function getMessages(chatId: string): Promise<ChatApiResponse<DirectMessage[]>> {
  try {
    const currentUser = await getCurrentUser();

    // 특정 채팅방의 메시지 목록 조회 (시간순)
    // direct_messages 테이블에서 메시지 조회 시도
    const { data: messages, error: messagesError } = await supabase
      .from('direct_messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true });

    if (messagesError) {
      console.error('메시지 목록 조회 오류:', messagesError);
      // 권한 문제인 경우 빈 배열 반환
      if (messagesError.code === 'PGRST301' || messagesError.message.includes('permission')) {
        return { success: true, data: [] };
      }
      return {
        success: false,
        error: `메시지를 불러올 수 없습니다: ${messagesError.message}`,
      };
    }

    if (!messages || messages.length === 0) {
      return { success: true, data: [] };
    }

    // 상대방이 보낸 메시지를 읽음 처리 (is_read = true로 업데이트)
    try {
      const { error: updateError } = await supabase
        .from('direct_messages')
        .update({
          is_read: true,
          read_at: new Date().toISOString(),
        })
        .eq('chat_id', chatId)
        .eq('is_read', false)
        .neq('sender_id', currentUser.id); // 상대방이 보낸 메시지만

      if (updateError) {
        // 오류가 있어도 메시지 조회는 계속 진행
      } else {
      }
    } catch (error) {
      // 오류가 있어도 메시지 조회는 계속 진행
    }

    // 메시지 데이터를 DirectMessage 형태로 변환
    const messageDetails: DirectMessage[] = messages.map(message => ({
      id: message.id,
      chat_id: message.chat_id,
      sender_id: message.sender_id,
      content: message.content,
      is_read: message.is_read,
      read_at: message.read_at,
      created_at: message.created_at,
      sender: {
        id: message.sender_id,
        email: `user-${message.sender_id}@example.com`,
        nickname:
          message.sender_id === currentUser.id ? '나' : `User ${message.sender_id.slice(0, 8)}`,
        avatar_url: null,
      },
    }));

    return { success: true, data: messageDetails };
  } catch (error) {
    console.error('getMessages 오류:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
    };
  }
}

/**
 * 사용자 검색
 * - 대화 상대방 찾기
 *
 * @param searchTerm - 검색할 닉네임 또는 이메일
 */
export async function searchUsers(searchTerm: string): Promise<ChatApiResponse<ChatUser[]>> {
  try {
    if (!searchTerm.trim()) {
      return { success: true, data: [] };
    }

    // 사용자 검색 (profiles 테이블에서 검색)

    const { data: profiles, error: searchError } = await supabase
      .from('profiles')
      .select('id, nickname, avatar_url, created_at')
      .ilike('nickname', `%${searchTerm}%`)
      .limit(10);

    if (searchError) {
      console.error('사용자 검색 오류:', searchError);
      return {
        success: false,
        error: `사용자 검색 중 오류가 발생했습니다: ${searchError.message}`,
      };
    }

    if (!profiles || profiles.length === 0) {
      return { success: true, data: [] };
    }

    // 사용자 데이터를 ChatUser 형태로 변환
    const chatUsers: ChatUser[] = profiles.map(profile => ({
      id: profile.id,
      email: `user-${profile.id}@example.com`, // email 필드가 없으므로 기본값 사용
      nickname: profile.nickname,
      avatar_url: profile.avatar_url,
    }));

    return { success: true, data: chatUsers };
  } catch (error) {
    console.error('searchUsers 오류:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
    };
  }
}

/**
 * 1:1 채팅방 나가기
 * - 사용자가 특정 채팅방에서 나갈 때 호출
 * - 채팅방을 완전히 삭제하는 것이 아니라 논리적 삭제 처리
 * - 현재는 채팅방을 완전히 삭제 (향후 논리적 삭제로 변경 가능)
 *
 * @param chatId - 나갈 채팅방 ID
 */
export async function exitDirectChat(chatId: string): Promise<ChatApiResponse<boolean>> {
  try {
    const currentUser = await getCurrentUser();

    // 1단계: 채팅방 소유권 확인
    const { data: chat, error: chatError } = await supabase
      .from('direct_chats')
      .select('*')
      .eq('id', chatId)
      .or(`user1_id.eq.${currentUser.id},user2_id.eq.${currentUser.id}`)
      .single();

    if (chatError || !chat) {
      console.error('채팅방 조회 오류:', chatError);
      return { success: false, error: '채팅방을 찾을 수 없습니다.' };
    }

    // 2단계: 채팅방 삭제 (향후 논리적 삭제로 변경 가능)
    const { error: deleteError } = await supabase.from('direct_chats').delete().eq('id', chatId);

    if (deleteError) {
      console.error('채팅방 삭제 오류:', deleteError);
      return { success: false, error: '채팅방 나가기에 실패했습니다.' };
    }

    return { success: true, data: true };
  } catch (error) {
    console.error('exitDirectChat 오류:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
    };
  }
}
```

## 3. Context 실적용 및 변경

- /src/contexts/DirectChatContext.tsx 업데이트

```tsx
/**
 * 1 : 1 채팅 Context Provider
 *  - 1 : 1 채팅 기능 전역 상태 관리
 *  - 채팅방, 메시지, 사용자 검색 등의 상태와 액션 제공
 *
 * 주요 기능
 *  - 채팅방 목록 관리
 *  - 메시지 전송 및 조회
 *  - 사용자 검색
 *  - 에러 처리
 *  - 로딩 상태 관리
 *  - 추후 실시간 채팅 업데이트 필요
 */

import { createContext, useCallback, useContext, useRef, useState } from 'react';
import type { ChatListItem, ChatUser, CreateMessageData, DirectMessage } from '../types/ChatType';
import {
  getChatList,
  getMessages,
  sendMessage as sendMessageService,
  searchUsers as searchUsersService,
  findOrCreateDirectChat,
  exitDirectChat,
} from '../services/chat/directChatService';

/**
 * DirectChatContext 의  Context 타입 정의
 * state 의 모양
 * action 의 모양
 */
interface DirectChatContextType {
  // state ========================
  chats: ChatListItem[]; // 채팅방 여러개 관리
  messages: DirectMessage[]; // 여러 메시지를 관리
  users: ChatUser[]; // 검색된 여러 사용자
  currentChat: ChatListItem | null; // 현재 선택된 채팅방 정보
  loading: boolean; // 로딩 상태 관리
  error: string | null;
  // action ========================
  loadChats: () => Promise<void>; // 채팅 목록 로딩 상태관리
  loadMessages: (chatId: string) => Promise<void>; // 특정 채팅방의 메시지 조회
  // 메시지가 제대로 전송되었는지 아닌지 체크를 위해서 boolean 리턴 타입
  sendMessage: (messageData: CreateMessageData) => Promise<boolean>; // 메시지 전송
  searchUsers: (searchTerm: string) => Promise<void>; // 검색어(닉네임)롤 사용자 검색
  createDirectChat: (participantId: string) => Promise<string | null>; // 채팅방 생성 또는 접근
  exitDirectChat: (chatId: string) => Promise<boolean>; // 채팅방 나가기
  clearError: () => void; // 에러 상태만 초기화 하기
}
// 컨테스트 생성
const DirectChatContext = createContext<DirectChatContextType | null>(null);

// Provide 의 Props
interface DirectChatProiderProps {
  children: React.ReactNode;
}
// Provider 생성
export const DirectChatProider: React.FC<DirectChatProiderProps> = ({ children }) => {
  // 상태관리
  const [chats, setChats] = useState<ChatListItem[]>([]);
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [currentChat, setCurrentChat] = useState<ChatListItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 사용자가 선택해서 활성화한 채팅방의 ID 를 보관함.
  // 리랜더링이 되어서 값이 갱신되거나, 화면에 보여줄 필요는 없음.
  const currentChatId = useRef<string | null>(null);

  // 공통 기능 함수
  // 에러 메시지 전용 함수
  const handleError = useCallback((errorMessage: string) => {
    setError(errorMessage);
  }, []);

  // 액션들
  // 채팅방 목록 가져오기 : 내가 참여한 목록
  const loadChats = useCallback(async () => {
    try {
      // 채팅방 목록 로드 시에는 전역 로딩 상태를 사용하지 않음 (사용자 경험 개선)
      const response = await getChatList();
      if (response.success && response.data) {
        setChats(response.data); // 목록담기
      } else {
        handleError(response.error || '채팅방 목록을 불러올 수 없습니다.');
      }
    } catch (err) {
      handleError('채팅방 목록 로드 중 오류가 발생했습니다.');
    }
  }, [handleError]);

  // 선택된 채팅방의 모든 메시지 가져오기
  const loadMessages = useCallback(
    async (chatId: string) => {
      try {
        // 메시지 로드 시에는 전역 로딩 상태를 사용하지 않음 (사용자 경험 개선)

        // 현재 활성화된 채팅방 ID 보관
        currentChatId.current = chatId;

        // 현재 채팅방 정보 찾기
        const chatInfo = chats.find(chat => chat.id === chatId);
        if (chatInfo) {
          setCurrentChat(chatInfo);
        }

        const response = await getMessages(chatId);
        if (response.success && response.data) {
          setMessages(response.data);
        } else {
          handleError(response.error || '메시지를 불러올 수 없습니다.');
        }
      } catch (err) {
        handleError('메시지 로드 중 오류가 발생했습니다.');
      }
    },
    [handleError, chats],
  );

  const sendMessage = useCallback(
    async (messageData: CreateMessageData) => {
      try {
        // 메시지 전송 시에는 전역 로딩 상태를 사용하지 않음 (사용자 경험 개선)
        const response = await sendMessageService(messageData);
        if (response.success && response.data) {
          // 메시지 전송 성공 후 즉시 로컬 상태에 메시지 추가 (자연스러운 UX)
          setMessages(prev => [...prev, response.data!]);

          // 백그라운드에서 데이터 동기화 (사용자에게 방해되지 않음)
          setTimeout(async () => {
            await loadMessages(messageData.chat_id);
            await loadChats();
          }, 100);

          return true;
        } else {
          handleError(response.error || '메시지 전송에 실패했습니다.');
          return false;
        }
      } catch (err) {
        handleError('메시지 전송 중 오류가 발생했습니다.');
        return false;
      }
    },
    [handleError, loadChats, loadMessages],
  );

  // 검색어로 사용자 목록 출력
  const searchUsers = useCallback(
    async (searchTerm: string) => {
      try {
        setLoading(true);
        const response = await searchUsersService(searchTerm);
        if (response.success && response.data) {
          setUsers(response.data);
        } else {
          handleError(response.error || '사용자 검색에 실패했습니다.');
        }
      } catch (err) {
        handleError('사용자 검색 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    },
    [handleError],
  );

  // 채팅방 생성 또는 있으면 선택
  const createDirectChat = useCallback(
    async (participantId: string): Promise<string | null> => {
      try {
        setLoading(true);
        const response = await findOrCreateDirectChat(participantId);

        if (response.success && response.data) {
          // 채팅방 새로 고침으로 목록 갱신
          await loadChats();
          return response.data.id; // 새 채팅ID 를 전달한 이유는 즉시 채팅방 참여
        } else {
          handleError(response.error || '채팅방 생성에 실패했습니다.');
          return null;
        }
      } catch (err) {
        handleError('채팅방 생성 중 오류가 발생했습니다.');
        return null;
      } finally {
        setLoading(false);
      }
    },
    [handleError, loadChats],
  );

  // 채팅방 나가기
  const exitDirectChatHandler = useCallback(
    async (chatId: string): Promise<boolean> => {
      try {
        setLoading(true);
        const response = await exitDirectChat(chatId);
        if (response.success) {
          // 채팅방 목록에서 제거
          setChats(prev => prev.filter(chat => chat.id !== chatId));
          // 현재 채팅방이 나간 채팅방이면 초기화
          if (currentChatId.current === chatId) {
            currentChatId.current = null;
            setCurrentChat(null);
            setMessages([]);
          }
          return true;
        } else {
          handleError(response.error || '채팅방 나가기에 실패했습니다.');
          return false;
        }
      } catch (err) {
        handleError('채팅방 나가기 중 오류가 발생했습니다.');
        return false;
      } finally {
        setLoading(false);
      }
    },
    [handleError],
  );

  // 에러메시지 초기화
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Context 의 value
  const value: DirectChatContextType = {
    // 상태(state)
    chats,
    messages,
    users,
    currentChat,
    loading,
    error,
    // 액션 (action) : 샹태관리 업데이트 함수
    loadChats,
    loadMessages,
    sendMessage,
    searchUsers,
    createDirectChat,
    exitDirectChat: exitDirectChatHandler,
    clearError,
  };
  return <DirectChatContext.Provider value={value}>{children}</DirectChatContext.Provider>;
};

// 커스텀 훅
export const useDirectChat = () => {
  const context = useContext(DirectChatContext);
  if (!context) {
    throw new Error('채팅 컨텐스트가 생성되지 않았습니다.');
  }
  return context;
};
```

## 4. DirectChatList.tsx 업데이트

- /src/components/chat/direct/DirectChatList.tsx

- Realtime 적용법 체크 해보기 (알림에서도 사용)

```tsx
// Supabase Realtime 으로 실시간 동기화
useEffect(() => {
  const subscription = supabase
    .channel('direct_chats_changes') // direct_chats_changes 라는 이름으로 채널을 만든다.
    .on(
      'postgres_changes', // PostgreSQL 데이터 베이스의 변경사항을 알려주는 이벤트 명
      {
        event: '*', // 모든 이벤트 타입을 감지함. (INSERT, UPDATE, DELETE..)
        schema: 'public', // 스키마가 public 인 것이 대상
        table: 'direct_chats', // 변경이 감시되어질 테이블명
      },
      payload => {
        // 변경사항에 대한 상세 정보(새로운 데이터, 이전 데이터등..)
        loadChats(); // 변경사항이 있을 때만 새로고침
      },
    )
    .subscribe(); // 구독을 신청한다. (addEventListener 처럼)

  // 클린업 함수 : 컴포넌트가 언마운트 될때, 즉, 화면에서 사라질 때 실행
  return () => {
    // 구독 해제
    subscription.unsubscribe(); // 반드시 해줌. 메모리 누수 방지, 백엔드 부하방지
  };
}, [loadChats]);
```

```tsx
/**
 * - 채팅 네비게이션 : 사용자가 참여 중인 채팅방 목록 제공
 * - 상태 표시 : 읽지 않은 메시지와 최신 활동 표시
 * - 새 채팅 시작 : 사용자 검색을 통한 새 채팅방 생성
 */

import { useEffect, useState } from 'react';
import { useDirectChat } from '../../../contexts/DirectChatContext';
import type { ChatUser } from '../../../types/ChatType';
import { supabase } from '../../../lib/supabase';

// Props 정의
interface DirectChatListProps {
  onChatSelect: (chatId: string) => void; // 채팅방 선택 시 호출되는 콜백 함수
  onCreateChat: () => void; // 새 채팅방 생성시 호출되는 콜백 함수
  selectedChatId?: string; // 현재 선택된 채팅방의 ID
}

const DirectChatList = ({ onChatSelect, onCreateChat, selectedChatId }: DirectChatListProps) => {
  // Context 활용
  const { loadChats, createDirectChat, error, users, searchUsers, loading, chats } =
    useDirectChat();

  // 사용자 검색 상태 관리
  const [searchTerm, setSearchTerm] = useState<string>(''); // 사용자 검색어
  const [showUserSearch, setShowUserSearch] = useState<boolean>(false); // 사용자 검색 UI 표시 여부

  // 최초에 컴포넌트 마운트시 채팅 목록 로드
  useEffect(() => {
    loadChats();
  }, [loadChats]); // 신규 또는 메세지 전송 등으로 업데이트 시 채팅목록 호촐

  // Supabase Realtime 으로 실시간 동기화
  useEffect(() => {
    const subscription = supabase
      .channel('direct_chats_changes') // direct_chats_changes 라는 이름으로 채널을 만든다.
      .on(
        'postgres_changes', // PostgreSQL 데이터 베이스의 변경사항을 알려주는 이벤트 명
        {
          event: '*', // 모든 이벤트 타입을 감지함. (INSERT, UPDATE, DELETE..)
          schema: 'public', // 스키마가 public 인 것이 대상
          table: 'direct_chats', // 변경이 감시되어질 테이블명
        },
        payload => {
          // 변경사항에 대한 상세 정보(새로운 데이터, 이전 데이터등..)
          loadChats(); // 변경사항이 있을 때만 새로고침
        },
      )
      .subscribe(); // 구독을 신청한다. (addEventListener 처럼)

    // 클린업 함수 : 컴포넌트가 언마운트 될때, 즉, 화면에서 사라질 때 실행
    return () => {
      // 구독 해제
      subscription.unsubscribe(); // 반드시 해줌. 메모리 누수 방지, 백엔드 부하방지
    };
  }, [loadChats]);

  // 컴포넌트가 변경시 사용자 검색 즉시 실행
  // 검색어가 비어있지 않을 때만 검색 수행
  useEffect(() => {
    // 사용자 검색어가 만약 있다면
    if (searchTerm.trim()) {
      // console.log('DB 에서 사용자 닉네임을 실시간 검색 함..');
      // 검색어가 입력이 되면 Service 의 사용자 검색 API 를 호출해야 한다.
      searchUsers(searchTerm);
    }
  }, [searchTerm, searchUsers]);

  // 날짜 관련 포맷 설정
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    // 24시간 이내인 경우 시간만 표시
    if (diffInHours < 24) {
      return date.toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false, // 24시간 형식 사용
      });
    } else {
      // 24시간 이후인 경우 날짜만 표시
      return date.toLocaleDateString('ko-KR', {
        month: 'short', // 짧은 월 이름 (예: "12월")
        day: 'numeric', // 숫자 날짜 (예: "25")
      });
    }
  };

  /**
   * 사용자 선택 시 새 채팅방 생성 및 선택
   * 처리 과정 :
   * 1. 선택된 사용자와 새 채팅방 생성
   * 2. 생성된 채팅방을 즉시 선택된 것으로 인정
   * 3. 사용자 검색 UI 숨김
   * 4. 사용자 검색어 초기화
   */
  const handleUserSelect = async (user: ChatUser) => {
    // 상대방 선택됨.
    // 상대방의 id 를 이용해서 채팅방을 생성해야 합니다.
    const chatId = await createDirectChat(user.id);
    if (chatId) {
      onChatSelect(chatId); // 생성된 채팅방 ID를 전달
      setShowUserSearch(false); // 사용자 검색 UI 숨기기
      setSearchTerm(''); // 검색어 초기화
    }
  };

  // 에러 상태일 때 에러 메시지 표시
  if (error) {
    return (
      <div className="chat-list">
        <div className="error-message ">
          <p>오류 : {error}</p>
          <button onClick={loadChats}>다시 시도</button>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-list">
      {/* 채팅 목록 헤더 - 제목과 새 채팅 버튼 */}
      <div className="chat-list-header">
        <h2>1 : 1 채팅</h2>
        {/* 사용자가 새채팅 생성시 showUserSearch 를 true 로 변경 */}
        <button className="new-chat-btn" onClick={() => setShowUserSearch(!showUserSearch)}>
          새 채팅
        </button>
      </div>

      {/* 사용자 검색 UI - 새 채팅 버튼 클릭 시 표시 */}
      {showUserSearch && (
        <div className="user-search">
          {/* 사용자 검색 필드 */}
          <input
            type="text"
            value={searchTerm} // 사용자 검색어
            onChange={e => setSearchTerm(e.target.value)} // 사용자 검색어 변경 진행
            placeholder="사용자 검색..."
            className="search-input"
          />

          {/* 검색 결과 목록 */}
          <div className="search-result">
            {/* 검색된 사용자 출력 */}
            {users.map(user => (
              // 사용자 중 대화상대를 선택할 수 있음. : handleUserSelect
              <div key={user.id} className="user-item" onClick={() => handleUserSelect(user)}>
                {/* 사용자 아바타 */}
                <div className="user-avatar">
                  {user.avatar_url ? (
                    // 사용자 아바타 이미지 출력
                    <img src={user.avatar_url} alt={user.nickname} />
                  ) : (
                    // 사용자 아바타 닉네임 출력 : 첫 글자만 보여줌
                    <div className="avatar-placeholder">{user.nickname.charAt(0)}</div>
                  )}
                </div>
                {/* 사용자 정보 */}
                <div className="user-info">
                  <div className="user-nickname">{user.nickname}</div>
                </div>
              </div>
            ))}
          </div>

          {/* 검색 결과가 없을 때 표시 */}
          {/* 사용자 검색어는 있는데 사용자 목록이 없다면 */}
          {searchTerm && users.length === 0 && (
            <div className="no-results">검색 결과가 없습니다.</div>
          )}
        </div>
      )}

      {/* 채팅 목록 컨테이너 */}
      <div className="chat-items">
        {loading ? (
          // 로딩표시
          <div className="loading">로딩 중...</div>
        ) : chats.length === 0 ? (
          // 채팅방이 없을 때 안내 메시지
          <div className="no-chats">
            <p>아직 채팅방이 없습니다.</p>
            <p>새 채팅 버튼을 눌러 대화를 시작하세요!</p>
          </div>
        ) : (
          // 채팅 목록 렌더링
          chats.map(chat => (
            // 개별 채팅 아이템
            <div
              key={chat.id}
              className={`chat-item ${selectedChatId === chat.id ? 'selected' : ''}`}
              // 기존 채팅방 목록에서 채팅방 선택
              onClick={() => onChatSelect(chat.id)}
            >
              {/* 채팅 상대방 아바타 */}
              <div className="chat-avatar">
                {chat.other_user.avatar_url ? (
                  // 상대방 아바타 이미지 있는 경우
                  <img src={chat.other_user.avatar_url} alt={chat.other_user.nickname} />
                ) : (
                  // 상대방 아바타 이미지 없는 경운
                  <div className="avatar-placeholder">{chat.other_user.nickname.charAt(0)}</div>
                )}
                {/* 읽지 않은 메시지 개수 배지 */}
                {chat.unread_count > 0 && <div className="unread-badge">{chat.unread_count}</div>}
              </div>
              {/* 채팅 정보 */}
              <div className="chat-info">
                {/* 채팅 헤더 - 이름과 시간 */}
                <div className="chat-header">
                  <div className="chat-name">{chat.other_user.nickname}</div>
                  <div className="chat-time">
                    {chat.last_message ? formatTime(chat.last_message.created_at) : ''}
                  </div>
                </div>
                {/* 마지막 메시지 미리보기 */}
                <div className="chat-preview">
                  {chat.last_message ? (
                    <span className={chat.unread_count > 0 ? 'unread' : ''}>
                      {/* 마지막 채팅 작성자 닉네임 : 마지막 채팅 메세지 내용을 출력합니다. */}
                      {chat.last_message.sender_nickname} : {chat.last_message.content}
                    </span>
                  ) : (
                    <span className="no-message">메시지가 없습니다.</span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DirectChatList;
```

## DirectChatRoom.tsx 업데이트

- /src/components/chat/direct/DirectChatRoom.tsx 업데이트
