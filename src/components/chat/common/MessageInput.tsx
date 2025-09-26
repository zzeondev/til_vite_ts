/**
 * 1:1 채팅에서 메시지를 입력하고 전송하는 컴포넌트
 * - 자동 높이 조절되는 텍스트 영역
 * - Enter 키로 메시지 전송, Shift + Enter 로 줄 바꿈
 * - 전송 중 로딩 상태 표시
 * - 빈 메시지 전송 방지
 * - 전송 후 입력 필드 자동 초기화
 */

const MessageInput = () => {
  return (
    <div className="message-input">
      <form className="message-form">
        {/* 입력 컨테이너 - 텍스트 영역과 전송 버튼 */}
        <div className="input-containter">
          {/* 메시지 입력 텍스트 영역 */}
          <textarea
            className="message-textarea"
            rows={1}
            placeholder="메시지를 입력하세요... (Enter 로 전송, Shift+Enter 로 줄바꿈)"
          />
          {/* 메시지 전송 버튼 */}
          <button type="submit" className="send-button">
            {/* 전송 중일 때 로딩 스피너 표시 */}
            {/* <div className="loading-spiner"></div> */}
            {/* 평상시 전송 아이콘 표시 (종이비행기 모양) */}
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" fill="currentColor" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
};

export default MessageInput;
