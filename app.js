var express = require('express');
var app = express();
var session = require('express-session');
var server = require('http').createServer(app);
var sanitize = require('sanitize');
const ejs = require('ejs');

var port = 8080;

// Set the view engine to ejs
app.set('view engine', 'ejs');

// Serve public files
app.use(express.static('public'))
app.use(express.json());
app.use(sanitize.middleware);
app.use(express.urlencoded());

const { Pool, Client } = require('pg')

//Please don't hack me, thanks.
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'Books',
    password: '!BusyPanda61',
    port: 5432,
})
pool.connect();

//Create a session
app.use(session({
	secret: 'secrets',
}))

// Routes
app.get('/', function (req, res) {    
    res.sendFile(__dirname + '/views/index.html');
});

app.get('/home', function (req, res) {
    if (req.session.user)
        res.render(__dirname + '/views/home');
    else
        res.redirect("/")
});

app.get('/ownerhome', function (req, res) {
    if (req.session.user)
        res.sendFile(__dirname + '/views/ownerhome.html');
    else
        res.redirect("/")
});

app.get('/reports', function (req, res) {
    if (req.session.user)
        res.sendFile(__dirname + '/views/reports.html');
    else
        res.redirect("/")
});

app.get('/cart', function (req, res) {
    if (req.session.user) {
        let total = 0;
        for (let book of req.session.cart) {
            total += book[0].book_price;
        }
        
        res.render(__dirname + '/views/cart', {
            "cart": req.session.cart,
            "cart_total": total,
            "user": req.session.user
        });
    }
    else
        res.redirect("/")
});

app.get('/orders', function (req, res) {
    if (req.session.user) {

        let query = `SELECT * FROM orders WHERE order_user = ${req.session.user.user_ID};`;
        pool.query(query, (err, result) => {
            if (result) {
                res.render(__dirname + '/views/orders', {
                    "orders": result.rows,
                    "user": req.session.user
                });
            }
            else
                res.send({})
        })
    }
    else
        res.redirect("/")
});

app.get('/orders/:order_num', function (req, res) {
    if (req.session.user) {
        let order_num = req.paramString("order_num");
        let query = `SELECT * FROM orders WHERE order_num = ${order_num};
            SELECT * FROM order_book WHERE "order_ID" = ${order_num};`;
        console.log(query)
        pool.query(query, (err, result) => {
            if (result) {
                let books = [];
                let total = 0;
                for (let book of result[1].rows) {
                    books.push(book.book_ID);
                    total += book.price;
                }
                query = `SELECT * FROM book WHERE "book_ID" IN (${books.join(',')});`;
                pool.query(query, (err, result2) => {
                    if (result2) {
                        console.log(result2.rows);
                        res.render(__dirname + '/views/order', {
                            "order": result[0].rows[0],
                            "books": result2.rows,
                            "order_total": total,
                            "user": req.session.user
                        });
                    }
                });
            }
            else
                res.send({})
        })
    }
    else
        res.redirect("/")
});

app.get('/register', function (req, res) {
    res.render(__dirname + '/views/register');
});

app.get('/logout', function (req, res) {
    req.session.destroy();
    res.redirect("/")
});

app.get('/addbook', function (req, res) {
    if (req.session.user)
        res.sendFile(__dirname + '/views/addbook.html');
    else
        res.redirect("/")
});

app.get('/adding', function (req, res) {
    let bookTitle = req.queryString("bookTitle")
    let bookGenre = req.queryString("bookGenre")
    let bookPages = req.queryString("bookPages")
    let bookPublisher = req.queryString("bookPublisher")
    let bookPrice = req.queryString("bookPrice")
    let bookDate = req.queryString("bookDate")
    let bookPer = req.queryString("bookPercentage")
    let bookAuthorF = req.queryString("bookAuthorF")
    let bookAuthorL = req.queryString("bookAuthorL")

    let query = `SELECT EXISTS (SELECT * FROM publisher WHERE p_name = '${bookPublisher}');`;
    pool.query(query, (err, result3) => {
        if (result3) {
            console.log(result3.rows[0].exists)
            if (result3.rows[0].exists == true) {
                let query = `SELECT EXISTS (SELECT * FROM author WHERE author_lname = '${bookAuthorL}' and author_fname = '${bookAuthorF}');`;
                console.log(query)
                pool.query(query, (err, result2) => {
                    if (result2) {
                        if (result2.rows[0].exists == true) {
                            console.log(result2.rows[0].exists)
                            let query = `INSERT INTO public.book(
                            book_name, book_genre, book_pages, book_publisher, book_price, book_date, book_stock, book_percentage, book_authornamef, book_authornamel, book_stock)
                            VALUES ('${bookTitle}', '${bookGenre}', ${bookPages}, '${bookPublisher}', ${bookPrice}, '${bookDate}', 20, ${bookPer}, '${bookAuthorF}', '${bookAuthorL}', 0);`
                            console.log(query);
                            pool.query(query, (err, result) => {
                                if (result) {
                                    res.send("Book added.")   
                                }
                                else
                                    res.send("Book could not be added.")
                            })            
                        } else {
                            res.send("Book could not be added.")
                        }
                        
                    } else {
                        res.send("Book could not be added.")
                    }
                })                
            } else {
                res.send("Book could not be added.")
            }
        } else {
            res.send("Book could not be added.")
        }
    })
});

