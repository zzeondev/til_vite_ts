# Supabase 인증 후 회원 추가 정보 받기

- 회원가입 후 > `profiles 테이블` 에 추가 내용 받기

## 1. `profiles 테이블` 생성하기

- SQL Editor 를 이용해서 진행함

```sql
-- 사용자 프로필 정보를 저장하는 테이블 생성
-- auth.users 테이블에 데이터가 추가되면 이와 연동하여 profiles 별도로 자동 추가
create table profiles (

  -- id 칼럼은 pk
  -- uuid 는 데이터 타입으로 중복 제거
  -- references auth.users : 참조 테이블 auth.users
  -- on delete cascade : 사용자 계정을 삭제하면 자동으로 profils 도 같이 삭제
  id uuid references auth.users on delete cascade primary key,

  -- 추가 칼럼
  -- nickname 은 사용자 닉네임
  nickname text,
  -- avatar_url 은 사용자 이미지
  -- supabase 의 storage 에 이미지 업로드시 해당 이미지 URL
  avatar_url text,
  -- created_at : 생성날짜
  -- timestamp with time zone : 시간대 정보를 포함한 시간
  -- default now() : 기본 값으로 현재 시간을 저장하겠다.
  created_at timestamp with time zone default now()
);
```

## 2. 만약, 테이블이 추가, 컬럼 추가, 변경 등 되었다면?

```bash
npm run generate-types
```

- 실행 수 생성된 `/types_db_ts` 내용 을 우리 type 파일에 추가

```ts
export type TodoType = { id: string; title: string; completed: boolean };

// 개발자가 직접 작성해 줌.
export type Todo = Database['public']['Tables']['todos']['Row'];
export type TodoInsert = Database['public']['Tables']['todos']['Insert'];
export type TodoUpdate = Database['public']['Tables']['todos']['Update'];

// 사용자 정보
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '13.0.4';
  };
  public: {
    Tables: {
      memos: {
        Row: {
          created_at: string;
          id: number;
          memo: string;
        };
        Insert: {
          created_at?: string;
          id?: number;
          memo: string;
        };
        Update: {
          created_at?: string;
          id?: number;
          memo?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string | null;
          id: string;
          nickname: string | null;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string | null;
          id: string;
          nickname?: string | null;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string | null;
          id?: string;
          nickname?: string | null;
        };
        Relationships: [];
      };
      todos: {
        Row: {
          completed: boolean;
          content: string | null;
          created_at: string | null;
          id: number;
          title: string;
          updated_at: string | null;
        };
        Insert: {
          completed?: boolean;
          content?: string | null;
          created_at?: string | null;
          id?: number;
          title: string;
          updated_at?: string | null;
        };
        Update: {
          completed?: boolean;
          content?: string | null;
          created_at?: string | null;
          id?: number;
          title?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
```

## 3. 프로필 CRUD 를 위한 파일 구성

- `/src/lib/profile.ts 파일` 생성

```ts
/**
 * 사용자 프로필 관리
 * - 프로필 생성
 * - 프로필 정보 조회
 * - 프로필 정보 수정
 * - 프로필 정보 삭제
 *
 * 주의 사항
 * - 반드시 사용자 인증 후에만 프로필 생성
 */

import type { ProfileInsert } from '../types/TodoType';
import { supabase } from './supabase';

// 사용자 프로필 생성
const createProfile = async (newUserProfile: ProfileInsert): Promise<boolean> => {
  try {
    const { error } = await supabase.from('profiles').insert([{ ...newUserProfile }]);
    if (error) {
      console.log(`프로필 추가에 실패 : ${error.message}`);
      return false;
    }
    return true;
  } catch (error) {
    console.log(`프로필 생성 오류 : ${error}`);
    return false;
  }
};

// 사용자 프로필 조회
const getProfile = () => {};

// 사용자 프로필 수정
const updateProfile = () => {};

// 사용자 프로필 삭제
const deleteProfile = () => {};

// 사용자 프로필 이미지 업로드
const uploadAvatar = () => {};

// 내보내기
export { createProfile, getProfile, updateProfile, deleteProfile, uploadAvatar };
```

## 4. 회원가입 시 추가 정보 내용 구성

- id(uuid), nickname(null), avatar_url(null), created_at(자동)
- `/src/pages/SignUpPage.tsx 추가`

