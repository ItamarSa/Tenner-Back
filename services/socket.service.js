import { logger } from './logger.service.js'
import { Server } from 'socket.io'

var gIo = null

export function setupSocketAPI(http) {
    gIo = new Server(http, {
        cors: {
            origin: '*',
        }
    })
    gIo.on('connection', socket => {
        console.log("hello!!!!!!!!!cls");
        logger.info(`New connected socket [id: ${socket.id}]`);
        socket.on('disconnect', socket => {
            logger.info(`Socket disconnected [id: ${socket.id}]`);
        });
        socket.on('chat-set-topic', topic => {
            if (socket.myTopic === topic) return;
            if (socket.myTopic) {
                socket.leave(socket.myTopic);
                logger.info(`Socket is leaving topic ${socket.myTopic} [id: ${socket.id}]`);
            }
            socket.join(topic);
            socket.myTopic = topic;
        });
        socket.on('new-order', ( gig ) => {
            const ownerId=gig.owner._id
            // gIo.to(socket.ownerId).emit('order-received', gig);
            emitToUser({type:"order-received",data:gig,userId:ownerId});
            // Handle the 'new-order' event and perform your custom logic

            // Check if gig.owner.id === loggedInUser.id
            // const loggedInUser = userService.getLoggedinUser();
            // if (gig.owner.id === loggedInUser.id) {
            //     // Emit the same 'new-order' event to the front end
            //     // gIo.emit(SOCKET_EVENT_NEW_ORDER, { gig });
            //     showSuccessMsg('New order')
            //     console.log('New order');
            // }
        });
        // emitToUser({
        //     type: 'user-watch-success', // Use the event type that matches your front-end code
        //     data: 'Someone watched your profile',
        //     userId: socket.userId,
        // });
        socket.on('chat-send-msg', msg => {
            logger.info(`New chat msg from socket [id: ${socket.id}], emitting to topic ${socket.myTopic}`);
            gIo.to(socket.myTopic).emit('chat-add-msg', msg);
        });
        socket.on('user-watch', userId => {
            logger.info(`user-watch from socket [id: ${socket.id}], on user ${userId}`);
            socket.join('watching:' + userId);
        });

        // Auth
        socket.on('set-user-socket', userId => {
            logger.info(`Setting socket.userId = ${userId} for socket [id: ${socket.id}]`);
            console.log('socket.id', socket.userId)
            socket.userId = userId;
            console.log('socket.id', socket.userId)
        });
        socket.on('unset-user-socket', () => {
            logger.info(`Removing socket.userId for socket [id: ${socket.id}]`);
            console.log('socket.id', socket.userId)
            delete socket.userId;
            console.log('socket.id', socket.userId)
        });
    });
}

function emitTo({ type, data, label }) {
    if (label) gIo.to('watching:' + label.toString()).emit(type, data)
    else gIo.emit(type, data)
}

async function emitToUser({ type, data, userId }) {
    console.log('socet*********************',userId)
    if (userId) {
        userId = userId.toString();
        const socket = await _getUserSocket(userId);

        if (socket) {
            logger.info(`Emitting event: ${type} to user: ${userId} socket [id: ${socket.id}]`);
            socket.emit(type, data);
        } else {
            logger.info(`No active socket for user: ${userId}`);
            // Handle this case as needed
            // _printSockets()
        }
    } else {
        logger.warn('User ID is not defined');
    }
}


// If possible, send to all sockets BUT not the current socket 
// Optionally, broadcast to a room / to all
async function broadcast({ type, data, room = null, userId }) {
    userId = userId.toString()
    logger.info(`Broadcasting event: ${type}`)
    const excludedSocket = await _getUserSocket(userId)
    if (room && excludedSocket) {
        logger.info(`Broadcast to room ${room} excluding user: ${userId}`)
        excludedSocket.broadcast.to(room).emit(type, data)
    } else if (excludedSocket) {
        logger.info(`Broadcast to all excluding user: ${userId}`)
        excludedSocket.broadcast.emit(type, data)
    } else if (room) {
        logger.info(`Emit to room: ${room}`)
        gIo.to(room).emit(type, data)
    } else {
        logger.info(`Emit to all`)
        gIo.emit(type, data)
    }
}

async function _getUserSocket(userId) {
    const sockets = await _getAllSockets()
    const socket = sockets.find(s => s.userId === userId)
    return socket
}
async function _getAllSockets() {
    // return all Socket instances
    const sockets = await gIo.fetchSockets()
    return sockets
}

async function _printSockets() {
    const sockets = await _getAllSockets()
    console.log(`Sockets: (count: ${sockets.length}):`)
    sockets.forEach(_printSocket)
}
function _printSocket(socket) {
    console.log(`Socket - socketId: ${socket.id} userId: ${socket.userId}`)
}

export const socketService = {
    // set up the sockets service and define the API
    setupSocketAPI,
    // emit to everyone / everyone in a specific room (label)
    emitTo,
    // emit to a specific user (if currently active in system)
    emitToUser,
    // Send to all sockets BUT not the current socket - if found
    // (otherwise broadcast to a room / to all)
    broadcast,
}
