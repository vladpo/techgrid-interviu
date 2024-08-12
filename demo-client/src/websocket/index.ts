import { ref, type Ref, type UnwrapRef } from 'vue'
import { io, Socket } from 'socket.io-client'
import useSession from '@/session'
import { type ClientToServerEvents, type ServerToClientEvents } from 'demo-common'
import type { EventNames, EventsMap, DefaultEventsMap } from '@socket.io/component-emitter'

interface WsState<ServerEvents extends EventsMap> {
  socket: Socket<ServerEvents, ClientToServerEvents>
}

type EmitType = <E extends keyof ClientToServerEvents>(
  event: E,
  ...data: Parameters<ClientToServerEvents[E]>
) => void

type OnType<ServerEvents extends EventsMap> = <T extends EventNames<ServerEvents>>(
  eventName: T,
  callback: ServerEvents[T]
) => void

type UseWebSocketReturnType<ServerEvents extends EventsMap> = {
  webSocket: Ref<
    UnwrapRef<WsState<ServerEvents>>,
    UnwrapRef<WsState<ServerEvents>> | WsState<ServerEvents>
  >
  emit: EmitType
  on: OnType<ServerEvents>
}

const wsState = ref<WsState<ServerToClientEvents>>({
  socket: io('http://localhost:8080', {
    auth: (callBack: (o: object) => void) => {
      const { session } = useSession()
      callBack({ token: session.value.jwt })
    },
    withCredentials: true,
    autoConnect: false
  }).off()
})

const useWebSocket =
  <ServerEvents extends EventsMap = DefaultEventsMap>() =>
    (): UseWebSocketReturnType<ServerEvents> => {
      const socket: UnwrapRef<WsState<ServerEvents>['socket']> = wsState.value.socket;

      socket.on('connect', () => {
        console.log('socket connected')
      })

      socket.on('disconnect', () => {
        console.log('socket disconnect')
      })

      if (!socket.connected) {
        socket.connect()
      }

      return {
        webSocket: wsState,
        emit: <E extends keyof ClientToServerEvents>(
          eventName: E,
          ...data: Parameters<ClientToServerEvents[E]>
        ): void => {
          socket.emit(eventName, ...data)
        },
        on: <E extends EventNames<ServerEvents>>(eventName: E, callback: ServerEvents[E]): void => {
          socket.on(eventName, callback)
        }
      }
    }

export default useWebSocket<ServerToClientEvents>()