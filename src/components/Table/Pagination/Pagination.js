import React, { useState, useEffect } from 'react'
import styles from './Pagination.module.css'
import Button from '../../Button/Button'

const Pagination = ({ postsPerPage, totalPosts, paginate }) => {
  const [currentPage, setCurrentPage] = useState(1)

  const pageNumbers = []

  for (let i = 1; i <= Math.ceil(totalPosts / postsPerPage); i++) {
    pageNumbers.push(i)
  }

  useEffect(() => {
    return () => {}
  }, [currentPage])

  const pagNextPrev = (value) => {
    if (value === 'prev') {
      setCurrentPage(currentPage - 1)
      paginate(currentPage - 1)
    } else if (value === 'next') {
      setCurrentPage(currentPage + 1)
      paginate(currentPage + 1)
    }
  }

  return (
    <nav className={styles['navigation']}>
      <Button
        /*         onClick={() => previousPage(1)} */
        onClick={() => pagNextPrev('prev')}
        plain
        disabled={currentPage === 1 ? true : false}
      >
        Previous
      </Button>
      {pageNumbers.map((number) => {
        return (
          <button
            key={number}
            className="page-link"
            onClick={() => {
              paginate(number)
              setCurrentPage(number)
            }}
          >
            {number}
          </button>
        )
      })}
      <Button
        /* onClick={() => nextPage(1)} */
        onClick={() => pagNextPrev('next')}
        plain
        disabled={currentPage > pageNumbers.length - 1 ? true : false}
      >
        Next
      </Button>
    </nav>
  )
}

export default Pagination
