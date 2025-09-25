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
