export default function handleError (err) {
  alert(err.message + '\nCheck browser console for more info.')
  console.error(err)
  if (Sentry) Sentry.captureException(err)
}
