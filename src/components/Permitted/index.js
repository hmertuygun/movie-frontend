import { FEATURES } from 'constants/Features'
import store from 'store'

const Permitted = ({ feature, children }) => {
  const { users } = store.getState()
  const { isCanaryUser } = users
  const isCanaryUserHasFeature = FEATURES.canary.includes(feature)
  const isNormalUserHasFeature = FEATURES.normal.includes(feature)
  return (
    <>
      {isCanaryUser ? (
        isCanaryUserHasFeature ? (
          children
        ) : (
          // Just for future
          <></>
        )
      ) : isNormalUserHasFeature ? (
        children
      ) : (
        // Just for future
        <></>
      )}
    </>
  )
}

export default Permitted
