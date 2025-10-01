# DirectChatRoom.tsx 보완

## 1. 메시지 그룹핑 업데이트

```tsx
// 날짜별 메시지 그룹 타입 정의 - 같은 날짜의 메시지들을 그룹핑
// 원본데이터를 가공하고 마무리. 별도의 파일에 type 으로 정의 안함
interface MessageGrouop {
  [date: string]: MessageDetail[]; // 날짜 문자열을 키로 하고 해당 날짜의 메시지 배열을 값으로 담음
}
```

```tsx
// 메시지를 날짜별로 그룹화하는 함수 - 같은 날짜의 메시지들을 하나의 그룹으로
// 날짜 구분선도 표시
// 사용자가 만약 채팅방을 한개 선택하면 채팅방의 메시지 내용이 들어옴
const groupMessagesByDate = (messages: MessageDetail[]): MessageGrouop => {
  // 날짜 별로 그룹화 된 메시지를 저장
  const groups: MessageGrouop = {};
  messages.forEach((message: MessageDetail) => {
    // 메시지 생성일의 속성을 문자열로 만듦
    const date = new Date(message.created_at).toDateString();
    // 만약 키명으로 새로운 날짜 글자가 들어오면 키명을 새로 만들자
    if (!groups[date]) {
      groups[date] = [];
    }
    // 해당 날짜의 그룹에 메시지를 추가
    groups[date].push(message);
  });
  return groups;
};
```

```tsx
// 날짜 별로 그룹화된 메시지 목록 랜더링
Object.entries(messageGroups).map(([date, dateMessages]: [string, MessageDetail[]]) => (
  <div key={date} className="message-group">
    {/* 날짜 구분선 */}
    <div className="date-divider">
      {/* 날짜 출력 */}
      <span>{formatDate(dateMessages[0].created_at)}</span>
    </div>

    {/* 메시지들 묶음 컨테이너 */}
    <div className="message-group-container">
      {dateMessages.map((message: MessageDetail) => {
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
                      <img src={message.sender.avatar_url} alt={message.sender.nickname} />
                    </>
                  ) : (
                    <>
                      {/* 나의 아바타 이미지가 없는 경우 - 첫글자만*/}
                      <div className="avatar-placeholder">{message.sender.nickname.charAt(0)}</div>
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
                      <img src={message.sender.avatar_url} alt={message.sender.nickname} />
                    </>
                  ) : (
                    <>
                      {/* 대화상대 아바타 이미지가 없는 경우 - 첫글자만*/}
                      <div className="avatar-placeholder">{message.sender.nickname.charAt(0)}</div>
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
));
```

## 2. 메시지 입력후 스크롤바 위치 조절

- 업데이트

```tsx
// DOM 업데이트 후 실행되도록 함
const scrollToBottom = () => {
  // DOM 완료 후 실행도도록
  setTimeout(() => {
    messageEndRef.current?.scrollIntoView({
      behavior: 'smooth', // 부드러운 스크롤 애니메이션
      block: 'end', // 수직 스크롤을 요소의 하단에 맞춤
      inline: 'nearest', // 수평 스크롤을 가장 가까운 위치에 맞춤
    });
  }, 100);
};
```

```tsx
// 새로운 메시지가 축되거나 메시지 목록이 변경이 되면 하단으로 스크롤
useEffect(() => {
  // 메시지가 왔을 때만 스크롤 실행
  if (messages.length > 0) {
    scrollToBottom();
  }
}, [messages]);
```

```tsx
// 초기 로딩 완료 후 스크롤 (메시지 처음 로딩 완료)
useEffect(() => {
  if (!loading && messages.length > 0) {
    scrollToBottom();
  }
}, [loading, messages]);
```

# Supabase 테이블 설정

## 1. profiles 테이블의 select 의 RLS 는 해제 필요

- 기존 정책 수정 (Select) : SQL Editor

```sql
-- profiles 테이블 RLS 정책 수정
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view all profiles" ON profiles
    FOR SELECT USING (true);
```

## 2. 채팅을 위한 테이블 생성

### 2.1. 채팅방 테이블

- `direct_chats` : 테이블명
- 1 : 1 채팅방의 기본 정보를 저장하는 테이블
- 두 사용자 간의 채팅방을 고유하게 식별
- 최신 메시지 순으로 정렬하기 위해 필드 구성
- 중복 채팅방 생성을 방지하도록

