import OpenAI from 'openai';

//文字起こし実行
export const transcription = async (formData: FormData, apiKey: string) => {
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

//要約実行
export const summarize = async (
  apiKey: string,
  gptModel: string,
  vanillaText: string
) => {
  const openAi = new OpenAI({
    apiKey: apiKey,
    dangerouslyAllowBrowser: true,
  });

  const prompt = `
  #命令書 
  あなたはプロの編集者です。以下の制約条件に従って、入力する文章を元に要約とアジェンダを作成してください。
   #制約条件
  ・重要なキーワードを取りこぼさない。
  ・文章の意味を変更しない。 
  ・必ずアジェンダとサマリーを作成すること。
  ・アジェンダは数字の箇条書きで作成すること。
  ・サマリーは200文字以上400文字以内の文章にまとめること。
   #入力する文章
   [${vanillaText}] 
  #出力形式
   [アジェンダ]:
   [サマリー]:
  `;

  const gptRes = await openAi.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model: `${gptModel}`,
    temperature: 0,
  });

  const result = gptRes.choices[0].message.content;

  return result;
};
