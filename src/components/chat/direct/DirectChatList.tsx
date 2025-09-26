/**
 * - 채팅 네비게이션 : 사용자가 참여 중인 채팅방 목록 제공
 * - 상태 표시 : 읽지 않은 메시지와 최신 활동 표시
 * - 새 채팅 시작 : 사용자 검색을 통한 새 채팅방 생성
 */

import { useEffect, useState } from 'react';

// Props 정의
interface DirectChatListProps {
  onChatSelect: (chatId: string) => void; // 채팅방 선택시 호출되는 콜백 함수
  onCreateChat: () => void; // 새 채팅방 생성시 호출되는 콜백 함수
  selectdChatId?: string; // 현재 선택된 채팅방 ID
}

// 사용자 검색시 생성되어지는 객체 형태의 모양
interface ChatUser {
  id: string; // 사용자 고유 식별자 (UUID)
  email: string; // 사용자 이메일 주소
  nickname: string; // 표시용 닉네임
  avatar_url?: string; // 프로필 이미지 URL (선택사항)
}

const DirectChatList = ({ onChatSelect, onCreateChat, selectdChatId }: DirectChatListProps) => {
  // DB 에서 읽어온 데이터를 관리함 : 여러 곳에서 활용하는 데이터 이므로 context 를 활용예정
  const [users, setUsers] = useState<ChatUser[]>([]);

  // 사용자 검색 상태 관리
  const [searchTerm, setSearchTerm] = useState<string>(''); // 사용자 검색어
  const [showUserSearch, setShowUserSearch] = useState<boolean>(false); // 사용자 검색 UI 표시 여부

  // 컴포넌트가 변경시 사용자 검색 즉시 실행
  // 검색어가 비어있지 않을 때만 검색 수행
  useEffect(() => {
    // 사용자 검색어가 만약 있다면
    if (searchTerm.trim()) {
      console.log('DB 에서 사용자 닉네임을 실시간 검색함...');
    }
  }, [searchTerm]);

  /**
   * 사용자 선택 시 새 채팅방 생성 및 선택
   * 처리 과정 :
   * 1. 선택된 사용자와 새 채팅방 생성
   * 2. 생성된 채팅방을 즉시 선택된 것으로 인정
   * 3. 사용자 검색 UI 숨김
   * 4. 사용자 검색어 초기화
   */
  const handleUserSelect = (user: ChatUser) => {
    // 사용자 선택됨
    // 사용자의 id 를 이용해서 채팅방을 생성해야 합니다.
    onChatSelect(user.id); // 새로운 채팅방 생성
    setShowUserSearch(false); // 사용자 검색 UI 숨기기
    setSearchTerm(''); // 검색어 초기화
  };

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
              {/* <span className="no-message">메시지가 없습니다.</span> */}
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