app.get('/removebook', function (req, res) {
    if (req.session.user)
        res.sendFile(__dirname + '/views/removebook.html');
    else
        res.redirect("/")
});

app.get('/removing', function (req, res) {
    let bookTitle = req.queryString("bookTitle")
    let bookAuthorF = req.queryString("bookAuthorF")
    let bookAuthorL = req.queryString("bookAuthorL")
    let bookISBN = req.queryString("bookISBN")
    let query = `SELECT EXISTS (SELECT * FROM book WHERE book_name = '${bookTitle}' and book_authornamef = '${bookAuthorF}' and book_authornamel = '${bookAuthorL}' and book_isbn = ${bookISBN});`
    pool.query(query, (err, result2) => {
        if (result2.rows[0].exists == true) {
            let query = `DELETE FROM public.book
            WHERE book_name = '${bookTitle}' and book_authornamef = '${bookAuthorF}' and book_authornamel = '${bookAuthorL}' and book_isbn = ${bookISBN};`
            console.log(query);
            pool.query(query, (err, result) => {
                if (result) {
                    res.send("Book removed.")      
                }
                else
                    res.send("Book could not be removed.")
            })
        } else {
            res.send("Book does not exist to delete.")
        }
    })     
});

app.post('/transfer_sales', function (req, res) {
    let query = `select * from book where book_stock < 20;`
    pool.query(query, (err, result) => {
        if (result) {
            //console.log(result.rows);
            let end = ""
            for (let i = 0; i < result.rows.length; i++) {
                var publisher = result.rows[i].book_publisher;
                let query = `select "p_bankAccount" from publisher where p_name = '${publisher}';`
                pool.query(query, (err, result2) => {
                    if (result2) {
                        console.log("Transfering $" + (result.rows[i].book_price * result.rows[i].book_percentage * (result.rows[i].book_sold)).toFixed(2) + " to " + result.rows[i].book_publisher + " with the account number " + result2.rows[0].p_bankAccount);
                        query = `UPDATE book set book_sold = 0 WHERE book_sold != 0;`
                        pool.query(query, (err, result3) => {
                            if (result3)
                                console.log("Amount sold has been reset for next transfer.")
                        })
                    }
                })              
            }
            res.send("Look at terminal/console.")
        } else {
            res.send("Nothing to transfer.");
        }
    })
});

app.get('/transfer', function (req, res) {
    if (req.session.user)
        res.sendFile(__dirname + '/views/transfer.html');
    else
        res.redirect("/")
});

app.get('/sales/genre/:book_genre', function (req, res) {
    let bookGenre = req.params.book_genre;
    console.log(bookGenre)
    pool.query(`select book_price, book_stock, book_genre
                from book
                where book_genre='${bookGenre}' AND book_stock < 20;`, (err, result) => {
        if (result) {
            console.log(result.rows);
            var sales = (0);
            console.log(result.rows.length)
            for (let i = 0; i < result.rows.length; i++) {
                var price = result.rows[i].book_price;
                var sold = 20 - result.rows[i].book_stock;
                bookGenre = result.rows[i].book_genre;
                sales += (price * sold);
                console.log(sales)                
            }

            res.send("Sales for " + bookGenre + "\t $"+sales.toFixed(2))
        }
        else
            res.send({})
    })   

})

app.get('/reportsauthor', function (req, res, next) {
    let bookAuthor = req.queryString("author")
    let query = "SELECT DISTINCT book_authorname FROM book WHERE UPPER(book_authorname) LIKE UPPER('%" + bookAuthor + "%');";
    pool.query(query, (err, result) => {
        if (result) {
            console.log(result.rows);
            res.json(result.rows)          
        }
        else
            res.send({})
    })
});

app.get('/sales/author/:book_author', function (req, res) {
    let authorName = req.paramString("book_author");
    console.log(authorName)
    let query = `select book_price, book_stock, book_authorname
    from book
    where book_authorname='${authorName}' AND book_stock < 20;`

    pool.query(query, (err, result) => {
        if (result) {
            console.log(result.rows);
            var sales = 0;
            console.log(result.rows.length)
            for (let i = 0; i < result.rows.length; i++) {
                var price = result.rows[i].book_price;
                var sold = 20 - result.rows[i].book_stock;
                authorName = result.rows[i].book_authorname;
                sales += (price * sold);
                console.log(sales)                
            }

            res.send("Sales for " + authorName + "\t $"+sales.toFixed(2))
        }
        else{
            console.log(query)
            res.send({})            
        }

    })   

})

