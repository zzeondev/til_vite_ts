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

import type {
  Chat,
  ChatApiResponse,
  ChatListItem,
  ChatUser,
  CreateMessageData,
  Message,
  MessageDetail,
} from '../../types/ChatType';

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
export async function searchUsers(searchTerm: string): Promise<ChatApiResponse<ChatUser[]>> {
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
