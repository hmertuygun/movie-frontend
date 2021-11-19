import React from 'react'

const VideoCard = ({
  image,
  date,
  title,
  description,
  author,
  likeCount,
  commentCount,
}) => {
  const getInitials = (nameString) => {
    const fullName = nameString.split(' ')
    const initials = fullName.shift().charAt(0) + fullName.pop().charAt(0)
    return initials.toUpperCase()
  }

  return (
    <div className="card hover-translate-y-n3 hover-shadow-lg overflow-hidden">
      <div className="position-relative overflow-hidden">
        <a href="#" className="d-block">
          <img alt="placeholder" src={image} className="card-img-top" />
        </a>
      </div>
      <div className="card-body py-4">
        <small className="d-block text-sm mb-2">{date}</small>
        <a href="#" className="h5 stretched-link lh-150">
          {title}
        </a>
        <p className="mt-3 mb-0 lh-170">{description}</p>
      </div>
      <div className="card-footer border-0 delimiter-top">
        <div className="row align-items-center">
          <div className="col-auto">
            <span className="avatar avatar-sm bg-primary rounded-circle">
              {getInitials(author)}
            </span>
            <span className="text-sm mb-0 avatar-content">{author}</span>
          </div>
          <div className="col text-right text-right">
            <div className="actions">
              <a href="#" className="action-item">
                <i data-feather="heart" className="mr-1"></i> {likeCount} like
              </a>
              <a href="#" className="action-item">
                <i data-feather="eye" className=" mr-1"></i> {commentCount}{' '}
                comment
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VideoCard
