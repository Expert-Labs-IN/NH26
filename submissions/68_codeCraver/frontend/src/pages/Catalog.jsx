import React, { useState, useEffect } from 'react'
import axios from 'axios'
import ProductCatalog from '../components/ProductCatalog'

export default function Catalog({ showToast }) {
    const [products, setProducts] = useState([])

    const fetchProducts = async () => {
        try {
            const { data } = await axios.get('/api/products')
            setProducts(data)
        } catch { }
    }

    useEffect(() => { fetchProducts() }, [])

    const handleDelete = async (id) => {
        try {
            await axios.delete(`/api/products/${id}`)
            setProducts(p => p.filter(x => x._id !== id))
            showToast('Product deleted')
        } catch { showToast('Delete failed', 'error') }
    }

    return (
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>
            <ProductCatalog products={products} onDelete={handleDelete} />
        </div>
    )
}
