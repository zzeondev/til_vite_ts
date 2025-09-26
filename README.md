# 1:1 채팅 구현 (UI 및 기본 페이지 구성)

## 1. 기본기능

- 실시간 통신
- 사용자 관리
- 메시지 관리
- 채팅방 관리

## 2. 기본 구성 및 UI 를 먼저 진행하시길 권장

### 2.1. 페이지 구성

- `/src/pages/chat 폴더` 생성
- `/src/pages/chat/DirectChatPage.tsx 파일` 생성

### 2.2. App.tsx 에서 router 셋팅

```tsx
{
  user && (
    <Link to="/chat" className="nav-link">
      1 : 1 채팅
    </Link>
  );
}
```

```tsx
{
  /* 1 : 1 채팅 페이지 */
}
<Route
  path="/chat"
  element={
    <Protected>
      <DirectChatPage />
    </Protected>
  }
/>;
```

### 2.3. 채팅 페이지 구성

- /src/pages/chat/DrirectChatPage.tsx

### 2.3. 채팅 페이지 구성

- /src/pages/chat/DirectChatPage.tsx

```tsx
/**
 * 주요 기능
 * - 채팅목록과 채팅방을 분할한 레이아웃으로 표시
 * - 채팅방 선택 및 채팅방 전환 관리
 * - 환영 화면 표시 (채팅방 미선택 시)
 * - 반응형 레이아웃 지원
 * - 레이아웃 구성 : 사이드바와 메인 영역으로 구성
 * - 컴포넌트 구성 : DirectChatList 와 DirectChatRoom 컴포넌트
 */

function DirectChatPage() {
  return (
    <div className="chat-page">
      {/* 메인 채팅 컨테이너 - 사이드바와 메인 영역으로 구성 */}
      <div className="chat-container">
        {/* 왼쪽 사이드 바 - 채팅 목록 표시 */}
        <div className="chat-sidebar">사이드바컴포넌트</div>
        {/* 오른쪽 메인 영역 - 채팅방 또는 환영 화면 표시 */}
        <div className="chat-main">메인컴포넌트</div>
      </div>
    </div>
  );
}

export default DirectChatPage;
```

- `/src/components/chat/chat.css 파일` 생성

```css
/* 채팅 페이지 전체 컨테이너 : 헤더 높이를 제외한 전체 화면 높이 사용 */
.chat-page {
  height: calc(100vh - 120px);
  display: flex;
  flex-direction: column;
}

/* 메인 채팅 컨테이너 - 사이드바와 채팅방을 나누는 레이아웃 */
.chat-container {
  display: flex;
  height: 100%;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
}

/* 왼쪽 사이드바 - 채팅 목록과 사용자 검색 영역*/
.chat-sidebar {
  width: 300px;
  border-right: 1px solid #e0e0e0;
  background-color: #f8f9fa;
  display: flex;
  flex-direction: column;
}

/* 오른쪽 메인 영역 - 채팅방 내용 표시 */
.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
}
```

### 2.4. 채팅 리스트 영역 구성

- `src/components/chat/direct 폴더` 생성
- `src/components/chat/direct/DirectChatList.tsx 파일` 생성

```tsx
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
```

- `/src/components/chat/chat.css 파일` 업데이트

