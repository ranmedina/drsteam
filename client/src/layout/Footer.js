import React from 'react';
import './Footer.scss';

export default () => {
  return (
    <div className='footer'>
      <div className='footer-content'>
        <span>This site is not affiliated with Valve Corporation or Steam.</span>
        <span className='pull-right' href='https://steamcommunity.com/id/itsdale' target='_blank' rel='noopener noreferrer'>
          developed by{' '}
          <a href='https://steamcommunity.com/id/itsdale' target='_blank' rel='noopener noreferrer'>
            daley
          </a>
          ✌️
        </span>
        <div className='socials'></div>
      </div>
    </div>
  );
};
