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


const cryptr = new Cryptr(process.env.SECRET1 || 'Secret-Puk-1234')



async function login(username, password) {
    logger.debug(`auth.service - login with username: ${username}`)

    const user = await userService.getByUsername(username)
    console.log('userlogin:', user,password)
    if (!user) throw new Error('Invalid username or password')
    const match = await bcrypt.compare(password, user.password)
    if (!match) throw new Error('Invalid username or password')

    delete user.password
    return user
}

// {username, password,email,imgUrl,createdAt,store,response,from,delivery,languages,level,queue,reviews,aboutMe}
async function signup({username, password,email,imgUrl,createdAt,store,response,from,delivery,languages,level,queue,reviews,aboutMe}) {
    const saltRounds = 10

    logger.debug(`auth.service - signup with username: ${username}, email: ${email}`)
    if (!username || !password || !email) throw new Error('Missing details')

    const hash = await bcrypt.hash(password, saltRounds)
    console.log('hash', hash)

    // user.password=hash
    return userService.add({ username, password: hash, email,imgUrl,createdAt,store,response,from,delivery,languages,level,queue,reviews,aboutMe })
}

function getLoginToken(user) {
    const userInfo = { _id: user._id, email: user.email }
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