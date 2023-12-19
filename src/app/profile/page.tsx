'use client'
import React from 'react';
import Sidebar from '../components/Sidebar';
import { useRecoilState } from 'recoil';
import { userIdState } from '@/app/atoms/userId';
import { userState } from '@/app/atoms/user';

const Profile = () => {
  const [userId, setUserId] = useRecoilState(userIdState);
  const [user, setUser] = useRecoilState(userState);
  return (
    <div>
      <Sidebar userId={userId}/>
    </div>
  );
};

export default Profile;
