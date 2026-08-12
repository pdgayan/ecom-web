import React, { useEffect, useMemo, useState } from "react";
import { CATALOG_URL } from "../api";
import { useApp } from "../AppContext";
import { FOOD_CATEGORIES, formatCategoryLabel } from "../data/menuCategories";

const emptyForm = {
  id: "",
  name: "",
  manufacturer: "",
  category: "",
  categoryId: "",
  image_url: "",
  availability: "",
  certification: "[]",
  country: "",
  stock: "",
  leadTime: "",
  price: "",
  priceUnit: "",
  description: "",
  specifications: "{}",
  documents: "[]",
  supplierId: "",
  condition: "",
  natoStockNumber: "",
  exportControl: "",
};

function toJsonValue(value, fallback) {
  if (!value) return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function serializeProduct(formData) {
  return {
    id: formData.id || undefined,
    name: formData.name,
    manufacturer: formData.manufacturer,
    category: formData.category,
    categoryId: formData.categoryId,
    image_url: formData.image_url,
    availability: formData.availability,
    certification: toJsonValue(formData.certification, []),
    country: formData.country,
    stock: formData.stock === "" ? null : Number(formData.stock),
    leadTime: formData.leadTime,
    price: formData.price === "" ? null : Number(formData.price),
    priceUnit: formData.priceUnit,
    description: formData.description,
    specifications: toJsonValue(formData.specifications, {}),
    documents: toJsonValue(formData.documents, []),
    supplierId: formData.supplierId,
    condition: formData.condition,
    natoStockNumber: formData.natoStockNumber,
    exportControl: formData.exportControl,
  };
}

function formatFormValue(product) {
  return {
    ...emptyForm,
    ...product,
    certification: JSON.stringify(product.certification ?? [], null, 2),
    specifications: JSON.stringify(product.specifications ?? {}, null, 2),
    documents: JSON.stringify(product.documents ?? [], null, 2),
    stock: product.stock ?? "",
    price: product.price ?? "",
  };
}

const FOOD_CATEGORY_OPTIONS = [...FOOD_CATEGORIES];

export default function SellerDashboardPage() {
  const { token } = useApp();
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const editing = useMemo(() => Boolean(formData.id), [formData.id]);

  async function loadProducts() {
    setError("");
    try {
      const response = await fetch(`${CATALOG_URL}/products`);
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Could not load products");
      setProducts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  }

  function handleEdit(product) {
    setMessage("");
    setFormData(formatFormValue(product));
  }

  function resetForm() {
    setFormData(emptyForm);
    setSelectedFile(null);
    setUploadingImage(false);
    setError("");
    setMessage("");
  }

  function handleFileChange(event) {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);
    setError("");
    setMessage("");
  }

  async function uploadImage(file) {
    if (!file) {
      return formData.image_url || "";
    }

    setUploadingImage(true);
    setError("");
    setMessage("Uploading image...");

    const uploadFormData = new FormData();
    uploadFormData.append("image", file);

    const response = await fetch(`${CATALOG_URL}/products/upload`, {
      method: "POST",
      headers: token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {},
      body: uploadFormData,
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Image upload failed");
    }

    setMessage("Image uploaded");
    setFormData((current) => ({ ...current, image_url: data.imageUrl }));
    return data.imageUrl;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    const payload = serializeProduct(formData);
    try {
      let imageUrl = payload.image_url || "";

      if (selectedFile) {
        imageUrl = await uploadImage(selectedFile);
      }

      const response = await fetch(
        editing
          ? `${CATALOG_URL}/products/${formData.id}`
          : `${CATALOG_URL}/products`,
        {
          method: editing ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ ...payload, image_url: imageUrl }),
        },
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Save failed");

      setMessage(editing ? "Product updated" : "Product created");
      resetForm();
      await loadProducts();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
      setUploadingImage(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this product?")) return;

    setError("");
    setMessage("");
    try {
      const response = await fetch(`${CATALOG_URL}/products/${id}`, {
        method: "DELETE",
        headers: token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {},
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Delete failed");
      setMessage("Product deleted");
      await loadProducts();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="dashboard-layout">
      <section className="dashboard-hero card">
        <div>
          <div className="eyebrow">Kitchen dashboard</div>
          <h1>Manage menu items</h1>
          <p>
            Add, edit, and delete dishes from the same page with a cleaner food
            ordering workflow.
          </p>
        </div>
        <div className="dashboard-stats">
          <div className="stat-box">
            <span className="stat-value">{products.length}</span>
            <span className="stat-label">Dishes</span>
          </div>
          <div className="stat-box accent">
            <span className="stat-value">{editing ? "Edit" : "New"}</span>
            <span className="stat-label">Form mode</span>
          </div>
        </div>
      </section>

      <div className="dashboard-grid">
        <section className="card form-card">
          <div className="section-head">
            <h2>{editing ? "Edit dish" : "Add dish"}</h2>
            {editing && (
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={resetForm}
              >
                Cancel edit
              </button>
            )}
          </div>

          {error && <div className="alert alert-error">{error}</div>}
          {message && <div className="alert alert-success">{message}</div>}

          <form className="product-form" onSubmit={handleSubmit}>
            <div className="grid-two">
              <label className="form-field">
                <span>Dish name</span>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </label>
              <label className="form-field">
                <span>Brand / restaurant</span>
                <input
                  name="manufacturer"
                  value={formData.manufacturer}
                  onChange={handleChange}
                />
              </label>
              <label className="form-field">
                <span>Category</span>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                >
                  <option value="">Select a category</option>
                  {FOOD_CATEGORY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.label}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="form-field">
                <span>Category ID</span>
                <input
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  placeholder="e.g. BURGER-01"
                />
              </label>
              <label className="form-field">
                <span>Upload image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </label>
              <label className="form-field">
                <span>Availability</span>
                <input
                  name="availability"
                  value={formData.availability}
                  onChange={handleChange}
                />
              </label>
              <label className="form-field">
                <span>Country</span>
                <input
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                />
              </label>
              <label className="form-field">
                <span>Stock</span>
                <input
                  name="stock"
                  type="number"
                  value={formData.stock}
                  onChange={handleChange}
                />
              </label>
              <label className="form-field">
                <span>Prep time</span>
                <input
                  name="leadTime"
                  value={formData.leadTime}
                  onChange={handleChange}
                />
              </label>
              <label className="form-field">
                <span>Price</span>
                <input
                  name="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={handleChange}
                />
              </label>
              <label className="form-field">
                <span>Price unit</span>
                <input
                  name="priceUnit"
                  value={formData.priceUnit}
                  onChange={handleChange}
                />
              </label>
              <label className="form-field">
                <span>Condition</span>
                <input
                  name="condition"
                  value={formData.condition}
                  onChange={handleChange}
                />
              </label>
            </div>

            <label className="form-field">
              <span>Description</span>
              <textarea
                name="description"
                rows="4"
                value={formData.description}
                onChange={handleChange}
              />
            </label>
            <label className="form-field">
              <span>Certification JSON</span>
              <textarea
                name="certification"
                rows="3"
                value={formData.certification}
                onChange={handleChange}
              />
            </label>
            <label className="form-field">
              <span>Specifications JSON</span>
              <textarea
                name="specifications"
                rows="4"
                value={formData.specifications}
                onChange={handleChange}
              />
            </label>
            <label className="form-field">
              <span>Documents JSON</span>
              <textarea
                name="documents"
                rows="3"
                value={formData.documents}
                onChange={handleChange}
              />
            </label>

            <div className="grid-two">
              <label className="form-field">
                <span>Supplier ID</span>
                <input
                  name="supplierId"
                  value={formData.supplierId}
                  onChange={handleChange}
                />
              </label>
              <label className="form-field">
                <span>NATO Stock Number</span>
                <input
                  name="natoStockNumber"
                  value={formData.natoStockNumber}
                  onChange={handleChange}
                />
              </label>
              <label className="form-field">
                <span>Export control</span>
                <input
                  name="exportControl"
                  value={formData.exportControl}
                  onChange={handleChange}
                />
              </label>
            </div>

            {formData.image_url && (
              <div className="image-preview">
                <img src={formData.image_url} alt="Selected preview" />
              </div>
            )}

            <button
              className="btn btn-primary btn-wide"
              type="submit"
              disabled={saving || uploadingImage}
            >
              {saving || uploadingImage
                ? "Saving…"
                : editing
                  ? "Update product"
                  : "Create product"}
            </button>
          </form>
        </section>

        <section className="card list-card">
          <div className="section-head">
            <h2>Current dishes</h2>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={loadProducts}
            >
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="spinner">Loading products…</div>
          ) : (
            <div className="admin-list">
              {products.map((product) => (
                <article className="admin-row" key={product.id}>
                  <img
                    src={
                      product.image_url ||
                      `https://picsum.photos/seed/${encodeURIComponent(product.id)}/300/200`
                    }
                    alt={product.name}
                  />
                  <div className="admin-row-body">
                    <div className="admin-row-top">
                      <div>
                        <div className="eyebrow">
                          {formatCategoryLabel(product.category)}
                        </div>
                        <h3>{product.name}</h3>
                      </div>
                      <div className="price-chip">
                        ${Number(product.price || 0).toFixed(2)}
                      </div>
                    </div>
                    <p>{product.description || "No description yet."}</p>
                    <div className="row-meta">
                      <span>{product.stock ?? 0} available</span>
                      <span>{product.manufacturer || "No manufacturer"}</span>
                    </div>
                    <div className="row-actions">
                      <button
                        className="btn btn-outline btn-sm"
                        type="button"
                        onClick={() => handleEdit(product)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        type="button"
                        onClick={() => handleDelete(product.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              ))}

              {!products.length && (
                <div className="empty-state">
                  <h2>No dishes yet</h2>
                  <p>Create one on the left.</p>
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
