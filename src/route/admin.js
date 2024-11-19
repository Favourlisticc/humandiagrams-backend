const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require("bcrypt")
const Admin = require("../database/schema/admin")
const nodemailer = require('nodemailer');
const Clothe = require("../database/schema/clothe")


// Route to fetch all products
router.get('/main/products', async (req, res) => {
  try {
    const products = await Clothe.find();
    res.status(200).json(products);
    console.log(products)
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: 'Failed to fetch products', details: error.message });
  }
});

router.post('/signup', async (req, res) => {
    const { firstName, lastName, role, email, password } = req.body;
    console.log(req.body)
  
    try {
      // Check if user already exists
      let admin = await Admin.findOne({ email });
      if (admin) {
        console.log("User already exists")
        return res.status(400).json({ msg: 'User already exists' });
      }
  
      // Create a new user
      admin = new Admin({
        firstName,
        lastName,
        role,
        email,
        password: await bcrypt.hash(password, 10) // Hash the password
      });
  
      // Save the user to the database
      await admin.save();
  
      // Create a JWT token for the user
      const payload = { adminId: admin.id, role: admin.role };
      const token = jwt.sign(payload, "e6bf7b1a8266f4f6dd1acdcb03091dae3d4179bb2bad87a68942f69b4cc75b89b79f8e8c918ee78da555efe6ffa28bdc5f07c9ebb79171c68846a8fdb121947a", { expiresIn: '5h' });
  
      // Send user details and token back to the frontend
      res.status(201).json({ token, msg: 'User registered successfully', admin });
      console.log(token, admin);
    } catch (error) {
      console.log(error);
      res.status(500).send('Server Error');
    }
  });
  
// POST: Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  console.log(email, password)

  try {
    // Check if the user exists
    const user = await Admin.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if the password is correct
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // If credentials are correct, generate a JWT token and send role
    const token = jwt.sign(
      { id: user._id, role: user.role },
      "e6bf7b1a8266f4f6dd1acdcb03091dae3d4179bb2bad87a68942f69b4cc75b89b79f8e8c918ee78da555efe6ffa28bdc5f07c9ebb79171c68846a8fdb121947a",
      { expiresIn: '1h' } // Token expiry time
    );

    // Respond with the token and user role
    res.status(200).json({
      token,
      role: user.role, // Send the role back to the frontend
      user
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.post('/send-email', (req, res) => {
  const { fullName, email } = req.body;
  console.log(fullName, email)

  if (!fullName || !email) {
    console.log("Full name and email are required")
    return res.status(400).json({ error: "Full name and email are required" });
  }

  const transporter = nodemailer.createTransport({
    host: "smtp.zoho.com",
    port: 465,
    secure: true,
    auth: {
      user: "contact@pozse.com", // Your Zoho email
      pass: "xpu0nukvuXHp", // Replace with app-specific password
    },
  });

  const mailOptions = {
    from: "contact@pozse.com",
    to: ["favoursunday600@gmail.com", "Richbaniba@gmail.com"],
    subject: "New User WaitList",
    text: `Full Name: ${fullName}\nEmail: ${email}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
      return res.status(500).json({ error: "Failed to send email" });
    }
    console.log( "Email sent successfully")
    res.status(200).json({ message: "Email sent successfully", info });
  });
  });

  router.post('/add-product', async (req, res) => {
    try {
      const { title, price, image, collection } = req.body;

      console.log(req.body)
  
      // Validate required fields
      if (!title || !price || !image || !collection) {
        return res.status(400).send({ error: 'All fields including collection are required' });
      }
  
  
      // Create a new product instance
      const product = new Clothe({
        title,
        price,
        image,
        collection, // Save the normalized collection array
      });
  
      // Save the product to the database
      await product.save();
  
      res.status(201).send({ message: 'Product added successfully' });
    } catch (error) {
      res.status(500).send({ error: 'Failed to add product' });
      console.error(error);
    }
  });

  // Get all products
router.get('/products', async (req, res) => {
  try {
    const products = await Clothe.find();
    res.status(200).json(products);
    console.log("Products fetched successfully:", products);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});
  

// Fetch products by collection
router.get('/products/:collection', async (req, res) => {
  const { collection } = req.params;

  try {
    console.log(`Fetching products for collection: ${collection}`);
    const product = await Clothe.find({ collection }); // Filter by collection
    console.log("Products fetched successfully:", product);
    res.json({ success: true, product });
  } catch (error) {
    console.error('Error fetching products by collection:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch products by collection' });
  }
});

// Update a product
router.put('/update/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { price } = req.body;

    console.log(`Updating product with ID: ${id} and new price: ${price}`);
    const product = await Clothe.findByIdAndUpdate(id, { price }, { new: true });

    if (!product) {
      console.error('Product not found with ID:', id);
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    console.log('Product updated successfully:', product);
    res.json({ success: true, product });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ success: false, error: 'Failed to update product' });
  }
});

// Delete a product
router.delete('/delete/:id', async (req, res) => {
  try {
    const { id } = req.params;

    console.log(`Deleting product with ID: ${id}`);
    const deletedProduct = await Clothe.findByIdAndDelete(id);

    if (!deletedProduct) {
      console.error('Product not found for deletion with ID:', id);
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    console.log('Product deleted successfully:', deletedProduct);
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ success: false, error: 'Failed to delete product' });
  }
});

module.exports = router;