import React, { useState, useEffect, useMemo, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  BookOpen, Plus, Search, Edit3, Trash2, CheckCircle2,
  XCircle, Star, ExternalLink, Calendar, Clock, Image as ImageIcon,
  Upload, X, Bold, Italic, Code, Heading2, Heading3, Quote, List, Link as LinkIcon,
  Sparkles, FileText, Eye, Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  getAllBlogsAdmin, createBlogAdmin, updateBlogAdmin, deleteBlogAdmin,
  uploadBlogCoverImage, type UpsertBlogInput
} from '@/services/blogs';
import type { BlogPost } from '@/lib/database.types';
import { toast } from 'sonner';

const CATEGORIES = ['Engineering', 'AI & Research', 'Product Updates', 'Guides'];

export default function AdminBlogs() {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft'>('all');

  // Modal / Form state
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [formData, setFormData] = useState<UpsertBlogInput>({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    cover_image: '',
    author_name: 'ZYR0 Team',
    category: 'Engineering',
    tags: [],
    read_time_minutes: 5,
    is_published: false,
    is_featured: false,
  });
  const [tagsInput, setTagsInput] = useState('');
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Delete confirmation state
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const contentTextareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    loadAdminBlogs();
  }, []);

  async function loadAdminBlogs() {
    setLoading(true);
    try {
      const data = await getAllBlogsAdmin();
      setBlogs(data);
    } catch (err: any) {
      console.error('Failed to load admin blogs:', err);
      toast.error(err.message || 'Failed to fetch blogs');
    } finally {
      setLoading(false);
    }
  }

  // Summary Metrics
  const stats = useMemo(() => {
    const total = blogs.length;
    const published = blogs.filter((b) => b.is_published).length;
    const drafts = total - published;
    const totalViews = blogs.reduce((sum, b) => sum + (b.views_count || 0), 0);
    return { total, published, drafts, totalViews };
  }, [blogs]);

  const filteredBlogs = useMemo(() => {
    return blogs.filter((b) => {
      const matchSearch =
        b.title.toLowerCase().includes(search.toLowerCase()) ||
        b.slug.toLowerCase().includes(search.toLowerCase()) ||
        b.category.toLowerCase().includes(search.toLowerCase());

      if (!matchSearch) return false;
      if (filterStatus === 'published') return b.is_published;
      if (filterStatus === 'draft') return !b.is_published;
      return true;
    });
  }, [blogs, search, filterStatus]);

  const handleOpenCreate = () => {
    setCurrentId(null);
    setFormData({
      title: '',
      slug: '',
      excerpt: '',
      content: '## Introduction\n\nStart writing your dispatch here...\n\n### Architectural Approach\n\nDetail the technical system design...',
      cover_image: '',
      author_name: 'ZYR0 Team',
      category: 'Engineering',
      tags: ['Engineering', 'Architecture'],
      read_time_minutes: 5,
      is_published: false,
      is_featured: false,
    });
    setTagsInput('Engineering, Architecture');
    setActiveTab('edit');
    setIsEditing(true);
  };

  const handleOpenEdit = (post: BlogPost) => {
    setCurrentId(post.id);
    setFormData({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt || '',
      content: post.content,
      cover_image: post.cover_image || '',
      author_name: post.author_name,
      category: post.category,
      tags: post.tags || [],
      read_time_minutes: post.read_time_minutes,
      is_published: post.is_published,
      is_featured: post.is_featured,
    });
    setTagsInput((post.tags || []).join(', '));
    setActiveTab('edit');
    setIsEditing(true);
  };

  const handleAutoSlug = (title: string) => {
    const slug = title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/--+/g, '-')
      .trim();
    setFormData((prev) => ({ ...prev, slug, title }));
  };

  const handleAutoCalculateReadTime = () => {
    const words = formData.content.trim().split(/\s+/).filter(Boolean).length;
    const est = Math.max(1, Math.ceil(words / 200));
    setFormData((prev) => ({ ...prev, read_time_minutes: est }));
    toast.success(`Calculated: ~${est} min read (${words} words)`);
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file (PNG, JPG, WebP, SVG).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be under 5MB.');
      return;
    }

    setUploadingImage(true);
    try {
      const publicUrl = await uploadBlogCoverImage(file);
      setFormData((prev) => ({ ...prev, cover_image: publicUrl }));
      toast.success('Cover image uploaded successfully.');
    } catch (err: any) {
      console.error('Image upload failed:', err);
      toast.error(err.message || 'Image upload failed. You can paste an external URL instead.');
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Markdown Formatting Toolbar Injection
  const insertFormatting = (prefix: string, suffix = '') => {
    const textarea = contentTextareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const current = textarea.value;
    const selected = current.substring(start, end);

    const replacement = prefix + selected + suffix;
    const nextVal = current.substring(0, start) + replacement + current.substring(end);

    setFormData((prev) => ({ ...prev, content: nextVal }));

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, end + prefix.length);
    }, 0);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.slug.trim() || !formData.content.trim()) {
      toast.error('Title, slug, and content are required.');
      return;
    }

    setSubmitting(true);
    try {
      const parsedTags = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const payload = {
        ...formData,
        tags: parsedTags,
      };

      if (currentId) {
        await updateBlogAdmin(currentId, payload);
        toast.success('Article updated successfully');
      } else {
        await createBlogAdmin(payload);
        toast.success('Article created successfully');
      }

      setIsEditing(false);
      loadAdminBlogs();
    } catch (err: any) {
      console.error('Failed to save article:', err);
      toast.error(err.message || 'Error saving article');
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteBlogAdmin(deleteTarget.id);
      toast.success(`"${deleteTarget.title}" deleted.`);
      setBlogs((prev) => prev.filter((b) => b.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete');
    }
  };

  const handleTogglePublish = async (post: BlogPost) => {
    try {
      const updated = await updateBlogAdmin(post.id, {
        is_published: !post.is_published,
      });
      toast.success(updated.is_published ? 'Published live on /blog' : 'Reverted to draft');
      setBlogs((prev) => prev.map((b) => (b.id === post.id ? updated : b)));
    } catch (err: any) {
      toast.error(err.message || 'Failed to toggle publish status');
    }
  };

  const handleToggleFeatured = async (post: BlogPost) => {
    try {
      const updated = await updateBlogAdmin(post.id, {
        is_featured: !post.is_featured,
      });
      toast.success(updated.is_featured ? 'Marked as hero spotlight' : 'Removed from featured spot');
      setBlogs((prev) => prev.map((b) => (b.id === post.id ? updated : b)));
    } catch (err: any) {
      toast.error(err.message || 'Failed to toggle featured status');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/70 pb-5">
        <div>
          <h1 className="text-2xl font-bold font-heading text-foreground">Blog CMS Publishing</h1>
          <p className="text-xs text-muted-foreground mt-1 font-sans">
            Compose, curate, and publish technical dispatches for blog.zyroo.org & /blog.
          </p>
        </div>

        <Button onClick={handleOpenCreate} className="gap-2">
          <Plus className="w-4 h-4" /> New Article
        </Button>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-border/70 bg-card">
          <div className="text-xs font-mono uppercase text-muted-foreground">Total Dispatches</div>
          <div className="text-2xl font-bold font-heading text-foreground mt-1">{stats.total}</div>
        </div>
        <div className="p-4 rounded-xl border border-border/70 bg-card">
          <div className="text-xs font-mono uppercase text-emerald-600 dark:text-emerald-400">Published Live</div>
          <div className="text-2xl font-bold font-heading text-foreground mt-1">{stats.published}</div>
        </div>
        <div className="p-4 rounded-xl border border-border/70 bg-card">
          <div className="text-xs font-mono uppercase text-amber-600 dark:text-amber-400">Drafts</div>
          <div className="text-2xl font-bold font-heading text-foreground mt-1">{stats.drafts}</div>
        </div>
        <div className="p-4 rounded-xl border border-border/70 bg-card">
          <div className="text-xs font-mono uppercase text-primary">Total Read Views</div>
          <div className="text-2xl font-bold font-heading text-foreground mt-1">{stats.totalViews.toLocaleString()}</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="w-full sm:w-80 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Search by title, slug, category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-muted/40 border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
          />
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-muted/40 border border-border rounded-xl text-xs">
          {(['all', 'published', 'draft'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1 rounded-lg capitalize font-mono text-xs font-medium transition-colors cursor-pointer ${
                filterStatus === st
                  ? 'bg-background text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Blog Posts Table */}
      <div className="border border-border/80 rounded-xl overflow-hidden bg-card shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border/70 bg-muted/30 text-muted-foreground font-mono uppercase tracking-wider">
              <tr>
                <th className="p-4">Post Title / Slug</th>
                <th className="p-4">Category</th>
                <th className="p-4">Status</th>
                <th className="p-4">Hero Spot</th>
                <th className="p-4">Views</th>
                <th className="p-4">Published Date</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground">
                    Loading dispatches...
                  </td>
                </tr>
              ) : filteredBlogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground">
                    No articles found. Click "New Article" to create your first dispatch.
                  </td>
                </tr>
              ) : (
                filteredBlogs.map((b) => (
                  <tr key={b.id} className="hover:bg-muted/20 transition-colors">
                    <td className="p-4 max-w-sm">
                      <div className="font-semibold text-foreground truncate">{b.title}</div>
                      <div className="text-[11px] font-mono text-muted-foreground truncate">
                        /blog/{b.slug}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-muted border border-border text-foreground">
                        {b.category}
                      </span>
                    </td>
                    <td className="p-4">
                      <button
                        type="button"
                        onClick={() => handleTogglePublish(b)}
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium transition-colors cursor-pointer ${
                          b.is_published
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 hover:bg-amber-500/20'
                        }`}
                      >
                        {b.is_published ? (
                          <>
                            <CheckCircle2 className="w-3 h-3" /> Published
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3" /> Draft
                          </>
                        )}
                      </button>
                    </td>
                    <td className="p-4">
                      <button
                        type="button"
                        onClick={() => handleToggleFeatured(b)}
                        className={`p-1.5 rounded hover:bg-muted transition-colors cursor-pointer ${
                          b.is_featured ? 'text-amber-500' : 'text-muted-foreground/40'
                        }`}
                        title="Toggle Hero Spotlight"
                      >
                        <Star className={`w-4 h-4 ${b.is_featured ? 'fill-amber-500' : ''}`} />
                      </button>
                    </td>
                    <td className="p-4 font-mono text-muted-foreground">
                      {b.views_count.toLocaleString()}
                    </td>
                    <td className="p-4 text-muted-foreground font-mono">
                      {b.published_at ? new Date(b.published_at).toLocaleDateString() : '—'}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {b.is_published && (
                          <a
                            href={`/blog/${b.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-muted-foreground hover:text-foreground rounded hover:bg-muted"
                            title="View Public Article"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(b)}
                          className="p-1.5 text-muted-foreground hover:text-foreground rounded hover:bg-muted cursor-pointer"
                          title="Edit"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget({ id: b.id, title: b.title })}
                          className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-500/10 rounded cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-background border border-border rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <h3 className="font-heading font-bold text-lg text-foreground">
              Delete Article?
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground font-sans">
              Are you sure you want to permanently delete <strong className="text-foreground">"{deleteTarget.title}"</strong>? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeleteTarget(null)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={confirmDelete}
              >
                Delete Dispatch
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Editor Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
          <div className="bg-background border border-border rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between">
              <div>
                <h3 className="font-heading font-bold text-lg sm:text-xl text-foreground">
                  {currentId ? 'Edit Dispatch' : 'Compose New Dispatch'}
                </h3>
                <p className="text-xs text-muted-foreground">
                  Dual-pane Markdown writer with direct image upload & live typography preview.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center p-0.5 bg-muted/60 border border-border rounded-lg text-xs">
                  <button
                    type="button"
                    onClick={() => setActiveTab('edit')}
                    className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                      activeTab === 'edit'
                        ? 'bg-background font-semibold text-foreground shadow-xs'
                        : 'text-muted-foreground'
                    }`}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('preview')}
                    className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                      activeTab === 'preview'
                        ? 'bg-background font-semibold text-foreground shadow-xs'
                        : 'text-muted-foreground'
                    }`}
                  >
                    Preview
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted text-sm font-bold cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Row 1: Title & Slug */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Article Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => {
                      if (!currentId) {
                        handleAutoSlug(e.target.value);
                      } else {
                        setFormData((p) => ({ ...p, title: e.target.value }));
                      }
                    }}
                    placeholder="e.g., Scaling Distributed Inference in ZYR0 2.0"
                    className="w-full px-3.5 py-2 bg-muted/30 border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Slug (URL Key) *
                  </label>
                  <div className="flex items-center">
                    <span className="px-3 py-2 bg-muted/60 border border-r-0 border-border rounded-l-xl text-xs font-mono text-muted-foreground">
                      /blog/
                    </span>
                    <input
                      type="text"
                      required
                      value={formData.slug}
                      onChange={(e) => setFormData((p) => ({ ...p, slug: e.target.value }))}
                      placeholder="scaling-distributed-inference"
                      className="w-full px-3.5 py-2 bg-muted/30 border border-border rounded-r-xl text-sm font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>

              {/* Row 2: Category, Author, Read Time */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData((p) => ({ ...p, category: e.target.value }))}
                    className="w-full px-3 py-2 bg-muted/30 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">Author Name</label>
                  <input
                    type="text"
                    value={formData.author_name}
                    onChange={(e) => setFormData((p) => ({ ...p, author_name: e.target.value }))}
                    className="w-full px-3 py-2 bg-muted/30 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-foreground">Read Time (min)</label>
                    <button
                      type="button"
                      onClick={handleAutoCalculateReadTime}
                      className="text-[10px] font-mono text-primary hover:underline cursor-pointer"
                    >
                      Auto Calc
                    </button>
                  </div>
                  <input
                    type="number"
                    min={1}
                    value={formData.read_time_minutes}
                    onChange={(e) => setFormData((p) => ({ ...p, read_time_minutes: parseInt(e.target.value) || 5 }))}
                    className="w-full px-3 py-2 bg-muted/30 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Row 3: Cover Image Upload + URL */}
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Cover Image (File Upload or External URL)
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageFileChange}
                      accept="image/png,image/jpeg,image/webp,image/svg+xml"
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={uploadingImage}
                      onClick={() => fileInputRef.current?.click()}
                      className="gap-2 text-xs"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      {uploadingImage ? 'Uploading Image...' : 'Upload Cover File'}
                    </Button>
                    <span className="text-xs text-muted-foreground font-mono">Max 5MB</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="url"
                      value={formData.cover_image || ''}
                      onChange={(e) => setFormData((p) => ({ ...p, cover_image: e.target.value }))}
                      placeholder="Or paste external image URL: https://..."
                      className="w-full px-3 py-2 bg-muted/30 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    {formData.cover_image && (
                      <button
                        type="button"
                        onClick={() => setFormData((p) => ({ ...p, cover_image: '' }))}
                        className="p-1 text-muted-foreground hover:text-foreground cursor-pointer"
                        title="Clear image"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Cover Image Preview */}
                {formData.cover_image && (
                  <div className="mt-3 relative w-48 aspect-[16/9] rounded-lg overflow-hidden border border-border/80 bg-muted">
                    <img
                      src={formData.cover_image}
                      alt="Cover Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>

              {/* Row 4: Tags & Excerpt */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Tags (Comma-separated)
                  </label>
                  <input
                    type="text"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    placeholder="AI, Architecture, Performance"
                    className="w-full px-3 py-2 bg-muted/30 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Summary / Excerpt
                  </label>
                  <input
                    type="text"
                    value={formData.excerpt || ''}
                    onChange={(e) => setFormData((p) => ({ ...p, excerpt: e.target.value }))}
                    placeholder="Brief 1-2 sentence excerpt for index cards and search engines..."
                    className="w-full px-3 py-2 bg-muted/30 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Row 5: Markdown Editor with Formatting Toolbar */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-foreground">
                    Markdown Content *
                  </label>

                  {/* Formatting Toolbar */}
                  {activeTab === 'edit' && (
                    <div className="flex flex-wrap items-center gap-1 p-1 bg-muted/60 border border-border/80 rounded-lg text-xs">
                      <button
                        type="button"
                        onClick={() => insertFormatting('**', '**')}
                        title="Bold"
                        className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        <Bold className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertFormatting('*', '*')}
                        title="Italic"
                        className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        <Italic className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertFormatting('## ')}
                        title="Heading 2"
                        className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        <Heading2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertFormatting('### ')}
                        title="Heading 3"
                        className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        <Heading3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertFormatting('> ')}
                        title="Blockquote"
                        className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        <Quote className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertFormatting('`', '`')}
                        title="Inline Code"
                        className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        <Code className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertFormatting('- ')}
                        title="Bullet List"
                        className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        <List className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertFormatting('[Link Title](', ')')}
                        title="Insert Link"
                        className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        <LinkIcon className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {activeTab === 'edit' ? (
                  <textarea
                    ref={contentTextareaRef}
                    rows={14}
                    required
                    value={formData.content}
                    onChange={(e) => setFormData((p) => ({ ...p, content: e.target.value }))}
                    placeholder="# Heading 1&#10;&#10;Write your markdown content here..."
                    className="w-full p-4 bg-muted/20 border border-border rounded-xl font-mono text-xs leading-relaxed text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                ) : (
                  <div className="p-6 border border-border rounded-xl bg-card min-h-[300px] prose prose-slate dark:prose-invert max-w-none text-xs">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {formData.content}
                    </ReactMarkdown>
                  </div>
                )}
              </div>

              {/* Publication Settings */}
              <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-border">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-foreground">
                  <input
                    type="checkbox"
                    checked={formData.is_published}
                    onChange={(e) => setFormData((p) => ({ ...p, is_published: e.target.checked }))}
                    className="rounded border-border"
                  />
                  <span>Publish Immediately (Visible to Public on /blog)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-foreground">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData((p) => ({ ...p, is_featured: e.target.checked }))}
                    className="rounded border-border"
                  />
                  <span>Featured Hero Spot</span>
                </label>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={submitting}>
                  {submitting ? 'Saving...' : currentId ? 'Update Article' : 'Create Article'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
