# 더미를 데이터를 이용한 테스트 코드

- 테이블 구조에 대해서 고민 선작업

## 1. 데이터 타입 정의를 많이 고민합니다.

- `/src/types/ChatType.ts 파일` 생성

## 2. 채팅 시스템에서 사용자 정보를 나타내는 기본 형

- 아래는 샘플링

```ts
const user: any = {
  id: 'user-1234',
  email: 'test@test.com',
  nickname: '홍길동',
  avatar_url?: 'http~',
};
```

- 타입을 정의해 보자

```ts
interface ChatUser {
  id: string;
  email: string;
  nickname: string;
  avatar_url?: string;
}
```

## 3. 채팅 시스템에서 채팅방의 타입도 필요로 함.

- 채팅방의 기본 정보를 담는 타입.
- 향후 업데이트를 위해서 채팅방의 타입도 정의된 타입.
- 채팅방 생성자와 시간 정보로 채팅방을 관리함.
- 아래는 샘플링

```ts
const chat: any = {
  id: 'chat-455',
  name: '1:1 채팅',
  type: 'direct', // direct | group
  created_by: 'user-123',
  created_at: '2025-09-26~~',
  updated_at: '2025-09-26~~',
};
```

- 타입을 정의해 보자

```ts
interface Chat {
  id: string;
  name: string;
  type: 'direct'; // direct | group
  created_by: string;
  created_at: string;
  updated_at: string;
}
```

## 4. 채팅 메시지의 타입도 필요로 함.

- 개별 메시지의 기본 정보를 담는 타입.
- 어떤 채팅방의 메시지인지 구본
- 발신자 : 누가 발신했는지
- 실제 메시지 텍스트도 저장
- 아래는 샘플링

```ts
const message: any = {
  id: 'msg-4567',
  chat_id: 'chat-456',
  sender_id: 'user-123',
  content: '안녕하세요.',
  created_at: '2025-09-26~~',
  updated_at: '2025-09-26~~',
};
```

- 타입을 정의해 보자.

```ts
interface Message {
  id: string;
  chat_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}
```

## 5. 메시지 + 발신자 정보 형태가 필요함.

- 확장 타입
- 하나의 메시지는 메시지 타입과 발신자 정보 형태가 혼합이 되어있음.
- 아래는 샘플링

```ts
const sample: any = {
  id: 'msg-4567',
  chat_id: 'chat-456',
  sender_id: 'user-123',
  content: '안녕하세요.',
  created_at: '2025-09-26~~',
  updated_at: '2025-09-26~~',
  sender : {
     id: 'user-1234',
    email: 'test@test.com',
    nickname: '홍길동',
    avatar_url?: 'http~',
  }
};
```

- 타입을 정의해 보자 (문법이 약하다면 사용함)

```ts
interface MessageDetail {
  id: string;
  chat_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  sender: {
    id: string;
    email: string;
    nickname: string;
    avatar_url?: string;
  };
}
```

- 타입을 정의해 보자. (문법중 상속을 아는 경우)

```ts
interface MessageDetail extends Message {
  sender: ChatUser;
}
```

## 6. 채팅방 목록용 타입도 필요할 듯

- 채팅방의 목록을 표시할 때 사용한 타입
- `last_message` : 미리보기 제공
- `other_user` : 상대방 정보
- `unread_count` : 읽지 않은 메세지 개수
- 아래는 샘플링

```ts
const chatItem: any = {
  id: 'chat-456',
  name: '홍길동',
  type: 'direct',
  last_message: {
    content: '안녕하세요.',
    create_at: '2025-09~~',
    sender_nickname: '홍길동',
  },
  other_user : {
    id: 'user-1234',
    email: 'test@test.com',
    nickname: '둘리',
    avatar_url?: 'http~',
  },
  unread_count: 5,
  updated_at: "2025-09~"
};
```

- 타입을 정의해 보자

