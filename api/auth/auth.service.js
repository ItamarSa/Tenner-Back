import Cryptr from 'cryptr'
import bcrypt from 'bcrypt'

import { userService } from '../user/user.service.js'
import { logger } from '../../services/logger.service.js'

export const authService = {
    signup,
    login,
    getLoginToken,
    validateToken
}

let hash
const cryptr = new Cryptr(process.env.SECRET1 || 'Secret-Puk-1234')



async function login(username, password) {
    logger.debug(`auth.service - login with username: ${username}`)

    const user = await userService.getByUsername(username)
    if (!user) throw new Error('Invalid username or password')
    console.log('variable:', hash, password)
    const match = await bcrypt.compare(password, hash)
    if (!match) throw new Error('Invalid username or password')

    delete user.password
    return user
}


async function signup(user) {
    const saltRounds = 10

    logger.debug(`auth.service - signup with username: ${user.username}, email: ${user.email}`)
    if (!user.username || !user.password || !user.email) throw new Error('Missing details')

    hash = await bcrypt.hash(user.password, saltRounds)
    // user.password=hash
    return userService.add(user)
}

function getLoginToken(user) {
    const userInfo = { _id: user._id, fullname: user.fullname }
    return cryptr.encrypt(JSON.stringify(userInfo))
}

function validateToken(loginToken) {
    try {
        const json = cryptr.decrypt(loginToken)
        const loggedinUser = JSON.parse(json)
        return loggedinUser
    } catch (err) {
    }
    return null
}