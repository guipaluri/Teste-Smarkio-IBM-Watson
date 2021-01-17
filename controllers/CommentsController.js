const knex = require("../db/knex");

const fs = require('fs');
const TextToSpeechV1 = require('ibm-watson/text-to-speech/v1');
const { IamAuthenticator } = require('ibm-watson/auth');

const textToSpeech = new TextToSpeechV1({
  authenticator: new IamAuthenticator({ apikey: 'pdN7433DqAnVp5yPBi_GOCJnXEYWVq6C4ALGBtKfFuVU' }),
  serviceUrl: 'https://api.us-south.text-to-speech.watson.cloud.ibm.com/instances/a7553fd2-67ff-416e-bde2-6be53b24f736'
});

const index = async (req, res) => {
  const comentarios = await knex("comments").orderBy("id", "desc");
  return res.status(200).json(comentarios);
};

const show = async (req, res) => {
  const id = req.params.id;
  const comentario = await knex("comments").where({ id: id }).first();
  return res.status(200).json(comentario);
};

const create = async (req, res) => {
  const body = req.body;
  if(!body.comment) return res.status(400).json("Comment deve ser obrigatório")
  if(!body.comment.trim()) return res.status(400).json("Comentário não deve ser nulo.");
  await knex("comments").insert({ comment: body.comment })
    .then((id) => res.json({...body, id: id[0]}))
    .catch((err) => {
    if(err.code == "ER_DUP_ENTRY") res.status(400).json("Comentário duplicado")
    else res.status(400).json(err)
  });

};

const remove = async (req, res) => {
  const linhasDeletadas = await knex('comments')
  .where('id', req.params.id)
  .del()
  if(linhasDeletadas === 0){
    res.status(400).json("O comentário não existe")
  } else res.json(`Comentário ${req.params.id} foi deletado`)
}

const play = async (req, res) => {
  const id = req.params.id;
  const comentario = await knex("comments").where({ id: id }).first();  


  const params = {
    text: comentario.comment,
    voice: 'pt-BR_IsabelaVoice',
    accept: 'audio/wav'
  };
  
  const buffer = await textToSpeech
    .synthesize(params)
    .then(response => {
      const audio = response.result;      
      return textToSpeech.repairWavHeaderStream(audio);
    })
    // .then(repairedFile => {
    //   fs.writeFileSync(`files/audio${comentario.id}.wav`, repairedFile);
    //   console.log('audio.wav written with a corrected wav header');
    //   return repairedFile
    // })
    .catch(err => {
      res.status(400).json(err)
    });
    
    await knex('comments').where({ id: id })
    .update("audio_file", `audio${comentario.id}`)

    res.setHeader('Content-Type', 'audio/wav');
    res.setHeader('Content-Disposition', `inline`);
    res.write(buffer);
    res.end();
  



  // return res.status(200).json("play");
};

module.exports = {
  index,
  show,
  create,
  remove,
  play,
};