```ts
interface ChatListItem {
  id: string; // 채팅방 ID
  name: string; // 채팅방 이름
  type: 'direct'; // 채팅방 타입
  last_message?: {
    // 마지막 메시지 정보(선택사항)
    content: string; // 내용
    create_at: string; // 작성시간
    sender_nickname: string; // 보낸사람 닉네임
  };
  other_user: ChatUser; // 상대방 사용자 정보
  unread_count: number; // 읽지 않은 메시지 수
  updated_at: string; // 마지막 업데이트 시간
}
```

## 7. 채팅방 생성용 타입 정의

- 새 채팅방을 생성할 때 필요한 최소한의 데이터
- `id`, `created_at` 는 서버에서 자동생성 필요
- 아래는 샘플링

```ts
const newChatData: any = {
  name: '1:1 채팅', // 채팅방 이름
  type: 'direct', // 채팅방 타입
  participant_id: 'user-357', // 참여자 ID
};
```

- 타입을 정의해 보자

```ts
interface CreateChatData {
  name: string; // 채팅방 이름
  type: 'direct'; // 채팅방 타입 (direct | group)
  participant_id: string; // 참여자 ID
}
```

## 8. 메시지 전송용 타입 필요할 듯

- 새 메시지를 전송할 때 필요한 데이터
- `id`, `created_at` 은 서버에서 자동생성
- 현재 로그인 한 사용자는 자동으로 설정
- 아래는 샘플링

```ts
const newMessageData: any = {
  chat_id: 'chat_456', // 채팅방 ID
  content: '안녕하세요....', // 메시지 내용
};
```

- 타입을 정의해 보자

```ts
interface CreateMessageData {
  chat_id: string; // 채팅방 ID
  content: string; // 메시지 내용
}
```

## 9. API 처리 후 응답용 타입

- 어떤 데이터가 처리 후 API 응답시 동일한 형태로 구성
- 성공/실패 상태, 데이터/에러를 구분해서 구성
- 다양한 케이스 이미로 `제네릭`을 활용함
- 아래는 샘플링

```ts
// 성공 응답
const successResponse: any<데이터형이 변경가능> = {
  success: true,
  data: 데이터형에 맞는 데이터
}

// 실패 응답
const errorResponse: any<데이터형이 변경가능> = {
  success: false,
  data: "에러에 대한 상세내용"
}
```

- 타입을 정의해 보자

```ts
interface ChatApiResponse<T> {
  success: boolean; // 성공 여부
  data?: T; // 응답 데이터 (제네릭타입-선택적)
  error?: string; // 에러메시지 (실패시-선택적)
}
```

## 10. Mock 데이를 위한 Service 구현

- API 호출 처리
- 데이터 변환 및 데이터 가공
- 에러 처리
- Mock 데이터 테스트 -> 실제 API 전환 테스트

### 10.1. Mock Data 준비

- `src/services/chat 폴더` 생성
- `src/services/chat/directChatService.ts 파일` 생성

