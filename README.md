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
