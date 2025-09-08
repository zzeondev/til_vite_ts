import React, { useEffect, useState } from 'react';
import { TodoProvider } from '../contexts/TodoContext';
import TodoWrite from '../components/todos/TodoWrite';
import TodoList from '../components/todos/TodoList';
import type { Profile } from '../types/TodoType';
import { useAuth } from '../contexts/AuthContext';
import { getProfile } from '../lib/profile';

function TodoPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);

  // 프로필 가져오기
  const loadProfile = async () => {
    try {
      if (user?.id) {
        const userProfile = await getProfile(user.id);
        if (!userProfile) {
          alert('탈퇴한 회원입니다. 관리자님에게 요청하세요.');
        }
        setProfile(userProfile);
      }
    } catch (error) {
      console.log('프로필 가져오기 Error : ', error);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  return (
    <div>
      <h2>{profile?.nickname}할 일</h2>
      <TodoProvider>
        <div>
          <TodoWrite />
        </div>
        <div>
          <TodoList />
        </div>
      </TodoProvider>
    </div>
  );
}

export default TodoPage;
