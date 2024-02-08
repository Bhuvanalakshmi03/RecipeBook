const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.use(express.static('public'));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/', (req, res) => {
    const { name, age, email, password } = req.body
  
    // Insert data into the 'users' table
    
    db.run(
        'INSERT INTO auth (name, age, email, password) VALUES (?, ?, ?, ?)',
        [name, age, email, password], 
        (err) => {
        if (err) {
        return res.render('index',{error:"Some issues"})
      }
  
      // Respond with the ID of the inserted row
      res.redirect('/')
    })
  })

  app.post('/home',(req,res) => {
       const{email,password} = req.body

       db.get('SELECT * FROM auth WHERE email=? AND password = ?',
       [email,password] ,
       (err,user)=>{
        if(err|| !user){
            return res.render('home',{error:'Invalid user'})
        }
        res.redirect('/home')
       }
       )
  }
  )

//db config
const db = new sqlite3.Database('./db/database.db')

// Route for displaying the recipe creation form
app.get('/add_recipe', (req, res) => {
    res.render('add_recipe');
});

// Route for handling the form submission and adding a new recipe to the database
app.post('/add_recipe', (req, res) => {
    const { title, category, ingredients, instructions } = req.body;

    db.run(
        'INSERT INTO recipie (title, category) VALUES (?, ?)',
        [title, category],
        function (err) {
            if (err) {
                console.error(err);
                return res.redirect('/add_recipe?error=Recipe creation failed');
            }

            const recipeId = this.lastID;

            ingredients.forEach((ingredient) => {
                db.run(
                    'INSERT INTO ingredient (rec_id, name) VALUES (?, ?)',
                    [recipeId, ingredient]
                );
            });

            instructions.forEach((instruction, index) => {
                db.run(
                    'INSERT INTO instruction (rec_id, step_no, description) VALUES (?, ?, ?)',
                    [recipeId, index + 1, instruction]
                );
            });

            res.redirect('/');
        }
    );
});

// Route for deleting a recipe
app.get('/delete_recipe/:id', (req, res) => {
    const recipeId = req.params.id;

    db.run('DELETE FROM recipie WHERE rec_id = ?', [recipeId], (err) => {
        if (err) {
            console.error(err);
            return res.redirect('/?error=Deletion failed');
        }
        res.redirect('/');
    });
});

// Route for updating a recipe
app.get('/update_recipe/:id', (req, res) => {
    const recipeId = req.params.id;

    db.get('SELECT * FROM recipie WHERE rec_id = ?', [recipeId], (err, recipe) => {
        if (err || !recipe) {
            return res.status(404).send('Recipe not found');
        }
        res.render('update_recipe', { recipe, error: req.query.error }); // Pass error as a query parameter
    });
});

app.post('/update_recipe/:id', (req, res) => {
    const recipeId = req.params.id;
    const { title, category, ingredients, instructions } = req.body;

    db.run(
        'UPDATE recipie SET title = ?, category = ? WHERE rec_id = ?',
        [title, category, recipeId],
        (err) => {
            if (err) {
                console.error(err);
                return res.redirect(`/update_recipe/${recipeId}?error=Update failed`);
            }
            res.redirect('/');
        }
    );
});

// Route for searching recipes
app.get('/search', (req, res) => {
    const query = req.query.q; // Assuming 'q' is the query parameter

    db.all(
        'SELECT * FROM recipie WHERE title LIKE ? OR category LIKE ?',
        [`%${query}%`, `%${query}%`],
        (err, searchResults) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Internal Server Error');
            }
            res.render('search', { searchResults, query });
        }
    );
});

// Route for filtering recipes
app.get('/filter', (req, res) => {
    const { category, ingredient } = req.query;
    let filterQuery = 'SELECT DISTINCT r.* FROM recipie r ';
    let filterParams = [];

    if (category || ingredient) {
        filterQuery += 'LEFT JOIN ingredient i ON r.rec_id = i.rec_id WHERE ';
    }

    if (category && ingredient) {
        filterQuery += 'category = ? AND name = ?';
        filterParams = [category, ingredient];
    } else if (category) {
        filterQuery += 'category = ?';
        filterParams = [category];
    } else if (ingredient) {
        filterQuery += 'name = ?';
        filterParams = [ingredient];
    }

    // Execute the filter query
    db.all(filterQuery, filterParams, (err, filterResults) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Internal Server Error');
        }
        res.render('filter', { filterResults, category, ingredient });
    });
});

// Route for displaying all recipes
app.get('/', (req, res) => {
    db.all('SELECT * FROM recipie', (err, recipes) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Internal Server Error');
        }
        res.render('index', { recipes });
    });
});

app.get('/home',(req,res) => {
    res.render('home')
})

// Start the server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
