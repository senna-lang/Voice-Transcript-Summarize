import React from 'react';

const Register = () => {
  return (
    <div className=" h-screen flex flex-col items-center justify-center bg-blue-300">
      <form className=" p-8 rounded-lg shadow-md w-96">
        <h1 className="mb-4 text-2xl text-gray-700 font-medium">新規登録</h1>
        <div>
          <label className="block text-sm font-medium">Email</label>
          <input type="text" className="mt-1 border-2 rounded-md" />
        </div>
        <div>
          <label className="block text-sm font-medium">Password</label>
          <input type="password" className="mt-1 border-2 rounded-md" />
        </div>
      </form>
    </div>
  );
};

export default Register;