```ts
/**
 * 1 : 1 채팅 서비스 (Mock 버전)
 *  - 실제 supabase API 연동 전까지 사용함.
 *  - Mock 데이터와 서비스 함수들 제공함.
 *  - 추후 Mock 데이터를 실제 API 호출로 대체 예정.
 *
 * 주요기능
 *  - 채팅방 생성 및 조회
 *  - 메시지 전송 및 조회
 *  - 사용자 검색
 *  - Mock 데이터를 이용한 UI 테스트
 *
 * 주의 사항
 *  - 모든 Mock 데이터를 실제 Supabase 쿼리로 대체
 *  - 에러처리도 상세하게 진행
 *  - 실시간 기능 (WebSocket 또는 Supabase Realtimes) 추가
 */

import type { ChatListItem, ChatUser, MessageDetail } from '../../types/ChatType';

/**
 * Mock 사용자 데이터
 *  실제로는 Supabase 의 profiles 테이블에서 가져올 데이터 샘플
 *  고유한 ID, 이메일, 닉네임, 아바타 URL
 */
const mockUser: ChatUser[] = [
  { id: '1', email: 'user1@example.com', nickname: '김철수', avatar_url: null },
  { id: '2', email: 'user2@example.com', nickname: '고길동', avatar_url: null },
  { id: '3', email: 'user3@example.com', nickname: '이영희', avatar_url: null },
  { id: '4', email: 'user4@example.com', nickname: '재현님', avatar_url: null },
];

/**
 * Mock 채팅방 목록 데이터
 *  실제로는 Supabase 의 채팅목록 테이블에서 가져올 데이터 샘플
 *  각 목록에는 마지막 메시지, 읽지 않는 메시지 수, 상대방 정보 포함
 */
const mockChats: ChatListItem[] = [
  {
    id: 'chat1',
    name: '김철수', // 채팅방 이름인데 1:1 이라서 상대방 닉네임으로
    type: 'direct', // 채팅 타입
    // 마지막 메시지 정보(선택사항)
    last_message: {
      content: '안녕하세요!', // 내용
      create_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 작성시간
      sender_nickname: '김철수', // 보낸사람 닉네임
    },
    other_user: mockUser[0], // 상대방 사용자 정보
    unread_count: 2, // 읽지 않은 메시지 수
    updated_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 마지막 업데이트 시간
  },
  {
    id: 'chat2',
    name: '이영희', // 채팅방 이름인데 1:1 이라서 상대방 닉네임으로
    type: 'direct', // 채팅 타입
    // 마지막 메시지 정보(선택사항)
    last_message: {
      content: '오늘 날씨가 좋네요^^', // 내용
      create_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 작성시간
      sender_nickname: '이영희', // 보낸사람 닉네임
    },
    other_user: mockUser[2], // 상대방 사용자 정보
    unread_count: 0, // 읽지 않은 메시지 수
    updated_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 마지막 업데이트 시간
  },
];

/**
 * Mock 메시지 데이터
 *  실제로는 Supabase 의 메세지 테이블에서 가져올 데이터 샘플
 *  채티방 ID를 키로 해서 각 채팅방의 메시지를 그룹화후 관리
 */
const mockMessages: { [chatId: string]: MessageDetail[] } = {
  chat1: [
    {
      id: 'msg1',
      chat_id: 'chat1',
      sender_id: '1',
      content: '안녕하세요.',
      created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      updated_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      sender: mockUser[0],
    },
    {
      id: 'msg2',
      chat_id: 'chat1',
      sender_id: '1',
      content: '안녕하세요! 반갑습니다.',
      created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      updated_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      sender: {
        id: 'current', // 현재 mockUser 에 없는 사용자 임시로.
        email: 'me@example.com',
        nickname: '나',
        avatar_url: null,
      },
    },
    {
      id: 'msg3',
      chat_id: 'chat1',
      sender_id: '1',
      content: '오늘 날씨가 정말 좋네요!.',
      created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      updated_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      sender: {
        id: 'current', // 현재 mockUser 에 없는 사용자 임시로.
        email: 'me@example.com',
        nickname: '나',
        avatar_url: null,
      },
    },
    {
      id: 'msg4',
      chat_id: 'chat1',
      sender_id: '1',
      content: '오늘 뭐 하시나요?',
      created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      updated_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      sender: mockUser[0],
    },
  ],
  chat2: [
    {
      id: 'msg5',
      chat_id: 'chat2',
      sender_id: '2',
      content: '오늘 날씨가 좋네요.',
      created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      updated_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      sender: mockUser[2],
    },
  ],
};
```

### 10.2. Service 함수 준비

- directChatService.ts 추가

