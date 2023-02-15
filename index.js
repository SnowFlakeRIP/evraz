const fastify = require('fastify')({
    logger: true
})
const Pool = require('pg-pool')
const config = {
    user: 'postgres',
    password: '123456789',
    host: 'localhost',
    port: 5432,
    database: 'test'
}
fastify.register(require('@fastify/cors'), (instance) => {
    return (req, callback) => {
        const corsOptions = {
            // This is NOT recommended for production as it enables reflection exploits
            origin: true
        };

        // do not include CORS headers for requests from localhost
        if (/^localhost$/m.test(req.headers.origin)) {
            corsOptions.origin = false
        }

        // callback expects two parameters: error and options
        callback(null, corsOptions)
    }
})
const pool = new Pool(config)

fastify.get('/comments/show/:filmId', async (req, res) => {
    let data = {
        message: 'error',
        statusCode: 400
    }
    const filmId = req.params.filmId
    if (!filmId) {
        data = {
            message: 'filmId is empty',
            statusCode: 400
        }
        return data
    }
    const client = await pool.connect()
    try {
        const comments = await client.query(`select "commentId"::integer,"filmId"::integer,"filmRating"::integer,"commentText", "createDate",fio
                                             from comments c
                                                      inner join users u on u."userId" = c."userId"
                                             where "filmId" = $1`, [filmId])
        data = {
            message: comments.rows,
            statusCode: 200
        }
    } catch (e) {
        console.log(e)
    } finally {
        client.release()
    }
    res.send(data)
})

fastify.post('/comments/add', async (req, res) => {
    let data = {
        message: 'error',
        statusCode: 400
    }
    const client = await pool.connect()
    try {
        if (!req.body.filmId) {
            data = {
                message: 'body filmId is empty',
                statusCode: 400
            }
            return data
        }
        const filmId = req.body.filmId
        if (!req.body.commentText) {
            data = {
                message: 'body commentText is empty',
                statusCode: 400
            }
            return data
        }
        const commentText = req.body.commentText
        if (!req.body.filmRating) {
            data = {
                message: 'body filmRating is empty',
                statusCode: 400
            }
            return data
        }
        if(!req.body.userId){
            data = {
                message:'нет указан id пользователя',
                statusCode: 400
            }
            return data
        }
        const filmRating = req.body.filmRating
        const createComment = await client.query(`insert into comments ("filmId", "commentText", "filmRating", "userId")
                                                  values ($1, $2, $3, $4) returning "commentId"::integer,"filmId"::integer,"commentText","filmRating"::integer,"createDate"::date`, [filmId, commentText, filmRating, req.body.userId])
        if (createComment.rowCount > 0 && createComment.rows.length > 0) {
            const user = await client.query(`select * from users where "userId" = $1`,[req.body.userId])
            console.log(`Успешно создали комментарий`)
            data = {
                message: {...createComment.rows[0],...user.rows[0]},
                statusCode: 200
            }
        } else {
            console.log('Ошибка при выполнении запроса на создание комментария')
            data = {
                message: 'произошла ошибка при выполнении запроса на создание комментария',
                statusCode: 400
            }
        }
    } catch (e) {
        console.log(e)
    } finally {
        client.release()
    }
    res.send(data)
})

fastify.post('/user/add',async (req,rep)=>{
    const client = await pool.connect()
    try{
        const createUser = await client.query(`insert into users ("fio","tableId") values ($1,$2) returning *`,[req.body.fio,req.body.tableId])
        console.log(createUser.rows[0])
        if(createUser.rowCount > 0){
            return {
                message:createUser.rows[0],
                statusCode:200
            }
        }
        else{
            return {
                message:'Ошибка при создании пользователя',
                statusCode:400
            }
        }
    }
    catch (e) {
        console.log(e)
    }
    finally {
        client.release()
    }
})

fastify.post('/login/admin', async (request, reply) => {
    let data = {
        message:'error',
        statusCode:400
    }
    try {
        const object = request.body
        if(object.login === 'admin' && object.password === 'admin'){
            data.message = {
                success:true
            }
            data.statusCode = 200
        }
        else{
            data.message = {
                success:false
            }
            data.statusCode = 400
        }
    }
    catch (e) {
        console.log(e);
    }
    
});

fastify.post('/film/create',async(request,reply) => {
    let data = {
        message:'error',
        statusCode:400
    }
    const client = await pool.connect()
    try{
    
    
    }
    catch (e) {
        console.log(e);
    }
    finally {
        client.release()
    }
})

fastify.listen(({port:5000,host:'0.0.0.0'}), (err, address) => {
    if (err) {
        console.log(err)
        process.exit()
    }
})
