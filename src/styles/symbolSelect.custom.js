export const customStyle = (
  isLoading,
  isOnboardingSkipped,
  isTablet,
  isMobile
) => {
  return {
    control: (styles) => ({
      ...styles,
      boxShadow: 'none',
      border: '4px solid var(--trade-borders)',
      backgroundColor: 'var(--trade-background)',
      opacity: isLoading ? 0.4 : 1,
      borderLeft: (!isMobile ? 0 : '') || (isOnboardingSkipped ? '' : 0),
      borderRadius: 0,
      height: isOnboardingSkipped && isTablet ? '52px' : '56px',
      minHeight: isOnboardingSkipped && isTablet ? '52px' : '56px',
      color: 'var(--grey)',

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

    indicatorsContainer: (styles) => ({
      ...styles,
      height: '41px',
    }),
  }
}
