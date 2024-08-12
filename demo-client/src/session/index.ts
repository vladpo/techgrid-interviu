import { ref } from 'vue'
import restApi, { HttpError } from '../httpclient'
import { jwtDecode } from 'jwt-decode'
import router, { PATH_HOME } from '../router'
import { type PublicUser } from 'demo-common'
import useWebSocket from '@/websocket'

export interface Credentials {
  email: string
  password: string
}

export interface Session {
  jwt?: string
  user?: PublicUser
  isExpired: () => Promise<boolean>
  isValid: () => Promise<boolean>
}

const isExpired = async () => {
  const e = await restApi.tryRefreshToken()
  return e
    .map((jwt) => {
      session.value.jwt = jwt
      return false
    })
    .orDefaultLazy(() => {
      if (session.value.user || session.value.jwt) {
        resetSession()
      }
      return true
    })
}

const session = ref<Session>({
  isExpired,
  isValid: async () => {
    return !(await isExpired())
  }
})

const login = async (c: Credentials, onError: (err: HttpError) => void): Promise<void> =>
  await restApi.tryLogin(c, (e) => {
    e.ifRight((jwt) => {
      session.value.user = jwtDecode<PublicUser>(jwt)
      session.value.jwt = jwt
      router.push(PATH_HOME)
    }).ifLeft(onError)
  })
const logout = async (onError: (err: HttpError) => void): Promise<void> =>
  await restApi.tryLogout((e) => {
    e.ifRight(resetSession).ifLeft(onError)
  })

const resetSession = () => {
  session.value.jwt = undefined
  session.value.user = undefined
  const {webSocket} = useWebSocket();
  webSocket.value.socket?.disconnect();
  router.push(PATH_HOME)
}

const useSession = () => ({
  session,
  login,
  logout
})

export default useSession