```tsx
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { createProfile } from '../lib/profile';
import type { ProfileInsert } from '../types/TodoType';

function SignUpPage() {
  const { signUp } = useAuth();

  const [email, setEmail] = useState<string>('');
  const [pw, setPw] = useState<string>('');

  // 추가 정보 (닉네임)
  const [nickName, setNickName] = useState<string>('');

  const [msg, setMsg] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    // 웹브라우저 갱신 막기
    e.preventDefault();
    if (!email.trim()) {
      alert('이메일을 입력하세요.');
      return;
    }

    if (!pw.trim()) {
      alert('비밀번호를 입력하세요.');
      return;
    }
    if (pw.length < 6) {
      alert('비밀번호는 최소 6자입니다.');
      return;
    }

    if (!nickName.trim()) {
      alert('닉네임을 입력하세요.');
      return;
    }

    // 회원가입 및 추가정보 입력하기
    const { error, data } = await supabase.auth.signUp({
      email,
      password: pw,
      options: {
        // 회원 가입 후 이메일로 인증 확인시 리다이렉트 될 URL
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setMsg(`회원가입 오류 : ${error}`);
    } else {
      // 회원가입 성공했으므로 profiles 도 채워준다.
      if (data?.user?.id) {
        // 프로필을 추가한다.
        const newUser: ProfileInsert = { id: data.user.id, nickname: nickName };
        const result = await createProfile(newUser);
        if (result) {
          // 프로필 추가가 성공한 경우
          setMsg(`회원가입 및 프로필 생성에 성공했습니다. 이메일 인증 링크를 확인해 주세요.`);
        } else {
          // 프로필 추가가 실패한 경우
          setMsg(`회원가입이 성공, 하지만, 프로필 생성 실패했습니다.`);
        }
      } else {
        setMsg(`회원가입이 성공했습니다. 이메일 인증 링크를 확인해 주세요.`);
      }
    }
  };

  return (
    <div>
      <h2>Todo 서비스 회원가입</h2>
      <div>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="이메일"
          />
          <br />
          <input
            type="password"
            value={pw}
            onChange={e => setPw(e.target.value)}
            placeholder="비밀번호"
          />
          <br />
          <input
            type="text"
            value={nickName}
            onChange={e => setNickName(e.target.value)}
            placeholder="닉네임"
          />
          <br />
          <button type="submit">회원가입</button>
        </form>
        <p>{msg}</p>
      </div>
    </div>
  );
}

export default SignUpPage;
```

## 5. 사용자 프로필 CRUD 기능 추가

- /src/lib/profile.ts 내용 추가

```ts
/**
 * 사용자 프로필 관리
 * - 프로필 생성
 * - 프로필 정보 조회
 * - 프로필 정보 수정
 * - 프로필 정보 삭제
 *
 * 주의 사항
 * - 반드시 사용자 인증 후에만 프로필 생성
 */

import type { Profile, ProfileInsert, ProfileUpdate } from '../types/TodoType';
import { supabase } from './supabase';

// 사용자 프로필 생성
const createProfile = async (newUserProfile: ProfileInsert): Promise<boolean> => {
  try {
    const { error } = await supabase.from('profiles').insert([{ ...newUserProfile }]);
    if (error) {
      console.log(`프로필 추가에 실패 : ${error.message}`);
      return false;
    }
    return true;
  } catch (error) {
    console.log(`프로필 생성 오류 : ${error}`);
    return false;
  }
};

// 사용자 프로필 조회
const getProfile = async (userId: string): Promise<Profile | null> => {
  try {
    const { error, data } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (error) {
      console.log(error.message);
      return null;
    }
    return data;
  } catch (error) {
    console.log(error);
    return null;
  }
};

// 사용자 프로필 수정
const updateProfile = async (editUserProfile: ProfileUpdate, userId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ ...editUserProfile })
      .eq('id', userId);
    if (error) {
      console.log(error.message);
      return false;
    }
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};

// 사용자 프로필 삭제
const deleteProfile = () => {};

// 사용자 프로필 이미지 업로드
const uploadAvatar = () => {};

// 내보내기
export { createProfile, getProfile, updateProfile, deleteProfile, uploadAvatar };
```

## 6. 사용자 프로필 출력 페이지

- `/src/pages/ProfilePage.tsx` 파일 생성

