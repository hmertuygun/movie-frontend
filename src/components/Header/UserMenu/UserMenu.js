import { UserContext } from 'contexts/UserContext'
import { useSymbolContext } from 'contexts/SymbolContext'
import { useContext } from 'react'
import { getNumberOfDays } from 'utils/getNumberOfDays'
import Select from 'react-select'
import { SECTION_ONE, SECTION_TWO } from 'constants/DropDownMenu'
import logout from 'assets/dropdown_menu/dark/logout.svg'
import { Link } from 'react-router-dom'
import useComponentVisible from 'hooks/useComponentVisible'
import { ChevronDown } from 'react-feather'
import { ThemeContext } from 'contexts/ThemeContext'
import Control from 'components/Header/UserMenuControl/UserMenuControl'
import { customStyles } from './customStyle'

const UserMenu = () => {
  const { ref, isComponentVisible, setIsComponentVisible } =
    useComponentVisible(false)
  const { userData, subscriptionData, activeExchange, isOnboardingSkipped } =
    useContext(UserContext)
  const { exchanges, setExchange, isExchangeLoading } = useSymbolContext()
  const { theme } = useContext(ThemeContext)

  return (
    <div>
      <li
        onClick={() => setIsComponentVisible(!isComponentVisible)}
        className="nav-item dropdown dropdown-animate d-flex align-items-center"
      >
        <span
          style={{ border: '1px solid', cursor: 'pointer' }}
          class={`badge ml-1 badge-pill d-flex align-items-center ${
            theme === 'DARK' ? 'badge-dark' : 'badge-white'
          }`}
        >
          <p className="mb-0 ml-2 mr-2 text-capitalize">
            {userData?.email?.split('@')[0]}
          </p>
          <ChevronDown
            size={15}
            className={theme === 'DARK' ? 'text-white' : 'text-black'}
          />
        </span>
      </li>
      <div
        className={`dropdown-menu dropdown-menu-xs dropdown-menu-right dropdown-menu-arrow p-3 ${
          isComponentVisible ? 'show' : ''
        }`}
        ref={ref}
      >
        <p className="h6 mb-1">{userData?.email}</p>
        <p className="text-primary mb-1">
          {subscriptionData ? getNumberOfDays(subscriptionData?.due) : ''} days
          left in subscription
        </p>
        <Select
          components={{
            Control,
          }}
          options={exchanges}
          isSearchable={false}
          styles={customStyles}
          onChange={(value) => setExchange(value)}
          value={activeExchange}
          isDisabled={isExchangeLoading || isOnboardingSkipped}
        />
        <hr className="mb-3 mt-3" />
        <ul className="navbar-nav d-flex flex-column">
          {SECTION_ONE.map((menu) => (
            <li
              className="nav-item mb-2"
              onClick={() => setIsComponentVisible(!isComponentVisible)}
            >
              <Link
                to={menu.link}
                className="d-flex align-items-center text-muted"
              >
                <img
                  src={theme === 'DARK' ? menu.lightIcon : menu.icon}
                  alt={menu.label}
                  className="dropdown-menu-icon"
                />
                <p className="mb-0 ml-3">{menu.label}</p>
              </Link>
            </li>
          ))}
        </ul>
        <hr className="mb-2 mt-2" />
        <ul className="navbar-nav d-flex flex-column">
          {SECTION_TWO.map((menu) => (
            <li
              className="nav-item mb-2"
              onClick={() => setIsComponentVisible(!isComponentVisible)}
            >
              <a
                href={menu.link}
                type="button"
                className="d-flex align-items-center text-muted"
                rel="noreferrer"
              >
                <img
                  src={theme === 'DARK' ? menu.lightIcon : menu.icon}
                  alt={menu.label}
                  className="dropdown-menu-icon"
                />
                <p className="mb-0 ml-3">{menu.label}</p>
              </a>
            </li>
          ))}
        </ul>
        <hr className="mb-3 mt-2" />
        <Link className="d-flex align-items-center" to="/logout">
          <img src={logout} alt="Logout" className="dropdown-menu-icon" />
          <p className="mb-0 ml-3 text-danger">Logout</p>
        </Link>
      </div>
    </div>
  )
}

export default UserMenu
