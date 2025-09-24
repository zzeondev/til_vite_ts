# gmail 과 supabase

- https://www.youtube.com/watch?v=iWQEK8pS2kU

## 1. GCP(구글 클라우드 플랫폼) 환경설정

- https://cloud.google.com
- https://console.cloud.google.com/welcome?project=mytodo47300
- https://iwoohaha.tistory.com/318

### 1.1. 신규 프로젝트 생성

- 상단의 전체 프로젝트 목록 펼침 메뉴 > `새 프로젝트 만들기`
- 프로젝트 이름 : `적당한 이름` (중복체크)
- 조직 없음

### 1.2. 신규 프로젝트 셋팅

- 상단의 전체 프로젝트 목록 펼침 메뉴 > `생성한 프로젝트 선택`
- 왼쪽 최상단의 `햄버거 메뉴` 선택
- API 및 서비스 메뉴 선택
- OAuth 동의 메뉴 선택 > `시작하기 버튼` 선택
- 앱이름/사용자 지원 이메일 선택 > 다음 버튼
- 대상 : `외부` 선택 > 다음 버튼
- 연락처 정보 : `이메일`> 다음 버튼
- 동의 > 완료 선택 > 계속 버튼
- 만들기 버튼 선택

### 1.3. OAuth 동의화면 세팅

- 왼쪽 최상단의 `햄버거 메뉴` 선택
- API 및 서비스 메뉴 선택 > OAuth 동의화면
- OAuth 클라이언트 ID 만들기 메뉴 선택
- 애플리케이션 유형 : `웹 애플리케이션` 선택
- 이름 입력 : `ex) 오늘 할일 서비스`
- 승인된 JavaScript 원본 : `http://localhost:5173`
- 승인된 리디랙션 URI : `https://jinvuynwlrgxoisfdjyh.supabase.co/auth/v1/callback`
- 완성된 `OAuth 2.0 클라이언트 ID` 목록 확인

### 1.4. 데이터액세스 셋팅

- 왼쪽 최상단의 `햄버거 메뉴` 선택
- API 및 서비스 메뉴 선택 > OAuth 동의화면 > 데이터액세스 선택
- `범위 추가 또는 삭제 버튼` 선택
- 원하는 정보 3개 선택 > 업데이트 버튼 선택
- `민감하지 않은 범위` 항목 확인

### 1.5. 클라이언트 메뉴에서 ID 와 시크릿 키 확인

- 클라이언트 ID 와 시크릿 키 보관

## 2. supabase 환경설정

- 프로젝트 > Auth > SignIn/Providers > Google > Enable > 각 항목 입력
- 저장 확인

# 구글 로그인 적용하기

## 1. 구글 로그인 버튼 만들기

- /src/components/GoogleLoginButton.tsx 생성

```tsx
import React from 'react';
import { useAuth } from '../contexts/AuthContext';

interface GoogleLoginButtonProps {
  children?: React.ReactNode;
  onError: (error: string) => void;
  onSuccess: (message: string) => void;
}

const GoogleLoginButton = ({ onError, onSuccess }: GoogleLoginButtonProps) => {
  // 구글 로그인 사용
  const { signInWithGoogle } = useAuth();
  // 구글 로그인 실행
  const handleGoogleLogin = async () => {
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        console.log('구글 로그인 에러 메시지 : ', error);
        if (onError) {
          onError(error);
        }
      } else {
        console.log('구글 로그인 성공');
        if (onSuccess) {
          onSuccess('구글 로그인이 성공하였습니다.');
        }
      }
    } catch (err) {
      console.log('구글 로그인 오류 : ', err);
    }
  };
  return (
    <button
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        width: '100%',
        padding: '12px 16px',
        backgroundColor: '#fff',
        color: '#333',
        border: '1px solid #dadce0',
        borderRadius: '8px',
        fontSize: '16px',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'background-color 0.2s ease',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.backgroundColor = '#f8f9fa';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.backgroundColor = '#fff';
      }}
      onClick={handleGoogleLogin}
    >
      {/* 구글 아이콘 SVG */}
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          fill="#4285F4"
        />
        <path
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          fill="#34A853"
        />
        <path
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          fill="#FBBC05"
        />
        <path
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          fill="#EA4335"
        />
      </svg>
      구글 로그인
    </button>
  );
};

export default GoogleLoginButton;
```

- /src/contexts/AuthContext.tsx 추가

```tsx
// 구글 로그인 함수
signInWithGoogle: () => Promise<{ error?: string }>;
```

```tsx
// 구글 로그인 함수
const signInWithGoogle: AuthContextType['signInWithGoogle'] = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      // 로그인 실행후 이동옵션
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });
  // 오류발생시 체크 해보자.
  if (error) {
    return { error: error.message };
  }
  console.log('구글 로그인 성공 : ', data);
  return {};
};
```

```tsx
const value: AuthContextType = {
  signUp,
  signIn,
  checkEmailExists,
  checkNicknameExists,
  signInWithKakao,
  signInWithGoogle,
  unlinkKakaoAccount,
  signOut,
  user,
  session,
  loading,
  deleteAccount,
};
```

