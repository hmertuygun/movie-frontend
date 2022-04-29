const sortTemplate = (type) => {
  return type ? (
    type === 'asc' ? (
      <span className="fa fa-sort-amount-up-alt" />
    ) : (
      <span className="fa fa-sort-amount-down" />
    )
  ) : null
}

export default sortTemplate