#### 2.1.1. 주요기능

- 채팅방 생성 및 관리
- 채팅방 목록 조회 시 정렬 기준 제공
- 사용자 간의 채팅방 관계 정의
- 중복 채팅방 방지

#### 2.1.2. 테이블 생성 쿼리

```sql
-- 1:1 채팅방 테이블 생성 (Supabase 호환 버전)
CREATE TABLE direct_chats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), -- 채팅방 고유 식별자 (자동 생성)
  user1_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, -- 참여자 1의 사용자 ID (Supabase auth.users 참조)
  user2_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, -- 참여자 2의 사용자 ID (Supabase auth.users 참조)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), -- 채팅방 생성 시간 (자동 설정)
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), -- 마지막 메시지 시간 (채팅방 목록 정렬용)

  -- 중복 방지를 위한 가상 컬럼들 (PostgreSQL 12+ Generated Columns)
  user_pair_high UUID GENERATED ALWAYS AS (GREATEST(user1_id, user2_id)) STORED, -- 사용자 ID 중 큰 값 (자동 계산)
  user_pair_low UUID GENERATED ALWAYS AS (LEAST(user1_id, user2_id)) STORED, -- 사용자 ID 중 작은 값 (자동 계산)

  -- 제약조건
  CONSTRAINT no_self_chat CHECK (user1_id != user2_id), -- 자신과의 채팅방 생성 방지
  CONSTRAINT unique_chat_pair UNIQUE (user_pair_high, user_pair_low) -- 사용자 순서 무관하게 중복 채팅방 방지
);

-- 인덱스 생성
CREATE INDEX idx_direct_chats_user1 ON direct_chats(user1_id);
CREATE INDEX idx_direct_chats_user2 ON direct_chats(user2_id);
CREATE INDEX idx_direct_chats_last_message ON direct_chats(last_message_at DESC);
```

### 2.2. 메시지 정보 테이블

- `direct_messages` : 테이블명
- 실제 채팅 메시지 내용을 저장하는 테이블
- 메시지의 발신자, 내용, 시간 정보를 관리
- 읽음 상태(`is_read`)를 통해서 메시지 읽음 여부 추적
- 메시지 수정 이력을 `updated_at`

#### 2.2.1. 주요기능

- 채팅 메시지 저장 및 조회
- 메시지 읽음 상태 관리
- 채팅방 내 메시지 시간 속 정렬
- 읽지 않은 메시지 수 계산

#### 2.2.2. 테이블 생성 쿼리

```sql
-- 1:1 채팅 메시지 테이블 생성 (Supabase 호환 버전)
CREATE TABLE direct_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), -- 메시지 고유 식별자 (자동 생성)
  chat_id UUID NOT NULL REFERENCES direct_chats(id) ON DELETE CASCADE, -- 소속 채팅방 ID (direct_chats 테이블 참조)
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, -- 발신자 사용자 ID (Supabase auth.users 참조)
  content TEXT NOT NULL, -- 메시지 내용 (텍스트)
  is_read BOOLEAN DEFAULT FALSE, -- 읽음 상태 (기본값: 읽지 않음)
  read_at TIMESTAMP WITH TIME ZONE, -- 읽은 시간 (읽음 처리 시 설정)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), -- 메시지 전송 시간 (자동 설정)

  -- 메시지 내용 길이 제한 (2000자)
  CONSTRAINT content_length CHECK (LENGTH(content) <= 2000)
);

-- 인덱스 생성
CREATE INDEX idx_direct_messages_chat_id ON direct_messages(chat_id);
CREATE INDEX idx_direct_messages_sender ON direct_messages(sender_id);
CREATE INDEX idx_direct_messages_created_at ON direct_messages(created_at DESC);
CREATE INDEX idx_direct_messages_chat_created ON direct_messages(chat_id, created_at DESC);
```

## 3. Supabase Realtime 설정

- `새로고침` 없이 데이터 CRUD

### 3.1. `direct_chats` 에 설정

```sql
-- direct_chats 테이블에 Realtime 활성화
ALTER PUBLICATION supabase_realtime ADD TABLE direct_chats;
```

### 3.2. `direct_messages` 에 설정

```sql
-- direct_messages 테이블에 Realtime 활성화
ALTER PUBLICATION supabase_realtime ADD TABLE direct_messages;
```
