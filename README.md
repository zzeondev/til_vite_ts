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
