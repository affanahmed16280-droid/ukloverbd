"use client";

import React, { useState, useCallback, useRef } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, query, getDocs, where } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  UploadCloud, CheckCircle2, XCircle, Trash2,
  Package, ArrowLeft, ShieldCheck
} from "lucide-react";
import Link from "next/link";

type UploadStatus = "idle" | "uploading" | "success" | "error";

type UploadItem = {
  id: string;
  file: File;
  previewUrl: string;
  title: string;
  price: number;
  originalPrice: number;
  category: string;
  status: UploadStatus;
  progress: number;
  errorMsg?: string;
};

const CATEGORIES = [
  "Facewash", "Face Serum", "Cream", "Sunscreen", "Shampoo",
  "Conditioner", "Body Lotion", "Jewelry", "Baby and Kids", "Offers"
];

function generateTitle(filename: string): string {
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, "");
  return nameWithoutExt
    .split(/[_\-\s]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export default function AdminUploadPage() {
  const [items, setItems] = useState<UploadItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [adminUnlocked, setAdminUnlocked] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "ukbrandlover2024") {
      setAdminUnlocked(true);
    } else {
      setPasswordError("Incorrect password. Please try again.");
    }
  };

  const addFiles = useCallback((files: File[]) => {
    const newItems: UploadItem[] = files
      .filter(f => f.type.startsWith("image/"))
      .map((file) => ({
        id: `${Date.now()}-${Math.random().toString(36).substring(7)}`,
        file,
        previewUrl: URL.createObjectURL(file),
        title: generateTitle(file.name),
        price: 0,
        originalPrice: 0,
        category: CATEGORIES[0],
        status: "idle",
        progress: 0,
      }));
    setItems((prev) => [...prev, ...newItems]);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(Array.from(e.target.files));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) addFiles(Array.from(e.dataTransfer.files));
  };

  const updateItem = (id: string, updates: Partial<UploadItem>) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter(item => item.id !== id));
  };

  const uploadItem = async (item: UploadItem) => {
    updateItem(item.id, { status: "uploading", progress: 10 });

    try {
      // Check for duplicate by original filename in Firestore
      if (db) {
        const dupQ = query(
          collection(db, "products"),
          where("originalFilename", "==", item.file.name)
        );
        const dupSnap = await getDocs(dupQ);
        if (!dupSnap.empty) {
          updateItem(item.id, {
            status: "error",
            errorMsg: "Duplicate: already uploaded",
            progress: 0
          });
          return;
        }
      }

      updateItem(item.id, { progress: 30 });

      // Upload to Cloudinary via server API route
      const formData = new FormData();
      formData.append("file", item.file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Upload failed");
      }

      updateItem(item.id, { progress: 70 });
      const data = await res.json();

      // Save to Firestore
      if (db) {
        await addDoc(collection(db, "products"), {
          title: item.title,
          price: Number(item.price),
          originalPrice: Number(item.originalPrice) || Math.round(Number(item.price) * 1.25),
          imageUrl: data.secure_url,
          cloudinaryPublicId: data.public_id,
          originalFilename: item.file.name,
          category: item.category,
          createdAt: serverTimestamp(),
          inStock: true,
        });
      }

      updateItem(item.id, { status: "success", progress: 100 });
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Unknown error";
      updateItem(item.id, { status: "error", progress: 0, errorMsg: msg });
    }
  };

  const uploadBatch = async () => {
    setIsUploading(true);
    const pendingItems = items.filter(i => i.status === "idle" || i.status === "error");
    for (const item of pendingItems) {
      await uploadItem(item);
    }
    setIsUploading(false);
  };

  const totalPending = items.filter(i => i.status === "idle").length;
  const totalSuccess = items.filter(i => i.status === "success").length;
  const totalError = items.filter(i => i.status === "error").length;

  if (!adminUnlocked) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="bg-card border border-border rounded-2xl p-10 w-full max-w-sm shadow-xl space-y-6">
          <div className="text-center space-y-2">
            <ShieldCheck className="w-12 h-12 text-primary mx-auto" />
            <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-playfair)' }}>Admin Access</h1>
            <p className="text-muted-foreground text-sm">UK Brand Lover · Upload Portal</p>
          </div>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <Input
              type="password"
              placeholder="Enter admin password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="text-center"
            />
            {passwordError && <p className="text-destructive text-sm text-center">{passwordError}</p>}
            <Button type="submit" className="w-full">Unlock Dashboard</Button>
          </form>
          <Link href="/" className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Store
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Package className="w-7 h-7 text-primary" />
              <h1 className="text-3xl font-bold text-foreground" style={{ fontFamily: 'var(--font-playfair)' }}>
                Bulk Product Upload
              </h1>
            </div>
            <p className="text-muted-foreground">Upload product images → auto-generates titles → saves to Firestore</p>
          </div>
          <Link href="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors border border-border rounded-lg px-4 py-2">
            <ArrowLeft className="w-4 h-4" /> Back to Store
          </Link>
        </div>

        {/* Stats Row */}
        {items.length > 0 && (
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-card border border-border rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-foreground">{totalPending}</div>
              <div className="text-sm text-muted-foreground">Pending</div>
            </div>
            <div className="bg-card border border-border rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-green-500">{totalSuccess}</div>
              <div className="text-sm text-muted-foreground">Uploaded</div>
            </div>
            <div className="bg-card border border-border rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-destructive">{totalError}</div>
              <div className="text-sm text-muted-foreground">Errors</div>
            </div>
          </div>
        )}

        {/* Drop Zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-16 text-center cursor-pointer transition-all duration-200
            ${isDragging
              ? "border-primary bg-primary/5 scale-[1.01]"
              : "border-border hover:border-primary/50 hover:bg-muted/50"
            }`}
        >
          <UploadCloud className={`mx-auto h-14 w-14 mb-4 transition-colors ${isDragging ? "text-primary" : "text-muted-foreground"}`} />
          <div className="text-xl font-semibold text-foreground mb-1">
            {isDragging ? "Drop images here!" : "Drag & Drop product images"}
          </div>
          <p className="text-muted-foreground text-sm">or click to browse — PNG, JPG, WEBP supported</p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={handleFileSelect}
          />
        </div>

        {/* Queue Table */}
        {items.length > 0 && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-foreground">
                Upload Queue <span className="text-muted-foreground font-normal text-base">({items.length} images)</span>
              </h2>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setItems([])}
                  disabled={isUploading}
                >
                  Clear All
                </Button>
                <Button
                  onClick={uploadBatch}
                  disabled={isUploading || totalPending === 0}
                  className="min-w-36"
                >
                  {isUploading ? "Uploading..." : `Upload ${totalPending} Image${totalPending !== 1 ? "s" : ""}`}
                </Button>
              </div>
            </div>

            <div className="border border-border rounded-xl overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-20">Preview</TableHead>
                    <TableHead>Product Title</TableHead>
                    <TableHead className="w-32">Price (৳)</TableHead>
                    <TableHead className="w-32">Orig. Price (৳)</TableHead>
                    <TableHead className="w-40">Category</TableHead>
                    <TableHead className="w-40">Status</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => {
                    const isLocked = item.status === "uploading" || item.status === "success";
                    return (
                      <TableRow key={item.id} className={item.status === "success" ? "opacity-60" : ""}>
                        <TableCell>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={item.previewUrl}
                            alt="Preview"
                            className="w-14 h-14 object-cover rounded-lg border border-border"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={item.title}
                            onChange={(e) => updateItem(item.id, { title: e.target.value })}
                            disabled={isLocked}
                            className="text-sm"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={item.price || ""}
                            placeholder="0"
                            onChange={(e) => updateItem(item.id, { price: Number(e.target.value) })}
                            disabled={isLocked}
                            className="text-sm"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={item.originalPrice || ""}
                            placeholder="0"
                            onChange={(e) => updateItem(item.id, { originalPrice: Number(e.target.value) })}
                            disabled={isLocked}
                            className="text-sm"
                          />
                        </TableCell>
                        <TableCell>
                          <select
                            value={item.category}
                            onChange={(e) => updateItem(item.id, { category: e.target.value })}
                            disabled={isLocked}
                            className="flex h-9 w-full items-center rounded-md border border-input bg-background px-3 py-1 text-sm disabled:opacity-50"
                          >
                            {CATEGORIES.map(cat => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                          </select>
                        </TableCell>
                        <TableCell>
                          {item.status === "idle" && (
                            <Badge variant="secondary">Pending</Badge>
                          )}
                          {item.status === "uploading" && (
                            <div className="w-full space-y-1">
                              <Progress value={item.progress} className="h-2" />
                              <span className="text-xs text-muted-foreground">{item.progress}%</span>
                            </div>
                          )}
                          {item.status === "success" && (
                            <div className="flex items-center gap-1 text-green-600">
                              <CheckCircle2 className="w-5 h-5" />
                              <span className="text-sm font-medium">Done</span>
                            </div>
                          )}
                          {item.status === "error" && (
                            <div className="flex items-center gap-1 text-destructive" title={item.errorMsg}>
                              <XCircle className="w-5 h-5" />
                              <span className="text-xs line-clamp-2">{item.errorMsg || "Error"}</span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeItem(item.id)}
                            disabled={item.status === "uploading"}
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* Instructions */}
        {items.length === 0 && (
          <div className="bg-card border border-border rounded-xl p-8 space-y-4">
            <h3 className="font-semibold text-lg text-foreground">How it works:</h3>
            <ol className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-3">
                <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">1</span>
                <span>Drag and drop your product images (PNG, JPG, WEBP). Filenames are auto-converted to product titles.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">2</span>
                <span>Edit the generated title, set the selling price (৳) and original price (৳), and select a category.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">3</span>
                <span>Click "Upload" — images go to Cloudinary, product data is saved to Firebase Firestore automatically.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">4</span>
                <span>Products instantly appear live on the storefront. Duplicate uploads are automatically prevented.</span>
              </li>
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}
