import React from 'react';
import './ItemBox.scss';

export default (props) => {
  const { floatvalue, full_item_name, imageurl, paintindex, paintseed } = props.info;

  return (
    <div className='item_box'>
      <div className='title'>
        <p>{full_item_name}</p>
      </div>
      <div className='image'>
        <img src={imageurl} alt='Skin' />
      </div>
      <div className='info'>
        <p>Paint index: {paintindex}</p>
        <p>Paint seed: {paintseed}</p>
        <p className='floatvalue'>
          <b>Float value:</b> {floatvalue}
        </p>
      </div>
    </div>
  );
};