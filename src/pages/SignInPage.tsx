import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import KakaoLoginButton from '../components/KakaoLoginButton';
import GoogleLoginButton from '../components/GoogleLoginButton';

function SignInPage() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [email, setEmail] = useState<string>('');
  const [pw, setPw] = useState<string>('');
  const [msg, setMsg] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const { error } = await signIn(email, pw);
    if (error) {
      setMsg(`로그인 오류 : ${error}`);
    } else {
      setMsg('로그인 성공');
      // 바로 이동시키기
      navigate('/todos');
    }
  };
  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">🔑 로그인페이지</h2>
        <p className="page-subtitle">계정에 로그인하세요.</p>
      </div>
      <div className="card" style={{ maxWidth: '400px', margin: '0 auto' }}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">이메일</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="이메일을 입력하세요"
              className="form-input"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">비밀번호</label>
            <input
              type="password"
              value={pw}
              onChange={e => setPw(e.target.value)}
              placeholder="비밀번호를 입력하세요"
              className="form-input"
              required
            />
          </div>

          <button type="submit" className="btn btn-success btn-lg" style={{ width: '100%' }}>
            로그인
          </button>
        </form>

        {/* SNS 로그인 영역 */}
        <div style={{ display: 'flex', alignItems: 'center', margin: 'var(--space-6) ' }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--gray-300)' }}></div>
          <span style={{ padding: '0 var(--space-4)', fontSize: '14px' }}>또는</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--gray-300)' }}></div>
        </div>

        {/* 카카오 로그인 버튼 : 오류 메시지는 사용자도 볼 수 있어야 함*/}
        <KakaoLoginButton onError={error => setMsg(`카카오 로그인 오류 : ${error}`)} />
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

export default SignInPage;
