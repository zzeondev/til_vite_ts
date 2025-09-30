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