```ts
/**
 * 1 : 1 채팅방 생성 또는 찾기
 * - 사용자가 특정 사용자와 채팅을 시작하려고 할 때 호출
 * - 기존 채팅방이 있으면 재사용, 없으면 새로 생성함
 * - 중복 채팅방이 생성되지 않도록
 *
 * @param participantId - 채팅방에 참여할 상대방 ID
 */
export async function findOrCreateDirectChat(
  participantId: string,
): Promise<ChatApiResponse<Chat>> {
  // mock 데이터로서 새로운 채팅방 생성 형태로 진행
  const newChat: Chat = {
    id: `chat_${Date.now()}`, // 채팅방 고유 식별자
    name: '1:1 채팅', // 채팅방 이름
    type: 'direct', // 채팅방 타입 (direct | group) : 현재는 1:1 만 지원
    created_by: 'current', // 채팅방 생성한 유저의 ID
    created_at: new Date().toISOString(), // 생성시간
    updated_at: new Date().toISOString(), // 마지막 업데이트 시간
  };
  return { success: true, data: newChat };
}

/**
 * 채팅방 목록 조회
 */
export async function getChatList(): Promise<ChatApiResponse<ChatListItem[]>> {
  await new Promise(resolve => setTimeout(resolve, 1000));
  return { success: true, data: mockChats };
}

/**
 * 메세지 전송
 *
 * @param messageData - 전송할 메시지 데이터
 */
export async function sendMessage(
  messageData: CreateMessageData,
): Promise<ChatApiResponse<Message>> {
  // 시뮬레이션으로 백엔드 비동기 느끼으로 0.5초 진행 대기
  await new Promise(resolve => setTimeout(resolve, 500));
  // Mock 데이터로 새로운 메시지를 생성
  const newMessage: Message = {
    id: `msg_${Date.now()}`, // 메시지 고유 식별자
    chat_id: messageData.chat_id, // 채팅방 ID
    sender_id: 'current', // 발신자 사용자 ID
    content: messageData.content, // 메시지 내용
    created_at: new Date().toISOString(), // 전송 시간
    updated_at: new Date().toISOString(), // 수정 시간(편집 시)
  };

  return { success: true, data: newMessage };
}

/**
 * 메세지 목록 조회
 *
 * @param chatId - 채팅방의 ID
 */
export async function getMessages(chatId: string): Promise<ChatApiResponse<MessageDetail[]>> {
  // 시뮬레이션으로 백엔드 비동기 느끼으로 0.5초 진행 대기
  await new Promise(resolve => setTimeout(resolve, 500));
  // Mock 데이터로서 해당 채팅방의 메시지들 전체 조회
  const messages = mockMessages[chatId] || null;
  return { success: true, data: messages };
}

/**
 * 사용자 검색
 * - 대화 상대방 찾기
 *
 * @param searchTerm - 검색할 닉네임 또는 이메일
 */
async function searchUsers(searchTerm: string): Promise<ChatApiResponse<ChatUser[]>> {
  // 시뮬레이션으로 백엔드 비동기 느끼으로 0.3초 진행 대기
  await new Promise(resolve => setTimeout(resolve, 300));
  if (!searchTerm.trim()) {
    return { success: true, data: [] };
  }
  const filteredUser = mockUser.filter(item =>
    item.nickname.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return { success: true, data: filteredUser };
}
```

### 11.

- `/src/contexts/DirectChatContext.tsx 파일 생성`

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
import type { ChatListItem, ChatUser, CreateMessageData, MessageDetail } from '../types/ChatType';
import {
  getChatList,
  getMessages,
  sendMessage as sendMessageService,
  searchUsers as searchUsersService,
  findOrCreateDirectChat,
} from '../services/chat/directChatService';

/**
 * DirectChatContext 의  Context 타입 정의
 * state 의 모양
 * action 의 모양
 */
