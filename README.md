# 더미 데이터를 이용한 테스트 코드

- 테이블 구조에 대해서 고민 선작업

## 1. 데이터 타입 정의를 많이 고민합니다.

- `/src/types/ChatType.ts 파일` 생성

## 2. 채팅 시스템에서 사용자 정보를 나타내는 기본형

- 아래는 샘플링

```ts
const user: any = {
  id: 'user-1234',
  email: 'test@test.com',
  nickname: '홍길동',
  avatar_url?: 'https~',
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

## 3. 채팅 시스템에서 채팅방의 타입도 필요로 함

- 채팅방의 기본 정보를 담는 타입
- 향후 업데이트를 위해서 채팅방의 타입도 정의된 타입
- 채팅방 생성자와 시간 정보로 채팅방을 관리함
- 아래는 샘플링

```ts
const chat: any = {
  id: 'chat-455',
  name: '1:1 채팅',
  type: 'direct', // direct | group
  created_by: 'user_123',
  created_at: '2025-09-26',
  updated_at: '2025-09-26',
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

## 4. 채팅 메시지의 타입도 필요로 함

- 개별 메시지의 기본 정보를 담는 타입
- 어떤 채팅방의 메시지인지 구분
- 발신자 : 누가 발신했는지
- 실제 메시지 텍스트도 저장
- 아래는 샘플링

```ts
const message: any = {
  id: 'msg-4567',
  chat_id: 'chat-456',
  sender_id: 'user-123',
  content: '안녕하세요',
  created_at: '2025-09-26',
  updated_at: '2025-09-26',
};
```

- 타입을 정의 해보자

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

## 5. 메시지 + 발신자 정보 형태가 필요함

- 확장 타입
- 하나의 메시지는 메시지 타입과 발신자 정보 형태가 혼합이 되어있음
- 아래는 샘플링

```ts
const sample: any = {
  id: 'msg-4567',
  chat_id: 'chat-456',
  sender_id: 'user-123',
  content: '안녕하세요',
  created_at: '2025-09-26',
  updated_at: '2025-09-26',
  sender: {
    id: 'user-1234',
    email: 'test@test.com',
    nickname: '홍길동',
    avatar_url?: 'https~',
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

- 타입을 정의해 보자 (문법중 상속을 아는 경우)

```ts
interface MessageDetail extends Message {
  sender: ChatUser;
}
```

## 6. 채팅방 목록용 타입도 필요할듯

- 채팅방의 목록을 표시할 때 사용한 타입
- `last_message` : 미리보기 제공
- `other_user` : 상대방 정보
- `unread_count` : 읽지 않은 메시지 개수
- 아래는 샘플링

```ts
const ChatITem: any = {
  id: 'chat-456',
  name: '홍길동',
  type: 'direct',
  last_message: {
    content: '안녕하세요',
    create_at: '2025-09-26',
    sender_nickname: '홍길동',
  },
  other_user: {
    id: 'user-12345',
    email: 'test1@test.com',
    nickname: '둘리',
    avatar_url?: 'https~',
  },
  unread_count: 5,
  update_at: "2025-09~"
};
```

- 타입을 정의해 보자

```ts
interface ChatListItem {
  id: string;
  name: string;
  type: 'direct';
  last_message?: {
    content: string;
    created_at: string;
    sender_nickname: string;
  };
  other_user: ChatUser;
  unread_count: string;
  updated_at: string;
}
```
