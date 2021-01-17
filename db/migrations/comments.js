exports.up = function(knex) {
    return knex.schema
      .createTable('comments', function (table) {
         table.increments('id');
         table.string('comment', 192).notNullable().unique();
         table.string('audio_file', 192);
      })      
  };
  
  exports.down = function(knex) {
    return knex.schema        
        .dropTable("comments");
  };
  
  exports.config = { transaction: false };