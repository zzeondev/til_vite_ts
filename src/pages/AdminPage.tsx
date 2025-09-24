import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import type { DeleteRequest, DeleteRequestUpdate } from '../types/TodoType';
import Loading from '../components/Loading';

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
    // console.log(user?.email);
    // console.log(user?.id);
    // console.log(user);
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
      <div className="card" style={{ textAlign: 'center', maxWidth: '500px', margin: '0 auto' }}>
        <h2 className="page-title">접근 권한이 없습니다.</h2>
        <p className="page-subtitle">관리자만이 이 페이지에 접근할 수 있습니다.</p>
        <div style={{ marginTop: 'var(--space-6)' }}>
          <p style={{ color: 'var(--gray-600)' }}>
            현재 로그인 된 계정 : <strong>{user?.email}</strong>
          </p>
        </div>
      </div>
    );
  }
  // 2. 로딩중 이라면
  if (loading) {
    return <Loading message="관리자데이터를 불러오는 중..." />;
  }

  // tsx 자리
  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">👨‍💼 관리자 페이지</h2>
        <p className="page-subtitle">계정 삭제 요청 관리</p>
      </div>
      {/* 삭제 요청 관리 */}
      <div className="card">
        <h3 style={{ marginBottom: 'var(--space-4)', color: 'var(--gray-800)' }}>
          📋 삭제 요청 목록
        </h3>
        {deleteRequests.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
            <div style={{ fontSize: '3rem', marginBottom: 'var(--space-4)' }}>✅</div>
            <p style={{ color: 'var(--gray-600)', fontSize: '1.1rem' }}>
              대기 중인 삭제 요청이 없습니다.
            </p>
          </div>
        ) : (
          <div>
            {deleteRequests.map(item => (
              <div key={item.id} className="admin-request-item">
                <div className="admin-request-header">
                  <h4 style={{ margin: 0, color: 'var(--gray-800)' }}>👤 {item.user_email}</h4>
                  <span className="admin-status-badge">대기 중</span>
                </div>
                {/* 상세정보 */}
                <div className="admin-request-details">
                  <div className="admin-detail-row">
                    <span className="admin-detail-label">사용자 ID:</span>
                    <span className="admin-detail-value">{item.user_id}</span>
                  </div>
                  <div className="admin-detail-row">
                    <span className="admin-detail-label">요청시간:</span>
                    <span className="admin-detail-value">
                      {item.requested_at && new Date(item.requested_at).toLocaleString('ko-KR')}
                    </span>
                  </div>
                  <div className="admin-detail-row">
                    <span className="admin-detail-label">삭제 사유:</span>
                    <span className="admin-detail-value"> {item.reason}</span>
                  </div>
                </div>
                {/* 액션들 */}
                <div className="admin-request-actions">
                  <button
                    className="btn btn-success btn-sm"
                    onClick={() => approveDelete(item.id, item)}
                  >
                    ✅ 승인
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => rejectDelete(item.id, item)}
                  >
                    ❌ 거절
                  </button>
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
