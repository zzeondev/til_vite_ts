import React, { useState } from 'react';
import KakaoLoginButton from '../components/KakaoLoginButton';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import GoogleLoginButton from '../components/GoogleLoginButton';

function SignUpPage() {
  const { signUp, checkEmailExists, checkNicknameExists } = useAuth();

  const [email, setEmail] = useState<string>('');
  const [pw, setPw] = useState<string>('');
  const [nickName, setNickName] = useState<string>('');
  const [msg, setMsg] = useState<string>('');

  // 이메일 중복 확인 상태
  const [emailCheckStatus, setEmailCheckStatus] = useState<
    'idle' | 'checking' | 'available' | 'taken'
  >('idle');

  // 이메일 중복 확인 메세지
  const [emailCheckMessage, setEmailCheckMessage] = useState<string>('');

  // 닉네임 중복 확인 상태
  const [nicknameCheckStatus, setNicknameCheckStatus] = useState<
    'idle' | 'checking' | 'available' | 'taken'
  >('idle');

  // 닉네임 중복 확인 메세지
  const [nicknameCheckMessage, setNicknameCheckMessage] = useState<string>('');

  // 이메일 중복 확인 함수
  const handleEmailCheck = async () => {
    if (!email.trim()) {
      setEmailCheckMessage('이메일을 입력해주세요.');
      setEmailCheckStatus('taken');
      return;
    }
    // 입력된 글자가 email 형식에 맞는지 정규표현식으로 검사
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailCheckMessage('올바른 이메일 형식을 입력해주세요.');
      setEmailCheckStatus('taken');
      return;
    }

    setEmailCheckStatus('checking');
    setEmailCheckMessage('이메일 중복 확인 중...');
    try {
      // DB 에 직접 이메일 글자를 보내고 중복확인 진행
      const result = await checkEmailExists(email);
      if (result.error) {
        setEmailCheckMessage(`오류 : ${result.error}`);
        setEmailCheckStatus('taken');
      } else if (result.exists) {
        setEmailCheckMessage('이미 사용 중인 이메일입니다.');
        setEmailCheckStatus('taken');
      } else {
        setEmailCheckMessage('사용 가능한 이메일입니다.');
        setEmailCheckStatus('available');
      }
    } catch (error) {
      setEmailCheckMessage('이메일 중복 확인 중 오류가 발생했습니다.');
      setEmailCheckStatus('taken');
    }
  };

  // 닉네임 중복 확인 함수
  const handleNicknameCheck = async () => {
    if (!nickName.trim()) {
      setNicknameCheckMessage('닉네임을 입력해 주세요.');
      setNicknameCheckStatus('taken');
      return;
    }
    if (nickName.trim().length < 2) {
      setNicknameCheckMessage('닉네임을 2자 이상 입력해 주세요.');
      setNicknameCheckStatus('taken');
      return;
    }
    setNicknameCheckStatus('checking');
    setNicknameCheckMessage('닉네임 중복 확인 중...');
    try {
      // DB 에 직접 닉네임 글자를 보내고 중복확인 진행
      const result = await checkNicknameExists(nickName);
      if (result.error) {
        setNicknameCheckMessage(`오류 : ${result.error}`);
        setNicknameCheckStatus('taken');
      } else if (result.exists) {
        setNicknameCheckMessage('이미 사용 중인 닉네임입니다.');
        setNicknameCheckStatus('taken');
      } else {
        setNicknameCheckMessage('사용 가능한 닉네임입니다.');
        setNicknameCheckStatus('available');
      }
    } catch (error) {
      setNicknameCheckStatus('taken');
      setNicknameCheckMessage('닉네임 중복 확인 중 오류가 발생했습니다.');
    }
  };

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
        // 잠시 추가정보를 보관합니다.
        // Supabase 에서 auth 에는 추가적인 정보를 저장하는 객체가 존재
        // 공식적인 명칭이 metadata 라고 합니다.
        // 이메일 인증 후에 프로필 생성 시에 사용하려고 보관
        data: { nickName: nickName },
      },
    });

    if (error) {
      setMsg(`회원가입 오류 : ${error}`);
    } else {
      setMsg(
        '회원가입이 성공했습니다. 이메일 인증 링크를 확인해주세요. 인증 완료 후 프로필이 자동으로 생성됩니다.',
      );
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">회원가입</h2>
        <p className="page-subtitle">새 계정을 만들어 보세요.</p>
      </div>
      <div className="card" style={{ maxWidth: '400px', margin: '0 auto' }}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">이메일</label>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
              {/* 이메일 입력 태그 */}
              <input
                type="email"
                value={email}
                onChange={e => {
                  setEmail(e.target.value);
                  if (emailCheckStatus !== 'idle') {
                    setEmailCheckStatus('idle');
                    setEmailCheckMessage('');
                  }
                }}
                placeholder="이메일을 입력하세요."
                className="form-input"
                required
                style={{ flex: 1 }}
              />
              {/* 이메일 중복 체크 버튼 태그*/}
              <button
                type="button"
                onClick={handleEmailCheck}
                disabled={emailCheckStatus === 'checking'}
                style={{
                  padding: '8px 16px',
                  backgroundColor: emailCheckStatus === 'available' ? '#10b981' : '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: emailCheckStatus === 'checking' ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  whiteSpace: 'nowrap',
                  opacity: emailCheckStatus === 'checking' ? 0.6 : 1,
                }}
              >
                {emailCheckStatus === 'checking' ? '확인중...' : '중복확인'}
              </button>
            </div>
            {/* 이메일 체크 결과 메시지 영역 */}
            {emailCheckMessage && (
              <div
                style={{
                  marginTop: '4px',
                  fontSize: '14px',
                  color:
                    emailCheckStatus === 'available'
                      ? '#10b981'
                      : emailCheckStatus === 'taken'
                        ? '#ef4444'
                        : '#6b7280',
                }}
              >
                {emailCheckStatus === 'checking' && '⏳ '}
                {emailCheckStatus === 'available' && '✅ '}
                {emailCheckStatus === 'taken' && '❌ '}
                {emailCheckMessage}
              </div>
            )}
          </div>
          <div className="form-group">
            <label className="form-label">비밀번호</label>
            <input
              type="password"
              value={pw}
              onChange={e => setPw(e.target.value)}
              placeholder="비밀번호 (최소 6자)"
              className="form-input"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">닉네임</label>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
              {/* 닉네임 입력 태그 */}
              <input
                type="text"
                value={nickName}
                onChange={e => {
                  setNickName(e.target.value);
                  if (nicknameCheckStatus !== 'idle') {
                    setNicknameCheckStatus('idle');
                    setNicknameCheckMessage('');
                  }
                }}
                placeholder="닉네임을 입력하세요."
                className="form-input"
                style={{ flex: 1 }}
                required
              />
              {/* 닉네임 중복 체크 버튼 태그 */}
              <button
                type="button"
                onClick={handleNicknameCheck}
                disabled={nicknameCheckStatus === 'checking'}
                style={{
                  padding: '8px 16px',
                  backgroundColor: nicknameCheckStatus === 'available' ? '#10b981' : '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: nicknameCheckStatus === 'checking' ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  whiteSpace: 'nowrap',
                  opacity: nicknameCheckStatus === 'checking' ? 0.6 : 1,
                }}
              >
                {nicknameCheckStatus === 'checking' ? '확인중...' : '중복확인'}
              </button>
            </div>
            {/* 닉네임 체크 결과 메시지 영역 */}
            {nicknameCheckMessage && (
              <div
                style={{
                  marginTop: '4px',
                  fontSize: '14px',
                  color:
                    nicknameCheckStatus === 'available'
                      ? '#10b981'
                      : nicknameCheckStatus === 'taken'
                        ? '#ef4444'
                        : '#6b7280',
                }}
              >
                {nicknameCheckStatus === 'checking' && '⏳ '}
                {nicknameCheckStatus === 'available' && '✅ '}
                {nicknameCheckStatus === 'taken' && '❌ '}
                {nicknameCheckMessage}
              </div>
            )}
          </div>
          {/* 이메일 및 닉네임 중복 체크 요청 출력 및 회원가입 */}
          <button
            type="submit"
            className="btn btn-success btn-lg"
            style={{
              width: '100%',
              opacity:
                emailCheckStatus !== 'available' || nicknameCheckStatus !== 'available' ? 0.5 : 1,
              cursor:
                emailCheckStatus !== 'available' || nicknameCheckStatus !== 'available'
                  ? 'not-allowed'
                  : 'pointer',
            }}
            disabled={emailCheckStatus !== 'available' || nicknameCheckStatus !== 'available'}
          >
            {emailCheckStatus !== 'available' || nicknameCheckStatus !== 'available'
              ? '이메일 및 닉네임 중복 확인 필요'
              : '회원가입'}
          </button>
          {/* 중복 확인 상태 안내 */}
          {(emailCheckStatus === 'idle' || nicknameCheckStatus === 'idle') && (
            <div
              style={{
                marginTop: '8px',
                padding: '8px 12px',
                backgroundColor: '#fef3c7',
                border: '1px solid #f59e0b',
                borderRadius: '4px',
                fontSize: '14px',
                color: '#92400e',
                textAlign: 'center',
              }}
            >
              ⚠️ 이메일 및 닉네임 중복 확인을 완료해주세요.
            </div>
          )}
          {emailCheckStatus === 'taken' && (
            <div
              style={{
                marginTop: '8px',
                padding: '8px 12px',
                backgroundColor: '#fee2e2',
                border: '1px solid #ef4444',
                borderRadius: '4px',
                fontSize: '14px',
                color: '#dc2626',
                textAlign: 'center',
              }}
            >
              ❌ 이미 사용 중인 이메일입니다. 다른 이메일을 사용하거나 해당 이메일로 로그인해주세요.
            </div>
          )}
          {nicknameCheckStatus === 'taken' && (
            <div
              style={{
                marginTop: '8px',
                padding: '8px 12px',
                backgroundColor: '#fee2e2',
                border: '1px solid #ef4444',
                borderRadius: '4px',
                fontSize: '14px',
                color: '#dc2626',
                textAlign: 'center',
              }}
            >
              ❌ 이미 사용 중인 닉네임입니다. 다른 닉네임을 사용해주세요.
            </div>
          )}
        </form>

        {/* SNS 로그인 영역 */}
        <div style={{ display: 'flex', alignItems: 'center', margin: 'var(--space-6) ' }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--gray-300)' }}></div>
          <span style={{ padding: '0 var(--space-4)', fontSize: '14px' }}>또는</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--gray-300)' }}></div>
        </div>
        {/* 카카오 로그인 버튼 : 오류 메시지는 사용자도 볼 수 있어야 함*/}
        <KakaoLoginButton
          onError={error => setMsg(`카카오 로그인 오류 : ${error}`)}
          onSuccess={message => setMsg(message)}
        />
        {/* 구글 로그인 버튼 : 오류 메시지는 사용자도 볼 수 있어야 함 */}
        <div style={{ marginTop: 'var(--space-3' }}>
          <GoogleLoginButton
            onError={error => setMsg(`구글 로그인 오류 : ${error}`)}
            onSuccess={message => setMsg(message)}
          />
        </div>

        {/* 메시지 출력 */}
        {msg && (
          <p
            style={{
              marginTop: 'var(--space-4)',
              padding: 'var(--space-3)',
              borderRadius: 'var(--radius-md)',
              backgroundColor: msg.includes('성공') ? 'var(--success-50)' : '#fef2f2',
              color: msg.includes('성공') ? 'var(--success-600)' : '#dc2626',
              border: `1px solid ${msg.includes('성공') ? 'var(--success-600)' : '#dc2626'}`,
            }}
          >
            {msg}
          </p>
        )}
      </div>
    </div>
  );
}

export default SignUpPage;
