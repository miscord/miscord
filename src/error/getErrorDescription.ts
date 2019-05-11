const errorDescriptions = {
  'Invalid username or email address': `
Couldn't login to Facebook.
Check your username/email address, it may be incorrect.
`,
  'Invalid username or password': `
Couldn't login to Facebook.
Check your password or preferrably, use an app password:
http://facebook.com/settings?tab=security&section=per_app_passwords&view
`,
  'Incorrect login details were provided.': `
Couldn't login to Discord.
Check your token.
(it shouldn't be client ID nor anything else that doesn't have "token" in its name)
`
}

export default function getErrorDescription (err: Error) {
  const entry = Object.entries(errorDescriptions)
    .find(([ message ]) => err.toString().includes(message))
  return entry ? entry[1] : null
}