```css
/* 채팅 페이지 전체 컨테이너 : 헤더 높이를 제외한 전체 화면 높이 사용 */
.chat-page {
  height: calc(100vh - 120px);
  display: flex;
  flex-direction: column;
}
/* 메인 채팅 컨테이너 - 사이드바와 채팅방을 나누는 레이아웃 */
.chat-container {
  display: flex;
  height: 100%;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
}
/* 왼쪽 사이드바 - 채팅 목록과 사용자 검색 영역 */
.chat-sidebar {
  width: 300px;
  border-right: 1px solid #e0e0e0;
  background-color: #f8f9fa;
  display: flex;
  flex-direction: column;
}
/* 오른쪽 메인 영역 - 채팅방 내용 표시 */
.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
}

/*  ==== 채팅 리스트 영역 ==== */

/* 채팅 목록 컨테이너 - 세로 방향으로 채팅 목록 표시 */
.chat-list {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #f8f9fa;
  border-right: 1px solid #e0e0e0;
}
/* 채팅 목록 헤더 - 제목과 새 채팅 버튼 */
.chat-list-header {
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #ffffff;
}
/* 채팅 목록 제목 스타일 */
.chat-list-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #333;
}
/* 새 채팅 시작 버튼 - 둥근 모서리와 호버 효과 */
.new-chat-btn {
  background-color: #007bff;
  color: #ffffff;
  border: none;
  padding: 10px 20px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  opacity: 0.8;
  transition: all 0.2s ease;
}
.new-chat-btn:hover {
  opacity: 1;
}
/*  ==== 사용자 검색 영역 ==== */
/* 사용자 검색 컨테이너 - 검색 입력과 결과 표시 */
.user-search {
  padding: 16px;
  border-bottom: 1px solid #e0e0e0;
  background-color: #ffffff;
}
/* 검색 입력 필드 */
.search-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}
/* 검색 결과 컨테이너 - 스크롤 가능한 최대 높이 설정 */
.search-result {
  margin-top: 8px;
  max-height: 200px;
  overflow-y: auto;
}
/* 검색된 사용자 아이템 - 아바타와 닉네임 표시 */
.user-item {
  display: flex;
  align-items: center;
  padding: 8px;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s ease;
}
/* 사용자 아이템 호버효과 */
.user-item:hover {
  background-color: #f0f0f0;
}

/* 사용자 아바타 컨테이너 */
.user-avatar {
  margin-right: 12px;
}
/* 사용자 아바타 이미지 - 원형으로 표시 */
.user-avatar img {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}
/* 아바타 플레이스홀더 - 이미지가 없을 때 이니셜 표시 */
.avatar-placeholder {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #007bff;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
}

/* 사용자 정보 컨테이너 */
.user-info {
  display: block;
}
/* 사용자 닉네임 스타일 */
.user-nickname {
  font-weight: 500;
  color: #333;
}
/* 검색 결과 없음 메시지 */
.no-results {
  padding: 16px;
  text-align: center;
  color: #666;
  font-size: 14px;
}

/*  ==== 채팅 아이템 목록 ==== */
/* 채팅 아이템 컨테이너 - 스크롤 가능한 목록 */
.chat-items {
  flex: 1;
  overflow-y: auto;
}
/* 채팅방이 없을 떄 표시 */
.no-chats {
  padding: 32px 16px;
  text-align: center;
  color: #666;
}

/* 개별 채팅 아이템 - 아바타, 이름, 미리보기, 시간 표시 */
.chat-item {
  display: flex;
  align-items: center;
  padding: 18px 20px;
  cursor: pointer;
  border-bottom: 1px solid #f5f5f5;
  transition: all 0.2s ease;
  background-color: #ffffff;
}
/* 선택된 채팅 아이템 - 파란색 테두리, 오른쪽 테두리 */
.chat-item.selected {
  background-color: #e3f2fd;
  border-right: 3px solid #007bff;
}
/* 채팅 상대방 아바타 컨테이너 - 읽지 않은 메시지 배치 위치 기준*/
.chat-avatar {
  position: relative;
  margin-right: 16px;
}
.chat-avatar img {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #f0f0f0;
}
.chat-avatar .avatar-placeholder {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, #007bff, #0056b3);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 19px;
  border: 2px solid #f0f0f0;
}
/* 읽지 않은 메시지 개수 배지 - 아바타에 우상단에 표시 */
.unread-badge {
  position: absolute;
  top: -2px;
  right: -2px;
  background-color: #ff4444;
  color: #ffffff;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
}

/* 채팅 정보 컨테이너 - 이름, 시간, 미리보기*/
.chat-info {
  flex: 1;
  min-width: 0;
}

/* 채팅 헤더 - 이름과 시간 양쪽 끝에 배치 */
.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

/* 채팅 상대방 이름 */
.chat-name {
  font-weight: 600;
  color: #333;
  font-size: 14px;
}

/* 마지막 메시지 시간 */
.chat-time {
  font-size: 12px;
  color: #666;
}

/* 마지막 메시지 미리보기 - 긴 텍스트는 말줄임표 처리 */
.chat-preview {
  font-size: 13px;
  color: #666;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 읽지 않은 메시지 미리보기 - 굵은 글씨 */
.chat-preview .unread {
  font-weight: 600;
  color: #333;
}

/* 메시지가 없는 경우 표시 */
.chat-preview .no-message {
  font-style: italic;
  color: #999;
}
```

### 2.5. 채팅 메인 영역 구성

- /src/pages/chat/DirectChatPage.tsx 업데이트
- 안내페이지 추가