- /src/pages/SignUpPage.tsx 업데이트

```tsx
{
  /* 구글 로그인 버튼 :  오류 메시지는 사용자도 볼 수 있어야 함.  */
}
<div style={{ marginTop: 'var(--space-3)' }}>
  <GoogleLoginButton
    onError={error => setMsg(`구글 로그인 오류 : ${error}`)}
    onSuccess={message => setMsg(message)}
  />
</div>;
```

- /src/pages/SignInPage.tsx 업데이트

```tsx
{
  /* 구글 로그인 버튼 :  오류 메시지는 사용자도 볼 수 있어야 함.  */
}
<div style={{ marginTop: 'var(--space-3)' }}>
  <GoogleLoginButton onError={error => setMsg(`구글 로그인 오류 : ${error}`)} />
</div>;
```

## 2. 구글 로그인 후 리다이렉트 처리

- /src/pages/AuthCallback.tsx 업데이트

```tsx
// 닉네임 추출
const extractNickname = (user: any, isOAuthLogin: boolean, loginType: string): string => {
  let nickname = user.user_metadata.nickname;
  if (isOAuthLogin && !nickname) {
    nickname =
      user.app_metadata.full_name ||
      user.app_metadata.name ||
      user.user_metadata.full_name ||
      user.user_metadata.name ||
      user.email?.split('@')[0] ||
      (loginType === '카카오 로그인' ? '카카오사용자' : '구글사용자');
  }
  return nickname;
};
```

- handleAuthCallback 함수 업데이트

```tsx
// 카카오 또는 구글로 로그인 했는지 확인 필요 (kakao, google 은 Supabase 에서 정한 글자)
const isKakaoLogin = user.app_metadata.provider === 'kakao';
const isGoogleLogin = user.app_metadata.provider === 'kakao';
const isOAuthLogin = isKakaoLogin || isGoogleLogin;

let loginType = '이메일 인증';
if (isKakaoLogin) {
  loginType = '카카오 로그인';
} else if (isGoogleLogin) {
  loginType = '구글 로그인';
}

// OAuth 로그인 이메일 죽복 확인 (임시 비활성화)
if (isKakaoLogin && user.email) {
  console.log(`${loginType} - 이메일 중복 확인 비활성화`);
  console.log(user.email);
}

// 닉네임 추출
const nickname = extractNickname(user, isOAuthLogin, loginType);
```

## 3. 구글 회원 탈퇴 기능

- /src/contexts/AuthContext.tsx 구글 회원 탈퇴 추가

```tsx
// 구글 계정 연동 해제 함수
unlinkGoogleAccount: () => Promise<{ error?: string; success?: boolean; message?: string }>;
```

```tsx
// 구글 계정 연동 해제 함수
const unlinkGoogleAccount: AuthContextType['unlinkGoogleAccount'] = async () => {
  try {
    // 구글 로그인 사용자인지 확인
    if (user?.app_metadata.provider !== 'google') {
      return { error: '구글 로그인 사용자가 아닙니다.' };
    }
    // supabase 에서 구글 계정 연동 해제
    // 사용자의 구글 identity 찾기
    const googleIdentity = user.identities?.find(item => item.provider === 'google');
    if (!googleIdentity) {
      return { error: '구글 계정 연동 정보를 찾을 수 없습니다.' };
    }
    // 사용자의 구글 identity 찾기 성공
    const { error } = await supabase.auth.unlinkIdentity(googleIdentity);
    if (error) {
      console.log(' 구글 계정 연동 해제 실패:', error.message);
      return { error: '구글 계정 연동 해제에 실패하였습니다.' };
    }
    // 계정 해제에 성공했다면
    return {
      success: true,
      message: '구글 계정 연동이 해제되었습니다. 다시 로그인해주세요.',
    };
  } catch (err) {
    console.log(`구글 계정 연동 해제 오류 : `, err);
    return { error: '구글 계정 연동 해제 중 오류가 발생했습니다.' };
  }
};
```

```tsx
// 회원 탈퇴기능 (카카오, 구글 회원탈퇴 기능도 추가)
const deleteAccount: AuthContextType['deleteAccount'] = async () => {
  try {
    // 카카오, 구글 로그인 사용자 인지 확인
    const isKakaoUser = user?.app_metadata.provider === 'kakao';
    const isGoogleUser = user?.app_metadata.provider === 'google';

    // 기존에 사용한 데이터들을 먼저 정리한다.
    const { error: profileError } = await supabase.from('profiles').delete().eq('id', user?.id);
    if (profileError) {
      console.log('프로필 삭제 실패 : ', profileError.message);
      return { error: '프로필 삭제에 실패했습니다.' };
    }

    // 탈퇴 신청 데이터 추가
    // account_deletion_requests 에  Pending 으로 Insert 합니다.
    // 등록할 삭제 데이터
    const deleteInfo: DeleteRequestInsert = {
      user_id: user?.id,
      reason: isKakaoUser
        ? '카카오 회원 탈퇴 요청'
        : isGoogleUser
          ? '구글 회원 탈퇴 요청'
          : '사용자 요청',
      status: 'pending',
      user_email: user?.email as string,
    };
    const { error: deleteRequestsError } = await supabase
      .from('account_deletion_requests')
      .insert([{ ...deleteInfo }]);

    if (deleteRequestsError) {
      console.log('탈퇴 목록 추가에 실패 : ', deleteRequestsError.message);
      return { error: '탈퇴 목록 추가에 실패했습니다.' };
    }

    // 혹시 SMTP 서버가 구축이 가능하다면 관리자에게 이메일 전송하는 자리

    // 로그아웃 시켜줌.
    await signOut();

    return {
      success: true,
      message: isKakaoUser
        ? '카카오 계정 연동이 해제되었습니다. 계정 삭제가 요청되었습니다.'
        : isGoogleUser
          ? '구글 계정 연동이 해제되었습니다. 계정 삭제가 요청되었습니다.'
          : '계정 삭제가 요청되었습니다. 관리자 승인 후 완전히 삭제됩니다.',
    };
  } catch (err) {
    console.log('탈퇴 요청 기능 오류 : ', err);
    return { error: '계정 탈퇴 처리 중 오류가 발생하였습니다.' };
  }
};
```

