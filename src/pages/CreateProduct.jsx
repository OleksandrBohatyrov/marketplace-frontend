// src/pages/CreateProduct.jsx
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'

export default function CreateProduct() {
	const navigate = useNavigate()
	const { user } = useAuth()

	const [name, setName] = useState('')
	const [description, setDescription] = useState('')
	const [price, setPrice] = useState('')
	const [categories, setCategories] = useState([])
	const [categoryId, setCategoryId] = useState('')
	const [error, setError] = useState('')

	useEffect(() => {
		api.get('/api/categories')
			.then(res => setCategories(res.data))
			.catch(console.error)
	}, [])

	const handleSubmit = async e => {
		e.preventDefault()
		setError('')

		if (!name || !price || !categoryId) {
			setError('Fill in the title, price and category')
			return
		}

		try {
			await api.post(
				'/api/products',
				{
					name,
					description,
					price: parseFloat(price),
					categoryId: parseInt(categoryId, 10),
				},
				{ withCredentials: true }
			)

			navigate('/', { replace: true })
		} catch (err) {
			console.error(err)
			setError(err.response?.data?.message || 'Error when creating a product')
		}
	}

	if (!user) {
		navigate('/login', { replace: true })
		return null
	}

	return (
		<div className='container my-5' style={{ maxWidth: 600 }}>
			<h2 className='mb-4'>Add new product</h2>
			{error && <div className='alert alert-danger'>{error}</div>}

			<form onSubmit={handleSubmit}>
				<div className='form-floating mb-3'>
					<input type='text' className='form-control' id='prodName' placeholder='Product name' value={name} onChange={e => setName(e.target.value)} required />
					<label htmlFor='prodName'>Product name</label>
				</div>

				<div className='form-floating mb-3'>
					<textarea className='form-control' placeholder='Description' id='prodDesc' style={{ height: '100px' }} value={description} onChange={e => setDescription(e.target.value)} />
					<label htmlFor='prodDesc'>Description</label>
				</div>

				<div className='form-floating mb-3'>
					<input type='number' step='0.01' className='form-control' id='prodPrice' placeholder='Price' value={price} onChange={e => setPrice(e.target.value)} required />
					<label htmlFor='prodPrice'>Price, €</label>
				</div>

				<div className='mb-4'>
					<label htmlFor='prodCat' className='form-label'>
						Category
					</label>
					<select className='form-select' id='prodCat' value={categoryId} onChange={e => setCategoryId(e.target.value)} required>
						<option value=''>Select Category</option>
						{categories.map(cat => (
							<option key={cat.id} value={cat.id}>
								{cat.name}
							</option>
						))}
					</select>
				</div>

				<button type='submit' className='btn btn-success w-100'>
					Add item
				</button>
			</form>
		</div>
	)
}
