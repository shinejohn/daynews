import React, { useState } from 'react';
import { X, Folder, Plus, Check } from 'lucide-react';
export const SaveModal = ({
  onClose,
  article
}) => {
  const [selectedCollection, setSelectedCollection] = useState('default');
  const [showNewCollection, setShowNewCollection] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [saved, setSaved] = useState(false);
  const collections = [{
    id: 'default',
    name: 'Saved Items',
    count: 12
  }, {
    id: 'local-news',
    name: 'Local News',
    count: 8
  }, {
    id: 'must-read',
    name: 'Must Read',
    count: 5
  }];
  const handleSave = () => {
    setSaved(true);
    setTimeout(() => {
      onClose();
    }, 1500);
  };
  const handleCreateCollection = () => {
    if (newCollectionName.trim()) {
      // In a real app, we would add the collection to the database
      setShowNewCollection(false);
      setNewCollectionName('');
    }
  };
  return <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold">Save Article</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-4">
          {/* Article preview */}
          <div className="flex items-center mb-4">
            <div className="h-16 w-16 bg-gray-200 rounded overflow-hidden mr-3">
              {article.image && <img src={article.image} alt={article.title} className="h-full w-full object-cover" />}
            </div>
            <div>
              <h3 className="font-medium text-gray-900 text-sm line-clamp-2">
                {article.title}
              </h3>
              <p className="text-xs text-gray-500">{article.category}</p>
            </div>
          </div>
          {saved ? <div className="text-center py-6">
              <div className="mx-auto h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
                <Check className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                Article Saved!
              </h3>
              <p className="text-sm text-gray-500">
                You can find this article in your saved items.
              </p>
            </div> : <>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Save to Collection
                </label>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {collections.map(collection => <div key={collection.id} className={`flex items-center justify-between p-2 rounded-md cursor-pointer ${selectedCollection === collection.id ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50 border border-transparent'}`} onClick={() => setSelectedCollection(collection.id)}>
                      <div className="flex items-center">
                        <Folder className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm">{collection.name}</span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {collection.count} items
                      </span>
                    </div>)}
                </div>
              </div>
              {showNewCollection ? <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Collection Name
                  </label>
                  <div className="flex">
                    <input type="text" value={newCollectionName} onChange={e => setNewCollectionName(e.target.value)} className="flex-1 border border-gray-300 rounded-l-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="Enter collection name" />
                    <button className="bg-blue-600 text-white px-3 py-2 rounded-r-md text-sm" onClick={handleCreateCollection}>
                      Create
                    </button>
                  </div>
                </div> : <button className="flex items-center text-blue-600 text-sm mb-4" onClick={() => setShowNewCollection(true)}>
                  <Plus className="h-4 w-4 mr-1" />
                  Create New Collection
                </button>}
            </>}
        </div>
        {!saved && <div className="flex justify-end gap-3 p-4 border-t">
            <button onClick={onClose} className="px-4 py-2 border border-gray-300 rounded text-sm font-medium">
              Cancel
            </button>
            <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium">
              Save Article
            </button>
          </div>}
      </div>
    </div>;
};