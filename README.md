# 채팅 테이블 수정

```sql
-- direct_chats 테이블에 is_active 컬럼 추가
ALTER TABLE direct_chats ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
-- 기존 데이터는 모두 활성 상태로 설정
UPDATE direct_chats SET is_active = TRUE WHERE is_active IS NULL;
```

```sql
-- direct_chats 테이블에 사용자별 참여 상태 컬럼 추가
ALTER TABLE direct_chats ADD COLUMN user1_active BOOLEAN DEFAULT TRUE;
ALTER TABLE direct_chats ADD COLUMN user2_active BOOLEAN DEFAULT TRUE;

-- 기존 데이터는 모두 활성 상태로 설정
UPDATE direct_chats SET user1_active = TRUE WHERE user1_active IS NULL;
UPDATE direct_chats SET user2_active = TRUE WHERE user2_active IS NULL;

```

```sql
-- direct_chats 테이블에 사용자별 나간 시점 컬럼 추가 (user1_active, user2_active는 이미 존재)
ALTER TABLE direct_chats ADD COLUMN user1_left_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE direct_chats ADD COLUMN user2_left_at TIMESTAMP WITH TIME ZONE;
```

```sql
-- direct_chats 테이블에 사용자별 나간 시점과 알림 상태 컬럼 추가
ALTER TABLE direct_chats ADD COLUMN user1_notified BOOLEAN DEFAULT FALSE;
ALTER TABLE direct_chats ADD COLUMN user2_notified BOOLEAN DEFAULT FALSE;
```

## 채팅 사용자 검색 리랜더링 문제 해결

### 문제점

- 새 채팅 버튼을 눌러서 사용자 검색할 때 입력할 때마다 채팅장이 리랜더링되는 문제
- `searchUsers` 함수에서 `setLoading(true)`를 사용하여 전체 채팅장이 새로 렌더링됨

### 해결 방법

1. **별도의 로딩 상태 추가**
   - `DirectChatContext`에 `userSearchLoading` 상태 추가
   - 사용자 검색 전용 로딩 상태로 분리

2. **searchUsers 함수 수정**
   - `setLoading(true)` → `setUserSearchLoading(true)`로 변경
   - 전체 채팅장 리랜더링 방지

3. **UI 개선**
   - 사용자 검색 영역에만 로딩 표시
   - 검색 결과가 없을 때 조건 개선

### 변경된 파일

- `src/contexts/DirectChatContext.tsx`
  - `userSearchLoading` 상태 추가
  - `searchUsers` 함수에서 별도 로딩 상태 사용
- `src/components/chat/direct/DirectChatList.tsx`
  - 사용자 검색 로딩 상태 활용
  - 검색 결과 UI 개선
