const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()


// for json parsing
app.use(express.json())

// static serving
app.use(express.static('build'))

// http logging using morgan
morgan.token('data', (req, _res) => JSON.stringify(req.body)) // new token for body data
app.use(morgan('method :url :status :res[content-length] - :response-time ms :data')) 

// cors
app.use(cors())

// Load the database
let persons = require('./db.json')
let maxId = persons.reduce((prev, p) => Math.max(prev, p.id), 0)
const newId = () => ++maxId

app.get('/', (_req, res) => {
  res.send('Phonebook backend')
})

app.get('/info', (_req, res) => {
  res.send(`
    <div> Phonebook has info for ${persons.length} people </div>
    <div>${new Date}</div>
  `)
})

app.get('/api/persons', (_req, res) => {
  res.json(persons)
})

app.post('/api/persons', (req, res) => {
  const person = req.body
  // Check if the request is valid
  if (!person.name) {return res.status(400).json({error: 'name missing'})}
  if (!person.number) {return res.status(400).json({error: 'number missing'})}
  if (persons.find(p => p.name === person.name)) {
    return res.status(400).json({error: 'name must be unique'})
  }
  // Only keep name and number attributes
  newPerson = {
    id: newId(),
    name: person.name,
    number: person.number
  }
  persons.push(newPerson)
  res.json(newPerson)
})

app.get('/api/persons/:id', (req, res) => {
  const id = req.params.id
  const person = persons.find(p => p.id == id)
  if (person) {res.json(person)}
  else        {res.status(404).end()}
})

app.delete('/api/persons/:id', (req, res) => {
  const id = req.params.id
  persons = persons.filter(p => p.id != id)
  res.status(204).end()
})

const unknownEndpoint = (_req, res) => res.status(404).send({ error: 'unknown endpoint' })
app.use(unknownEndpoint)


const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`))
