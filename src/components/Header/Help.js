import { HelpCircle } from 'react-feather'

const Help = ({ isForMobile }) => {
  const handleZendesk = () => {
    window.zE(function () {
      window.zE.activate()
    })
  }

  return (
    <button
      className={`btn btn-primary custom-help-button ${
        isForMobile ? 'mobile-help' : ''
      }`}
      onClick={handleZendesk}
    >
      <HelpCircle size={16} />
      &nbsp; Help
    </button>
  )
}

export default Help
