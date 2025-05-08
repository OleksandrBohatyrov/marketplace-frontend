import React, { useEffect, useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import api from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import { Container, InputGroup, FormControl, Button } from 'react-bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'

export default function Chat() {
  const { chatId } = useParams()
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [otherUser, setOtherUser] = useState(null)
  const [input, setInput] = useState('')
  const messagesEndRef = useRef(null)

  // Laeb vestluse info (teise kasutaja nime jaoks)
  useEffect(() => {
    api.get('/api/chats')
      .then(res => {
        const chat = res.data.find(c => c.id === parseInt(chatId, 10))
        if (chat) setOtherUser(chat.otherUser)
      })
      .catch(console.error)
  }, [chatId])

  // Laeb sõnumid ja uuendab iga 3 sekundi järel
  useEffect(() => {
    loadMessages()
    const interval = setInterval(loadMessages, 3000)
    return () => clearInterval(interval)
  }, [chatId])

  const loadMessages = () => {
    api.get(`/api/Chats/${chatId}/messages`)
      .then(res => {
        setMessages(res.data)
        scrollToBottom()
      })
      .catch(console.error)
  }

  // Kerib sõnumivaatese allossa
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Sõnumi saatmine
  const handleSend = async () => {
    const text = input.trim()
    if (!text) return
    try {
      await api.post(`/api/Chats/${chatId}/messages`, { text })
      setInput('')
      loadMessages()
    } catch (err) {
      console.error('Sõnumi saatmine ebaõnnestus:', err.response?.data || err.message)
      alert('Sõnumi saatmine ebaõnnestus')
    }
  }

  return (
    <Container className="d-flex flex-column" style={{ maxWidth: 600, marginTop: 20 }}>
      <h4 className="mb-3">Vestlus kasutajaga {otherUser?.userName || '...'}</h4>
      <div
        className="flex-grow-1 mb-3 p-3 border rounded"
        style={{ overflowY: 'auto', height: '400px', display: 'flex', flexDirection: 'column' }}
      >
        {messages.map(m => {
          const mine = m.senderId === user.id
          return (
            <div key={m.id} className="mb-2" style={{ alignSelf: mine ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
              <div style={{ fontSize: 12, color: '#555' }}>
                <strong>{mine ? 'Teie' : otherUser?.userName}</strong>{' '}
                <span>{new Date(m.sentAt).toLocaleTimeString()}</span>
              </div>
              <div
                className="p-2 rounded"
                style={{ background: mine ? '#d1ffd6' : '#f1f1f1' }}
              >
                {m.text}
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      <InputGroup>
        <FormControl
          placeholder="Sõnum..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
        />
        <Button variant="primary" onClick={handleSend}>
          Saada
        </Button>
      </InputGroup>
    </Container>
  )
}
