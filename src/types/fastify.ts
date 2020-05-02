import { DefaultHeaders, DefaultParams, DefaultQuery, FastifyReply, FastifyRequest } from 'fastify'
import { IncomingMessage, ServerResponse } from 'http'
import Connection from '../Connection'

export type Request<Params = DefaultParams, Body = any> = FastifyRequest<IncomingMessage, DefaultQuery, Params, DefaultHeaders, Body>
export type ConnectionRequest<Body = Connection> = Request<{ name: string }, Body>
export type Reply = FastifyReply<ServerResponse>
export type DoneFunction = (err?: Error) => void
