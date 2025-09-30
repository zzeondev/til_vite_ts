/**
 * 주요 기능
 * - 채팅목록과 채팅방을 분할한 레이아웃으로 표시
 * - 채팅방 선택 및 채팅방 전환 관리
 * - 환영 화면 표시 (채팅방 미선택 시)
 * - 반응형 레이아웃 지원
 * - 레이아웃 구성 : 사이드바와 메인 영역으로 구성
 * - 컴포넌트 구성 : DirectChatList 와 DirectChatRoom 컴포넌트
 */

import { useState } from 'react';
import DirectChatList from '../../components/chat/direct/DirectChatList';
import DirectChatRoom from '../../components/chat/direct/DirectChatRoom';

function DirectChatPage() {
  // 현재 선택된 채팅방의 ID 상태 관리
  const [selectedChatId, setSelectedChatId] = useState<string | null>('');

  /**
   * 채팅방 선택 처리 함수
   * DirectChatList 에서 목록 중 채팅방 1개를 선택하면 호출됨
   * 선택된 채팅방 ID 를 상태에 보관함
   */
  const handleChatSelect = (chatId: string) => {
    setSelectedChatId(chatId);
  };

  /**
   * 새로운 채팅 생성 처리 함수
   *
   * DirectChatList 에서 새 채팅 버튼 클릭시 호출
   */
  const handleCreateChat = () => {
    // 새로운 채팅방 생성 처리
  };

  return (
    <div className="chat-page">
      {/* 메인 채팅 컨테이너 - 사이드바와 메인 영역으로 구성 */}
      <div className="chat-container">
        {/* 왼쪽 사이드 바 - 채팅 목록 표시 */}
        <div className="chat-sidebar">
          <DirectChatList
            onChatSelect={handleChatSelect} // 채팅방 선택시 호출되는 콜백 함수
            onCreateChat={handleCreateChat} // 새 채팅방 생성시 호출되는 콜백 함수
            selectedChatId={selectedChatId || undefined} // 현재 선택된 채팅방 ID
          />
        </div>
        {/* 오른쪽 메인 영역 - 채팅방 또는 환영 화면 표시 */}
        <div className="chat-main">
          {/* 선택된 채팅방 ID 유무 */}
          {selectedChatId ? (
            // 채팅방이 선택된 경우 : DirectChatRoom
            <DirectChatRoom chatId={selectedChatId} />
          ) : (
            // 채팅방이 선택되지 않은 경우 : 환영 화면 표시
            <div className="chat-welcome">
              {/* 환영 화면 내용 */}
              <div className="welcome-content">
                <h2>1:1 채팅</h2>
                <p>좌측에서 채팅방을 선택하거나</p>
                <p>새 채팅 버튼을 눌러 대화를 시작하세요.</p>
                {/* 기능 안내 정보 */}
                <div className="feature-info">
                  <p>💬 실시간 1:1 메시지</p>
                  <p>👥 사용자 검색 및 초대</p>
                  <p>📱 반응형 디자인</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DirectChatPage;
