const express = require('express');
const app = express();
const port = 3000;
app.use(express.json());

// declare users
let users = [
  {
    email: "sample@gmail.com",
    password: "sample1234",
    isAdmin: true
  },
  {
    email: "generic@yahoo.com",
    password: "generic4321",
    isAdmin: true
  }
];

// declare items 
let items = [
  {
    name: "Playstation 5",
    description: "Home Console designed by Sony and was released on Fall 2020",
    price: 31000,
    isActive: true,
    createdOn: "2023-06-22"
  },
  {
    name: "Nintendo Switch OLED",
    description: "Portable console designed by Nintendo and was released on Fall 2021",
    price: 25000,
    isActive: true,
    createdOn: "2023-06-20"
  },
  {
    name: "Xbox Series X",
    description: "Home console designed by Microsoft and was released on Fall 2020",
    price: 31000,
    isActive: false,
    createdOn: "2023-06-18"
  },
  {
    name: "Steam Deck",
    description: "Portable console designed by Valve and was released on Winter 2021",
    price: 31000,
    isActive: false,
    createdOn: "2023-06-14"
  },
  {
    name: "PS4",
    description: "Home console designed by Sony and was released on Fall 2013",
    price: 18000,
    isActive: false,
    createdOn: "2022-06-12"
  }
];

// declare loggedUser & orders
let loggedUser;
let orders = [];

// register
app.post('/users', (req, res) => {
  console.log(req.body);
  let newUser = {
    email: req.body.email,
    password: req.body.password,
    isAdmin: req.body.isAdmin || false
  };

// Check if email exists in the user database
const locateUser = users.find(user => user.email === req.body.email);
    if (locateUser) {
        res.status(400).send('Another email already exists. Please try again..');
    return;
  }
  users.push(newUser);
  console.log(users);
  res.send('Thank you for registering.');
});

// login
app.post('/users/login', (req, res) => {
console.log(req.body);


// find the user with the same email and password from our request body
let findUser = users.find((user) => {
    return user.email === req.body.email;
});
    if (findUser) {
        let findUserIndex = users.findIndex((user) => {
            return user.email === findUser.email
    });
    findUser.index = findUserIndex;
    loggedUser = findUser;
    console.log(loggedUser);
    res.send('Thank you for logging in.')
    } else {
        loggedUser = findUser;
    res.send('Login failed due to wrong credentials.')
    }
});

// Middleware function to check if the user is logged in
const checkLoggedIn = (req, res, next) => {
    if (loggedUser) {
      // If the user is logged in, proceed to the next middleware or route handler
      next();
    } else {
      // If the user is not logged in, send an error response
      res.status(401).send('Unauthorized Access & please login.');
    }
  };

// Set user as admin
app.put('/users/admin/:index', checkLoggedIn, (req, res) => { //:index meaning choose from 0>
  console.log(req.params);
  console.log(req.params.index);
  let userIndex = parseInt(req.params.index);

    if (loggedUser.isAdmin === true) {
        users[userIndex].isAdmin = true;
        console.log(users[userIndex]);
        res.send('User is now Admin');
    } else {
        res.send('Unauthorized User has been Denied Access.');
    }
});

// add items
app.post('/items', checkLoggedIn, (req, res) => {
 // console.log(loggedUser);
console.log(req.body);
    if (loggedUser.isAdmin === true) {
    let newItem = {
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
        isActive: req.body.isActive || true,
        createdOn: req.body.createdOn
    }
    items.push(newItem);
    console.log(items);
    res.send('You have added a new item.');
    } else {
        res.send('Unathorized Access so Action is Forbidden.');
    }
});

// get all items
app.get('/items', checkLoggedIn, (req, res) => {
    console.log(loggedUser);
    res.send(items);
});

// get all active items
app.get('/items/active', checkLoggedIn, (req, res) => {
    const activeItems = items.filter(item => item.isActive === true);
    res.send(activeItems);
});

// get specific item
app.get('/items/:index', checkLoggedIn, (req, res) => {
    console.log(req.params);
    console.log(req.params.index);
    let index = parseInt(req.params.index);
    let item = items[index];
    res.send(item)
});

// archive item
app.put('/items/archive/:index', checkLoggedIn, (req, res) => {
    console.log(req.params);
    console.log(req.params.index);
    let itemIndex = parseInt(req.params.index);
    if (loggedUser.isAdmin === true) {
        items[itemIndex].isActive = false;
        console.log(items[itemIndex]);
        res.send('Item Archived')
    } else {
        res.send('Unathorized Access so Action is Forbidden.');
    }
});

