'use client';

import { useState } from 'react';

export default function Form() {
  const [text, setText] = useState('');
  const submitFile = async (e: any) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const res = await fetch('/api', {
      method: 'POST',
      body: formData,
    });
    const whisperText = await res.json();
    if (whisperText) {
      setText(whisperText);
    }
  };
  return (
    <div>
      <form onSubmit={submitFile} className="flex flex-col gap-8">
        <div className="flex flex-col">
          <label>音声ファイル</label>
          <input type="file" name="resource" accept="audio/*" required />
        </div>
        <div className="flex justify-center">
          <button type="submit">送信</button>
        </div>
      </form>
      <div>変換: {text}</div>
    </div>
  );
}
