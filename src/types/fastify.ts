import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { Server as HttpServer, IncomingMessage, ServerResponse } from 'http'

export type Server = FastifyInstance<HttpServer, IncomingMessage, ServerResponse>
export type Request = FastifyRequest<IncomingMessage>
export type Reply = FastifyReply<ServerResponse>
export type DoneFunction = (err?: Error) => void
