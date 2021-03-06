const express = require('express');
const app = express();
const port = 3000;
const expressLayouts = require('express-ejs-layouts');
const bodyParser = require('body-parser');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const methodOverride = require('method-override');
const flash = require('connect-flash');
const { body, validationResult, check } = require('express-validator');

require('./connect-db/mongoose');

// model
const Category = require('./model/Category');
const Label = require('./model/Label');
const Product = require('./model/Product');

app.set('view engine', 'ejs');
app.use(methodOverride('_method'));
app.use(expressLayouts);
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(cookieParser('secret'))
app.use(session({
    cookie: {
        maxAge: 6000
    },
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}))
app.use(flash());
app.use(express.static('public'));
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});


app.get('/', async (req, res) => {
    const products = await Product.find();
    const totalProducts = products.length;
    res.render('index', {
        title: 'Eternity | Dashboard',
        layout: 'layouts/template',
        url: '/',
        totalProducts,
    });
});


// Product
app.get('/products', async (req, res) => {
    const products = await Product.find().populate([{ path: "category_id", select: "name" }, { path: "label_id", select: "name" }]);
    console.log(products);
    res.render('products', {
        title: 'Eternity | Product',
        layout: 'layouts/template',
        url: '/product',
        products,
    });
});

app.get('/add_product', async (req, res) => {
    const categories = await Category.find();
    const labels = await Label.find();
    res.render('addProduct', {
        title: 'Eternity | Add Product',
        layout: 'layouts/template',
        url: '/product',
        categories,
        labels,
        msg: req.flash('msg'),
        status: req.flash('status'),
    });
});

app.post('/add_product',
    [
        check('name', 'The name is too long').isLength({ max: 40 }),
        check('code', 'The code is too long').isLength({ max: 20 }),
        check('description', 'The desription is too long').isLength({ max: 300 }),
        body('code').custom(async (value) => {
            const code = value.toLowerCase();
            const check = await Product.findOne({ code });
            if (check) {
                throw new Error('The code is already taken');
            }
            return true;
        }),
    ],
    async (req,res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const categories = await Category.find();
            const labels = await Label.find();
            res.render('addProduct', {
                title: 'Eternity | Add Product',
                layout: 'layouts/template',
                url: '/product',
                categories,
                labels,
                errors: errors.array(),
                msg: req.flash('msg'),
                status: req.flash('status'),
            });
        } else {
            const product = new Product({
                name: req.body.name,
                code: req.body.code.toLowerCase(),
                price: req.body.price,
                description: req.body.description,
                stock: req.body.stock,
                category_id: req.body.category,
                label_id: req.body.label,
            });
            await product.save();
            req.flash('msg', 'Success add new product');
            req.flash('status', 'created');
            res.redirect('/add_product');
        }
});
// End Product

// Category
app.get('/categories', async (req, res) => {
    const categories = await Category.find();

    res.render('categories', {
        categories,
        title: 'Eternity | Category',
        layout: 'layouts/template',
        url: '/category',
        msg: req.flash('msg'),
        status: req.flash('status'),
    });
});

app.get('/add_category', (req, res) => {
    res.render('addCategory', {
        title: 'Eternity | Add Category',
        layout: 'layouts/template',
        url: '/category',
        msg: req.flash('msg'),
        status: req.flash('status'),
    });
});

app.post('/add_category',
    [
        check('category', 'The category is required').isLength({min: 1}),
        check('category', 'The category is too long').isLength({max: 20}),
        body('category').custom(async (value) => {
            if (value != '') {
                const newValue = value.split('');
                const firstWord = newValue[0];
                newValue.splice(0, 1);
                newValue.unshift(firstWord.toUpperCase());
                const fixValue = newValue.join('').toString();
                const name = await Category.findOne({ name: fixValue });
                if (name) {
                    throw new Error('The category is already taken');
                }
            }
            return true;
        }),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.render('addCategory', {
                title: 'Eternity | Add Category',
                layout: 'layouts/template',
                url: '/category',
                msg: req.flash('msg'),
                status: req.flash('status'),
                errors: errors.array(),
            });
        } else {
            const newValue = req.body.category.split('');
            const firstWord = newValue[0];
            newValue.splice(0, 1);
            newValue.unshift(firstWord.toUpperCase())
            const fixValue = newValue.join('').toString();
            const category = new Category({
                name: fixValue
            });
            await category.save();
            req.flash('msg', 'Success add new category');
            req.flash('status', 'created');
            res.redirect('/add_category');
        }
});

