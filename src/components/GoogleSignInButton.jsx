import { GoogleLogin } from '@react-oauth/google'

/**
 * Icon-only Google button (`type="icon"`) — no “Sign in with Google” text.
 * Width is in pixels (GSI does not accept percentages).
 */
export function GoogleSignInButton({ onCredential, onGoogleUiError }) {
  return (
    <div
      className="flex w-full justify-center"
      title="Continue with Google"
    >
      <GoogleLogin
        onSuccess={(cred) => {
          if (cred.credential) onCredential(cred.credential)
        }}
        onError={onGoogleUiError ?? (() => {})}
        type="icon"
        theme="filled_black"
        size="large"
        shape="circle"
        width={64}
      />
    </div>
  )
}
