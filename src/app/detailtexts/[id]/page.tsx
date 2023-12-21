import React from 'react';
import { getTextDetail } from '@/app/lib/firestore';

const DetailTexts = async ({ params }: { params: { id: string } }) => {
  const detailTexts = await getTextDetail(params.id);

  return (
    <div>
      {detailTexts.map(text => (
        <div key={text.summary}>
          <div>{text.vanilla}</div>
          <div>{text.summary}</div>
        </div>
      ))}
    </div>
  );
};

export default DetailTexts;
