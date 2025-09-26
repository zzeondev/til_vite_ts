import React from 'react';
import MessageInput from '../common/MessageInput';

export const DirectChatRoom = () => {
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
        {/* 메시지가 없을 때 안내 메시지 */}
        {/* <div className="no-message">
          <p>아직 메시지가 없습니다.</p>
          <p>첫 번째 메시지를 보내세요!</p>
        </div> */}

        {/* 날짜 별로 그룹화된 메시지 목록 랜더링 */}
        <div className="message-group">
          {/* 날짜 구분선 */}
          <div className="date-divider">
            {/* 날짜 출력 */}
            <span>오늘</span>
          </div>

          {/* 메시지들 묶음 컨테이너 */}
          <div className="message-group-container">
            {/* 해당 날짜의 메시지들 */}
            {/* 나의 메시지 - 오른쪽 정렬 */}
            <div className="message-item my-message">
              {/* 내 메시지 : 말풍선, 시간, 아바타 (오른쪽 정렬) */}
              <div className="message-bubble">
                <div className="message-text">내가 작성한 채팅</div>
                <div className="message-time">13:25</div>
              </div>
              <div className="message-avatar">
                {/* 나의 아바타 이미지가 있는 경우 */}
                {/* <img src="https://api.dicebear.com/7.x/adventurer/svg?seed=tmpAvatar" alt="닉네임" /> */}
                {/* 나의 아바타 이미지가 없는 경우 */}
                <div className="avatar-placeholder">닉</div>
              </div>
            </div>

            {/* 대상의 메시지 - 왼쪽 정렬 */}
            <div className="message-item other-message">
              <div className="message-avatar">
                {/* 대화상대 아바타 이미지가 있는 경우 */}
                <img
                  src="https://api.dicebear.com/7.x/adventurer/svg?seed=tmpAvatar"
                  alt="닉네임"
                />
                {/* 대화상대 아바타 이미지가 없는 경우 - 첫글자만*/}
                {/* <div className="avatar-placeholder">닉</div> */}
              </div>
              {/* 대화상대 메시지 :  말풍선, 시간, 아바타 (왼쪽 정렬) */}
              <div className="message-bubble">
                <div className="message-text">상대방이 작성한 채팅 </div>
                <div className="message-time">13:26</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 메시지 입력 컴포넌트 */}
      <MessageInput />
    </div>
  );
};

export default DirectChatRoom;
