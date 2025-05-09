import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'
import api from '../services/api'

export default function Cart() {
	const [cart, setCart] = useState([])
	const [clientSecret, setClientSecret] = useState('')
	const [processing, setProcessing] = useState(false)

	const navigate = useNavigate()
	const { user } = useAuth()
	const { refreshCartCount } = useCart()

	const stripe = useStripe()
	const elements = useElements()

	const loadCart = async () => {
		try {
			const res = await api.get('/api/cart')
			setCart(res.data)
		} catch (err) {
			console.error(err)
		}
	}

	useEffect(() => {
		loadCart()
	}, [])

	useEffect(() => {
		if (cart.length === 0) {
			setClientSecret('')
			return
		}

		const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

		api.post('/api/payments/create-payment-intent', {
			amount: Math.round(total * 100),
			currency: 'eur',
		})
			.then(res => setClientSecret(res.data.clientSecret))
			.catch(console.error)
	}, [cart])

	const handleRemove = async cartItemId => {
		if (!window.confirm('Kas olete kindel, et soovite selle toote ostukorvist eemaldada?')) {
			return
		}
		try {
			await api.delete(`/api/cart/${cartItemId}`)
			setCart(prev => prev.filter(i => i.id !== cartItemId))
			refreshCartCount()
		} catch (err) {
			console.error(err)
			alert('Toote eemaldamine ebaõnnestus. Palun proovige uuesti.')
		}
	}

	const handleCheckout = async () => {
		if (!user) {
			navigate('/login')
			return
		}

		if (cart.length === 0) {
			alert('Teie ostukorv on tühi.')
			return
		}

		if (!clientSecret) {
			alert('Makse ei ole veel valmis. Palun proovige hiljem uuesti.')
			return
		}

		if (!window.confirm('Kas soovite maksta ja ostukorvi tühjendada?')) {
			return
		}

		setProcessing(true)

		try {
			const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
				payment_method: { card: elements.getElement(CardElement) },
			})

			if (error) throw error

			if (paymentIntent.status === 'succeeded') {
				await api.post('/api/cart/checkout')

				refreshCartCount()
				setCart([])
				alert('Makse õnnestus! Tooted on märgitud müüdud ja ostukorv tühjendatud.')
			}
		} catch (err) {
			console.error(err)
			alert(err.message || 'Tekkis viga maksmisel.')
		} finally {
			setProcessing(false)
		}
	}

	const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)

	return (
		<section className='vh-100'>
			<div className='container my-4'>
				<h2>Ostukorv</h2>

				{cart.length === 0 ? (
					<p>Teie ostukorv on tühi.</p>
				) : (
					<>
						<ul className='list-group mb-3'>
							{cart.map(item => (
								<li key={item.id} className='list-group-item d-flex justify-content-between align-items-center'>
									<div>
										<strong>{item.productName}</strong>
										<br />
										<small className='text-muted'>
											Kogus: {item.quantity} × €{item.price.toFixed(2)}
										</small>
									</div>
									<div className='d-flex align-items-center'>
										<span className='fw-bold me-3'>€{(item.price * item.quantity).toFixed(2)}</span>
										<button className='btn btn-sm btn-outline-danger' onClick={() => handleRemove(item.id)}>
											Eemalda
										</button>
									</div>
								</li>
							))}
						</ul>

						<div className='d-flex justify-content-between align-items-center mb-3'>
							<h5>Kokku:</h5>
							<h5>€{total}</h5>
						</div>

						<div className='mb-3'>
							<label className='form-label'>Kaardi andmed</label>
							<div className='p-2 border rounded'>
								<CardElement options={{ hidePostalCode: true }} />
							</div>
						</div>

						<button className='btn btn-primary w-100' onClick={handleCheckout} disabled={processing || !clientSecret}>
							{processing ? 'Töötlemine…' : `Maksa $${total}`}
						</button>
					</>
				)}
			</div>
		</section>
	)
}