app.get('/reportsgenre', function (req, res) {
    let bookGenre = req.queryString("genre")
    let query = "SELECT DISTINCT book_genre FROM book WHERE UPPER(book_genre) LIKE UPPER('%" + bookGenre + "%') AND book_stock > 0";
    pool.query(query, (err, result) => {
        if (result) {
            res.json(result.rows)          
        }
        else
            res.send({})
    })
});


app.get('/books', function (req, res) {
    let bookName = req.queryString("name")
    let bookAuthor = req.queryString("author")
    
    let query = "SELECT * FROM book";
    let params = [];
    if (bookName) params.push("UPPER(book_name) LIKE UPPER('%" + bookName + "%')");
    if (bookAuthor) params.push("UPPER(book_authorname) LIKE UPPER('%" + bookAuthor + "%')");
    if (params.length > 0) query += " WHERE ";
    query += params.join(" or ");
    
    pool.query(query, (err, result) => {
        if (result)
            res.send(result.rows)
        else
            res.send({})
    })

});

app.get('/books/:book_ID', function (req, res) {
    let book_ID = req.paramInt("book_ID");
    pool.query(`select *
                from book
                where "book_ID"=${book_ID};`, (err, result) => {
        if (result)
            res.send(result.rows)
        else
            res.send({})
    })   

})

app.get('/getCart', function (req, res) { 
    res.send(req.session.cart)
})

app.get('/addingToCart', function (req, res) {
    let book_ID = req.queryString("book_ID") 
    let query = `SELECT * FROM book WHERE "book_ID" = ${book_ID}; 
                 UPDATE book SET book_stock = book_stock - 1 WHERE "book_ID" = ${book_ID};
                 UPDATE book SET book_sold = book_sold + 1 WHERE "book_ID" = ${book_ID};
                 UPDATE book SET book_stock = 20 WHERE book_stock < 10;`
    pool.query(query, (err, result) => {
        if (result) {
            req.session.cart.push(result[0].rows)
            res.json(result[0].rows)          
        }
        else
            res.send({})
    })
})
    
app.post("/login", function (req, res, next) {
    let cEmail = req.bodyString("cEmail").replace("'", "");
    let cPassword = req.bodyString("cPassword").replace("'", "");
    pool.query(`SELECT * 
                from users
                where user_email = '${cEmail}'
                and user_pass = '${cPassword}';`
                , (err, result) => {
        if (err) throw err;
        if (result) {
            req.session.user = result.rows[0];
            req.session.cart = [];
            res.redirect("/home")
        } else {
            res.redirect("/");
        }       
    })
});

app.post("/managerlogin", function (req, res, next) {
    let mEmail = req.bodyString("mEmail").replace("'", "");
    let mPassword = req.bodyString("mPassword").replace("'", "");
    pool.query(`SELECT * 
                from owner
                where owner_email = '${mEmail}'
                and owner_password = '${mPassword}';`
                , (err, result) => {
        if (err) throw err;
        if (result) {
            req.session.user = result.rows[0];
            req.session.cart = [];
            res.redirect("/ownerhome")
        } else {
            res.redirect("/");
        }       
    })
});

app.post("/register_user", function (req, res, next) {
    let firstname = req.bodyString("firstName").replace("'", "");
    let lastname = req.bodyString("lastName").replace("'", "");
    let address = req.bodyString("address").replace("'", "");
    let phone = req.bodyString("phone").replace("'", "");
    let email = req.bodyString("email").replace("'", "");
    let password = req.bodyString("password").replace("'", "");
    let card = req.bodyString("card").replace("'", "")
    let query = `INSERT INTO public.users(
        user_lname, user_fname, user_address, "user_phoneNum", user_email, user_pass, user_orders)
        VALUES ('${lastname}', '${firstname}', '${address}', '${phone}', '${email}', '${password}', '{}', '${card}');`
    pool.query(query, (err, result) => {
        if (err) throw err;
        if (result) {
            res.redirect("/")
        } else {
            res.redirect("/");
        }
    })
});

app.post("/placeOrder", function (req, res, next) {
    let address = req.bodyString("address").replace("'", "");
    let query = `INSERT INTO public.orders(
        order_user, order_address)
        VALUES (${req.session.user.user_ID}, '${address}');
        SELECT MAX("order_num") FROM public.orders;`;
    pool.query(query, (err, result) => {
        if (err) throw err;
        if (result) {
            query = "";
            console.log(result[1].rows);
            for (let book of req.session.cart) {
                query += `INSERT INTO public.order_book(
                    "order_ID", "book_ID", price)
                    VALUES (${result[1].rows[0].max}, ${book[0].book_ID}, ${book[0].book_price});`;
            }
            pool.query(query, (err, result2) => {
                if (err) throw err;
                if (result2) {
                    req.session.cart = [];
                    res.redirect(`/orders/${result[1].rows[0].max}`)
                }
            });
        }       
    })
});

server.listen(port);
console.log(`Started server on port ${port}!`);