```tsx
/**
 * 주요 기능
 * - 채팅목록과 채팅방을 분할한 레이아웃으로 표시
 * - 채팅방 선택 및 채팅방 전환 관리
 * - 환영 화면 표시 (채팅방 미선택 시)
 * - 반응형 레이아웃 지원
 * - 레이아웃 구성 : 사이드바와 메인 영역으로 구성
 * - 컴포넌트 구성 : DirectChatList 와 DirectChatRoom 컴포넌트
 */

import DirectChatList from '../../components/chat/direct/DirectChatList';
import { DirectChatRoom } from '../../components/chat/direct/DirectChatRoom';

function DirectChatPage() {
  return (
    <div className="chat-page">
      {/* 메인 채팅 컨테이너 - 사이드바와 메인 영역으로 구성 */}
      <div className="chat-container">
        {/* 왼쪽 사이드 바 - 채팅 목록 표시 */}
        <div className="chat-sidebar">
          <DirectChatList />
        </div>
        {/* 오른쪽 메인 영역 - 채팅방 또는 환영 화면 표시 */}
        <div className="chat-main">
          {/* 채팅방이 선택된 경우 : DirectChatRoom */}
          <DirectChatRoom />

          {/* 채팅방이 선택되지 않은 경우 : 환영 화면 표시 */}
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
        </div>
      </div>
    </div>
  );
}

export default DirectChatPage;
```

- css: 안내 페이지

```css
/*  ==== 환영 화면 및 상태 메시지 ==== */
/* 환영 화면 - 채팅방이 선택되지 않았을 때 표시 */
.chat-welcome {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  background-color: #f8f9fa;
}
/* 환영 화면 내용 */
.welcome-content {
  text-align: center;
  color: #666;
  max-width: 400px;
  padding: 32px;
}
/* 환영 화면 제목 */
.welcome-content h2 {
  margin-bottom: 16px;
  color: #333;
  font-size: 24px;
}
/* 환영 화면 설명 텍스트 */
.welcome-content p {
  margin: 8px 0;
  font-size: 14px;
  line-height: 1.5;
}

/* 기능 안내 박스 */
.feature-info {
  margin-top: 24px;
  padding: 16px;
  background-color: #ffffff;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

/* 기능 안내 텍스트 */
.feature-info p {
  margin: 6px 0;
  font-size: 13px;
  color: #555;
}
```

### 2.6. 채팅 룸 영역 구성

- `/src/components/chat/direct/DirectChatRoom.tsx 파일` 생성

```tsx
import React from 'react';

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
    </div>
  );
};

export default DirectChatRoom;
```

- 추가된 css

