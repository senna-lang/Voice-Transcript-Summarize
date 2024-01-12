import { FFmpeg, createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';

const MAX_FILE_SIZE = 25000000;
const fileTypes = ['mp4', 'mp3', 'm4a'];

export const compressionAudioFile = async (file: File, ffmpeg: FFmpeg) => {
  ffmpeg.FS('writeFile', file.name, await fetchFile(file));
  await ffmpeg.run(
    '-i', // 入力ファイルを指定
    file.name,
    '-vn', // ビデオストリームを無視し、音声ストリームのみを出力
    '-ar', // オーディオサンプリング周波数
    '16000',
    '-ac', // チャンネル
    '1',
    '-b:a', // ビットレート
    '64k',
    '-f', // 出力ファイルのフォーマット
    'mp3',
    'output.mp3'
  );
  const readData = ffmpeg.FS('readFile', 'output.mp3');
  const audioBlob = new Blob([readData.buffer], { type: 'audio/mp3' });

  // サイズチェック Whisperは最大25MB
  if (audioBlob.size > MAX_FILE_SIZE) {
    alert('サイズが大きすぎます');
    setLoading1(false);
    return;
  }

  const audio_file = new File([audioBlob], 'audio.mp3', {
    type: audioBlob.type,
    lastModified: Date.now(),
  });

  const formData = new FormData();
  formData.append('file', audio_file);

  return formData;
};
