"use client"

import { useState } from "react"
import { Edit, Trash2, ChevronDown, ChevronUp, Calendar } from "lucide-react"

interface UserListProps {
  users: any[]
  onEdit: (user: any) => void
  onDelete: (userId: string) => void
}

export function UserList({ users, onEdit, onDelete }: UserListProps) {
  const [expandedUser, setExpandedUser] = useState<string | null>(null)

  const toggleExpand = (userId: string) => {
    setExpandedUser(expandedUser === userId ? null : userId)
  }

  const formatExpiryDate = (dateString: string) => {
    if (!dateString) return "Not set"

    try {
      const date = new Date(dateString)
      const now = new Date()

      // Calculate days remaining
      const diffTime = date.getTime() - now.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      const formattedDate = date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })

      const isExpired = diffDays < 0

      return (
        <span className={isExpired ? "text-red-600" : "text-green-600"}>
          {formattedDate} {isExpired ? "(Expired)" : `(${diffDays} days left)`}
        </span>
      )
    } catch (error) {
      return dateString
    }
  }

  if (users.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
        No users found. Add a new user to get started.
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Mentor ID
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              License Key
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiry</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-red-100 flex items-center justify-center overflow-hidden">
                    {user.avatar ? (
                      <img
                        src={user.avatar || "/placeholder.svg"}
                        alt=""
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-red-600 font-medium">{user.email.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">{user.email}</div>
                    <div className="text-sm text-gray-500">{user.username || "No username"}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.mentorId}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <span className="font-mono">{user.licenseKey}</span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <div className="flex items-center">
                  <Calendar size={14} className="mr-1" />
                  {formatExpiryDate(user.licenseExpiry)}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                >
                  {user.isActive ? "Active" : "Inactive"}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex space-x-2">
                  <button onClick={() => onEdit(user)} className="text-blue-600 hover:text-blue-900">
                    <Edit size={18} />
                  </button>
                  <button onClick={() => onDelete(user.id)} className="text-red-600 hover:text-red-900">
                    <Trash2 size={18} />
                  </button>
                  <button onClick={() => toggleExpand(user.id)} className="text-gray-600 hover:text-gray-900">
                    {expandedUser === user.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {expandedUser && (
        <div className="p-4 bg-gray-50 border-t border-gray-200">
          {users.map((user) => {
            if (user.id === expandedUser) {
              return (
                <div key={`details-${user.id}`} className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">User Details</h3>
                    <p className="text-sm text-gray-500">Robot Name: {user.robotName || "Not set"}</p>
                    <p className="text-sm text-gray-500">License Expiry: {formatExpiryDate(user.licenseExpiry)}</p>
                  </div>

                  <div>
                    <h4 className="text-md font-medium text-gray-900">Allowed Trading Symbols</h4>
                    <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {user.allowedSymbols &&
                        user.allowedSymbols.map((symbol: any, index: number) => (
                          <div key={index} className="bg-white p-3 rounded-md shadow-sm border border-gray-200">
                            <div className="font-medium">{symbol.symbol}</div>
                            <div className="text-sm text-gray-500">
                              Min Lot: {symbol.minLotSize} | Max Trades: {symbol.maxTrades}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              )
            }
            return null
          })}
        </div>
      )}
    </div>
  )
}

