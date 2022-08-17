import { ThemeContext } from 'contexts/ThemeContext'
import { useContext } from 'react'
import dayjs from 'dayjs'
import { Globe, Youtube, Instagram, Twitter } from 'react-feather'

const relativeTime = require('dayjs/plugin/relativeTime')
dayjs.extend(relativeTime)

const AnalystDetailCard = ({ selectedAnalyst }) => {
  const { theme } = useContext(ThemeContext)

  let textPrimary = theme === 'DARK' ? 'text-white' : 'text-primary'

  //For flutter app
  const handleSocialIcon = (value) => {
    window.addEventListener('flutterInAppWebViewPlatformReady', (event) => {
      window.flutter_inappwebview
        .callHandler('social', value)
        .then(function (result) {
          // get result from Flutter side. It will be the number 64.
          console.log(result)
        })
    })
  }

  return (
    <div className="more-details">
      <div className="d-flex analyst-data">
        <div className="mr-1">
          {selectedAnalyst?.metaData?.profilePicture ? (
            <img
              alt="Analyst"
              src={selectedAnalyst?.metaData.profilePicture}
              className="avatar rounded-circle avatar-lg"
            />
          ) : (
            <span className="avatar bg-primary text-white rounded-circle avatar-lg">
              {selectedAnalyst?.name.substring(0, 1)}
            </span>
          )}
        </div>
        <div className="ml-1">
          <div className="d-flex align-items-center justify-content-between">
            <h3 className="text-sm mb-1 analyst-name">
              <strong>{selectedAnalyst?.name}</strong>
            </h3>
            <p className="sub-text mb-0">
              {selectedAnalyst?.lastUpdated
                ? `Updated ${dayjs(selectedAnalyst?.lastUpdated).fromNow()}`
                : ''}
            </p>
          </div>
          <p className="text-xs">{selectedAnalyst?.metaData?.description}</p>
        </div>
      </div>
      <div className="d-flex align-items-center justify-content-end">
        {selectedAnalyst?.metaData?.social?.website && (
          <a
            href={selectedAnalyst.metaData.social.website}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() =>
              handleSocialIcon(selectedAnalyst.metaData.social.website)
            }
          >
            <Globe size={18} className={`mr-2 icon-cursor ${textPrimary}`} />
          </a>
        )}
        {selectedAnalyst?.metaData?.social?.youtube && (
          <a
            href={selectedAnalyst.metaData.social.youtube}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() =>
              handleSocialIcon(selectedAnalyst.metaData.social.youtube)
            }
          >
            <Youtube size={18} className={`mr-2 icon-cursor ${textPrimary}`} />
          </a>
        )}
        {selectedAnalyst?.metaData?.social?.instagram && (
          <a
            href={selectedAnalyst.metaData.social.instagram}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() =>
              handleSocialIcon(selectedAnalyst.metaData.social.instagram)
            }
          >
            <Instagram
              size={18}
              className={`mr-2 icon-cursor ${textPrimary}`}
            />
          </a>
        )}
        {selectedAnalyst?.metaData?.social?.twitter && (
          <a
            href={selectedAnalyst.metaData.social.twitter}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() =>
              handleSocialIcon(selectedAnalyst.metaData.social.twitter)
            }
          >
            <Twitter size={18} className={`mr-2 icon-cursor ${textPrimary}`} />
          </a>
        )}
      </div>
    </div>
  )
}
export default AnalystDetailCard
