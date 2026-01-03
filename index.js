const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path = require('path');
const Chat = require('./models/chat');
const methodOverride = require('method-override');

// Middleware setup
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));

// View engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

// Database connection
main()
  .then(() => console.log('✅ MongoDB Connection Successful!'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/whatsapp');
}

// Check database status
async function checkDatabase() {
  try {
    const chatCount = await Chat.countDocuments();
    console.log(`📊 Database has ${chatCount} chat records`);
    if (chatCount === 0) {
      console.log('💡 Tip: Run "node init.js" to populate sample data');
    }
  } catch (error) {
    console.error('❌ Error checking database:', error);
  }
}

// Routes

// Home page - Show all chats
app.get('/', async (req, res) => {
  try {
    let chats = await Chat.find({}).sort({ created_at: -1 });
    res.render('index', { 
      chats,
      title: 'WhatsApp Chat Viewer'
    });
  } catch (error) {
    console.error('❌ Error fetching chats:', error);
    res.render('index', { 
      chats: [],
      title: 'WhatsApp Chat Viewer'
    });
  }
});

// New chat form
app.get('/chats/new', (req, res) => {
  res.render('new', { 
    title: 'New Message',
    chat: null,
    error: null
  });
});

// Create new chat
app.post('/chats', async (req, res) => {
  try {
    const { from, to, msg } = req.body;
    
    if (!from || !to || !msg) {
      return res.render('new', { 
        title: 'New Message',
        chat: null,
        error: 'All fields are required!'
      });
    }
    
    const newChat = new Chat({
      from,
      to,
      msg,
      created_at: new Date()
    });
    
    await newChat.save();
    res.redirect('/');
    
  } catch (error) {
    console.error('❌ Error creating chat:', error);
    res.render('new', { 
      title: 'New Message',
      chat: null,
      error: 'Failed to create message. Please try again.'
    });
  }
});

// View single chat
app.get('/chats/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const chat = await Chat.findById(id);
    if (!chat) {
      return res.status(404).render('error', {
        title: 'Chat Not Found',
        message: 'The chat you are looking for does not exist.'
      });
    }
    res.render('show', { chat });
  } catch (error) {
    console.error('❌ Error fetching chat:', error);
    res.redirect('/');
  }
});

// Edit chat form
app.get('/chats/:id/edit', async (req, res) => {
  try {
    const { id } = req.params;
    const chat = await Chat.findById(id);
    if (!chat) {
      return res.redirect('/');
    }
    res.render('edit', { 
      title: 'Edit Message',
      chat,
      error: null
    });
  } catch (error) {
    console.error('❌ Error fetching chat for edit:', error);
    res.redirect('/');
  }
});

// Update chat
app.put('/chats/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { from, to, msg } = req.body;
    
    const updatedChat = await Chat.findByIdAndUpdate(
      id,
      { from, to, msg, updated_at: new Date() },
      { new: true, runValidators: true }
    );
    
    if (!updatedChat) {
      return res.status(404).render('error', {
        title: 'Chat Not Found',
        message: 'The chat you are trying to update does not exist.'
      });
    }
    
    res.redirect('/');
  } catch (error) {
    console.error('❌ Error updating chat:', error);
    res.redirect('/');
  }
});

// Delete chat
app.delete('/chats/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedChat = await Chat.findByIdAndDelete(id);
    
    if (!deletedChat) {
      return res.status(404).json({ success: false, message: 'Chat not found' });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('❌ Error deleting chat:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 404 Error handler
app.use((req, res) => {
  res.status(404).render('error', {
    title: '404 - Page Not Found',
    message: 'Oops! The page you are looking for does not exist.'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('🔥 Server Error:', err);
  res.status(500).render('error', {
    title: '500 - Server Error',
    message: 'Something went wrong on our end. Please try again later.'
  });
});

// Start server
app.listen(8080, async () => {
  await checkDatabase();
  console.log(`
  🚀 Server is running on port 8080
  🌐 Home: http://localhost:8080
  📝 New Chat: http://localhost:8080/chats/new
  `);
});