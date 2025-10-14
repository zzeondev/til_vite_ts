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
