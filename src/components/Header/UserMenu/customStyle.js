export const customStyles = {
  control: (styles) => ({
    ...styles,
    backgroundColor: 'var(--trade-background)',
    border: '1px solid var(--trade-borders)',
    boxShadow: 'none',
    color: 'var(--grey)',
    '& div': {
      textAlign: 'center',
    },

    '&:hover': {
      cursor: 'pointer',
    },
  }),

  input: (styles) => ({
    ...styles,
    color: 'var(--grey)',
  }),

  valueContainer: (styles) => ({
    ...styles,
    height: '41px',
    padding: '0 5px',
  }),

  singleValue: (styles) => ({
    ...styles,
    textTransform: 'capitalize',
    color: 'var(--grey)',
    '@media  (max-width: 767px)': {
      ...styles['@media  (max-width: 767px)'],
      fontSize: '0.9rem',
    },
  }),

  option: (styles, { isDisabled, isFocused, isSelected }) => ({
    ...styles,
    textTransform: 'capitalize',
    padding: '5px 5px',
    backgroundColor: isDisabled
      ? 'var(--trade-background)'
      : isSelected
      ? 'var(--symbol-select-background-selected)'
      : isFocused
      ? 'var(--symbol-select-background-focus)'
      : 'var(--trade-background)',
    color: 'var(--grey)',

    '&:hover': {
      cursor: 'pointer',
    },
  }),

  placeholder: (styles) => ({
    ...styles,
    textTransform: 'capitalize',
  }),
}
