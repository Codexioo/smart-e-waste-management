import React, { useEffect, useState } from "react";
import axios from "../api/axiosInstance";
import "../styles/products.css";

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
      <h2 className="page-title">Product Management</h2>

      <div className="search-filter">
        <input
          placeholder="Search by product name..."
          value={search}
          onChange={(e) => filter(e.target.value)}
        />
        <button className="btn-approve" onClick={openAdd}>
          Add Product
        </button>
      </div>

      <table className="request-table">
        <thead>
          <tr>
            <th>Image</th>
            <th>Name</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Level</th>
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
              <td>{p.product_name}</td>
              <td>{p.price}</td>
              <td>{p.stock_quantity}</td>
              <td>{p.min_level_required}</td>
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
                <button className="btn-approve" onClick={() => openEdit(p)}>
                  Edit
                </button>
                <button className="btn-reject" onClick={() => deleteProduct(p)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {addMode && (
        <div className="popup-overlay">
          <div className="popup">
            <h3>{editProduct ? "Edit Product" : "Add Product"}</h3>
            <form onSubmit={handleSubmit}>
              <label>Product Name</label>
              <input
                name="product_name"
                value={form.product_name}
                onChange={handleChange}
                required
              />

              <label>Description</label>
              <textarea
                name="product_desc"
                value={form.product_desc}
                onChange={handleChange}
              />

              <label>Price</label>
              <input
                name="price"
                type="number"
                value={form.price}
                onChange={handleChange}
                required
              />

              <label>Stock Quantity</label>
              <input
                name="stock_quantity"
                type="number"
                value={form.stock_quantity}
                onChange={handleChange}
                required
              />

              <label>Minimum Level Required</label>
              <select
                name="min_level_required"
                value={form.min_level_required}
                onChange={handleChange}
                required
                style={{
                  width: "100%",
                  padding: "10px",
                  fontSize: "14px",
                  marginTop: "5px",
                  borderRadius: "12px",
                  border: "1px solid #ccc",
                }}
              >
                <option value="">Select Level</option>
                {[
                  "Bronze I",
                  "Bronze II",
                  "Silver I",
                  "Silver II",
                  "Gold I",
                  "Gold II",
                  "Platinum I",
                  "Platinum II",
                  "Diamond",
                  "Eco Legend",
                ].map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>

              <label>Image</label>
              <input type="file" accept="image/*" onChange={handleImage} />
              {previewUrl && <img src={previewUrl} alt="preview" />}

              <div style={{ marginTop: "15px" }}>
                <button type="submit" className="btn-approve">
                  {editProduct ? "Update" : "Add"}
                </button>
                <button
                  type="button"
                  className="btn-reject"
                  onClick={closePopup}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {previewImage && (
        <div
          className="image-preview-modal"
          onClick={() => setPreviewImage("")}
        >
          <img src={previewImage} alt="full" />
        </div>
      )}
    </div>
  );
}
