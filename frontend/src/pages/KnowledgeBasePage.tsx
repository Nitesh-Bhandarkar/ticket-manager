import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { getAllEntries, addEntry } from "@/api/knowledgeBase"
import type { KnowledgeBaseEntry } from "@/types"

const empty = { title: "", category: "", problemDescription: "", resolution: "" }

export function KnowledgeBasePage() {
  const [entries, setEntries] = useState<KnowledgeBaseEntry[]>([])
  const [form, setForm] = useState(empty)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getAllEntries().then(setEntries)
  }, [])

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)
    try {
      const entry = await addEntry(form)
      setEntries((prev) => [entry, ...prev])
      setForm(empty)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-xl font-semibold">Knowledge Base</h1>

      <form onSubmit={handleAdd} className="space-y-4 max-w-xl border rounded-lg p-4">
        <p className="font-medium text-sm">Add Resolution</p>
        <div className="space-y-1">
          <Label>Title</Label>
          <Input value={form.title} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, title: e.target.value })} required />
        </div>
        <div className="space-y-1">
          <Label>Category</Label>
          <Input value={form.category} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, category: e.target.value })} />
        </div>
        <div className="space-y-1">
          <Label>Problem Description</Label>
          <Textarea
            value={form.problemDescription}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setForm({ ...form, problemDescription: e.target.value })}
            rows={3}
            required
          />
        </div>
        <div className="space-y-1">
          <Label>Resolution</Label>
          <Textarea
            value={form.resolution}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setForm({ ...form, resolution: e.target.value })}
            rows={3}
            required
          />
        </div>
        <Button type="submit" disabled={saving}>{saving ? "Saving…" : "Add Entry"}</Button>
      </form>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Added</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map((e) => (
            <TableRow key={e.id}>
              <TableCell className="font-medium">{e.title}</TableCell>
              <TableCell>{e.category ?? "—"}</TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {new Date(e.createdAt).toLocaleDateString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
