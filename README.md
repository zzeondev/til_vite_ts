# Supabase Storage

## 1. 저장소 생성과정

- project > `storage` 메뉴 선택
- new bucket 생성 > `pubilc, 5M, image/*` 입력
- create bucket 버튼 선택

## 2. 권한 설정

- SQL Editor 에서 작성

### 2.1. Storage Policy 설정

```sql
-- 버킷 목록 조회 허용
CREATE POLICY "Allow bucket listing" ON storage.buckets FOR SELECT USING (true);

-- user-images 버킷의 객체에 대한 공개 접근 허용
CREATE POLICY "Public object access" ON storage.objects FOR ALL USING (bucket_id = 'user-images');
```

### 2.1. Storage Policy 설정

```sql
-- RLS 활성화
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 정책 생성
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can delete own profile" ON profiles FOR DELETE USING (auth.uid() = id);
```
