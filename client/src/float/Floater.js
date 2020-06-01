import React, { useState, useEffect, useRef } from 'react';
import FormControl from 'react-bootstrap/FormControl';
import InputGroup from 'react-bootstrap/InputGroup';
import PageWrapper from '../layout/PageWrapper';
import FloatBar from './FloatBar';
import ItemApi from '../api/item';
import ItemBox from './ItemBox';
import LoadingIcon from '../layout/LoadingIcon';
import '../layout/globalStyles.scss';
import { Helmet } from 'react-helmet';

export default () => {
  const [inspectLink, setInspectLink] = useState('');
  const [float, setFloat] = useState();
  const [itemInfo, setItemInfo] = useState({});
  const [loading, setLoading] = useState(false);
  const [lastSearch, setLastSearch] = useState();
  const [error, setError] = useState();
  const inputRef = useRef();

  useEffect(() => {
    inputRef.current.focus();
  }, []);

  const fetchItem = async () => {
    if (lastSearch === inspectLink || !inspectLink || inspectLink.length < 50) {
      return;
    }

    setFloat();
    setLoading(true);
    setError();
    try {
      const { data } = await ItemApi.getFloat(inspectLink);
      setFloat(data.iteminfo.floatvalue);
      setItemInfo(data.iteminfo);
      setLastSearch(inspectLink);
    } catch ({ response: { data } }) {
      console.error('Failed fetching float', data);
      setError(data.description);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setInspectLink(e.target.value);
  };

  return (
    <PageWrapper>
      <Helmet>
        <title>Dr.Steam | Floater</title>
        <meta
          name='description'
          content='Floater uses steam bots to examine your CS:GO skin, and results in a float value which is the precise wear value of the skin. The lower, the better.'
        ></meta>
      </Helmet>

      <p>In order to evaluate your item's float value, we need you to paste its inspect URL.</p>

      <InputGroup>
        <InputGroup.Prepend>
          <InputGroup.Text>Inspect Link</InputGroup.Text>
        </InputGroup.Prepend>
        <FormControl
          placeholder='ex. steam://rungame/730/76361502155133023/+csgo_econ_action_preview%20S76562128150246413A18356557568O5675844137085270043'
          value={inspectLink}
          onChange={handleChange}
          aria-label='Inpsect Link'
          ref={inputRef}
        />
        <InputGroup.Append>
          <button className='app-button' onClick={fetchItem}>
            Fetch
          </button>
        </InputGroup.Append>
      </InputGroup>

      {loading && <LoadingIcon />}

      {error && <p>{error}</p>}

      {float && (
        <>
          <ItemBox info={itemInfo} />
          <FloatBar float={float} />
        </>
      )}
    </PageWrapper>
  );
};
