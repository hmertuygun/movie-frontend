import Subscriptions from 'assets/dropdown_menu/dark/subscriptions.svg'
import Academy from 'assets/dropdown_menu/dark/academy.svg'
import Blog from 'assets/dropdown_menu/dark/blog.svg'
import Exchanges from 'assets/dropdown_menu/dark/exchanges.svg'
import Guides from 'assets/dropdown_menu/dark/guides.svg'
import Notifications from 'assets/dropdown_menu/dark/notifications.svg'
import Security from 'assets/dropdown_menu/dark/security.svg'
import SubscriptionsLight from 'assets/dropdown_menu/light/subscription_white.svg'
import AcademyLight from 'assets/dropdown_menu/light/academy_white.svg'
import BlogLight from 'assets/dropdown_menu/light/blog_white.svg'
import ExchangesLight from 'assets/dropdown_menu/light/exchanges_white.svg'
import GuidesLight from 'assets/dropdown_menu/light/guides_white.svg'
import NotificationsLight from 'assets/dropdown_menu/light/notifications_white.svg'
import SecurityLight from 'assets/dropdown_menu/light/security_white.svg'

export const SECTION_ONE = [
  {
    id: 0,
    label: 'Subscriptions & Billing',
    icon: Subscriptions,
    lightIcon: SubscriptionsLight,
    link: '/settings#subscription',
  },
  {
    id: 1,
    label: 'Exchanges',
    icon: Exchanges,
    lightIcon: ExchangesLight,
    link: '/settings#exchanges',
  },
  {
    id: 2,
    label: 'Security (2FA)',
    icon: Security,
    lightIcon: SecurityLight,
    link: '/settings#security',
  },
  {
    id: 3,
    label: 'Notifications',
    icon: Notifications,
    lightIcon: NotificationsLight,
    link: '/settings#notifications',
  },
]

export const SECTION_TWO = [
  {
    id: 4,
    label: 'Blog',
    icon: Blog,
    lightIcon: BlogLight,
    link: 'https://blog.coinpanel.com/',
  },
  {
    id: 5,
    label: 'Academy',
    icon: Academy,
    lightIcon: AcademyLight,
    link: 'https://academy.coinpanel.com',
  },
  {
    id: 6,
    label: 'Guides',
    icon: Guides,
    lightIcon: GuidesLight,
    link: 'https://support.coinpanel.com/hc/en-us/categories/360002959559-Beginner-s-Guide',
  },
]
