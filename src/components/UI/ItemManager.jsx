import React, { useState } from 'react';
import { useGame } from '../../contexts/GameContext';
import './Manager.css';

function ItemManager({ onClose }) {
  const { items, saveItem, deleteItem, uploadImage } = useGame();
  const [editingItem, setEditingItem] = useState(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    price: 0,
    imageUrl: '',
    inShop: false
  });

  const handleSaveItem = async () => {
    if (!newItem.name.trim()) return;
    await saveItem(newItem);
    setNewItem({
      name: '',
      description: '',
      price: 0,
      imageUrl: '',
      inShop: false
    });
    setShowNewForm(false);
  };

  const handleUpdateItem = async () => {
    if (!editingItem.name.trim()) return;
    await saveItem(editingItem);
    setEditingItem(null);
  };

  const handleStartEdit = (item) => {
    setEditingItem({ ...item });
    setShowNewForm(false);
  };

  const handleImageUpload = async (file) => {
    const url = await uploadImage(file, 'items');
    if (url) {
      setNewItem({ ...newItem, imageUrl: url });
    }
  };

  const handleEditImageUpload = async (file) => {
    const url = await uploadImage(file, 'items');
    if (url) {
      setEditingItem({ ...editingItem, imageUrl: url });
    }
  };

  const handleToggleShop = async (item) => {
    await saveItem({ ...item, inShop: !item.inShop });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal manager-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        <h2>Item Manager</h2>

        <div className="manager-content">
          <div className="manager-actions">
            <button className="primary" onClick={() => setShowNewForm(!showNewForm)}>
              + Create Item
            </button>
          </div>

          {showNewForm && (
            <div className="player-form">
              <h3>New Item</h3>
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={newItem.description}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                  rows="3"
                />
              </div>
              <div className="form-group">
                <label>Price</label>
                <input
                  type="number"
                  value={newItem.price}
                  onChange={(e) => setNewItem({ ...newItem, price: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="form-group">
                <label>Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e.target.files[0])}
                />
                {newItem.imageUrl && (
                  <img src={newItem.imageUrl} alt="Preview" style={{ width: 100, marginTop: 10 }} />
                )}
              </div>
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={newItem.inShop}
                    onChange={(e) => setNewItem({ ...newItem, inShop: e.target.checked })}
                  />
                  {' '}Add to Shop
                </label>
              </div>
              <div className="form-actions">
                <button className="primary" onClick={handleSaveItem}>Save Item</button>
                <button onClick={() => setShowNewForm(false)}>Cancel</button>
              </div>
            </div>
          )}

          {editingItem && (
            <div className="player-form">
              <h3>Edit Item</h3>
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={editingItem.name}
                  onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={editingItem.description}
                  onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                  rows="3"
                />
              </div>
              <div className="form-group">
                <label>Price</label>
                <input
                  type="number"
                  value={editingItem.price}
                  onChange={(e) => setEditingItem({ ...editingItem, price: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="form-group">
                <label>Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleEditImageUpload(e.target.files[0])}
                />
                {editingItem.imageUrl && (
                  <img src={editingItem.imageUrl} alt="Preview" style={{ width: 100, marginTop: 10 }} />
                )}
              </div>
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={editingItem.inShop}
                    onChange={(e) => setEditingItem({ ...editingItem, inShop: e.target.checked })}
                  />
                  {' '}In Shop
                </label>
              </div>
              <div className="form-actions">
                <button className="primary" onClick={handleUpdateItem}>Update Item</button>
                <button onClick={() => setEditingItem(null)}>Cancel</button>
              </div>
            </div>
          )}

          <div className="grid-list">
            {items.length === 0 ? (
              <p className="empty-state">No items created yet</p>
            ) : (
              items.map(item => (
                <div key={item.id} className="grid-item">
                  {item.imageUrl && <img src={item.imageUrl} alt={item.name} />}
                  <h4>{item.name}</h4>
                  <p>Price: {item.price}</p>
                  <p>{item.description}</p>
                  <div className="grid-item-actions">
                    <button onClick={() => handleStartEdit(item)}>
                      Edit
                    </button>
                    <button onClick={() => handleToggleShop(item)}>
                      {item.inShop ? 'Remove from Shop' : 'Add to Shop'}
                    </button>
                    <button className="danger" onClick={() => deleteItem(item.id)}>
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ItemManager;
