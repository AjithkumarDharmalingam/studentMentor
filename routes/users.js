var express = require('express');
var router = express.Router();
const {mongodb,dbUrl,MongoClient, dbName} = require('../config/dbConfig')


router.get('/', function(req, res, next) {
    res.send('respond with a resource');
  });


router.get('/all-students',async(req,res)=>{
  const client = new MongoClient(dbUrl)
  client.connect()
  try {
    let db = client.db(dbName)
    const user = await db.collection("student").find().toArray()
    res.status(200).send({
        message:"Data Received Successfully",
        user
    })
  } catch (error) {
    console.log(error);
    res.status(500).send({message:"Internal Server Error",error})
  }
  finally{
    client.close()
  }
})


router.get('/all-mentors',async(req,res)=>{
    const client = new MongoClient(dbUrl)
    client.connect()
    try {
      let db = client.db(dbName)
      const user = await db.collection("mentor").find().toArray()
      res.status(200).send({
          message:"Data Received Successfully",
          user
      })
    } catch (error) {
      console.log(error);
      res.status(500).send({message:"Internal Server Error",error})
    }
    finally{
      client.close()
    }
  })

  

  router.post('/add-mentor',async(req,res)=>{
    const client = new MongoClient(dbUrl)
    client.connect()
    try {
      let db = client.db(dbName)
      const user = await db.collection("mentor").insertOne(req.body);
      if(req.body.mentorStudents){
        req.body.mentorStudents.map(async(e)=>{
            const stu = await db.collection("student").updateOne({"studentName":e},{$set:{studentMentor:req.body.mentorName}})
        })
      }
      res.status(200).send({
          message:"Mentor Added Successfully",
      })
    } catch (error) {
      console.log(error);
      res.status(500).send({message:"Internal Server Error",error})
    }
    finally{
      client.close()
    }
  })


  router.post('/add-student',async(req,res)=>{
    const client = new MongoClient(dbUrl)
    client.connect()
    try {
      let db = client.db(dbName)
      const user = await db.collection("student").insertOne(req.body);
      if(req.body.studentMentor){
        const men = await db.collection("mentor").findOne({"mentorName":req.body.studentMentor})
        men.mentorStudents.push(req.body.studentName)
        const update = await db.collection("mentor").updateOne({"mentorName":req.body.studentMentor},{$set:{"mentorStudents":men.mentorStudents}})
      }
      res.status(200).send({
          message:"Student Added Successfully",
      })
    } catch (error) {
      console.log(error);
      res.status(500).send({message:"Internal Server Error",error})
    }
    finally{
      client.close()
    }
  })


  router.post('/assign-students',async(req,res)=>{
    const client = new MongoClient(dbUrl)
    client.connect()
    try {
      let db = client.db(dbName)
      if(req.body.mentorStudents){
        req.body.mentorStudents.map(async(e)=>{
          const stu = await db.collection("student").updateOne({"studentName":e},{$set:{"studentMentor":req.body.mentorName}})
        })
      }
      if(req.body.mentorName){
        const men = await db.collection("mentor").findOne({"mentorName":req.body.mentorName})
        req.body.mentorStudents.map((i)=>{
          men.mentorStudents.push(i)
        })
        const update = await db.collection("mentor").updateOne({"mentorName":req.body.mentorName},{$set:{"mentorStudents":men.mentorStudents}});
      }
      res.status(200).send({
          message:"Mentor and Student Mapped Successfully",
      })
    } catch (error) {
      console.log(error);
      res.status(500).send({message:"Internal Server Error",error})
    }
    finally{
      client.close()
    }
  })


  router.post('/change-mentor',async(req,res)=>{
    const client = new MongoClient(dbUrl)
    client.connect()
    try {
      let db = client.db(dbName)
      const men = await db.collection("mentor").findOne({"mentorName":req.body.mentorName});//2
      console.log(men);
       men.mentorStudents.splice(men.mentorStudents.indexOf(req.body.studentName),1);//3
      const update = await db.collection("mentor").updateOne({"mentorName":req.body.mentorName},{$set:{"mentorStudents":men.mentorStudents}});//4
      const user = await db.collection("student").updateOne({"studentName":req.body.studentName},{$set:{"studentMentor":req.body.mentorName}});//5
      const newmen = await db.collection("mentor").findOne({"mentorName":req.body.mentorName});//6
      newmen.mentorStudents.push(req.body.studentName);//6
      const newupdate = await db.collection("mentor").updateOne({"mentorName":req.body.mentorName},{$set:{"mentorStudents":newmen.mentorStudents}});//6
      res.status(200).send({
          message:"Mentor Changed Successfully",
      })
    } catch (error) {
      console.log(error);
      res.status(500).send({message:"Internal Server Error",error})
    }
    finally{
      client.close()
    }
  })


module.exports = router;
