# Supabase 회원 탈퇴

- 기본 제공되는 탈퇴 기능
  - `supabase.auth.admin.deleteUser()`
  - 관리자 전용 (서버에서만 실행됨)
  - react 는 클라이언트 즉, 웹브라우저 전용이라서 실행불가
  - 보안성 위험 : 실수로 지울 가능성
  - 복구 불가
- 탈퇴 기능
  - 사용자 비활성
  - 30일 후 삭제 일반적 진행

## 1. React 에서는 관리자가 수작업으로 삭제

- profiles 및 사용자가 등록한 테이블에서 제거 진행
- 사용자 삭제 수작업 실행
- 탈퇴신청한 사용자 목록을 관리할 테이블이 필요

## 2. DB 테이블 생성 및 업데이트 진행

- 탈퇴신청 사용자 테이블

```sql
-- Supabase Dashboard에서 실행
CREATE TABLE account_deletion_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reason TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,
  processed_at TIMESTAMP WITH TIME ZONE,
  processed_by UUID REFERENCES auth.users(id)
);
```

```sql
-- 탈퇴신청한 사용자 목록 테이블
CREATE TABLE account_deletion_requests (
  -- PK 이고, DEFAULT gen_random_uuid() 중복 안되는 ID 생성
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- auth.user(id) 가 삭제되면 같이 삭제해줌
  -- 관리자가 수작업으로 삭제하면 같이 삭제
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

-- 탈퇴 신청자의 email 을 담아둠
  user_email TEXT NOT NULL,

  -- 신청한 날짜
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- 어떤 사유인지
  reason TEXT,

  -- status : 현재 탈퇴 신청 진행 상태
  -- 기본으로 pending : 처리중
  -- 탈퇴 승인 approved : 승인
  -- 탈퇴 거부 rejected : 거절
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),

  -- 관리자가 메시지를 남겨서 승인/거절 사유 등을 기록함
  admin_notes TEXT,

  -- 요청을 처리한 시간
  processed_at TIMESTAMP WITH TIME ZONE,

  -- 요청을 처리한 관리자 ID
  processed_by UUID REFERENCES auth.users(id)
);
```

## 3. 더미 회원 가입 시키기

- https://tmailor.com/ko/

## 4. 관리자와 일반 회원을 구분합니다.

- "실제 관리자 이메일" 을 설정하고 진행

```tsx
const isAdmin = user?.email === 'wldjsjiun@naver.com';
```

## 5. 관리자 페이지 생성 및 라우터 셋팅

### 5.1. 관리자 페이지

- /src/pages/AdminPage.tsx 파일 생성

```tsx
import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import type { DeleteRequest, DeleteRequestUpdate } from '../types/TodoType';

function AdminPage() {
  // ts 자리
  const { user } = useAuth();
  // 삭제 요청 DB 목록 관리
  const [deleteRequests, setDeleteRequests] = useState<DeleteRequest[]>([]);
  // 로딩창
  const [loading, setLoading] = useState(true);
  // 관리자 확인
  const isAdmin = user?.email === 'wldjsjiun@naver.com';
  useEffect(() => {
    console.log(user?.email);
    console.log(user?.id);
    console.log(user);
  }, [user]);

  // 컴포넌트가 완료가 되었을 때, isAdmin 을 체크 후 실행
  useEffect(() => {
    if (isAdmin) {
      // 회원 탈퇴 신청자 목록을 파악
      loadDeleteMember();
    }
  }, [isAdmin]);

  // 탈퇴 신청자 목록 파악 테이터 요청
  const loadDeleteMember = async (): Promise<void> => {
    try {
      const { data, error } = await supabase
        .from('account_deletion_requests')
        .select('*')
        .eq('status', 'pending')
        .order('requested_at', { ascending: false });

      if (error) {
        console.log(`삭제 목록 요청 에러 : ${error.message}`);
        return;
      }

      // 삭제 요청 목록 보관
      setDeleteRequests(data || []);
    } catch (err) {
      console.log('삭제 요청 목록 오류', err);
    } finally {
      setLoading(false);
    }
  };

  // 탈퇴 승인
  const approveDelete = async (id: string, updateUser: DeleteRequestUpdate): Promise<void> => {
    try {
      const { error } = await supabase
        .from('account_deletion_requests')
        .update({ ...updateUser, status: 'approved' })
        .eq('id', id);
      if (error) {
        console.log(`탈퇴 업데이트 오류 : ${error.message}`);
        return;
      }
      alert(`사용자 ${id}의 계정이 삭제가 승인되었습니다. \n\n 관리자님 수동으로 삭제하세요.`);
      // 목록 다시 읽기
      loadDeleteMember();
    } catch (err) {
      console.log('탈퇴승인 오류 : ', err);
    }
  };

  // 탈퇴 거절
  const rejectDelete = async (id: string, updateUser: DeleteRequestUpdate): Promise<void> => {
    try {
      const { error } = await supabase
        .from('account_deletion_requests')
        .update({ ...updateUser, status: 'rejected' })
        .eq('id', id);
      if (error) {
        console.log(`탈퇴 업데이트 오류 : ${error.message}`);
        return;
      }
      alert(`사용자 ${id}의 계정이 삭제가 거부되었습니다.`);
      // 목록 다시 읽기
      loadDeleteMember();
    } catch (err) {
      console.log('탈퇴거절 오류 : ', err);
    }
  };

  // 1. 관리자 아이디가 불일치라면
  if (!isAdmin) {
    return (
      <div>
        <h1>접근 권한이 없습니다.</h1>
        <p>관리자만이 이 페이지에 접근할 수 있습니다.</p>
      </div>
    );
  }

  // 2. 로딩중 이라면
  if (loading) {
    return <div>로딩중...</div>;
  }

  // tsx 자리
  return (
    <div>
      <h1>관리자 페이지</h1>
      <div>
        {' '}
        {deleteRequests.length === 0 ? (
          <p>대기 중인 삭제 요청이 없습니다.</p>
        ) : (
          <div>
            {deleteRequests.map(item => (
              <div key={item.id}>
                <h3>사용자 : {item.user_email}</h3>
                <span>대기중</span>
                <div>
                  <p>사용자 ID : {item.user_id}</p>
                  <p>요청시간 : {item.requested_at}</p>
                  <p>사유 : {item.reason}</p>
                </div>
                <div>
                  <button onClick={() => approveDelete(item.id, item)}>승인</button>
                  <button onClick={() => rejectDelete(item.id, item)}>거절</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminPage;
```

