const MESSAGES = {
  online: 'You are back online!',
  offline: "You don't seem to be online anymore!",
  'dismiss-notice-error': "Couldn't dismiss notice. Please try again later!",
  'invalid-coupon': 'This coupon code is not valid.',
  'duplicate-template': `You cannot add the same template.`,
  'watchlist-failed': 'Cannot create watch lists, Please try again later.',
  'emoji-failed': 'Cannot add emoji, Please try again later!',
  'watchlist-created': 'Watch list created!',
  'delete-default-error': 'Cannot delete Default Watchlist.',
  'delete-list-success': 'Watch list deleted!',
  'price-alert-created': 'Price alert created!',
  'price-alert-failed': 'Price alert creation failed!',
  'price-alert-updated': 'Price alert updated!',
  'price-alert-update-failed': 'Price alert modification failed!',
  'price-alert-deleted': 'Price alert deleted',
  'price-alert-delete-failed': "Alert couldn't be deleted!",
  'price-alert-reactivated': 'Price alert reactivated',
  'price-alert-reactivate-failed': "Alert didn't re-activate!",
  'api-key-added': 'API key added!',
  'api-key-failed': "Couldn't add API key. Please try again later!",
  'api-key-updated': 'API key updated!',
  'api-key-updated-failed': "Couldn't update API key. Please try again later!",
  'api-key-deleted': 'API key deleted!',
  'api-key-delete-failed': "Couldn't delete API key. Please try again later!",
  'notification-settings-failed':
    'Cannot fetch notification settings. Please try again later!',
  'telegram-settings-failed':
    "Telegram notification setting couldn't be saved. Please try again later",
  'telegram-settings-success': 'Telegram notification setting saved!',
  'telegram-bot-error':
    'Please click Telegram settings to setup the bot first!',
  'telegram-disconnect-failed':
    "Couldn't disconnect Telegram. Please try again later!",
  'telegram-disconnected': 'Successfully disconnected!',
  'email-settings-failed': `Email notification setting couldn't be saved. Please try again later!`,
  'email-settings-saved': 'Email notification setting saved!',
  'try-again-later': 'It seems something wrong. Please try again later!',
  'end-trial-failed': 'Cannot end trial. Please contact support!',
  'payment-error':
    'We could not get the payment. Please report at: support.coinpanel.com',
  'something-wrong':
    'Something went wrong! Please report at: support.coinpanel.com',
  'payment-change-failed':
    'We could not change your default payment method. Please report at: support.coinpanel.com',
  'plan-change-failed':
    'We could not change your plan. Please report at: support.coinpanel.com',
  'cancel-subscription-failed':
    'We could not cancel your subscription. Please report at: support.coinpanel.com',
  'change-subscription-failed':
    'We could not change your subscription. Please report at: support.coinpanel.com',
  'order-create-failed': "Order couldn't be created. Please try again later!",
  'order-create-error':
    'Order couldn’t be created. Unknown error. Please report at: support.coinpanel.com',
  'order-created': 'Order Created!',
  'order-cancel-failed': "Order couldn't be cancelled. Please try again later!",
  'order-cancelled': 'Order Cancelled!',
  'order-edited': 'Order Edited!',
  'order-edit-failed': `Order couldn't be edited. Please try again later!`,
  'order-history-fetch-failed': 'Error fetching order history!',
  'order-will-execute': 'You order will be executed immediately',
  'invalid-drawing-file': 'Please upload a valid drawings file',
  'not-json-drawing': 'Please upload a valid drawings file with .json format',
  'dnd-valid-drawing': 'Please drag and drop a valid drawings file',
  'dnd-not-json-drawing':
    'Please drag and drop a valid drawings file with .json format',
  'drawing-upload-failed': 'Failed to upload chart drawings. Please try again.',
  'drawing-load-failed':
    'Unable to load your chart drawings. Please take a screenshot of your chrome console and send to support.',
  'emoji-saved': 'Emojis saved successfully!',
  'emoji-save-failed': 'Emojis not saved. Please try again later!',
  'activating-key-failed': 'Error activating this exchange key!',
  'portfolio-create-failed':
    "Portfolio couldn't be created. Please try again later!",
  'last-price-fetch-failed': 'Error getting last price of market!',
  'invalid-2fa': 'You need to provide a valid Two Factor Authentication token',
  '2fa-not-matching': `Provided 2FA Token doesn't match.`,
  'invalid-password':
    'Password must contain at least 6 characters, including 1 uppercase letter, 1 lowercase letter and 1 number',
  'empty-password': 'You need to provide a password..',
  'email-too-many-attempt':
    'Email unverified with too many resend tries, please wait 1 minute before trying again',
  'no-payment-method-added': `Please add a payment method to keep your account active. If you don’t have a payment method added, your
    subscription will be cancelled automatically.`,
}

export default MESSAGES
