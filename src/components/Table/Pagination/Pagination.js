import React, { useState, useEffect } from 'react'
import './Pagination.css'
import Button from '../../Button/Button'
import { NavLink } from 'react-router-dom'

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

  /*   return (
    <nav className={styles['navigation']}>
      <ul className="pagination">
        <li className="page-item">
          <NavLink
            className="page-link"
            to="#"
            onClick={() => pagNextPrev('prev')}
            plain
            disabled={currentPage === 1 ? true : false}
          >
            Previous
          </NavLink>
        </li>

        {pageNumbers.map((number) => {
          return (
            <li className="page-item" key={number}>
              <NavLink
                to="#"
                className="page-link"
                onClick={() => {
                  paginate(number)
                  setCurrentPage(number)
                }}
              >
                {number}
              </NavLink>
            </li>
          )
        })}
        <li className="page-item">
          <NavLink
            className="page-link"
            to="#"
            onClick={() => pagNextPrev('next')}
            plain
            disabled={currentPage === 1 ? true : false}
          >
            Next
          </NavLink>
        </li>
      </ul>
    </nav>
  ) */

  return (
    <nav className={'navigation'}>
      <ul className="pagination">
        {currentPage === 1 ? (
          <li className="page-item disabled">
            <span className={`page-link disabled-page-link`}>Previous</span>
          </li>
        ) : (
          <li className="page-item">
            <Button onClick={() => pagNextPrev('prev')} pageLink>
              Previous
            </Button>
          </li>
        )}
        {pageNumbers.map((number) => {
          return currentPage === number ? (
            <li className="page-item active" key={number}>
              <span
                className="page-link"
                onClick={() => {
                  paginate(number)
                  setCurrentPage(number)
                }}
              >
                {number}
              </span>
            </li>
          ) : (
            <li className="page-item" key={number}>
              <NavLink
                to="#"
                className="page-link"
                onClick={() => {
                  paginate(number)
                  setCurrentPage(number)
                }}
              >
                {number}
              </NavLink>
            </li>
          )
        })}
        {currentPage > pageNumbers.length - 1 ? (
          <li className="page-item disabled">
            <span className={`page-link disabled-page-link`}>Next</span>
          </li>
        ) : (
          <li className="page-item">
            <Button onClick={() => pagNextPrev('next')} pageLink>
              Next
            </Button>
          </li>
        )}
      </ul>
    </nav>
  )
}

export default Pagination
