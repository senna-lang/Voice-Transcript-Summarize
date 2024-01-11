export const transcription = async (formData: any,apiKey:string) => {
  try {
    // フォームデータから音声データを取得
    const resource = formData.get('file') as File;

    // Whisper-1モデルで日本語の文字起こしを行うためのフォームデータを作成
    const transcriptionFormData = new FormData();
    transcriptionFormData.set('file', resource); // 音声データをセット
    transcriptionFormData.set('model', 'whisper-1'); // モデルをwhisper-1にする
    transcriptionFormData.set('language', 'ja'); // 言語を日本語にする

    // 文字起こしを実行
    const res = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      method: 'POST',
      body: transcriptionFormData,
    });
    //文字起こしに失敗した場合はエラーメッセージを返す
    if (!res.ok) {
      window.alert('文字起こしに失敗しました。');
    }

    const json = await res.json();
    const result = json.text; // 文字起こしの結果を取得

    // ここでresultの値をバックエンドに保存したり、別のAPIに渡したり、何かしらの処理を行う

    // 成功した場合は成功メッセージを返す
    return result;
  } catch (err) {
    return err;
  }
};