```css
/* ==== 채팅방 영역 ==== */
/* 채팅방 컨테이너 - 헤더, 메시지, 입력 영역으로 구성 */
.chat-room {
  display: flex;
  flex-direction: column;
  height: 100%;
}
/* 채팅방 헤더 - 상대방 정보와 채팅 종료 버튼 */
.chat-room-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e0e0e0;
  background-color: #f8f9fa;
}
/*  채팅방 정보 컨테이너 */
.chat-room-info {
  display: block;
}
/* 채팅방 정보 제목 - 상대방 닉네임 표시 */
.chat-room-info h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}
/* 채팅방 액션 버튼들 컨테이너 */
.chat-room-actions {
  display: flex;
  gap: 8px;
}
/* 채팅 종료 버튼 */
.exit-chat-btn {
  padding: 8px 16px;
  background-color: #dc3545;
  color: #ffffff;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  opacity: 0.8px;
  transition: all 0.2s ease;
}

.exit-chat-btn:hover {
  opacity: 0.8;
}

/* ==== 채팅방 메시지 영역 ==== */
/* 메시지 컨테이너 -스크롤 가능한 메시지 목록 */
.chat-room-message {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

/* 메시지가 없을 때 표시 */
.no-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #666;
  text-align: center;
}
.no-message p {
  margin: 8px 0;
  font-size: 14px;
}
/* 메시지 그룹 - 같은 날짜의 메시지들은 묶음 */
.message-group {
  margin-bottom: 24px;
}
/* 날짜 구분선 - 메시지 그룹 사이에 날짜 표시 */
.date-divider {
  text-align: center;
  margin: 16px 0;
  position: relative;
}
/* 날짜 내용 앞쪽과 뒤쪽에 라인 배치 */
.date-divider::before {
  content: '';
  position: absolute;
  display: block;
  top: 50%;
  left: 0;
  width: 50%;
  height: 1px;
  background-color: #e0e0e0;
  z-index: 1;
}
.date-divider::after {
  content: '';
  position: absolute;
  display: block;
  top: 50%;
  right: 0;
  width: 50%;
  height: 1px;
  background-color: #e0e0e0;
  z-index: 1;
}
.date-divider span {
  background-color: #fff;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  color: #666;
  border: 1px solid #e0e0e0;
  position: relative;
  z-index: 2;
}
/* 메시지들 묶음 컨테이너 */
.message-group-container {
  position: relative;
  width: 100%;
  padding: 0 20px;
}

/* ==== 개별 메시지 스타일 ==== */

/* 메시지 아이템 기본 레이아웃 */
.message-item {
  display: flex;
  margin-bottom: 12px;
  gap: 8px;
}
/* 메시지 말풍선 컨테이너 */
.message-bubble {
  position: relative;
  display: flex;
  flex-direction: column;
  max-width: 100%;
}
/* 메시지 호버시 시간 표시 - 불투명하게 */
.message-bubble:hover .message-time {
  opacity: 1;
}
/* 메시지 텍스트 - 말풍선 스타일 */
.message-text {
  padding: 8px 12px;
  border-radius: 18px;
  font-size: 14px;
  line-height: 1.4;
  word-wrap: break-word;
  position: relative;
}
/* 메시지 시간 - 기본적으로 반투명 */
.message-time {
  font-size: 14px;
  color: #999;
  margin-top: 4px;
  opacity: 0.7;
}
/* 나의 메시지 (오른쪽 정렬) - 파란색 말풍선 */
.message-item.my-message {
  display: flex;
  justify-content: flex-end;
  align-items: flex-end;
  max-width: 100%;
  gap: 8px;
}
/* 나의 메시지 말풍선 - 파란색 배경 */
.my-message .message-text {
  background-color: #007bff;
  color: #ffffff;
  border-bottom-right-radius: 4px;
}
/* 나의 메시지 시간 - 왼쪽 정렬 */
.my-message .message-time {
  text-align: right;
}
/* 상대방의 메시지 (왼쪽 정렬) - 회색 말풍선 */
.message-item.other-message {
  display: flex;
  justify-content: flex-start;
  align-items: flex-end;
  margin-right: auto;
  max-width: 100%;
  gap: 8px;
}
/* 상대방의 메시지 말풍선 - 회색 배경 */
.other-message .message-text {
  background-color: #f1f3f4;
  color: #333;
  border-bottom-left-radius: 4px;
}
/* 나의 메시지 시간 - 왼쪽 정렬 */
.other-message .message-time {
  text-align: left;
}
/* 채팅룸의 아바타 */
.message-avatar {
  /* flex 에서 내용이 너비보다 큰 경우 줄여주는 비율 */
  flex-shrink: 0;
  margin: 0 4px;
}
/* 메시지 아바타 이미지 - 작은 원형 */
.message-avatar img {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}
/* 아바타 닉네임 별도 설정 가능하도록 */
.message-avatar .avatar-placeholder {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  font-size: 12px;
  color: #ffffff;
}
```

### 2.7. 메시지 입력 컴포넌트 구성

- `/src/components/chat/common 폴더` 생성
- `/src/components/chat/common/MessageInput.tsx 파일` 생성

```tsx
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
```

- 추가된 css

```css
/* ==== 메세지 입력 영역 ==== */
/* 메시지 입력 컨테이너 - 하단 고정 */
.message-input {
  border-top: 1px solid #e0e0e0;
  background-color: #fff;
  padding: 16px;
}
/* 메시지 입력 폼 */
.message-form {
  width: 100%;
}
/* 입력 컨테이너 - 텍스트, 전송 버튼 */
.input-containter {
  display: flex;
  gap: 8px;
}
/* 메시지 입력 텍스트 영역 - 자동 높이 조절 */
.message-textarea {
  flex: 1;
  min-height: 40px;
  max-height: 120px;
  border: 1px solid #ddd;
  border-radius: 20px;
  /* 너비,높이 제어함 */
  resize: none;
  font-size: 14px;
  line-height: 1.4;
}
/* 텍스트 영역 포커스 시 파란색 테두리 */
.message-textarea:focus {
  outline: none;
  border-color: #007bff;
}
/* 전송 버튼 - 원형 버튼 */
.send-button {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  background-color: #007bff;
  color: #ffffff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}
/* 전송 버튼 호버 효과 -  */
.send-button:hover:not(:disabled) {
  background-color: #0056b3;
}
/* 전송 버튼 비활성화 상태 */
.send-button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}
/* 로딩 스피너 - 전송 중 표시 */
.loading-spiner {
  width: 16px;
  height: 16px;
  border: 2px solid #ffffff;
  border-top: 2px solid transparent;
  border-radius: 50%;

  animation: spin 0.8s linear infinite;
}
/* 스피너 회전 애니메이션 */
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
```
