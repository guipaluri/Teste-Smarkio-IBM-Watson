const CommentsController = require( './controllers/CommentsController');


const router = (app) => {
  app.get('/', (req, res) => {return res.send("Hello Smarkio")});
  app.get('/comments', CommentsController.index);
  app.get('/comments/:id', CommentsController.show);
  app.post('/comments', CommentsController.create);
  app.delete('/comments/:id', CommentsController.remove);
  app.get('/comments/play/:id', CommentsController.play);
  return app;
};

module.exports =  { router };