interface DirectChatContextType {
  // state ========================
  chats: ChatListItem[]; // 채팅방 여러개 관리
  messages: MessageDetail[]; // 여러 메시지를 관리
  users: ChatUser[]; // 검색된 여러 사용자
  loading: boolean; // 로딩 상태 관리
  error: string | null;
  // action ========================
  loadChats: () => Promise<void>; // 채팅 목록 로딩 상태관리
  loadMessages: (chatId: string) => Promise<void>; // 특정 채팅방의 메시지 조회
  // 메시지가 제대로 전송되었는지 아닌지 체크를 위해 boolean 리턴 타입
  sendMessage: (messageData: CreateMessageData) => Promise<boolean>; // 메시지 전송
  searchUsers: (searchTerm: string) => Promise<void>; // 검색어(닉네임)롤 사용자 검색
  createDirectChat: (participantId: string) => Promise<string | null>; // 채팅방 생성 또는 접근
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
  const [messages, setMessages] = useState<MessageDetail[]>([]);
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 사용자가 선택해서 활성화한 채팅방의 ID 를 보관함.
  // 리랜더링이 되어서 값이 갱신되거나, 화면에 보여줄 필요는 없음.
  const currentChatId = useRef<string | null>(null);

  // 공통 기능 함수
  // 에러 메시지 전용 함수
  const handleError = useCallback((errorMessage: string) => {
    console.log(`Chat Error : ${errorMessage}`);
    setError(errorMessage);
  }, []);

