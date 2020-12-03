import React from 'react'

const AccordionContent = (props) => {
  let jsxField = (
    <div className="card-body pt-3">
      <span className="h6 ml-1">Notes</span>
      <textarea className="form-control" placeholder="You can take notes about your position in this area." rows="3"></textarea>
    </div>
  );
    
  return (
    <div>
      {props.open ? jsxField : ''}
    </div>
  )
}

export default AccordionContent;