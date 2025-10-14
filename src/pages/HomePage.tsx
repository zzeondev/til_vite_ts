import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

function HomePage() {
  const { user } = useAuth();

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">😜 홈</h2>
        <p className="page-subtitle">
          {user ? `${user.email}님, 환영합니다.` : 'Todo 서비스에 오신 것을 환영합니다.'}
        </p>
      </div>
      {user ? (
        <div className="card">
          <h3 style={{ marginBottom: 'var(--space-4)', color: 'var(--gray-800)' }}>📒 할일 관리</h3>
          <p style={{ marginBottom: 'var(--space-6)', color: 'var(--gray-600)' }}>
            ✒️ 효율적으로 할 일을 관리하고 생산성을 높여보세요.
          </p>
          <div
            style={{
              display: 'flex',
              gap: 'var(--space-3)',
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
            <Link to={'/todos'} className="btn btn-primary btn-lg">
              할 일 관리하기
            </Link>
            <Link to={'/todos-infinite'} className="btn btn-success btn-lg">
              무한 스크롤로 보기
            </Link>
          </div>
        </div>
      ) : (
        <div className="card">
          <h3 style={{ marginBottom: 'var(--space-4)', color: 'var(--gray-800)' }}>🚀 시작하기</h3>
          <p style={{ marginBottom: 'var(--space-6)', color: 'var(--gray-600)' }}>
            ✍️ 계정을 만들고 할 일 관리를 시작해보세요.
          </p>
          <div
            style={{
              display: 'flex',
              gap: 'var(--space-3)',
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
            <Link to={'/signin'} className="btn btn-primary btn-lg">
              😘 로그인
            </Link>
            <Link to={'/signup'} className="btn btn-success btn-lg">
              💑 회원가입
            </Link>
          </div>
        </div>
      )}
      {/* 기능 소개 섹션 */}
      <div className="card">
        <h3 style={{ marginBottom: 'var(--space-4)', color: 'var(--gray-800)' }}>🏷️ 주요 기능</h3>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: 'var(--space-4)',
          }}
        >
          <div
            style={{
              padding: 'var(--space-4)',
              backgroundColor: 'var(--gray-50)',
              borderRadius: 'var(--radius-md)',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '2rem', marginBottom: 'var(--sapce-2)' }}>📃</div>
            <h4 style={{ marginBottom: 'var(--space-2)', color: 'var(--gray-800)' }}>할 일 관리</h4>
            <p style={{ color: 'var(--gray-800)', fontSize: '14px' }}>
              할 일을 추가, 수정, 삭제하고 완료 상태를 관리할 수 있습니다.
            </p>
          </div>

          <div
            style={{
              padding: 'var(--space-4)',
              backgroundColor: 'var(--gray-50)',
              borderRadius: 'var(--radius-md)',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '2rem', marginBottom: 'var(--sapce-2)' }}>💎</div>
            <h4 style={{ marginBottom: 'var(--space-2)', color: 'var(--gray-800)' }}>
              무한 스크롤
            </h4>
            <p style={{ color: 'var(--gray-800)', fontSize: '14px' }}>
              많은 할 일을 효율적으로 탐색할 수 있는 무한 스크롤 기능을 제공합니다.
            </p>
          </div>

          <div
            style={{
              padding: 'var(--space-4)',
              backgroundColor: 'var(--gray-50)',
              borderRadius: 'var(--radius-md)',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '2rem', marginBottom: 'var(--sapce-2)' }}>🥻</div>
            <h4 style={{ marginBottom: 'var(--space-2)', color: 'var(--gray-800)' }}>
              프로필 관리
            </h4>
            <p style={{ color: 'var(--gray-800)', fontSize: '14px' }}>
              개인 정보와 아바타를 관리하고 계정을 안전하게 관리할 수 있습니다.
            </p>
          </div>
        </div>
      </div>
      {/* 추가 기능 섹션 */}
      {user && (
        <div className="card">
          <h3 style={{ marginBottom: 'var(--space-4)', color: 'var(--gray-800)' }}>🔍 추가 기능</h3>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: 'var(--space-4)',
            }}
          >
            <Link
              to={'/profile'}
              className="btn btn-secondary"
              style={{ textDecoration: 'none', textAlign: 'center' }}
            >
              🔑 프로필 관리
            </Link>
            <Link
              to={'/profile'}
              className="btn btn-secondary"
              style={{ textDecoration: 'none', textAlign: 'center' }}
            >
              📆 캘린더
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default HomePage;
