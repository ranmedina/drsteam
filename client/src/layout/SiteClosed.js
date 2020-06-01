import React from 'react';
import hammer from '../assets/hammer.png';
import './SiteClosed.scss';

export default () => {
  return (
    <div className='page_container'>
      <div className='content'>
        <div className='logo'>
          <div className='my'>Dr.</div>
          <div className='steam'>Steam</div>
        </div>
        <p>Site is currently under maintenance.</p>
        <p>Come back again later!</p>
        <img src={hammer} alt='hammer' />
      </div>
    </div>
  );
};
