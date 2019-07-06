import { IncomingMessage, ServerResponse } from 'http'
import { DefaultHeaders, DefaultQuery, DefaultParams } from 'fastify'
import Connection from '../../Connection'

declare module 'fastify' {
  interface FastifyRequest<
    HttpRequest = IncomingMessage,
    Query = DefaultQuery,
    Params = DefaultParams,
    Headers = DefaultHeaders,
    Body = any
    > {
    getConnection: () => Connection
  }

  interface FastifyReply<
    HttpResponse = ServerResponse
  > {
    sendError (code: number, message: string): FastifyReply<HttpResponse>
  }
}
