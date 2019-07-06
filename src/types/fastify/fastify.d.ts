import { IncomingMessage, ServerResponse } from 'http'
import { DefaultHeaders, DefaultQuery, DefaultParams } from 'fastify'
import Connection from '../../Connection'

declare module 'fastify' {
  interface FastifyReply<
    HttpResponse = ServerResponse
  > {
    sendError (code: number, message: string): FastifyReply<HttpResponse>
  }
}