### 5.2. 라우터 적용

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
import AdminPage from './pages/AdminPage';

const TopBar = () => {
  const { signOut, user } = useAuth();
  // 관리자인 경우 메뉴 추가로 출력하기
  // isAdmin 은 true / false
  const isAdmin = user?.email === 'wldjsjiun@naver.com';

  return (
    <nav style={{ display: 'flex', gap: 20, justifyContent: 'flex-end', padding: 40 }}>
      <Link to="/">홈</Link>
      {user && <Link to="/todos">할 일</Link>}
      {!user && <Link to="/signup">회원가입</Link>}
      {!user && <Link to="/signin">로그인</Link>}
      {user && <Link to="/profile">프로필</Link>}
      {user && <button onClick={signOut}>로그아웃</button>}

      {isAdmin && <Link to="/admin">관리자</Link>}
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

            <Route
              path="/admin"
              element={
                <Protected>
                  <AdminPage />
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

## 6. 회원탈퇴 기능

### 6.1. AuthContex 기능 업데이트

```tsx
/**
 * 주요기능
 * - 사용자 세션관리
 * - 로그인/회원가입/로그아웃
 * - 사용자 인증 정보 상태 변경 감시
 * - 전역 인증 상태를 컴포넌트에 반영
 */

import type { Session, User } from '@supabase/supabase-js';
import { createContext, useContext, useEffect, useState, type PropsWithChildren } from 'react';
import { supabase } from '../lib/supabase';
import type { DeleteRequest, DeleteRequestInsert } from '../types/TodoType';

// 1. 인증 컨텍스트 타입
type AuthContextType = {
  // 현재 사용자의 세션정보 (로그인 상태, 토큰)
  session: Session | null;
  // 현재 로그인 된 사용자 정보
  user: User | null;
  // 회원 가입 함수(이메일, 비밀번호) : 비동기라서
  signUp: (email: string, password: string) => Promise<{ error?: string }>;
  // 회원 로그인 함수(이메일, 비밀번호) : 비동기라서
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  // 회원 로그아웃
  signOut: () => Promise<void>;
  // 회원정보 로딩 상태
  loading: boolean;
  // 회원탈퇴 기능
  deleteAccount: () => Promise<{ error?: string; success?: boolean; message?: string }>;
};

// 2. 인증 컨텍스트 생성 (인증 기능을 컴포넌트에서 활용하게 해줌.)
const AuthContext = createContext<AuthContextType | null>(null);

// 3. 인증 컨텍스트 프로바이더
export const AuthProvider: React.FC<PropsWithChildren> = ({ children }) => {
  // 현재 사용자 세션
  const [session, setSession] = useState<Session | null>(null);
  // 현재 로그인한 사용자 정보
  const [user, setUser] = useState<User | null>(null);
  // 로딩 상태 추가 : 초기 실행시 로딩 시킴, true
  const [loading, setLoading] = useState<boolean>(true);

  // 초기 세션 로드 및 인증 상태 변경 감시
  useEffect(() => {
    // 세션을 초기에 로딩을 한 후 처리 한다.
    const loadSession = async () => {
      try {
        setLoading(true); // 로딩중
        const { data } = await supabase.auth.getSession();
        setSession(data.session ? data.session : null);
        setUser(data.session?.user ?? null);
      } catch (error) {
        console.log(error);
      } finally {
        // 로딩완료
        setLoading(false);
      }
    };
    loadSession();

    // // 기존 세션이 있는지 확인
    // supabase.auth.getSession().then(({ data }) => {
    //   setSession(data.session ? data.session : null);
    //   setUser(data.session?.user ?? null);
    // });
    // 인증상태 변경 이벤트를 체크(로그인, 로그아웃, 토큰 갱신 등의 이벤트 실시간 감시)
    const { data } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
    });
    // 컴포넌트가 제거되면 이벤트 체크 해제 : cleanUp
    return () => {
      // 이벤트 감시 해제.
      data.subscription.unsubscribe();
    };
  }, []);

  // 회원 가입 함수(이메일, 비밀번호) : 비동기라서
  const signUp: AuthContextType['signUp'] = async (email, password) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // 회원 가입 후 이메일로 인증 확인시 리다이렉트 될 URL
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      return { error: error.message };
    }
    // 우리는 이메일 확인을 활성화 시켰습니다.
    // 이메일 확인 후 인증 전까지는 아무것도 넘어오지 않습니다.
    return {};
  };

  // 회원 로그인 함수(이메일, 비밀번호) : 비동기라서
  const signIn: AuthContextType['signIn'] = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password, options: {} });
    if (error) {
      return { error: error.message };
    }
    return {};
  };
  // 회원 로그아웃
  const signOut: AuthContextType['signOut'] = async () => {
    await supabase.auth.signOut();
  };

  // 회원탈퇴 기능
  const deleteAccount: AuthContextType['deleteAccount'] = async () => {
    try {
      // 기존에 사용한 데이터들을 먼저 정리한다.
      const { error: profileError } = await supabase.from('profiles').delete().eq('id', user?.id);
      if (profileError) {
        console.log('프로필 삭제 실패 : ', profileError.message);
        return { error: '프로필 삭제에 실패했습니다.' };
      }
      // 탈퇴 신청 데이터 추가
      // account_deletion_requests 에 Pending 으로 Insert 합니다.
      // 등록할 삭제 데이터
      const deleteInfo: DeleteRequestInsert = {
        user_email: user?.email as string,
        user_id: user?.id,
        reason: '사용자 요청',
        status: 'pending',
      };
      const { error: deleteRequestError } = await supabase
        .from('account_deletion_requests')
        .insert([{ ...deleteInfo }]);
      if (deleteRequestError) {
        console.log('탈퇴 목록 추가에 실패 : ', deleteRequestError.message);
        return { error: '탈퇴 목록 추가에 실패했습니다.' };
      }

      // 혹시 SMTP 서버가 구축이 가능하다면 관리자에게 이메일 전송하는 자리

      // 로그아웃 시켜줌
      await signOut();

      return {
        success: true,
        message: '계정 삭제가 요청되었습니다. 관리자 승인 후 완전히 삭제됩니다.',
      };
    } catch (err) {
      console.log('탈퇴 요청 기능 오류 : ', err);
      return { error: '계정 탈퇴 처리중 오류가 발생하였습니다.' };
    }
  };

  const value: AuthContextType = {
    signUp,
    signIn,
    signOut,
    user,
    session,
    loading,
    deleteAccount,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// const {signUp, signIn, signOut, user, session} = useAuth()
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('AuthContext 가 없습니다.');
  }
  return ctx;
};
```

### 6.2. ProfilePage 업데이트

- ProfilePage.tsx 파일 수정

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
  const { user, deleteAccount } = useAuth();
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

  // 회원탈퇴
  const handleDeleteUser = () => {
    const message: string = '계정을 완전히 삭제하시겠습니까? \n\n 복구가 불가능합니다. ';
    let isConfirm = false;
    isConfirm = confirm(message);

    if (isConfirm) {
      deleteAccount();
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
            <button onClick={handleDeleteUser}>회원탈퇴</button>
          </>
        )}
      </div>
    </div>
  );
}

export default ProfilePage;
```
