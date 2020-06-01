import React, { useState, useEffect, useCallback } from 'react';
import Pagination from 'react-bootstrap/Pagination';
import './Pagination.scss';

export default (props) => {
  const { data, onPageChange, startPage } = props;
  const [initial, setInitial] = useState(false);
  const pageSize = props.pageSize ?? 20;
  const totalPages = Math.ceil(data.length / pageSize);
  const [currentPage, setCurrentPage] = useState(startPage);
  const [pager, setPager] = useState({
    startPage: 1,
    endPage: totalPages <= 10 ? totalPages : 10,
    startIndex: 0,
    endIndex: pageSize - 1,
  });

  const getPager = useCallback(
    (currPage) => {
      let startPage, endPage;
      if (totalPages <= 5) {
        startPage = 1;
        endPage = totalPages;
      } else {
        if (currPage <= 3) {
          startPage = 1;
          endPage = 5;
        } else if (currPage + 2 >= totalPages) {
          startPage = totalPages - 4;
          endPage = totalPages;
        } else {
          startPage = currPage - 2;
          endPage = currPage + 2;
        }
      }

      const startIndex = (currPage - 1) * pageSize;
      const endIndex = Math.min(startIndex + pageSize - 1, data.length - 1);

      return {
        startPage: startPage,
        endPage: endPage,
        startIndex: startIndex,
        endIndex: endIndex,
      };
    },
    [data.length, totalPages]
  );

  const setPage = useCallback(
    (page) => {
      const pager = getPager(page);
      setCurrentPage(page);
      setPager(pager);
      onPageChange(data.slice(pager.startIndex, pager.endIndex + 1), pager.startIndex, pager.endIndex + 1);
    },
    [data, getPager, onPageChange]
  );

  useEffect(() => {
    if (initial) {
      return;
    }
    setPage(startPage);
    setInitial(true);
  }, [startPage, initial, setPage]);

  return (
    <>
      <div className='_pagination'>
        <Pagination variant='dark'>
          <Pagination.First onClick={() => setPage(1)} disabled={currentPage === 1} />
          <Pagination.Prev onClick={() => setPage(currentPage - 1)} disabled={currentPage === 1} />
          {[...Array(pager.endPage + 1 - pager.startPage).keys()]
            .map((i) => pager.startPage + i)
            .map((page, index) => (
              <Pagination.Item key={index} active={currentPage === page} onClick={() => setPage(page)}>
                {page}
              </Pagination.Item>
            ))}
          <Pagination.Next onClick={() => setPage(currentPage + 1)} disabled={currentPage === totalPages} />
          <Pagination.Last onClick={() => setPage(totalPages)} disabled={currentPage === totalPages} />
        </Pagination>
      </div>
    </>
  );
};
