"use client"

import React, { useEffect, useState } from "react"
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Shield, ShieldAlert, Trash2, Clock, Award, Loader2 } from "lucide-react"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

type User = {
  id: string
  name: string | null
  email: string | null
  role: string
  status: string
  badges: string[]
  discordUsername: string | null
  _count: {
    purchases: number
    products: number
  }
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [userToDelete, setUserToDelete] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  
  // Badge Dialog State
  const [badgeUser, setBadgeUser] = useState<User | null>(null)
  const [newBadgeName, setNewBadgeName] = useState("")

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users")
      if (res.ok) {
        const data = await res.json()
        setUsers(data.users)
      }
    } catch (error) {
      toast.error("Failed to fetch users")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleUpdateUser = async (userId: string, data: any) => {
    setActionLoading(userId)
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, ...data }),
      })
      if (res.ok) {
        toast.success("User updated successfully")
        fetchUsers()
      } else {
        toast.error("Failed to update user")
      }
    } catch (error) {
      toast.error("Error updating user")
    } finally {
      setActionLoading(null)
    }
  }

  const handleDeleteUser = async () => {
    if (!userToDelete) return
    setActionLoading(userToDelete)
    try {
      const res = await fetch(`/api/admin/users?userId=${userToDelete}`, {
        method: "DELETE",
      })
      if (res.ok) {
        toast.success("User deleted")
        setUsers(users.filter(u => u.id !== userToDelete))
      } else {
        toast.error("Failed to delete user")
      }
    } catch (error) {
      toast.error("Error deleting user")
    } finally {
      setUserToDelete(null)
      setActionLoading(null)
    }
  }

  const handleAddBadgeSubmit = () => {
    if (!badgeUser || !newBadgeName) return
    handleUpdateUser(badgeUser.id, { badges: [...badgeUser.badges, newBadgeName] })
    setBadgeUser(null)
    setNewBadgeName("")
  }

  if (loading) return (
    <div className="p-20 flex flex-col items-center justify-center gap-4 text-center">
      <Loader2 className="animate-spin text-[#48E44B]" size={40} />
      <p className="text-sm font-bold text-[#767F88] uppercase tracking-widest">Accessing node identities...</p>
    </div>
  )

  return (
    <div className="space-y-6">
      <AlertDialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
        <AlertDialogContent className="rounded-[32px] border-none p-8">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User Account</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure? This will permanently delete the user and all their associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser} className="bg-red-500 hover:bg-red-600">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Badge Dialog */}
      <Dialog open={!!badgeUser} onOpenChange={(open) => !open && setBadgeUser(null)}>
        <DialogContent className="rounded-[32px] border-none p-8 max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-black tracking-tight">Assign Elite Badge</DialogTitle>
            <DialogDescription className="text-sm font-medium text-[#767F88]">
              Target User: <span className="text-black font-bold">{badgeUser?.name}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="py-6">
            <Input 
              value={newBadgeName}
              onChange={(e) => setNewBadgeName(e.target.value)}
              placeholder="e.g. Early Supporter, Pro Creator"
              className="h-12 rounded-xl border-gray-100 focus:ring-[#48E44B]"
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" className="rounded-xl font-bold" onClick={() => setBadgeUser(null)}>Cancel</Button>
            <Button onClick={handleAddBadgeSubmit} className="rounded-xl bg-black text-white font-bold px-6">Assign Badge</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="rounded-[32px] border border-gray-100 bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-[#FAFAFB]">
            <TableRow className="hover:bg-transparent">
              <TableHead className="font-bold py-5">User</TableHead>
              <TableHead className="font-bold">Role</TableHead>
              <TableHead className="font-bold">Status</TableHead>
              <TableHead className="font-bold">Badges</TableHead>
              <TableHead className="font-bold">Stats</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id} className="hover:bg-gray-50/50 transition-colors">
                <TableCell className="py-5">
                  <div className="flex flex-col">
                    <span className="font-bold text-[#141519]">{user.name || "Unnamed"}</span>
                    <span className="text-xs text-[#767F88]">{user.email}</span>
                    {user.discordUsername && (
                      <span className="text-[10px] text-[#5865F2] font-bold mt-1">@{user.discordUsername}</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="rounded-full px-3 py-0.5 text-[10px] font-black uppercase tracking-widest border-gray-200">
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {actionLoading === user.id ? (
                      <Loader2 className="animate-spin text-gray-400" size={14} />
                    ) : (
                      <div className={`h-1.5 w-1.5 rounded-full ${user.status === 'ACTIVE' ? 'bg-green-500' : user.status === 'BANNED' ? 'bg-red-500' : 'bg-amber-500'}`} />
                    )}
                    <span className="text-xs font-bold">{user.status}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {user.badges.map((badge, i) => (
                      <Badge key={i} className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none text-[9px] px-2 group relative">
                        {badge}
                        <button 
                          className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleUpdateUser(user.id, { badges: user.badges.filter(b => b !== badge) })}
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                    {user.badges.length === 0 && <span className="text-[10px] text-[#767F88]">No badges</span>}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex gap-3 text-xs font-bold text-[#767F88]">
                    <span>{user._count.purchases} sales</span>
                    <span>{user._count.products} assets</span>
                  </div>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-gray-100 rounded-lg">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-2xl border-gray-100 shadow-xl p-2 w-48">
                      <DropdownMenuItem onClick={() => setBadgeUser(user)} className="rounded-xl gap-2 font-bold text-xs p-3">
                        <Award size={14} /> Manage Badges
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleUpdateUser(user.id, { status: 'ACTIVE' })} className="rounded-xl gap-2 font-bold text-xs p-3 text-green-600">
                        <Shield className="h-4 w-4" /> Restore Access (Unban)
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleUpdateUser(user.id, { status: 'TIMEOUT' })} className="rounded-xl gap-2 font-bold text-xs p-3">
                        <Clock className="h-4 w-4" /> Initiate Time Out
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleUpdateUser(user.id, { status: 'BANNED' })} className="rounded-xl gap-2 font-bold text-xs p-3 text-amber-600">
                        <ShieldAlert className="h-4 w-4" /> Global Ban
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setUserToDelete(user.id)} className="rounded-xl gap-2 font-bold text-xs p-3 text-red-500 focus:text-red-500">
                        <Trash2 className="h-4 w-4" /> Delete Identity
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
