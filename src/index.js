const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');

const app = express();
const port = 3000;

app.post('/app/data-afnpg/endpoint/EcoNido', async (req, res) => {
  const data = req.body;

  try {
    // Conectar a la base de datos MongoDB Atlas
    const client = await MongoClient.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log("Conexión exitosa a MongoDB Atlas");

    // Obtener una referencia a la base de datos y la colección
    const db = client.db("EcoNido");
    const collection = db.collection("dispositivo");

    // Verificar si el dispositivo ya existe en la base de datos
    const existingDevice = await collection.findOne({ device_name: data.device_name });

    if (existingDevice) {
      // Si el dispositivo existe, realizar una actualización en lugar de una inserción
      await collection.updateOne({ device_name: data.device_name }, { $set: data });
      console.log("Datos actualizados en la base de datos");
    } else {
      // Si el dispositivo no existe, insertar los datos en la colección
      await collection.insertOne(data);
      console.log("Datos insertados en la base de datos");
    }

    // Cerrar la conexión
    client.close();
    console.log("Conexión cerrada");

    // Responder a la ESP32 con un mensaje de confirmación
    res.send("Datos recibidos y guardados en la base de datos");
  } catch (error) {
    console.error("Error al conectar a MongoDB Atlas:", error);
    res.status(500).send("Error al conectar a la base de datos");
  }
});
