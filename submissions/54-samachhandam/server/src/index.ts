import http from 'http'
import app from './app'
import { connectDB } from './config/db'
import config from './config/config';
import { initializeSocket } from './config/socket';
import { connectRedis } from './config/redis';

const server = http.createServer(app)
;(async () => {
    await connectDB()
    initializeSocket(server)
    await connectRedis()
})()
server.listen(config.PORT, () => {
    console.log(`Server is running on port ${config.PORT}`)
})

// Handle server errors
server.on('error', (error: NodeJS.ErrnoException) => {
    if (error.syscall !== 'listen') throw error

    switch (error.code) {
        case 'EACCES':
            console.error(`❌ Port ${config.PORT} requires elevated privileges`)
            process.exit(1)
        case 'EADDRINUSE':
            console.error(`❌ Port ${config.PORT} is already in use`)
            process.exit(1)
        default:
            throw error
    }
})

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('🛑 SIGTERM received. Shutting down...')
    server.close(() => {
        console.log('💤 Server closed')
        process.exit(0)
    })
})