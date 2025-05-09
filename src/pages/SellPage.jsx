import React, { useEffect, useState } from 'react'
import { useForm, Controller }     from 'react-hook-form'
import { useNavigate }             from 'react-router-dom'
import api                         from '../services/api'
import Select                      from 'react-select'
import CreatableSelect             from 'react-select/creatable'
import { useDropzone }             from 'react-dropzone'
import DatePicker                  from 'react-datepicker'
import imageCompression            from 'browser-image-compression'
import {
  Container,
  Form,
  Button,
  Row,
  Col,
  Alert,
  Image
} from 'react-bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'react-datepicker/dist/react-datepicker.css'

export default function SellPage() {
  const navigate = useNavigate()
  const [categories, setCategories] = useState([])
  const [tagsOptions, setTagsOptions] = useState([])
  const [error, setError]           = useState('')
  const [fileError, setFileError]   = useState('')

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors }
  } = useForm({
    defaultValues: {
      name: '',
      description: '',
      price: '',
      category: null,
      tagNames: [],   
      images: [],    
      isAuction: false,
      minBid: '',
      endsAt: null
    }
  })

  const isAuction = watch('isAuction')

  useEffect(() => {
    api.get('/api/users/me', { withCredentials: true })
       .catch(() => navigate('/login', { replace: true }))
    api.get('/api/categories')
       .then(r => setCategories(r.data))
    api.get('/api/tags')
       .then(r =>
         setTagsOptions(r.data.map(t => ({ label: t.name, value: t.name })))
       )
  }, [navigate])

  const {
    getRootProps,
    getInputProps,
    acceptedFiles,
    fileRejections
  } = useDropzone({
    accept: {
      'image/jpeg': [],
      'image/png':  [],
      'image/webp': []
    },
    maxFiles: 4,
    maxSize: 5 * 1024 * 1024, // 5 MB
    onDrop: async (accepted, rejected) => {
      if (rejected.length > 0) {
        const err = rejected[0].errors[0]
        if (err.code === 'file-invalid-type')
          setFileError('Lubatud formaadid: JPEG, PNG, WEBP.')
        else if (err.code === 'file-too-large')
          setFileError('Max 5 MB iga faili kohta.')
        else if (err.code === 'too-many-files')
          setFileError('Max 4 pilti korraga.')
        return
      }
      setFileError('')
      try {
        const compressed = await Promise.all(
          accepted.map(file =>
            imageCompression(file, {
              maxSizeMB: 1,
              useWebWorker: true,
              fileType: 'image/webp'
            })
          )
        )
        setValue('images', compressed, { shouldValidate: true })
      } catch {
        setFileError('Pildi konverteerimine ebaõnnestus.')
      }
    }
  })

  const onSubmit = async data => {
    setError('')
    if (!data.images.length) {
      setError('Vali vähemalt üks pilt.')
      return
    }

    try {
      const form = new FormData()
      form.append('Name', data.name)
      form.append('Description', data.description)
      form.append('CategoryId', data.category)
      form.append('Price', data.price || 0)
      data.tagNames.forEach(name => form.append('TagNames', name))
      data.images.forEach(f => form.append('Images', f, `${f.name}.webp`))
      form.append('IsAuction', data.isAuction)
      if (data.isAuction) {
        form.append('MinBid', data.minBid)
        form.append('EndsAt', data.endsAt.toISOString())
      }

      await api.post('/api/products', form, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      navigate('/', { replace: true })
    } catch (e) {
      console.error(e)
      setError('Toote avaldamine ebaõnnestus.')
    }
  }

  return (
    <Container style={{ maxWidth: 700 }} className="my-5">
      <h2>Lisa uus toode</h2>
      {error && <Alert variant="danger">{error}</Alert>}

      <Form onSubmit={handleSubmit(onSubmit)} noValidate>
        {/* Name */}
        <Form.Group className="mb-3">
          <Form.Label>Nimi *</Form.Label>
          <Form.Control
            {...register('name', { required: true })}
            isInvalid={!!errors.name}
          />
          <Form.Control.Feedback type="invalid">
            Väli on kohustuslik.
          </Form.Control.Feedback>
        </Form.Group>

        {/* Description */}
        <Form.Group className="mb-3">
          <Form.Label>Kirjeldus</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            {...register('description')}
          />
        </Form.Group>

        {/* Category */}
        <Form.Group className="mb-3">
          <Form.Label>Kategooria *</Form.Label>
          <Controller
            name="category"
            control={control}
            rules={{ required: true }}
            render={({ field }) => {
              const opts = categories.map(c => ({ value: c.id, label: c.name }))
              const sel  = opts.find(o => o.value === field.value) || null
              return (
                <Select
                  options={opts}
                  value={sel}
                  onChange={opt => field.onChange(opt.value)}
                  placeholder="— vali —"
                  classNamePrefix="react-select"
                />
              )
            }}
          />
          {errors.category && (
            <div className="text-danger">Vali kategooria.</div>
          )}
        </Form.Group>

        {/* Tags */}
        <Form.Group className="mb-3">
          <Form.Label>Sildid (kirjuta või vali olemasolev, max 5)</Form.Label>
          <Controller
            name="tagNames"
            control={control}
            rules={{ validate: v => v.length <= 5 }}
            render={({ field }) => {
              const value = field.value.map(n => ({ label: n, value: n }))
              return (
                <CreatableSelect
                  isMulti
                  options={tagsOptions}
                  value={value}
                  onChange={items => field.onChange(items.map(i => i.value))}
                  placeholder="Kirjuta uus või vali…"
                  classNamePrefix="react-select"
                />
              )
            }}
          />
          {errors.tagNames && (
            <div className="text-danger">Max 5 silti.</div>
          )}
        </Form.Group>

        {/* Images */}
        <Form.Group className="mb-4">
          <Form.Label>Pildid (1–4, JPEG/PNG/WEBP, ≤ 5 MB)</Form.Label>
          <div
            {...getRootProps()}
            className="border rounded p-4 text-center"
            style={{ cursor: 'pointer' }}
          >
            <input {...getInputProps()} />
            <p>Drag & drop või kliki siia</p>
            {fileError && <div className="text-danger">{fileError}</div>}
            <div className="d-flex flex-wrap justify-content-center mt-3">
              {acceptedFiles.map(file => (
                <Image
                  key={file.name}
                  src={URL.createObjectURL(file)}
                  thumbnail
                  width={70}
                  height={70}
                  className="m-1"
                />
              ))}
            </div>
          </div>
        </Form.Group>

        {/* Auction switch */}
        <Form.Group className="mb-3">
          <Form.Check
            type="switch"
            label="Müü oksjonina"
            {...register('isAuction')}
          />
        </Form.Group>

        {/* Auction fields */}
        {isAuction && (
          <Row className="g-3 mb-4">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Min. pakkumine (€) *</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  {...register('minBid', { required: true })}
                  isInvalid={!!errors.minBid}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Lõppkuupäev *</Form.Label>
                <Controller
                  name="endsAt"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <DatePicker
                      {...field}
                      selected={field.value}
                      onChange={field.onChange}
                      showTimeSelect
                      dateFormat="Pp"
                      className="form-control"
                    />
                  )}
                />
              </Form.Group>
            </Col>
          </Row>
        )}

        {/* Direct-sale price */}
        {!isAuction && (
          <Form.Group className="mb-4">
            <Form.Label>Hind (€) *</Form.Label>
            <Form.Control
              type="number"
              step="0.01"
              {...register('price', { required: true })}
              isInvalid={!!errors.price}
            />
          </Form.Group>
        )}

        <Button variant="primary" type="submit" className="w-100">
          Avalda
        </Button>
      </Form>
    </Container>
  )
}
