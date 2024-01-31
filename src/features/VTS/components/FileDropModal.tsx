"use client";
import { useEffect } from "react";
import { FileUploader } from "react-drag-drop-files";
import { FaFileAudio } from "react-icons/fa6";
import ReactLoading from "react-loading";
import { Modal } from "@mantine/core";
import { useRecoilState } from "recoil";
import { fileDropModalState } from "@/common/atoms/fileDropModal";
import { loadingAState } from "@/common/atoms/loadingA";
import { apiKeyState } from "@/common/atoms/apikey";
import { fsModalState } from "@/common/atoms/fsModal";
import { vanillaTextState } from "@/common/atoms/vanillaText";
import { transcription } from "@/common/lib/openai";
import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";

//ffmpegの初期化
const ffmpeg = createFFmpeg({
  corePath: "https://unpkg.com/@ffmpeg/core@0.11.0/dist/ffmpeg-core.js",
  log: true,
});
const MAX_FILE_SIZE = 25000000;
const fileTypes = ["mp4", "mp3", "m4a"];

const FileDropModal = () => {
  const [modalOpened, setModalOpened] = useRecoilState(fileDropModalState);
  const [fsModalOpened, setFsModalOpened] = useRecoilState(fsModalState);
  const [vanillaText, setVanillaText] = useRecoilState(vanillaTextState);
  const [loadingA, setLoadingA] = useRecoilState(loadingAState);
  const [apiKey, setApiKey] = useRecoilState(apiKeyState);

  //ffmpegのロード
  useEffect(() => {
    const load = async () => {
      await ffmpeg.load();
    };
    if (!ffmpeg.isLoaded()) {
      //ロードチェック
      load();
    }
  }, []);

  const submitFile = async (file: File) => {
    if (apiKey == "") {
      window.alert("openaiのAPIKeyをセットしてください");
      setModalOpened(false);
    } else {
      try {
        setLoadingA(true);
        ffmpeg.FS("writeFile", file.name, await fetchFile(file));
        await ffmpeg.run(
          "-i", // 入力ファイルを指定
          file.name,
          "-vn", // ビデオストリームを無視し、音声ストリームのみを出力
          "-ar", // オーディオサンプリング周波数
          "16000",
          "-ac", // チャンネル
          "1",
          "-b:a", // ビットレート
          "64k",
          "-f", // 出力ファイルのフォーマット
          "mp3",
          "output.mp3",
        );
        const readData = ffmpeg.FS("readFile", "output.mp3");
        const audioBlob = new Blob([readData.buffer], { type: "audio/mp3" });

        // サイズチェック Whisperは最大25MB
        if (audioBlob.size > MAX_FILE_SIZE) {
          alert("サイズが大きすぎます");
          setLoadingA(false);
          return;
        }

        const audio_file = new File([audioBlob], "audio.mp3", {
          type: audioBlob.type,
          lastModified: Date.now(),
        });

        const formData = new FormData();
        formData.append("file", audio_file);

        const whisperText = await transcription(formData, apiKey);
        const cleanedText = whisperText.replace(/^\s*$[\n\r]{1,}/gm, "");
        setVanillaText(cleanedText);
        setFsModalOpened(true);
      } catch (err) {
        alert("エラーが発生しました。時間をおいてもう１度お試しください。");
        console.log("エラーが発生しました", err);
      } finally {
        setLoadingA(false);
        setModalOpened(false);
      }
    }
  };

  return (
    <Modal
      opened={modalOpened}
      onClose={() => setModalOpened(false)}
      title="文字起こしするファイルをアップロードします"
      centered
    >
      <FileUploader handleChange={submitFile} name="file" types={fileTypes}>
        {loadingA ? (
          <div className=" rounded-md border-2 border-dashed border-blue-400 p-5">
            <div className=" flex flex-col items-center justify-center">
              <div className=" my-5">
                <ReactLoading
                  type="bars"
                  color="rgb(96 165 250)"
                  height="50px"
                  width="50px"
                  className="mx-auto"
                />
              </div>
              <div>アップロード中...</div>
            </div>
          </div>
        ) : (
          <div className=" rounded-md border-2 border-dashed border-blue-400 p-5">
            <div className=" flex flex-col items-center justify-center">
              <FaFileAudio className="h-16 w-16 text-sky-400" />
              <div>音声ファイルを文字起こしする</div>
              <div className=" text-sm text-gray-500">(MP3,MP4,M4A)</div>
            </div>
          </div>
        )}
      </FileUploader>
    </Modal>
  );
};

export default FileDropModal;
