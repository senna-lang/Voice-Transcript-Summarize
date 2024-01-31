"use client";
import { useState } from "react";
import {
  Modal,
  Button,
  TextInput,
  Stepper,
  Group,
  Combobox,
  useCombobox,
  Input,
  InputBase,
} from "@mantine/core";
import { serverTimestamp } from "firebase/firestore";
import { useRecoilState } from "recoil";
import { useTextMeta } from "@/common/hooks/useTextMeta";
import { loadingBState } from "@/common/atoms/loadingB";
import { loadingAState } from "@/common/atoms/loadingA";
import { fsModalState } from "@/common/atoms/fsModal";
import { vanillaTextState } from "@/common/atoms/vanillaText";
import { textTitleState } from "@/common/atoms/textTitle";
import { useUserIdState } from "@/common/atoms/userId";
import { fileDropModalState } from "@/common/atoms/fileDropModal";
import { apiKeyState } from "@/common/atoms/apikey";
import { saveText } from "@/common/lib/firestore";
import { summarize } from "@/common/lib/openai";

const FsModal = () => {
  const [loadingA, setLoadingA] = useRecoilState(loadingAState);
  const [loadingB, setLoadingB] = useRecoilState(loadingBState);
  const [fsModalOpened, setFsModalOpened] = useRecoilState(fsModalState);
  const [fileDropModalOpened, setFileDropModalOpened] =
    useRecoilState(fileDropModalState);
  const [active, setActive] = useState<number>(1);
  const [vanillaText, setVanillaText] = useRecoilState(vanillaTextState);
  const [textTitle, setTextTitle] = useRecoilState(textTitleState);
  const [userId, setUserId] = useUserIdState();
  const [summaryText, setSummaryText] = useState<string | null>("");
  const [gptModel, setGptModel] = useState<string | null>(null);
  const { textMeta, metaTrigger } = useTextMeta(userId);
  const [apiKey, setApiKey] = useRecoilState(apiKeyState);

  const nextStep = () =>
    setActive((current) => (current < 3 ? current + 1 : current));
  const groceries = ["gpt-3.5-turbo", "gpt-3.5-turbo-16k"];

  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });

  const options = groceries.map((item) => (
    <Combobox.Option value={item} key={item}>
      {item}
    </Combobox.Option>
  ));

  const createSummary = async (gptModel: string | null) => {
    if (apiKey == "") {
      alert("openaiのAPIKeyをセットしてください");
      setLoadingA(false);
    } else if (gptModel == null) {
      alert("ChatGPTのモデルを選択してください。");
      setLoadingA(false);
    } else {
      try {
        const gptRes = await summarize(apiKey, gptModel, vanillaText);
        setSummaryText(gptRes);
        nextStep();
      } catch (err) {
        alert("APIKeyが間違っている可能性があります。");
        console.log("エラーが発生しました", err);
      } finally {
        setLoadingA(false);
      }
    }
  };

  const saveTexts = async () => {
    if (vanillaText == "") {
      window.alert("生成テキストが空です");
      return;
    } else if (textTitle == "") {
      window.alert("タイトルを入力してください。");
      return;
    }
    try {
      const textMeta = {
        name: textTitle,
        userId,
        createdAt: serverTimestamp(),
      };
      const textData = {
        summary: summaryText,
        vanilla: vanillaText,
      };
      await saveText(textMeta, textData, userId);
      setVanillaText("");
      setSummaryText("");
      setTextTitle("");
      setFsModalOpened(false);
      setFileDropModalOpened(false);
      metaTrigger();
    } catch (err) {
      alert("保存に失敗しました。もう１度お試しください。");
      console.log("エラーが発生しました", err);
    }
  };

  return (
    <Modal
      opened={fsModalOpened}
      onClose={() => {
        setFsModalOpened(false);
        setSummaryText("");
        setActive(1);
        setLoadingA(false);
        setLoadingB(false);
      }}
      fullScreen
      radius={0}
      transitionProps={{ transition: "fade", duration: 200 }}
    >
      <div className=" mx-3 h-[90vh] md:flex">
        <div className="mb-4 flex flex-col items-center rounded-lg bg-slate-100 p-8 md:mb-0 md:w-1/2">
          <div className=" h-1/2 w-full">
            <h2 className=" mb-4 w-full text-center text-2xl font-semibold">
              Transcript
            </h2>
            <div className="mb-2 h-[85%] overflow-y-auto rounded-lg border-2 border-dashed border-blue-300 p-6">
              {vanillaText}
            </div>
          </div>
          <div className=" h-1/2 w-full">
            <h2 className=" m-4 w-full text-center text-2xl font-semibold">
              Summary
            </h2>
            <div className="h-[85%] overflow-y-auto rounded-lg border-2 border-dashed border-blue-300 p-6">
              {summaryText}
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center rounded-lg bg-slate-100 p-8 md:mx-3 md:w-1/2">
          <Stepper active={active} orientation="vertical" size="xl">
            <Stepper.Step
              label="Transcription"
              description="文字起こし"
            ></Stepper.Step>
            <Stepper.Step
              label="Save or Summarize"
              description="保存か要約を選んでください"
              loading={loadingA}
            >
              <div>文字起こしのみを保存 or ChatGptに要約してもらう</div>
              <div>
                {vanillaText.length > 3000
                  ? "文章が長いためgpt-3.5-turbo-16kをおすすめします。"
                  : "文章が短いためgpt-3.5-turboをおすすめします。"}
              </div>
            </Stepper.Step>
            <Stepper.Step
              label="Save All"
              description="全て保存"
              loading={loadingB}
            >
              文字起こしと要約の両方を保存する
            </Stepper.Step>
          </Stepper>

          <Group justify="between" mt="xl">
            {active == 1 && (
              <div className="flex flex-col">
                <Button
                  onClick={() => {
                    setLoadingA(true);
                    createSummary(gptModel);
                  }}
                  className="mb-2"
                  disabled={loadingA}
                >
                  要約してもらう
                </Button>
                <div className=" mb-2">
                  <Combobox
                    store={combobox}
                    onOptionSubmit={(val) => {
                      setGptModel(val);
                      combobox.closeDropdown();
                    }}
                  >
                    <Combobox.Target>
                      <InputBase
                        component="button"
                        type="button"
                        pointer
                        rightSection={<Combobox.Chevron />}
                        rightSectionPointerEvents="none"
                        onClick={() => combobox.toggleDropdown()}
                      >
                        {gptModel || (
                          <Input.Placeholder>
                            モデルを選択してください。
                          </Input.Placeholder>
                        )}
                      </InputBase>
                    </Combobox.Target>

                    <Combobox.Dropdown>
                      <Combobox.Options>{options}</Combobox.Options>
                    </Combobox.Dropdown>
                  </Combobox>
                </div>
                <div className=" flex">
                  <TextInput
                    placeholder="タイトルを入力"
                    onChange={(e) => setTextTitle(e.target.value)}
                  />
                  <Button
                    variant="default"
                    onClick={() => {
                      setLoadingA(true);
                      saveTexts();
                      setLoadingA(false);
                    }}
                    disabled={loadingA}
                  >
                    保存する
                  </Button>
                </div>
              </div>
            )}
            {active == 2 && (
              <div className="flex flex-col">
                <Button
                  onClick={() => {
                    setLoadingB(true);
                    createSummary(gptModel);
                    nextStep();
                    setLoadingB(false);
                  }}
                  className="mb-2 opacity-0"
                  disabled={loadingB}
                >
                  要約してもらう
                </Button>
                <div className=" flex">
                  <TextInput
                    placeholder="タイトルを入力"
                    onChange={(e) => setTextTitle(e.target.value)}
                  />
                  <Button
                    variant="default"
                    onClick={() => {
                      setLoadingB(true);
                      saveTexts();
                      setLoadingB(false);
                    }}
                    disabled={loadingB}
                  >
                    保存する
                  </Button>
                </div>
              </div>
            )}
          </Group>
        </div>
      </div>
    </Modal>
  );
};

export default FsModal;
