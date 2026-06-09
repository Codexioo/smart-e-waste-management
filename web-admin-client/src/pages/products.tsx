import React, { useEffect, useState } from "react";
import axios from "../api/axiosInstance";
import "../styles/products.css";
import { MdSearch, MdAdd, MdEdit, MdDelete, MdCloudUpload, MdClose } from 'react-icons/md';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [editProduct, setEditProduct] = useState(null);
  const [previewImage, setPreviewImage] = useState("");
  const [form, setForm] = useState({
    product_name: "",
    product_desc: "",
    price: "",
    stock_quantity: "",
    min_level_required: "",
    product_image: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [addMode, setAddMode] = useState(false);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const res = await axios.get("/products");
    if (res.data.success) {
      setProducts(res.data.products);
      setFiltered(res.data.products);
    }
  };

  const filter = (q: string) => {
    setSearch(q);
    const f = products.filter((p: any) =>
      p.product_name.toLowerCase().includes(q.toLowerCase())
    );
    setFiltered(f);
  };

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImage = (e: any) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const uploadImage = async (): Promise<string> => {
    if (!imageFile) return previewUrl || "";
    const formData = new FormData();
    formData.append("image", imageFile);
    const res = await axios.post("/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.url;
  };

  const openAdd = () => {
    setForm({
      product_name: "",
      product_desc: "",
      price: "",
      stock_quantity: "",
      min_level_required: "",
      product_image: "",
    });
    setImageFile(null);
    setPreviewUrl("");
    setAddMode(true);
    setEditProduct(null);
  };

  const openEdit = (p: any) => {
    setForm({
      product_name: p.product_name,
      product_desc: p.product_desc,
      price: p.price,
      stock_quantity: p.stock_quantity,
      min_level_required: p.min_level_required,
      product_image: p.product_image,
    });
    setPreviewUrl(p.product_image);
    setImageFile(null);
    setEditProduct(p);
    setAddMode(true);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const image = await uploadImage();
    const data = {
      ...form,
      product_image: image,
      price: parseFloat(form.price),
      stock_quantity: parseInt(form.stock_quantity),
      min_level_required: form.min_level_required
    };

    if (editProduct) {
      await axios.put("/products", { ...(editProduct as any), ...data });
    } else {
      await axios.post("/products", data);
    }

    setAddMode(false);
    setEditProduct(null);
    load();
  };

  const deleteProduct = async (p: any) => {
    if (!window.confirm("Delete this product?")) return;
    await axios.delete(`/products/${p.product_id}`);
    load();
  };

  const changeStatus = async (p: any, status: string) => {
    await axios.put("/products", { ...p, status });
    load();
  };

  const closePopup = () => {
    setAddMode(false);
    setEditProduct(null);
  };

  return (
    <div className="admin-requests">
      <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 className="page-title" style={{ marginBottom: 0 }}>Product Inventory</h2>
        <div className="stats-badge" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: 'var(--secondary)', padding: '8px 16px', borderRadius: '12px', fontWeight: 700, fontSize: '14px' }}>
          Total Products: {products.length}
        </div>
      </div>

      <div className="search-filter">
        <div style={{ position: 'relative', flex: 1 }}>
          {React.createElement(MdSearch as any, { style: { position: 'absolute', left: 12, top: 14, color: '#94a3b8' }, size: 20 })}
          <input
            placeholder="Search products..."
            value={search}
            onChange={(e) => filter(e.target.value)}
            style={{ paddingLeft: 40 }}
          />
        </div>
        <button className="btn-add-product" onClick={openAdd}>
          {React.createElement(MdAdd as any, { size: 20 })}
          <span>Add New Product</span>
        </button>
      </div>

      <table className="request-table">
        <thead>
          <tr>
            <th>Preview</th>
            <th>Product Name</th>
            <th>Price (Points)</th>
            <th>Stock</th>
            <th>Min. Level</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((p: any) => (
            <tr key={p.product_id}>
              <td>
                <img
                  src={p.product_image}
                  alt={p.product_name}
                  className="product-thumb"
                  onClick={() => setPreviewImage(p.product_image)}
                />
              </td>
              <td style={{ fontWeight: 700 }}>{p.product_name}</td>
              <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{p.price}</td>
              <td>{p.stock_quantity}</td>
              <td>
                <span className="badge accepted" style={{ fontSize: '10px' }}>
                  {p.min_level_required}
                </span>
              </td>
              <td>
                <select
                  className="status-select"
                  value={p.status}
                  onChange={(e) => changeStatus(p, e.target.value)}
                >
                  <option>Available</option>
                  <option>Out of Stock</option>
                  <option>Not Available</option>
                </select>
              </td>
              <td>
                <div className="button-group">
                  <button className="edit-btn" onClick={() => openEdit(p)}>
                    {React.createElement(MdEdit as any, { size: 16 })}
                  </button>
                  <button className="delete-btn" onClick={() => deleteProduct(p)}>
                    {React.createElement(MdDelete as any, { size: 16 })}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {addMode && (
        <div className="popup-overlay">
          <div className="popup">
            <div className="popup-header">
              <h3>{editProduct ? "Edit Product" : "Add New Product"}</h3>
              <button onClick={closePopup} className="close-btn">
                {React.createElement(MdClose as any, { size: 24 })}
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group full-width">
                  <label>Product Name</label>
                  <input
                    name="product_name"
                    value={form.product_name}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Eco-friendly Water Bottle"
                  />
                </div>

                <div className="form-group full-width">
                  <label>Description</label>
                  <textarea
                    name="product_desc"
                    value={form.product_desc}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Brief product description..."
                  />
                </div>

                <div className="form-group">
                  <label>Price (Points)</label>
                  <input
                    name="price"
                    type="number"
                    value={form.price}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Stock Quantity</label>
                  <input
                    name="stock_quantity"
                    type="number"
                    value={form.stock_quantity}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group full-width">
                  <label>Minimum Level Required</label>
                  <select
                    name="min_level_required"
                    value={form.min_level_required}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Level</option>
                    {[
                      "Bronze I", "Bronze II", "Silver I", "Silver II",
                      "Gold I", "Gold II", "Platinum I", "Platinum II",
                      "Diamond", "Eco Legend",
                    ].map((level) => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group full-width">
                  <label>Product Image</label>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImage} 
                    id="file-upload"
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="file-upload" className="upload-area">
                    <div className="upload-icon">
                      {React.createElement(MdCloudUpload as any, { size: 24 })}
                    </div>
                    <span className="upload-text">
                      {imageFile ? imageFile.name : "Click to upload product image"}
                    </span>
                  </label>
                  {previewUrl && <img src={previewUrl} alt="preview" className="preview-img" />}
                </div>
              </div>

              <div className="modal-actions">
                <button type="submit" className="btn-submit">
                  {editProduct ? "Update Product" : "Create Product"}
                </button>
                <button type="button" className="btn-cancel" onClick={closePopup}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {previewImage && (
        <div className="image-preview-modal" onClick={() => setPreviewImage("")}>
          <img src={previewImage} alt="full" />
        </div>
      )}
    </div>
  );
}
