import { FastifyInstance } from 'fastify'
import { Server as HttpServer, IncomingMessage, ServerResponse } from 'http'

export type Server = FastifyInstance<HttpServer, IncomingMessage, ServerResponse>
