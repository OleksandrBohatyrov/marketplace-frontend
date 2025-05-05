
import React, { useEffect, useState } from 'react'
import api from '../services/api'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

// Компонент для отображения страницы "Мои заказы"
export default function MyOrders() {
  // Получаем текущего пользователя из контекста
  const { user } = useAuth()
  const navigate = useNavigate()

  // 'purchases' - вкладка покупок, 'sales' - вкладка продаж
  const [tab, setTab] = useState('purchases')
  const [purchases, setPurchases] = useState([])
  const [sales, setSales] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Функция для загрузки заказов покупок и продаж
  const fetchOrders = async () => {
    setLoading(true)
    try {
      const [pRes, sRes] = await Promise.all([
        api.get('/api/orders/my-purchases', { withCredentials: true }),
        api.get('/api/orders/my-sales', { withCredentials: true })
      ])
      setPurchases(pRes.data)
      setSales(sRes.data)
      setError('')
    } catch (err) {
      console.error(err)
      setError('Tellimuste laadimine ebaõnnestus.') // Текст ошибки на эстонском
    } finally {
      setLoading(false)
    }
  }

  // Проверяем, авторизован ли пользователь, и загружаем данные
  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true })
      return
    }
    fetchOrders()
  }, [user])

  // Обработчик добавления адреса доставки покупателем
  const handleAddAddress = async orderId => {
    const address = window.prompt('Sisesta tarneaadress:') // Подсказка на эстонском
    if (!address) return
    try {
      await api.put(
        `/api/orders/${orderId}/address`,
        { shippingAddress: address },
        { withCredentials: true }
      )
      fetchOrders()
    } catch (err) {
      console.error(err)
      alert('Aadressi lisamine ebaõnnestus.') // Сообщение на эстонском
    }
  }

  // Обработчик для продавца: отметить заказ как отправленный
  const handleMarkShipped = async orderId => {
    try {
      await api.put(`/api/orders/${orderId}/ship`, {}, { withCredentials: true })
      fetchOrders()
    } catch (err) {
      console.error(err)
      alert('Saatmise märkimine ebaõnnestus.')
    }
  }

  // Обработчик подтверждения получения заказа покупателем
  const handleConfirmReceived = async orderId => {
    try {
      await api.put(`/api/orders/${orderId}/deliver`, {}, { withCredentials: true })
      fetchOrders()
    } catch (err) {
      console.error(err)
      alert('Saate kättesaamise kinnitamine ebaõnnestus.')
    }
  }

  // Пока идет загрузка данных, показываем индикатор
  if (loading) {
    return <div className="text-center mt-5">Tellimuste laadimine...</div>
  }

  // Выбираем, какие заказы показывать: покупки или продажи
  const list = tab === 'purchases' ? purchases : sales

  return (
    <div className="container my-5">
      <h2 className="mb-4">Minu tellimused</h2> {/* Заголовок страницы */}

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Вкладки для переключения между покупками и продажами */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${tab === 'purchases' ? 'active' : ''}`}
            onClick={() => setTab('purchases')}
          >
            Ostud
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${tab === 'sales' ? 'active' : ''}`}
            onClick={() => setTab('sales')}
          >
            Müük
          </button>
        </li>
      </ul>

      {/* Если заказов нет, показываем сообщение */}
      {list.length === 0 ? (
        <div className="alert alert-info">Tellimusi ei leitud.</div>
      ) : (
        <table className="table table-hover">
          <thead>
            <tr>
              <th>Toode</th>
              <th>Aadress</th>
              <th>Staatus</th>
              <th>Tegevused</th>
            </tr>
          </thead>
          <tbody>
            {list.map(order => (
              <tr key={order.id}>
                <td>
                  <a href={`/products/${order.product.id}`}>{order.product.name}</a>
                </td>
                <td>{order.shippingAddress || '-'}</td>
                <td>{order.status}</td>
                <td>
                  {/* Кнопки действий для покупателя */}
                  {tab === 'purchases' && (
                    <>
                      {order.status === 'PendingAddress' && (
                        <button
                          className="btn btn-sm btn-outline-primary me-2"
                          onClick={() => handleAddAddress(order.id)}
                        >
                          Lisa aadress
                        </button>
                      )}
                      {order.status === 'Shipped' && (
                        <button
                          className="btn btn-sm btn-success"
                          onClick={() => handleConfirmReceived(order.id)}
                        >
                          Kinnita kättesaamine
                        </button>
                      )}
                    </>
                  )}
                  {/* Кнопки действий для продавца */}
                  {tab === 'sales' && (
                    <>
                      {order.status === 'AwaitingShipment' && (
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => handleMarkShipped(order.id)}
                        >
                          Märgi saadetuks
                        </button>
                      )}
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

