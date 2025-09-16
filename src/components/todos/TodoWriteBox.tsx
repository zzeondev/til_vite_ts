import React from 'react';
import { Link } from 'react-router-dom';
import type { Profile } from '../../types/TodoType';

interface TodoWriteBoxProps {
  profile: Profile | null;
}
const TodoWriteBox = ({ profile }: TodoWriteBoxProps) => {
  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ marginBottom: 'var(--space-4)', color: 'var(--gray-800)' }}>
          ✏️ 새 할 일 작성
          {profile?.nickname && (
            <span
              style={{ marginLeft: 'var(--space-2)', fontSize: '16px', color: 'var(--gray-600)' }}
            >
              - {profile.nickname}
            </span>
          )}
        </h2>
        <Link to={'/todos/write'} className="btn btn-primary" style={{ color: '#fff' }}>
          작성하기
        </Link>
      </div>
    </div>
  );
};

export default TodoWriteBox;