app.get('/edit_category/:name', (req, res) => {
    const name = req.params.name;
    res.render('editCategory', {
        title: 'Eternity | Edit Category',
        layout: 'layouts/template',
        url: '/category',
        msg: req.flash('msg'),
        status: req.flash('status'),
        name
    });
});

app.put('/edit_category/:name',
    [
        check('category', 'The category is required').isLength({ min: 1 }),
        check('category', 'The category is too long').isLength({ max: 20 }),
        body('category').custom(async (value, {req}) => {
            if(value != '') {
                const newValue = value.split('');
                const firstWord = newValue[0];
                newValue.splice(0, 1);
                newValue.unshift(firstWord.toUpperCase());
                const fixValue = newValue.join('').toString();
                const data = await Category.findOne({ name: fixValue });
                if (data && value.toLowerCase() != req.params.name.toLowerCase()) {
                    throw new Error('The category is already taken');
                } else {
                    return console.log(value);
                }
            }
            return true;
        }),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.render('editCategory', {
                title: 'Eternity | Edit Category',
                layout: 'layouts/template',
                url: '/category',
                msg: req.flash('msg'),
                status: req.flash('status'),
                errors: errors.array(),
                name: req.params.name,
            });
        } else {
            const newValue = req.body.category.split('');
            const firstWord = newValue[0];
            newValue.splice(0, 1);
            newValue.unshift(firstWord.toUpperCase())
            const fixValue = newValue.join('').toString();
            const category = fixValue;
            await Category.updateOne({
                name: req.params.name
            }, { $set: { name: category } });
            req.flash('msg', 'Success edit category');
            req.flash('status', 'updated');
            res.redirect('/categories');
        }
});

app.delete('/delete_category/:name', async (req, res) => {
    try {
        const name = req.params.name;
        await Category.deleteOne({name});
        req.flash('msg', 'Success delete a category');
        req.flash('status', 'deleted');
        res.redirect('/categories');
    } catch (error) {
        console.error(error.message);
        req.flash('msg', 'Fail delete a category');
        req.flash('status', 'Failed');
        res.redirect('/categories');
    }
});
// End Category


// Label
app.get('/labels', async (req, res) => {
    const labels = await Label.find();
    res.render('labels', {
        labels,
        title: 'Eternity | Label',
        layout: 'layouts/template',
        url: '/label',
        msg: req.flash('msg'),
        status: req.flash('status'),
    });
});

app.get('/add_label', (req, res) => {
    res.render('addLabel', {
        title: 'Eternity | Add Label',
        layout: 'layouts/template',
        url: '/label',
        msg: req.flash('msg'),
        status: req.flash('status'),
    });
});

app.post('/add_label',
    [
        check('label', 'The label is required').isLength({ min: 1 }),
        check('label', 'The label is too long').isLength({ max: 20 }),
        body('label').custom(async (value) => {
            if(value != '') {
                const newValue = value.split('');
                const firstWord = newValue[0];
                newValue.splice(0, 1);
                newValue.unshift(firstWord.toUpperCase());
                const fixValue = newValue.join('').toString();
                const name = await Label.findOne({ name: fixValue });
                if (name) {
                    throw new Error('The label is already taken');
                }
            }
            return true;
        }),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.render('addLabel', {
                title: 'Eternity | Add Label',
                layout: 'layouts/template',
                url: '/label',
                msg: req.flash('msg'),
                status: req.flash('status'),
                errors: errors.array(),
            });
        } else {
            const newValue = req.body.label.split('');
            const firstWord = newValue[0];
            newValue.splice(0, 1);
            newValue.unshift(firstWord.toUpperCase());
            const fixValue = newValue.join('').toString();
            const label = new Label({
                name: fixValue
            });
            await label.save();
            req.flash('msg', 'Success add new label');
            req.flash('status', 'created');
            res.redirect('/add_label');
        }
});

