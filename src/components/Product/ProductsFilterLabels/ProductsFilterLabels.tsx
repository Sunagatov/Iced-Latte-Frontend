'use client';

import Label from './Label';


export default function ProductsFilterLabels({ labelsList, handleClickByDefault, handleLabel }: any) {

  return (
    <div className="flex gap-3 pt-1.5">
      <button
        className="text-white bg-black text-lg px-6 rounded-full w-[136px] h-[48px]"
        onClick={handleClickByDefault}
      >
        By default
      </button>

      <div className="flex justify-center gap-3">
        {labelsList.map((item: { label: string; id: string; }) => (
          <Label name={item.label} key={item.id} id={item.id} handleClickLabel={() => handleLabel(item.label, item.id)} />
        ))}
      </div>
    </div>
  );
}
