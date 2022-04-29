https://firebase.google.com/docs/auth/custom-email-handler#create_the_email_action_handler_page


# Auth
Firebase authentication

1. login or register
2. register - provide email ( actually registers user with generated password)
3. send user verifyEmail action, while saving registered user in localstorage
4. When user acesses the sitefrom the activation link, gets redirected to view with verification handler 
5. when verified make user set password.
6. Sign in

7. @TODO add recover password path
8. Handle user not verified email UI and signed in verify email actions