```tsx
const value: AuthContextType = {
  signUp,
  signIn,
  checkEmailExists,
  checkNicknameExists,
  signInWithKakao,
  signInWithGoogle,
  unlinkKakaoAccount,
  unlinkGoogleAccount,
  signOut,
  user,
  session,
  loading,
  deleteAccount,
};
```

- /src/page/ProfilePage.tsx 업데이트

```tsx
// 회원 기본 정보 (카카오, 구글 회원 탈퇴 추가)
const { user, deleteAccount, unlinkKakaoAccount, unlinkGoogleAccount } = useAuth();
```

```tsx
// 구글 계정 연동 해제
const handleUnlinkGoogle = async () => {
  const message =
    '구글 계정 연동을 해제하시겠습니까? \n\n 연동 해제 후에는 구글로 다시 로그인 할 수 없습니다.';
  const isConfirm = confirm(message);
  if (isConfirm) {
    const result = await unlinkGoogleAccount();
    if (result.success) {
      alert(result.message);
      // 연동 해제 후 로그아웃 처리
      window.location.href = '/singin';
    } else if (result.error) {
      alert(`연동 해제 실패 : ${result.error}`);
    }
  }
};
```

```tsx
// 회원탈퇴
const handleDeleteUser = () => {
  // 카카오 또는 구글 로그인 사용자인지 확인
  const isKakaoUser = user?.app_metadata.provider === 'kakao';
  const isGoogleUser = user?.app_metadata.provider === 'google';
  const message: string = isKakaoUser
    ? '😥 카카오 계정 연동을 해제하고 계정을 삭제하시겠습니까? \n\n 복구가 불가능합니다.'
    : isGoogleUser
      ? '😥 구글 계정 연동을 해제하고 계정을 삭제하시겠습니까? \n\n 복구가 불가능합니다.'
      : '😥 계정을 완전히 삭제하시겠습니까? \n\n 복구가 불가능합니다.';

  let isConfirm = false;
  isConfirm = confirm(message);

  if (isConfirm) {
    deleteAccount();
  }
};
```

```tsx
{
  /* 로그인 방식 표시 */
}
<div className="form-group">
  <label className="form-label">로그인 방식</label>
  <div
    style={{
      padding: 'var(--space-3)',
      backgroundColor: '#ffffff',
      borderRadius: 'var(--radius-md)',
      color: 'var(--gray-700)',
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-2)',
      border: '1px solid var(--gray-200)',
    }}
  >
    {user?.app_metadata?.provider === 'kakao' ? (
      <>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 3C6.48 3 2 6.48 2 10.5C2 13.52 4.5 16.1 8 17.5L7 21L10.5 18.5C11.3 18.7 12.1 18.8 13 18.8C18.52 18.8 23 15.32 23 11.3C23 7.28 18.52 3.8 13 3.8C12.7 3.8 12.4 3.8 12.1 3.9C12.1 3.6 12 3.3 12 3Z"
            fill="currentColor"
          />
        </svg>
        카카오 로그인
      </>
    ) : user?.app_metadata?.provider === 'google' ? (
      <>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        구글 로그인
      </>
    ) : (
      <>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path
            d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"
            fill="currentColor"
          />
        </svg>
        이메일 로그인
      </>
    )}
  </div>
</div>;
```

```tsx
{
  /* 구글 사용자에게만 연동 해제 버튼 표시 */
}
{
  user?.app_metadata?.provider === 'google' && (
    <button
      className="btn btn-warning btn-lg"
      onClick={handleUnlinkGoogle}
      style={{ backgroundColor: '#4285F4', color: '#FFFFFF', border: 'none' }}
    >
      🔗 구글 연동 해제
    </button>
  );
}
```

```tsx
<button className="btn btn-danger btn-lg" onClick={handleDeleteUser}>
  {user?.app_metadata?.provider === 'kakao'
    ? '카카오 연동 해제 & 탈퇴'
    : user?.app_metadata?.provider === 'google'
      ? '구글 연동 해제 & 탈퇴'
      : '회원탈퇴'}
</button>
```
