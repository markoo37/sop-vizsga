var express = require('express')
var bodyParser = require('body-parser')
var mysql = require('mysql')

var app = express()

//start mysql connection
var connection = mysql.createConnection({
    host : 'localhost', //mysql database host name
    user : 'root', //mysql database user name
    password : '', //mysql database password
    database : 'u4ufuk' //mysql database name
  });

connection.connect(function(err){
    if(err) throw err
    console.log("A csatlakozás sikerült")
})

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

var server = app.listen(3000, "127.0.0.1", function() {
    var host = server.address().address
    var port = server.address().port
    console.log("A következő portot figyeljük: http://%s:%s", host, port)
})



//FELHASZNÁLÓK KEZELÉSE

app.get("/users", function(req, res) {
    console.log(req)
    connection.query('SELECT * FROM users',  function (error, results, fields){
        if(error) throw error
        res.send(JSON.stringify({'users' : results}))
        //res.json(results)
    })
})



app.post("/users", function(req, res){
    var data = req.body
    var username = req.body.username
    var password = req.body.password
    var balance = 0
    var user_type_id = 1
    var how_many_wins = 0


    if(!data["username"] || !data["password"]){
        res.send({
            "error": 1,
            "message": "Bad Args!"
        })
    }
    else{
        connection.query("SELECT COUNT(*) AS userCount FROM users WHERE username = ?", username, function(err, result, field){
            if(parseInt(result[0].userCount) == 0){
                connection.query('INSERT INTO users (username, password, balance, user_type_id, how_many_wins) VALUES (?, MD5(?), ?, ?, ?)', [username, password, balance, user_type_id, how_many_wins], function(error, results, fields){
                    if(error) throw error
                    res.send({
                        "error": 0,
                        "message": `${username} has been registered!`
                    })
                    console.log(`${username} has been registered!`)
                    //res.json(results)
                    //res.send(JSON.stringify(results))
                })
            } else{  res.send({
                "error": 1,
                "message": "Username already exists!"
            }) }
        })
    }
     ////
    
    
})

app.put("/users", function(req, res){
    var data = req.body
    var id = req.body.id
    var username = req.body.username
    var balance = req.body.balance 
    

    if(data["id"] && data["username"] && data["balance"]){
        if(!isNaN(data["balance"]) && parseInt(data["balance"]) > 0){
            connection.query("UPDATE users SET balance = balance + ? WHERE username = ? AND id = ?", [parseInt(balance), username, id], function(err, result, field){
                if(err) throw err
                res.send({
                    "error": 0,
                    "message": "Balance updated succesfully!"
                })
            })
        }
        else{
            res.send({
                "error": 1,
                "message": "Please enter an integer or a number bigger than 0!"
            })
        }
    }
    else{ res.send({
        "error": 1,
        "message": "Bad args!"
    }) }
})

app.delete("/users", function(req, res){
    var data = req.body
    var id = req.body.id
    var username = req.body.username
    

    if(data["id"] && data["username"]){
        connection.query("SELECT COUNT(*) as userCount FROM users WHERE username  = ?", username, function(err, result, field){
            if(parseInt(result[0].userCount) > 0){
                connection.query("DELETE FROM users WHERE id = ? AND username = ? AND user_type_id <> 2", [id, username], function(err, result, field){
                    if(err) throw err
                    res.send({
                        "error": 0,
                        "message": "User deleted!"
                    })
                })
            }
            else{
                res.send({
                    "error": 1,
                    "message": "User does not exist!"
                })
            }
        })
    }
    else{ res.send({
        "error": 1,
        "message": "Bad args!"
    }) }
})

//Login

app.get("/login", function(req, res){
    var data = req.body
    var username = data.username
    var password = data.password

    if(data["username"] && data["password"]){
        connection.query("SELECT COUNT(*) as userCount FROM users WHERE username = ? AND password = MD5(?)", [username, password], function(err, result, field){
            if(parseInt(result[0].userCount) > 0){
                res.send({
                    "error": 0,
                    "message": "Succesfully logged in!"
                })
            }
            else{
                res.send({
                    "error": 1,
                    "message": "User not found!"
                })
            }
        })
    }
    else{ res.send({
        "error": 1,
        "message": "Bad args!"
    }) }
})

// GAME

app.get("/game", function(req, res){
    console.log(req)
    connection.query('SELECT * FROM game',  function (error, results, fields){
        if(error) throw error
        res.send(JSON.stringify({'games' : results}))
        //res.json(results)
    })
})


app.post("/game", function(req, res){
    var data = req.body
    var userID = data.user_id
    var gameID = data.game_id
    var win = data.win
    var date = data.date

    if(data["user_id"] && data["game_id"] && data["win"] && data["date"]){
        //insert log
        connection.query("INSERT INTO game_switch (user_id, game_id, win, date) VALUES (?, ?, ?, ?)", [userID, gameID, win, date], function(err, result, field){
            if(err) throw err
            res.send({
                "error": 0,
                "message": "Game log updated!"
            })
        })
        
    }
    else{
        res.send({
            "error": 1,
            "message": "Bad Args!"
        })
    }
})

app.put("/game", function(req, res){
    var data = req.body
    var id = data.id
    var money = data.money
    var win = data.win
    
    if(data["id"] && data["money"] && data["win"]){
        //update user's money
        if(data.win == "yes"){
            connection.query("UPDATE users SET balance=balance + ?, how_many_wins = how_many_wins + 1 WHERE id = ?", [parseInt(money), id], function(err, result, field){
                if(err) throw err
                res.send({
                    "error": 0,
                    "message": "Balance updated succesfully!"
                })
            })
        }
        else{
            connection.query("UPDATE users SET balance=balance + ? WHERE id= ?", [parseInt(money), id], function(err, result, field){
                if(err) throw err
                res.send({
                    "error": 0,
                    "message": "Balance updated succesfully!"
                })
            })
        }


        
    }
    else{
        res.send({
            "error": 1,
            "message": "Bad Args!"
        })
    }

})