  // 액션들
  // 채팅방 목록 가져오기 : 내가 참여한 목록
  const loadChats = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getChatList();
      if (response.success && response.data) {
        setChats(response.data); // 목록담기
      } else {
        handleError(response.error || '채팅방 목록을 불러올 수 없습니다.');
      }
    } catch (err) {
      handleError('채팅방 목록 로드 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  // 선택된 채팅방의 모든 메시지 가져오기
  const loadMessages = useCallback(
    async (chatId: string) => {
      try {
        setLoading(true);
        // 현재 활성화된 채팅방 ID 보관
        currentChatId.current = chatId;

        const response = await getMessages(chatId);
        if (response.success && response.data) {
          setMessages(response.data);
        } else {
          handleError(response.error || '메시지를 불러올 수 없습니다.');
        }
      } catch (err) {
        handleError('메시지 로드 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    },
    [handleError],
  );

  const sendMessage = useCallback(
    async (messageData: CreateMessageData) => {
      try {
        setLoading(true);
        const response = await sendMessageService(messageData);
        if (response.success && response.data) {
          // 즉시 UI 에 메시지를 추가한다.
          const newMessages: MessageDetail = {
            ...response.data,
            sender: {
              id: response.data.sender_id,
              email: 'me@example.com',
              nickname: '나',
              avatar_url: null,
            },
          };
          setMessages(prev => [...prev, newMessages]);
          // 채팅방 새로고침
          await loadChats();
          return true;
        } else {
          handleError(response.error || '메세지 전송에 실패했습니다.');
          return false;
        }
      } catch (err) {
        handleError('메시지 전송 중 오류가 발생했습니다.');
        return false;
      } finally {
        setLoading(false);
      }
    },
    [handleError, loadChats],
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

  // 에러메세지 초기화
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Context 의 value
  const value: DirectChatContextType = {
    // 상태(state)
    chats,
    messages,
    users,
    loading,
    error,
    // 액션 (action) : 샹태관리 업데이트 함수
    loadChats,
    loadMessages,
    sendMessage,
    searchUsers,
    createDirectChat,
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

## 12. Chat 관련 Context API 적용

- App.tsx 업데이트

```tsx
function App() {
  return <DirectChatProider>....</DirectChatProider>;
}

export default App;
```

## 13. 채팅의 각 기능 테스트하기

- /src/pages/chat/DirectChatPage.tsx 업데이트 및 활용
- 사용자 선택 채팅방 번호를 전달 (각 컴포넌트)

```tsx
/**
 * 주요 기능
 * - 채팅목록과 채팅방을 분할한 레이아웃으로 표시
 * - 채팅방 선택 및 채팅방 전환 관리
 * - 환영 화면 표시 (채팅방 미선택 시)
 * - 반응형 레이아웃 지원
 * - 레이아웃 구성 : 사이드바와 메인 영역으로 구성
 * - 컴포넌트 구성 : DirectChatList 와 DirectChatRoom 컴포넌트
 */

import { useState } from 'react';
import DirectChatList from '../../components/chat/direct/DirectChatList';
import DirectChatRoom from '../../components/chat/direct/DirectChatRoom';

function DirectChatPage() {
  // 현재 선택된 채팅방의 ID 상태 관리
  const [selectedChatId, setSelectedChatId] = useState<string | null>('');

  /**
   * 채팅방 선택 처리 함수
   * DirectChatList 에서 목록 중 채팅방 1개를 선택하면 호출됨
   * 선택된 채팅방 ID 를 상태에 보관함
   */
  const handleChatSelect = (chatId: string) => {
    setSelectedChatId(chatId);
  };

  /**
   * 새로운 채팅 생성 처리 함수
   *
   * DirectChatList 에서 새 채팅 버튼 클릭시 호출
   */
  const handleCreateChat = () => {
    // 새로운 채팅방 생성 처리
  };

  return (
    <div className="chat-page">
      {/* 메인 채팅 컨테이너 - 사이드바와 메인 영역으로 구성 */}
      <div className="chat-container">
        {/* 왼쪽 사이드 바 - 채팅 목록 표시 */}
        <div className="chat-sidebar">
          <DirectChatList
            onChatSelect={handleChatSelect} // 채팅방 선택시 호출되는 콜백 함수
            onCreateChat={handleCreateChat} // 새 채팅방 생성시 호출되는 콜백 함수
            selectedChatId={selectedChatId || undefined} // 현재 선택된 채팅방 ID
          />
        </div>
        {/* 오른쪽 메인 영역 - 채팅방 또는 환영 화면 표시 */}
        <div className="chat-main">
          {/* 선택된 채팅방 ID 유무 */}
          {selectedChatId ? (
            // 채팅방이 선택된 경우 : DirectChatRoom
            <DirectChatRoom chatId={selectedChatId} />
          ) : (
            // 채팅방이 선택되지 않은 경우 : 환영 화면 표시
            <div className="chat-welcome">
              {/* 환영 화면 내용 */}
              <div className="welcome-content">
                <h2>1:1 채팅</h2>
                <p>좌측에서 채팅방을 선택하거나</p>
                <p>새 채팅 버튼을 눌러 대화를 시작하세요.</p>
                {/* 기능 안내 정보 */}
                <div className="feature-info">
                  <p>💬 실시간 1:1 메시지</p>
                  <p>👥 사용자 검색 및 초대</p>
                  <p>📱 반응형 디자인</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DirectChatPage;
```

- /src/components/chat/DirectChatList.tsx
- Context 를 통해서 Service API 호출 및 상태 출력

```tsx
/**
 * - 채팅 네비게이션 : 사용자가 참여 중인 채팅방 목록 제공
 * - 상태 표시 : 읽지 않은 메시지와 최신 활동 표시
 * - 새 채팅 시작 : 사용자 검색을 통한 새 채팅방 생성
 */

import { useEffect, useState } from 'react';
import { useDirectChat } from '../../../contexts/DirectChatContext';
import type { ChatUser } from '../../../types/ChatType';

// Props 정의
interface DirectChatListProps {
  onChatSelect: (chatId: string) => void; // 채팅방 선택시 호출되는 콜백 함수
  onCreateChat: () => void; // 새 채팅방 생성시 호출되는 콜백 함수
  selectedChatId?: string; // 현재 선택된 채팅방 ID
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
  }, [loadChats]); // 신규 또는 메세지 전송 등으로 업데이트 시 목록 호출

  // 컴포넌트가 변경시 사용자 검색 즉시 실행
  // 검색어가 비어있지 않을 때만 검색 수행
  useEffect(() => {
    // 사용자 검색어가 만약 있다면
    if (searchTerm.trim()) {
      // console.log('DB 에서 사용자 닉네임을 실시간 검색함...');
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
    // 상대방 선택됨
    // 상대방의 id 를 이용해서 채팅방을 생성해야 합니다.
    const chatId = await createDirectChat(user.id);
    if (chatId) {
      onChatSelect(user.id); // 새로운 채팅방 생성
      setShowUserSearch(false); // 사용자 검색 UI 숨기기
      setSearchTerm(''); // 검색어 초기화
    }
  };

  // 에러 상태일 때 에러 메세지 표시
  if (error) {
    return (
      <div className="chat-list">
        <div className="error-message">
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
        {/* 사용자가 새 채팅 생성시 showUserSearch 를 true 로 변경 */}
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
              // 사용자 중 대화상대를 선택할 수 있음 : handleUserSelect
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
            //개별 채팅 아이템
            <div
              key={chat.id}
              className={`chat-item ${selectedChatId === chat.id ? 'selected' : ''} `}
              onClick={() => onChatSelect(chat.id)}
            >
              {/* 채팅 상대방 아바타 */}
              <div className="chat-avatar">
                {chat.other_user.avatar_url ? (
                  // 상대방 아바타 이미지 있는경우
                  <img src={chat.other_user.avatar_url} alt={chat.other_user.nickname} />
                ) : (
                  // 상대방 아바타 이미지 없는 경우
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

- /src/components/chat/DirectChatRoom.tsx
- Context 를 통해서 Service API 호출 및 상태 출력

```tsx
import React, { useEffect, useRef } from 'react';
import MessageInput from '../common/MessageInput';
import { useDirectChat } from '../../../contexts/DirectChatContext';

// DirectChatRoom 컴포넌트의 Props 타입 정의
interface DirectChatRoomProps {
  chatId: string;
}

const DirectChatRoom = ({ chatId }: DirectChatRoomProps) => {
  // DirectChatContext 에서 필요한 상태와 함수를 가져오기
  const { messages, loading, error, loadMessages } = useDirectChat();

  // 메시지 개수가 많으면 하단으로 스크롤 해야함
  // 새 매시지가 추가될 때 마다 최신 메시지를 볼 수 있도록 해야함
  const messageEndRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 채팅방 ID 가 변경이 되면 메시지를 다시 로드
  useEffect(() => {
    if (chatId) {
      loadMessages(chatId);
    }
  }, [chatId, loadMessages]);

  // 메시지 시간 포맷팅 함수 - HH:MM:DD 형식 반환
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false, // 24시간 형식 사용
    });
  };

  // 날짜 포맷팅 함수 - 오늘 : "오늘" , 과거 : "12월 25일" 형식
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return '오늘';
    } else {
      return date.toLocaleDateString('ko-KR', {
        month: 'short', // 짧은 월 이름 (예: "12월")
        day: 'numeric', // 숫자 날짜 (예: "25")
      });
    }
  };

  // 메시지를 날짜별로 그룹화하는 함수 - 같은 날짜의 메시지들을 하나의 그룹으로
  // 날짜 구분선도 표시
  const groupMessagesByDate = (messages: any[]) => {
    const groups: { [key: string]: any[] } = {};
    messages.forEach(message => {
      const date = new Date(message.created_at).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    return groups;
  };

  // 현재 사용자 ID (지금은 Mock 버전이어서 current 라고 함)
  // 실제 구현에서는 인증된 사용자의 ID 를 사용함
  const currentUserId = 'current';

  // 에러 상태일 때 에러 메시지 표시
  if (error) {
    return (
      <div className="chat-room">
        <div className="error-message">
          <p>오류 : {error}</p>
          <button onClick={() => loadMessages(chatId)}>다시 시도</button>
        </div>
      </div>
    );
  }

  // 로딩 상태일 때 로딩 메시지 표현
  if (loading) {
    return (
      <div className="chat-room">
        <div className="loading">메시지를 불러오는 중...</div>
      </div>
    );
  }

  // 메시지들을 날짜별로 그룹화 (리랜더링 자동으로 됨)
  const messageGroups = groupMessagesByDate(messages);

  return (
    <div className="chat-room">
      {/* 채팅방 헤더 - 제목과 나가기 */}
      <div className="chat-room-header">
        {/* 채팅방 정보 */}
        <div className="chat-room-info">
          <h3>1:1 채팅 (상대방 닉네임)</h3>
        </div>
        {/* 채팅방 액션 버튼들 */}
        <div className="chat-room-actions">
          {/* 채팅 나가기 버튼 */}
          <button
            className="exit-chat-btn"
            onClick={() => {
              if (window.confirm('채팅방을 나가시겠습니까?')) {
                alert('채팅방을 나갔습니다. (Mock 버전)');
              }
            }}
          >
            나가기
          </button>
        </div>
      </div>
      {/* 메시지 목록 영역 */}
      <div className="chat-room-message">
        {Object.keys(messageGroups).length === 0 ? (
          // 메시지가 없을 때 안내 메시지
          <div className="no-message">
            <p>아직 메시지가 없습니다.</p>
            <p>첫 번째 메시지를 보내세요!</p>
          </div>
        ) : (
          // 날짜 별로 그룹화된 메시지 목록 랜더링
          Object.entries(messageGroups).map(([date, dateMessages]) => (
            <div key={date} className="message-group">
              {/* 날짜 구분선 */}
              <div className="date-divider">
                {/* 날짜 출력 */}
                <span>{formatDate(dateMessages[0].created_at)}</span>
              </div>

              {/* 메시지들 묶음 컨테이너 */}
              <div className="message-group-container">
                {dateMessages.map(message => {
                  const isMyMessage = message.sender.id === currentUserId;

                  return (
                    <div
                      key={message.id}
                      className={`message-item ${isMyMessage ? 'my-message' : ' other-message'}`}
                    >
                      {isMyMessage ? (
                        <>
                          {/* 나의 메시지 - 오른쪽 정렬 */}
                          {/* 내 메시지 : 말풍선, 시간, 아바타 (오른쪽 정렬) */}
                          <div className="message-bubble">
                            <div className="message-text">{message.content}</div>
                            <div className="message-time">{formatTime(message.created_at)}</div>
                          </div>
                          <div className="message-avatar">
                            {message.sender.avatar_url ? (
                              <>
                                {/* 나의 아바타 이미지가 있는 경우 */}
                                <img
                                  src={message.sender.avatar_url}
                                  alt={message.sender.nickname}
                                />
                              </>
                            ) : (
                              <>
                                {/* 나의 아바타 이미지가 없는 경우 - 첫글자만*/}
                                <div className="avatar-placeholder">
                                  {message.sender.nickname.charAt(0)}
                                </div>
                              </>
                            )}
                          </div>
                        </>
                      ) : (
                        <>
                          {/* 대상의 메시지 - 왼쪽 정렬 */}
                          <div className="message-avatar">
                            {message.sender.avatar_url ? (
                              <>
                                {/* 대화상대 아바타 이미지가 있는 경우 */}
                                <img src={message.sender.avatar} alt={message.sender.nickname} />
                              </>
                            ) : (
                              <>
                                {/* 대화상대 아바타 이미지가 없는 경우 - 첫글자만*/}
                                <div className="avatar-placeholder">
                                  {message.sender.nickname.charAt(0)}
                                </div>
                              </>
                            )}
                          </div>
                          {/* 대화상대 메시지 :  말풍선, 시간, 아바타 (왼쪽 정렬) */}
                          <div className="message-bubble">
                            <div className="message-text">{message.content}</div>
                            <div className="message-time">{formatTime(message.created_at)}</div>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
        {/* 자동 스크롤을 위한 참조 */}
        <div ref={messageEndRef} />
      </div>

      {/* 메시지 입력 컴포넌트 */}
      <MessageInput chatId={chatId} />
    </div>
  );
};

export default DirectChatRoom;
```