app.get('/edit_label/:name', async (req, res) => {
    res.render('editLabel', {
        title: 'Eternity | Edit Label',
        layout: 'layouts/template',
        url: '/label',
        msg: req.flash('msg'),
        status: req.flash('status'),
        name: req.params.name
    });
});

app.put('/edit_label/:name',
    [
        body('label').custom(async (value, { req }) => {
            if(value != '') {
                const newValue = value.split('');
                const firstWord = newValue[0];
                newValue.splice(0, 1);
                newValue.unshift(firstWord.toUpperCase());
                const fixValue = newValue.join('').toString();
                const data = await Label.findOne({ name: fixValue });
                if (data && value.toLowerCase() != req.params.name.toLowerCase()) {
                    throw new Error('The label is already taken');
                } else {
                    return console.log(value);
                }
            }
            return true;
        }),
        check('label', 'The label is required').isLength({ min: 1 }),
        check('label', 'The label is too long').isLength({ max: 20 }),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.render('editLabel', {
                title: 'Eternity | Edit Label',
                layout: 'layouts/template',
                url: '/label',
                msg: req.flash('msg'),
                status: req.flash('status'),
                name: req.params.name,
                errors: errors.array(),
            });
        } else {
            const newValue = req.body.label.split('');
            const firstWord = newValue[0];
            newValue.splice(0, 1);
            newValue.unshift(firstWord.toUpperCase())
            const fixValue = newValue.join('').toString();
            const label = fixValue;
            await Label.updateOne({
                name: req.params.name
            }, { $set: { name: label } });
            req.flash('msg', 'Success edit label');
            req.flash('status', 'updated');
            res.redirect('/labels');
        }
});

app.delete('/labels/:name', async(req, res) => {
    try {
        await Label.deleteOne({name: req.params.name});
        req.flash('msg', 'Succes delete a label');
        req.flash('status', 'deleted');
        res.redirect('/labels');
    } catch (error) {
        console.log(error);
        req.flash('msg', 'Fail delete a label');
        req.flash('status', 'failed');
    }
});
// End Label



// Admin-component
app.get('/blank', (req, res) => {
    res.render('admin-info/blank', {
        title: 'Eternity | Product',
        layout: 'layouts/template',
        url: '/category',
    });
});

app.get('/button', (req, res) => {
    res.render('admin-info/button', {
        title: 'Eternity | Product',
        layout: 'layouts/template',
        url: '/category',
    });
});

app.get('/chart', (req, res) => {
    res.render('admin-info/chart', {
        title: 'Eternity | Product',
        layout: 'layouts/template',
        url: '/category',
    });
});

app.get('/element', (req, res) => {
    res.render('admin-info/element', {
        title: 'Eternity | Product',
        layout: 'layouts/template',
        url: '/category',
    });
});

app.get('/form', (req, res) => {
    res.render('admin-info/form', {
        title: 'Eternity | Product',
        layout: 'layouts/template',
        url: '/category',
    });
});

app.get('/signin', (req, res) => {
    res.render('admin-info/signin', {
        title: 'Eternity | Product',
        layout: 'layouts/sign',
        url: '/category',
    });
});

app.get('/signup', (req, res) => {
    res.render('admin-info/signup', {
        title: 'Eternity | Product',
        layout: 'layouts/sign',
        url: '/category',
    });
});

app.get('/table', (req, res) => {
    res.render('admin-info/table', {
        title: 'Eternity | Product',
        layout: 'layouts/template',
        url: '/category',
    });
});

app.get('/typography', (req, res) => {
    res.render('admin-info/typography', {
        title: 'Eternity | Product',
        layout: 'layouts/template',
        url: '/category',
    });
});

app.get('/widget', (req, res) => {
    res.render('admin-info/widget', {
        title: 'Eternity | Product',
        layout: 'layouts/template',
        url: '/category',
    });
});
// End Admin Component

app.use('', (req, res) => {
    res.status(404);
    res.render('404', {
        title: '404 Page Not Found',
        layout: 'layouts/template',
        url: '/404',
    });
});