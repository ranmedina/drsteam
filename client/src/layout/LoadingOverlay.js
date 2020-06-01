import React from 'react';
import { CSSTransition } from 'react-transition-group';
import './LoadingOverlay.scss';

export default (props) => {
  return (
    <CSSTransition in={props.loading} timeout={300} classNames='loading-fade' unmountOnExit>
      <div className='loading__overlay'>
        <div className='lds-ellipsis'>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
      </div>
    </CSSTransition>
  );
};
