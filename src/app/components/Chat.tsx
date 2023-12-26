'use client';
import { useRecoilState } from 'recoil';
import { userIdState } from '@/app/atoms/userId';
import { textIdState } from '../atoms/textId';
import { textTitleState } from '../atoms/textTitle';
import { TextDetail } from '../types/types';
import { useTextDetail } from '../hooks/useTextDetail';

const Chat = () => {
  const [userId] = useRecoilState(userIdState);
  const [textId] = useRecoilState(textIdState);
  const [textTitle] = useRecoilState(textTitleState);
  const { textDetail, isMutating } = useTextDetail(textId);
  return (
    <div className=" h-full p-4 flex flex-col">
      <h1 className="text-2xl text-white font-semibold mb-4">
        {userId ? textTitle : <></>}
      </h1>
      <div className="flex-grow overflow-y-auto mb-4">
        {userId && textDetail ? (
          textDetail.map((textDetail: TextDetail) => (
            <div key={textDetail.summary}>
              <div className="text-white">{textDetail.vanilla}</div>
              <div className="text-white">{textDetail.summary}</div>
            </div>
          ))
        ) : (
          <></>
        )}
      </div>

      <div className="flex-shrink-0 relative">
        <input
          type="text"
          placeholder="Send a Message"
          className="border-2 rounded w-full pr-10 focus:outline-none p-2"
          // onChange={(e) => setInputMessage(e.target.value)}
          // value={inputMessage}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              //  sendMessage();
            }
          }}
        />
        <button
          className="absolute inset-y-0 right-4 flex items-center"
          // onClick={() => sendMessage()}
        >
          {/* <FaPaperPlane /> */}
        </button>
      </div>
    </div>
  );
};

export default Chat;