```tsx
import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getProfile, updateProfile } from '../lib/profile';
import type { Profile, ProfileUpdate } from '../types/TodoType';

/**
 * 사용자 프로필 페이지
 * - 기본 정보 표시
 * - 정보 수정
 * - 회원탈퇴 기능 : 확인을 거치고 진행하도록
 */

function ProfilePage() {
  // 회원 기본 정보
  const { user } = useAuth();
  // 데이터 가져오는 동안의 로딩
  const [loading, setLoading] = useState<boolean>(true);
  // 사용자 프로필
  const [profileData, setProfileData] = useState<Profile | null>(null);
  // 에러 메시지
  const [error, setError] = useState<string>('');
  // 회원 정보 수정
  const [edit, setEdit] = useState<boolean>(false);
  // 회원 닉네임 보관
  const [nickName, setNickName] = useState<string>('');

  // 사용자 프로필 정보 가져오기
  const loadProfile = async () => {
    if (!user?.id) {
      // 사용자의 id 가 없으면 중지
      setError('사용자 정보를 찾을 수 없습니다.');
      setLoading(false);
      return;
    }
    try {
      // 사용자 정보 가져오기 ( null 일수도 있다. )
      const tempData = await getProfile(user?.id);

      if (!tempData) {
        // null 이라면
        setError('사용자 프로필 정보를 찾을 수 없습니다.');
        return;
      }
      // 사용자 정보가 있다.
      setNickName(tempData.nickname || '');
      setProfileData(tempData);
    } catch (err) {
      console.log(err);
      setError('사용자 프로필 호출 오류!!!');
    } finally {
      setLoading(false);
    }
  };

  // 프로필 데이터 업데이트
  const saveProfile = async () => {
    if (!user) {
      return;
    }
    if (!profileData) {
      return;
    }
    try {
      const tempUpdateData: ProfileUpdate = { nickname: nickName };
      const success = await updateProfile(tempUpdateData, user.id);
      if (!success) {
        console.log('프로필 업데이트에 실패하였습니다.');
        return;
      }
      loadProfile();
    } catch (err) {
      console.log('프로필 업데이트 오류', err);
    } finally {
      setEdit(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  if (loading) {
    return (
      <div
        style={{
          position: 'fixed',
          width: '100%',
          height: '100%',
          left: 0,
          top: 0,
          zIndex: 999,
          background: 'green',
        }}
      >
        <h1>프로필 로딩중 ... </h1>
      </div>
    );
  }
  // error 메시지 출력하기
  if (error) {
    return (
      <div>
        <h2>프로필</h2>
        <div>🧨 {error}</div>
        <button onClick={loadProfile}>재시도</button>
      </div>
    );
  }

  return (
    <div>
      <h2>회원정보</h2>
      {/* 사용자 기본 정보 섹션 */}
      <div>
        <h3>기본 정보</h3>
        <div>이메일: {user?.email}</div>
        <div>가입일: {user?.created_at && new Date(user.created_at).toLocaleString()}</div>
      </div>
      {/* 사용자 추가정보 */}
      <div>
        <h3>사용자 추가 정보</h3>
        <div>아이디 : {profileData?.id}</div>
        {edit ? (
          <>
            <div>
              닉네임 :
              <input type="text" value={nickName} onChange={e => setNickName(e.target.value)} />
            </div>
            <div>
              아바타 편집중 :
              {profileData?.avatar_url ? (
                <img src={profileData.avatar_url} />
              ) : (
                <button>파일추가</button>
              )}
            </div>
          </>
        ) : (
          <>
            <div>닉네임 : {profileData?.nickname}</div>
            <div>
              아바타 :
              {profileData?.avatar_url ? (
                <img src={profileData.avatar_url} />
              ) : (
                <img
                  src={
                    'https://tse3.mm.bing.net/th/id/OIP.YAcO2InfMIy-gCU-jDazowHaHa?r=0&w=474&h=474&c=7&p=0'
                  }
                  width={60}
                  height={60}
                />
              )}
            </div>
          </>
        )}

        <div>
          가입일 : {profileData?.created_at && new Date(profileData.created_at).toLocaleString()}
        </div>
      </div>
      <div>
        {edit ? (
          <>
            <button onClick={saveProfile}>수정확인</button>
            <button
              onClick={() => {
                setEdit(false);
                setNickName(profileData?.nickname || '');
              }}
            >
              수정취소
            </button>
          </>
        ) : (
          <>
            <button onClick={() => setEdit(true)}>정보수정</button>
            <button>회원탈퇴</button>
          </>
        )}
      </div>
    </div>
  );
}

export default ProfilePage;
```

## 7. 라우터 셋팅

- App.tsx

```tsx
import { Link, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import HomePage from './pages/HomePage';
import SignUpPage from './pages/SignUpPage';
import SignInPage from './pages/SignInPage';
import TodoPage from './pages/TodoPage';
import Protected from './components/Protected';
import AuthCallback from './pages/AuthCallback';
import ProfilePage from './pages/ProfilePage';

const TopBar = () => {
  const { signOut, user } = useAuth();
  return (
    <nav style={{ display: 'flex', gap: 20, justifyContent: 'flex-end', padding: 40 }}>
      <Link to="/">홈</Link>
      {user && <Link to="/todos">할 일</Link>}
      {!user && <Link to="/signup">회원가입</Link>}
      {!user && <Link to="/signin">로그인</Link>}
      {user && <Link to="/profile">프로필</Link>}
      {user && <button onClick={signOut}>로그아웃</button>}
    </nav>
  );
};

function App() {
  return (
    <AuthProvider>
      <div>
        <h1>Todo Service</h1>
        <Router>
          <TopBar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/signin" element={<SignInPage />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route
              path="/todos"
              element={
                <Protected>
                  <TodoPage />
                </Protected>
              }
            />
            <Route
              path="/profile"
              element={
                <Protected>
                  <ProfilePage />
                </Protected>
              }
            />
          </Routes>
        </Router>
      </div>
    </AuthProvider>
  );
}

export default App;
```
