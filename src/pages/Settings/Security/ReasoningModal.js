import { DELETION_REASONS } from 'constants/deletionReasons'
import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'

const ReasoningModal = ({ onChange }) => {
  const [checkedState, setCheckedState] = useState(
    new Array(DELETION_REASONS.length).fill(false)
  )
  const [textState, setTextState] = useState(
    new Array(DELETION_REASONS.length).fill('')
  )

  const handleOnChange = (position) => {
    const updatedCheckedState = checkedState.map((item, index) =>
      index === position ? !item : item
    )

    setCheckedState(updatedCheckedState)
    onMessageChange(null, position)
  }

  const onMessageChange = (e = null, position) => {
    const updatedTextState = textState.map((item, index) =>
      index === position && e ? e.target.value : item
    )
    setTextState(updatedTextState)
  }

  useEffect(() => {
    const data = checkedState
      .map((element, index) => {
        if (element)
          return `${DELETION_REASONS[index].label}: ${textState[index]}`
        return null
      })
      .filter((element) => element)
    onChange(data)
  }, [checkedState, textState])

  return (
    <div className="modal-open">
      {DELETION_REASONS.map(({ label, name, checked }, index) => (
        <div key={label}>
          <div class="custom-control custom-checkbox">
            <input
              type="checkbox"
              id={`custom-checkbox-${index}`}
              class="custom-control-input"
              name={name}
              value={name}
              checked={checkedState[index]}
              onChange={() => handleOnChange(index)}
            />
            <label
              class="custom-control-label"
              htmlFor={`custom-checkbox-${index}`}
            >
              {label}
            </label>
            {checkedState[index] && (
              <textarea
                class="form-control"
                placeholder="We are sorry about that, can you please express your ideas."
                resize="none"
                onChange={(e) => onMessageChange(e, index)}
                maxlength="200"
              ></textarea>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

ReasoningModal.propTypes = {
  onChange: PropTypes.func,
}

export default ReasoningModal
