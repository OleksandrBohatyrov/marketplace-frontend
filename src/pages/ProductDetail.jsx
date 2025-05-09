import 'bootstrap/dist/css/bootstrap.min.css'
import React, { useEffect, useState } from 'react'
import { Alert, Button, Col, Container, Row, Spinner } from 'react-bootstrap'
import Zoom from 'react-medium-image-zoom'
import 'react-medium-image-zoom/dist/styles.css'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'
import api from '../services/api'

export default function ProductDetail() {
	const { id } = useParams()
	const navigate = useNavigate()
	const { user } = useAuth()
	const { refreshCartCount } = useCart()

	const [product, setProduct] = useState(null)
	const [bids, setBids] = useState([])
	const [myProducts, setMyProducts] = useState([])
	const [showTradeForm, setShowTradeForm] = useState(false)
	const [offeredId, setOfferedId] = useState('')
	const [images, setImages] = useState([])
	const [currentImgIdx, setCurrentImgIdx] = useState(0)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')
	const [bidAmount, setBidAmount] = useState('')

	useEffect(() => {
		setLoading(true)
		api.get(`/api/products/${id}`)
			.then(res => {
				setProduct(res.data)
				const imgs = res.data.imageUrls ?? (res.data.imageUrl ? [res.data.imageUrl] : [])
				setImages(imgs)
			})
			.catch(console.error)
			.finally(() => setLoading(false))
	}, [id])

	useEffect(() => {
		if (product?.isAuction) {
			api.get('/api/bids', { params: { productId: product.id } })
				.then(res => setBids(res.data))
				.catch(console.error)
		}
	}, [product])

	useEffect(() => {
		if (showTradeForm && user) {
			api.get('/api/products/my-products')
				.then(res => setMyProducts(res.data))
				.catch(console.error)
		}
	}, [showTradeForm, user])

	async function handleWrite() {
		if (!product) return

		try {
			const { data } = await api.post(`/api/Chats/product/${product.id}`)
			navigate(`/chats/${data.id}`)
		} catch (err) {
			console.error('Vestluse loomise viga:', err.response?.status, err.response?.data || err.message)
			alert('Ei õnnestunud luua jututuba')
		}
	}
	const handlePlaceBid = async () => {
		setError('')
		if (!user) {
			setError('Palun logi sisse, et teha pakkumine.')
			return
		}
		if (user.id === product.sellerId) {
			setError('Ei saa teha pakkumist enda tootega.')
			return
		}
		const topBid = bids.length ? Math.max(...bids.map(b => b.amount)) : product.minBid ?? 0
		const amt = parseFloat(bidAmount)
		if (isNaN(amt) || amt <= topBid) {
			setError(`Sisesta summa, mis on suurem kui €${topBid.toFixed(2)}.`)
			return
		}
		try {
			await api.post('/api/bids', { productId: product.id, amount: amt })
			const res = await api.get('/api/bids', { params: { productId: product.id } })
			setBids(res.data)
			setBidAmount('')
		} catch {
			setError('Pakkumine ebaõnnestus.')
		}
	}

	const handleAddToCart = async () => {
		if (!user) {
			alert('Palun logi sisse, et lisada ostukorvi.')
			return
		}
		try {
			await api.post(`/api/cart/add/${product.id}`)
			refreshCartCount()
			alert('Toode lisatud ostukorvi.')
		} catch {
			alert('Ostukorvi lisamine ebaõnnestus.')
		}
	}

	const handleProposeTrade = async () => {
		setError('')
		if (!user) {
			setError('Palun logi sisse, et teha vahetuspakkumine.')
			return
		}
		if (user.id === product.sellerId) {
			setError('Ei saa teha vahetuspakkumist enda tootega.')
			return
		}
		if (product.status !== 'Available') {
			setError('Seda toodet ei saa enam vahetada.')
			return
		}
		const offeredInt = parseInt(offeredId, 10)
		if (isNaN(offeredInt)) {
			setError('Vali kehtiv oma toode.')
			return
		}
		try {
			await api.post('/api/trades', {
				TargetProductId: product.id,
				OfferedProductId: offeredInt,
			})
			alert('Vahetuspakkumine saadetud!')
			setShowTradeForm(false)
		} catch {
			setError('Vahetuspakkumine ebaõnnestus.')
		}
	}

	if (loading) return <Spinner animation='border' className='m-5' />
	if (!product) return <Alert variant='warning'>Toodet ei leitud.</Alert>

	const now = new Date()
	const endsAt = product.endsAt ? new Date(product.endsAt) : null
	const auctionActive = product.isAuction && endsAt > now
	const topBid = bids.length ? Math.max(...bids.map(b => b.amount)) : product.minBid ?? 0

	const prevImage = () => setCurrentImgIdx(i => (i === 0 ? images.length - 1 : i - 1))
	const nextImage = () => setCurrentImgIdx(i => (i === images.length - 1 ? 0 : i + 1))

	return (
		<Container className='my-5'>
			<Row className='g-4'>
				<Col md={5} className='position-relative'>
					{images.length > 0 ? (
						<>
							<Zoom>
								<img src={images[currentImgIdx]} alt={product.name} className='img-fluid w-100' style={{ objectFit: 'contain', height: 400 }} />
							</Zoom>
							<Button variant='light' size='sm' className='position-absolute top-50 start-0 translate-middle-y' onClick={prevImage}>
								‹
							</Button>
							<Button variant='light' size='sm' className='position-absolute top-50 end-0 translate-middle-y' onClick={nextImage}>
								›
							</Button>
						</>
					) : (
						<div className='border bg-light' style={{ height: 400 }} />
					)}
				</Col>

				<Col md={7}>
					<h2>{product.name}</h2>

					{product.isAuction ? <p className='text-danger'>Auktsioon {endsAt && `(lõpeb ${endsAt.toLocaleString()})`}</p> : <h4 className='text-success'>€{product.price.toFixed(2)}</h4>}

					<p>{product.description}</p>
					<p>
						<strong>Kategooria:</strong> {product.category.name}
					</p>

					{product.isAuction ? (
						<>
							<p>{auctionActive ? `Kõrgeim pakkumine: €${topBid.toFixed(2)}` : 'Auktsioon on lõppenud'}</p>
							{auctionActive && (
								<div className='mb-3' style={{ maxWidth: 300 }}>
									<div className='input-group mb-2'>
										<span className='input-group-text'>€</span>
										<input type='number' className='form-control' value={bidAmount} onChange={e => setBidAmount(e.target.value)} />
									</div>
									<Button variant='warning' onClick={handlePlaceBid} disabled={!user || user.id === product.sellerId}>
										Tee pakkumine
									</Button>
									{error && <div className='text-danger mt-2'>{error}</div>}
								</div>
							)}
						</>
					) : (
						<>
							<div className='d-flex mb-3'>
								<Button className='me-2' onClick={handleAddToCart} disabled={!user}>
									Lisa ostukorvi
								</Button>
								<Button
									variant='outline-secondary'
									className='me-2'
									onClick={() => setShowTradeForm(s => !s)}
									disabled={!user || user.id === product.sellerId || product.status !== 'Available'}
								>
									Pakkumine vahetada
								</Button>
								{user && user.id !== product.sellerId && (
									<Button variant='outline-primary' onClick={handleWrite}>
										Kirjuta müüjale
									</Button>
								)}
							</div>
							{showTradeForm && (
								<div className='mb-3' style={{ maxWidth: 300 }}>
									<select className='form-select mb-2' value={offeredId} onChange={e => setOfferedId(e.target.value)}>
										<option value=''>— vali oma toode —</option>
										{myProducts.map(mp => (
											<option key={mp.id} value={mp.id}>
												{mp.name}
											</option>
										))}
									</select>
									<Button variant='success' onClick={handleProposeTrade}>
										Saada pakkumine
									</Button>
									{error && <div className='text-danger mt-2'>{error}</div>}
								</div>
							)}
						</>
					)}

					<div className='mt-3'>
						<Button variant='outline-secondary' onClick={() => navigate(-1)}>
							Tagasi
						</Button>
					</div>
				</Col>
			</Row>
		</Container>
	)
}