// update product info
app.put('/items/info/:index', checkLoggedIn, (req, res) => {
    if (loggedUser.isAdmin === true) {
        console.log(req.params);
        console.log(req.params.index);
        let itemIndex = parseInt(req.params.index);

        // check if the item index is valid
        if (itemIndex < 0 || itemIndex >= items.length) {
            res.status(404).send('item not found.');
            return;
        }

        // Update description field of the item
        items[itemIndex].description = req.body.description;
        console.log(items[itemIndex]);
        res.send('Item description updated.');
    } else {
        res.send('Unathorized Access so Action is Forbidden.');
    }
});

// create order
app.post('/order', (req, res) => {
    if (loggedUser.isAdmin === true) {
        console.log(req.body);
        const select = req.body.products;
        // Find the item in the items array that matches the selected product
        const match = items.find(item => item.name.toLowerCase().includes(select.toLowerCase()));
        // Check if the selected product has a match in the items array
        if (!match) {
            res.status(400).send('Invalid product.');
            return;
        } else if (!match.isActive) {
            res.status(400).send('Inactive product so it cannot be added.');
            return;
        }
        let newOrder = {
            emailId: loggedUser.email,
            products: [match],
            price: match.price,
            quantity: req.body.quantity,
            purchased: req.body.purchased || new Date()
        };

        orders.push(newOrder);
        // check if pushed successfully
        console.log(orders);

        res.send('You created an order.');
    } else {
        res.send('Unauthorized Access from Admin. So Action is Forbidden.');
    }
});

// Get authenticated user's orders
app.get('/order/products', (req, res) => {
    if (loggedUser) {
        // Find the orders belonging to the logged-in user
        const userOrders = orders.filter(order => order.emailId === loggedUser.email);

        // Extract the products from each order
        const userProducts = userOrders.flatMap(order => {
            return order.products.map(product => {
                return {
                    ...product,
                    quantity: order.quantity
                };
            });
        });

        console.log(userProducts);
        res.send(userProducts);
    } else {
        res.send('Unauthorized Access due to restricted Admin user. So Action is Forbidden.');
    }
});

// Update Quantity
app.put('/order/update/:index', (req, res) => {
    if (loggedUser) {
        const orderIndex = parseInt(req.params.index);

        // Check if the order index is valid
        if (orderIndex < 0 || orderIndex >= orders.length) {
            res.status(404).send('Order not found.');
            return;
        }

        // Update the product quantity in the specified order
        orders[orderIndex].quantity = req.body.quantity;

        res.send('Product quantity updated.');
    } else {
        res.status(401).send('Unauthorized & please login.');
    }
});

// Remove products from the order
app.delete('/order/remove/:index', (req, res) => {
    if (loggedUser) {
        const orderIndex = parseInt(req.params.index);
        // Find the orders belonging to the logged-in user
        const userOrders = orders.filter(order => order.emailId === loggedUser.email);
        // Check if the order index is valid
        if (orderIndex < 0 || orderIndex >= userOrders.length) {
            res.status(404).send('Order is not found.');
            return;
        }
        // Remove the product from the specified order
        userOrders[orderIndex].products.splice(orderIndex, 1);
        res.send(`Product removed from the cart.`);
    } else {
        res.status(401).send('Unauthorized Access & please login.');
    }
});

// Compute subtotal for each item
app.get('/order/subtotal', (req, res) => {
    if (loggedUser) {
        const userOrders = orders.filter(order => order.emailId === loggedUser.email);

        const items = userOrders.flatMap(order => {
            return order.products.map(product => {
                const subtotal = product.price * order.quantity;
                return {
                    ...product,
                    subtotal
                };
            });
        });

        res.json(items);
    } else {
        res.status(401).send('Unauthorized Access & please login.');
    }
});

// Compute total price for all items in the cart
app.get('/order/total', (req, res) => {
    let total = 0;
    if (loggedUser) {
        const userOrders = orders.filter(order => order.emailId === loggedUser.email);
        userOrders.forEach(order => {
            order.products.forEach(product => {
                total += product.price * order.quantity;
            });
        });
    res.send(`Total price for all items in the cart: P${total.toFixed(2)}`);
    } else {
        res.status(401).send('Unauthorized Access & please login.');
    }
});

// get all orders
app.get('/order/all', (req, res) => {
    console.log(req.body);
    if (loggedUser.isAdmin === true) {
        res.send(orders);
    } else {
        res.send('Unathorized due to Non-admin access. So Action is Forbidden');
    }
});

// error handling
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).send('Internal Server Error');
  });

app.listen(port, () => console.log(`Server is running at port ${port}`));
