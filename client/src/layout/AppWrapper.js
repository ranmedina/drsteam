import React, { useEffect, useState } from 'react';
import ResizeObserver from 'resize-observer-polyfill';
import './AppWrapper.scss';

export default (props) => {
  const [paddingBtm, setPaddingBtm] = useState(48);
  const [initialResize, setInitialResize] = useState(false);

  const handleResize = () =>
    setPaddingBtm(document.getElementsByClassName('footer')[0] ? document.getElementsByClassName('footer')[0].clientHeight * 2 : 0);

  const resizeObserver = new ResizeObserver(() =>
    setPaddingBtm(document.getElementsByClassName('footer')[0] ? document.getElementsByClassName('footer')[0].clientHeight * 2 : 0)
  );

  useEffect(() => {
    if (!initialResize) {
      handleResize();
      setInitialResize(true);
      window.addEventListener('resize', handleResize);
      resizeObserver.observe(document.getElementsByClassName('background')[0]);
    }

    return () => window.removeEventListener('resize', handleResize);
  }, [initialResize, setInitialResize, resizeObserver]);

  return (
    <div className='background' style={{ paddingBottom: `${paddingBtm}px` }}>
      {props.children}
    </div>
  );
};
