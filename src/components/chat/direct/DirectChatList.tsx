/**
 * - 채팅 네비게이션 : 사용자가 참여 중인 채팅방 목록 제공
 * - 상태 표시 : 읽지 않은 메시지와 최신 활동 표시
 * - 새 채팅 시작 : 사용자 검색을 통한 새 채팅방 생성
 */
const DirectChatList = () => {
  return (
    <div className="chat-list">
      {/* 채팅 목록 헤더 - 제목과 새 채팅 버튼 */}
      <div className="chat-list-header">
        <h2>1 : 1 채팅</h2>
        <button className="new-chat-btn">새 채팅</button>
      </div>

      {/* 사용자 검색 UI - 새 채팅 버튼 클릭 시 표시 */}
      <div className="user-search">
        {/* 사용자 검색 필드 */}
        <input type="text" placeholder="사용자 검색..." className="search-input" />
        {/* 검색 결과 목록 */}
        <div className="search-result">
          {/* 검색된 사용자 출력 */}
          <div className="user-item">
            {/* 사용자 아바타 */}
            <div className="user-avatar">
              {/* 사용자 아바타 이미지 출력 */}
              <img
                src="https://api.dicebear.com/7.x/adventurer/svg?seed=tmpAvatar"
                alt="사용자닉네임"
              />
              {/* 사용자 아바타 닉네임 출력*/}
              {/* <div className="avatar-placeholder">닉</div> */}
            </div>
            {/* 사용자 정보 */}
            <div className="user-info">
              <div className="user-nickname">닉네임</div>
            </div>
          </div>
        </div>
        {/* 검색 결과가 없을 때 표시 */}
        <div className="no-results">검색 결과가 없습니다.</div>
      </div>

      {/* 채팅 목록 컨테이너 */}
      <div className="chat-items">
        {/* 로딩표시 */}
        {/* <div className="loading">로딩 중...</div> */}

        {/* 채팅방이 없을 때 안내 메시지 */}
        {/* <div className="no-chats">
          <p>아직 채팅방이 없습니다.</p>
          <p>새 채팅 버튼을 눌러 대화를 시작하세요!</p>
        </div> */}

        {/* 채팅 목록 렌더링  */}
        {/* 개별 채팅 아이템 */}
        <div className="chat-item">
          {/* 채팅 상대방 아바타 */}
          <div className="chat-avatar">
            <img src="https://api.dicebear.com/7.x/adventurer/svg?seed=tmpAvatar" alt="닉네임" />

            {/* 아바타 이미지가 없는 경우 */}
            {/* <div className="avatar-placeholder">닉</div> */}

            {/* 읽지 않은 메시지 개수 배지 */}
            <div className="unread-badge">5</div>
          </div>
          {/* 채팅 정보 */}
          <div className="chat-info">
            {/* 채팅 헤더 - 이름과 시간 */}
            <div className="chat-header">
              <div className="chat-name">상대방 닉네임</div>
              <div className="chat-time">마지막 메시지 시간</div>
            </div>

            {/* 마지막 메시지 미리보기 */}
            <div className="chat-preview">
              <span className="unread">
                마지막 채팅 작성자 닉네임 : 마지막 채팅 메세지 내용을 출력합니다.
              </span>
              <span className="no-message">메시지가 없습니다.</span>
            </div>
          </div>
        </div>
        {/* 선택된 채팅 아이템 */}
        <div className="chat-item selected"></div>
      </div>
    </div>
  );
};

export default DirectChatList;
