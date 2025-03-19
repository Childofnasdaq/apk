"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { X, Plus, Trash, Upload } from "lucide-react"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { storage } from "@/lib/firebase"
import { generateLicenseKey } from "@/lib/utils"

interface UserFormProps {
  user?: any
  onSubmit: (userData: any) => void
  onCancel: () => void
}

export function UserForm({ user, onSubmit, onCancel }: UserFormProps) {
  const [formData, setFormData] = useState({
    id: "",
    email: "",
    mentorId: "",
    username: "",
    robotName: "Aggressive Scalper",
    licenseExpiry: "",
    isActive: true,
    avatar: "",
    allowedSymbols: [
      {
        symbol: "XAUUSDm",
        minLotSize: 0.01,
        maxTrades: 5,
      },
    ],
  })

  const [newSymbol, setNewSymbol] = useState({
    symbol: "",
    minLotSize: 0.01,
    maxTrades: 5,
  })

  const [uploading, setUploading] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (user) {
      setFormData({
        id: user.id || "",
        email: user.email || "",
        mentorId: user.mentorId || "",
        username: user.username || "",
        robotName: user.robotName || "Aggressive Scalper",
        licenseExpiry: user.licenseExpiry || getDefaultExpiryDate(),
        isActive: user.isActive !== undefined ? user.isActive : true,
        avatar: user.avatar || "",
        allowedSymbols: user.allowedSymbols || [
          {
            symbol: "XAUUSDm",
            minLotSize: 0.01,
            maxTrades: 5,
          },
        ],
      })

      if (user.avatar) {
        setImagePreview(user.avatar)
      }
    } else {
      // Set default expiry date for new users
      setFormData((prev) => ({
        ...prev,
        licenseExpiry: getDefaultExpiryDate(),
        mentorId: generateMentorId(),
        licenseKey: generateLicenseKey(),
      }))
    }
  }, [user])

  const getDefaultExpiryDate = () => {
    const date = new Date()
    date.setFullYear(date.getFullYear() + 1)
    return date.toISOString().split("T")[0]
  }

  const generateMentorId = () => {
    // Generate a random 6-digit mentor ID
    return Math.floor(100000 + Math.random() * 900000).toString()
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  const handleNewSymbolChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    setNewSymbol((prev) => ({
      ...prev,
      [name]: name === "symbol" ? value : Number.parseFloat(value),
    }))
  }

  const addSymbol = () => {
    if (!newSymbol.symbol) return

    setFormData((prev) => ({
      ...prev,
      allowedSymbols: [...prev.allowedSymbols, { ...newSymbol }],
    }))

    setNewSymbol({
      symbol: "",
      minLotSize: 0.01,
      maxTrades: 5,
    })
  }

  const removeSymbol = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      allowedSymbols: prev.allowedSymbols.filter((_, i) => i !== index),
    }))
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const file = files[0]
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file")
      return
    }

    setUploading(true)
    try {
      // Create a preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)

      // Upload to Firebase Storage
      const storageRef = ref(storage, `avatars/${formData.email || Date.now()}_${file.name}`)
      const snapshot = await uploadBytes(storageRef, file)
      const downloadURL = await getDownloadURL(snapshot.ref)

      // Update form data with the image URL
      setFormData((prev) => ({
        ...prev,
        avatar: downloadURL,
      }))
    } catch (error) {
      console.error("Error uploading image:", error)
      alert("Failed to upload image. Please try again.")
    } finally {
      setUploading(false)
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">{user ? "Edit User" : "Add New User"}</h2>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-500">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div
                className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border-2 border-red-500"
                onClick={triggerFileInput}
              >
                {imagePreview ? (
                  <img src={imagePreview || "/placeholder.svg"} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <Upload className="text-gray-400" />
                )}
              </div>
              {uploading && (
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                  <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500"
                required
                disabled={!!user}
              />
            </div>

            <div>
              <label htmlFor="mentorId" className="block text-sm font-medium text-gray-700">
                Mentor ID
              </label>
              <input
                type="text"
                id="mentorId"
                name="mentorId"
                value={formData.mentorId}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500"
                required
                readOnly={!user}
              />
              {!user && <p className="text-xs text-gray-500 mt-1">Auto-generated Mentor ID</p>}
            </div>

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500"
              />
            </div>

            <div>
              <label htmlFor="robotName" className="block text-sm font-medium text-gray-700">
                Robot Name
              </label>
              <input
                type="text"
                id="robotName"
                name="robotName"
                value={formData.robotName}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500"
                required
              />
            </div>

            <div>
              <label htmlFor="licenseExpiry" className="block text-sm font-medium text-gray-700">
                License Expiry Date
              </label>
              <input
                type="date"
                id="licenseExpiry"
                name="licenseExpiry"
                value={formData.licenseExpiry}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500"
                required
              />
            </div>

            <div className="flex items-center h-full pt-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Active License</span>
              </label>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Allowed Trading Symbols</h3>

            <div className="space-y-3">
              {formData.allowedSymbols.map((symbol, index) => (
                <div key={index} className="flex items-center space-x-3 bg-gray-50 p-3 rounded-md">
                  <div className="flex-grow grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-500">Symbol</label>
                      <div className="font-medium">{symbol.symbol}</div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500">Min Lot Size</label>
                      <div className="font-medium">{symbol.minLotSize}</div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500">Max Trades</label>
                      <div className="font-medium">{symbol.maxTrades}</div>
                    </div>
                  </div>
                  <button type="button" onClick={() => removeSymbol(index)} className="text-red-600 hover:text-red-800">
                    <Trash size={18} />
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3">
              <div>
                <label htmlFor="newSymbol" className="block text-sm font-medium text-gray-700">
                  Symbol
                </label>
                <input
                  type="text"
                  id="newSymbol"
                  name="symbol"
                  value={newSymbol.symbol}
                  onChange={handleNewSymbolChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500"
                  placeholder="e.g. XAUUSDm"
                />
              </div>
              <div>
                <label htmlFor="newMinLotSize" className="block text-sm font-medium text-gray-700">
                  Min Lot Size
                </label>
                <input
                  type="number"
                  id="newMinLotSize"
                  name="minLotSize"
                  value={newSymbol.minLotSize}
                  onChange={handleNewSymbolChange}
                  step="0.01"
                  min="0.01"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500"
                />
              </div>
              <div>
                <label htmlFor="newMaxTrades" className="block text-sm font-medium text-gray-700">
                  Max Trades
                </label>
                <input
                  type="number"
                  id="newMaxTrades"
                  name="maxTrades"
                  value={newSymbol.maxTrades}
                  onChange={handleNewSymbolChange}
                  min="1"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={addSymbol}
              disabled={!newSymbol.symbol}
              className="mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
            >
              <Plus size={16} className="mr-2" /> Add Symbol
            </button>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              {user ? "Update User" : "Add User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

