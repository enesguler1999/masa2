import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, Image, GripVertical, X, Check, Upload, AlertCircle, Loader2 } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Table, { TableHead, TableBody, TableRow, TableHeader, TableCell } from '../common/Table';
import { bucketService } from '../../services/bucketService';
import { useUser } from '../../context/UserContext';

const BUCKET_ID = 'masaapp-public-common-bucket';

/**
 * Generic carousel slide CRUD manager.
 * Pass `service` (carouselSlideService or loginCarouselSlideService) and a `title`.
 */
export default function CarouselSlideManager({ service, title }) {
    const { user } = useUser();
    const [slides, setSlides] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Modal state
    const [modalOpen, setModalOpen] = useState(false);
    const [editingSlide, setEditingSlide] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);

    // Form state
    const [form, setForm] = useState({ slogan: '', sortOrder: '', subSlogan: '', url: '' });
    const [formError, setFormError] = useState(null);
    const [formLoading, setFormLoading] = useState(false);

    // Image upload
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [uploadingImage, setUploadingImage] = useState(false);

    const fetchSlides = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await service.list();
            const key = Object.keys(data).find(k => Array.isArray(data[k]));
            setSlides(key ? [...data[key]].sort((a, b) => a.sortOrder - b.sortOrder) : []);
        } catch (err) {
            setError(err?.response?.data?.message || 'Veriler yüklenirken hata oluştu.');
        } finally {
            setLoading(false);
        }
    }, [service]);

    useEffect(() => {
        fetchSlides();
    }, [fetchSlides]);

    const openCreate = () => {
        setEditingSlide(null);
        setForm({ slogan: '', sortOrder: String(slides.length + 1), subSlogan: '', url: '' });
        setImageFile(null);
        setImagePreview(null);
        setFormError(null);
        setModalOpen(true);
    };

    const openEdit = (slide) => {
        setEditingSlide(slide);
        setForm({
            slogan: slide.slogan || '',
            sortOrder: String(slide.sortOrder ?? ''),
            subSlogan: slide.subSlogan || '',
            url: slide.url || '',
        });
        setImageFile(null);
        setImagePreview(slide.url || null);
        setFormError(null);
        setModalOpen(true);
    };

    const handleImageChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError(null);
        setFormLoading(true);

        try {
            let imageUrl = form.url;

            // If user picked a new image, upload it first
            if (imageFile) {
                const appBucketToken = user?.applicationBucketToken;
                if (!appBucketToken) throw new Error('Uygulama bucket tokeni bulunamadı. Admin yetkiniz eksik olabilir.');

                setUploadingImage(true);
                const uploadResult = await bucketService.uploadFile(appBucketToken, BUCKET_ID, imageFile);
                setUploadingImage(false);

                if (!uploadResult?.data?.[0]?.downloadUrl) {
                    throw new Error('Görsel yüklenemedi.');
                }
                imageUrl = uploadResult.data[0].downloadUrl;
            }

            const payload = {
                slogan: form.slogan,
                sortOrder: parseInt(form.sortOrder, 10),
                subSlogan: form.subSlogan || undefined,
                url: imageUrl,
            };

            if (editingSlide) {
                await service.update(editingSlide.id, payload);
            } else {
                await service.create(payload);
            }

            setModalOpen(false);
            await fetchSlides();
        } catch (err) {
            setUploadingImage(false);
            setFormError(err?.response?.data?.message || err?.message || 'İşlem başarısız oldu.');
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setFormLoading(true);
        try {
            await service.delete(deleteTarget.id);
            setDeleteModalOpen(false);
            setDeleteTarget(null);
            await fetchSlides();
        } catch (err) {
            setFormError(err?.response?.data?.message || 'Silme işlemi başarısız.');
        } finally {
            setFormLoading(false);
        }
    };

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-bold text-zinc-900">{title}</h2>
                    <p className="text-sm text-zinc-500 mt-0.5">{slides.length} slayt</p>
                </div>
                <Button onClick={openCreate} variant="primary" size="sm">
                    <Plus size={16} className="mr-1.5" />
                    Yeni Slayt
                </Button>
            </div>

            {/* Error */}
            {error && (
                <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm mb-4">
                    <AlertCircle size={16} className="shrink-0" />
                    {error}
                </div>
            )}

            {/* Loading */}
            {loading ? (
                <div className="flex items-center justify-center py-16 text-zinc-400">
                    <Loader2 size={28} className="animate-spin mr-3" />
                    Yükleniyor...
                </div>
            ) : slides.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-zinc-400 gap-3">
                    <Image size={40} className="opacity-40" />
                    <p className="text-sm">Henüz slayt eklenmemiş.</p>
                    <Button onClick={openCreate} variant="secondary" size="sm">
                        <Plus size={14} className="mr-1" /> İlk slaytı ekle
                    </Button>
                </div>
            ) : (
                <Table>
                    <TableHead>
                        <tr>
                            <TableHeader className="w-12">#</TableHeader>
                            <TableHeader className="w-20">Görsel</TableHeader>
                            <TableHeader>Slogan</TableHeader>
                            <TableHeader>Alt Slogan</TableHeader>
                            <TableHeader className="w-24 text-center">Sıra</TableHeader>
                            <TableHeader className="w-28 text-right">İşlemler</TableHeader>
                        </tr>
                    </TableHead>
                    <TableBody>
                        {slides.map((slide, idx) => (
                            <TableRow key={slide.id}>
                                <TableCell className="text-zinc-400 font-mono text-xs">{idx + 1}</TableCell>
                                <TableCell>
                                    {slide.url ? (
                                        <img
                                            src={slide.url}
                                            alt={slide.slogan}
                                            className="w-16 h-10 object-cover rounded-lg border border-zinc-100 shadow-sm"
                                        />
                                    ) : (
                                        <div className="w-16 h-10 bg-zinc-100 rounded-lg flex items-center justify-center">
                                            <Image size={16} className="text-zinc-400" />
                                        </div>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <span className="font-semibold text-zinc-900">{slide.slogan}</span>
                                </TableCell>
                                <TableCell>
                                    <span className="text-zinc-500 text-sm">{slide.subSlogan || '—'}</span>
                                </TableCell>
                                <TableCell className="text-center">
                                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-zinc-100 text-zinc-700 font-bold text-sm">
                                        {slide.sortOrder}
                                    </span>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-1">
                                        <button
                                            onClick={() => openEdit(slide)}
                                            className="p-2 rounded-lg hover:bg-zinc-100 text-zinc-600 hover:text-zinc-900 transition-colors"
                                            title="Düzenle"
                                        >
                                            <Pencil size={15} />
                                        </button>
                                        <button
                                            onClick={() => { setDeleteTarget(slide); setDeleteModalOpen(true); }}
                                            className="p-2 rounded-lg hover:bg-red-50 text-zinc-600 hover:text-red-600 transition-colors"
                                            title="Sil"
                                        >
                                            <Trash2 size={15} />
                                        </button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}

            {/* Create / Edit Modal */}
            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={editingSlide ? 'Slaytı Düzenle' : 'Yeni Slayt Ekle'}
                footer={
                    <>
                        <Button variant="secondary" size="sm" onClick={() => setModalOpen(false)} disabled={formLoading}>
                            İptal
                        </Button>
                        <Button variant="primary" size="sm" onClick={handleSubmit} disabled={formLoading}>
                            {formLoading ? (
                                <><Loader2 size={14} className="animate-spin mr-1.5" />{uploadingImage ? 'Görsel yükleniyor...' : 'Kaydediliyor...'}</>
                            ) : (
                                <><Check size={14} className="mr-1.5" />{editingSlide ? 'Güncelle' : 'Oluştur'}</>
                            )}
                        </Button>
                    </>
                }
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    {formError && (
                        <div className="flex items-center gap-2 px-3 py-2.5 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                            <AlertCircle size={14} className="shrink-0" />
                            {formError}
                        </div>
                    )}

                    {/* Image upload */}
                    <div>
                        <label className="block text-sm font-semibold text-zinc-700 mb-2">Slayt Görseli</label>
                        <div className="flex items-start gap-4">
                            {imagePreview ? (
                                <div className="relative group">
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        className="w-32 h-20 object-cover rounded-xl border border-zinc-200 shadow-sm"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => { setImagePreview(null); setImageFile(null); setForm(f => ({ ...f, url: '' })); }}
                                        className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X size={11} />
                                    </button>
                                </div>
                            ) : (
                                <div className="w-32 h-20 bg-zinc-100 rounded-xl border-2 border-dashed border-zinc-300 flex items-center justify-center">
                                    <Image size={22} className="text-zinc-400" />
                                </div>
                            )}
                            <div className="flex-1">
                                <label className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white text-sm font-semibold rounded-lg cursor-pointer hover:bg-zinc-700 transition-colors w-fit">
                                    <Upload size={14} />
                                    Görsel Seç
                                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                                </label>
                                <p className="text-xs text-zinc-400 mt-2">PNG, JPG, WebP — maks. 5 MB</p>
                                <p className="text-xs text-zinc-400 mt-0.5">Yüklemeden URL de girebilirsiniz.</p>
                            </div>
                        </div>
                    </div>

                    {/* URL (manual) */}
                    <div>
                        <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Görsel URL <span className="text-zinc-400 font-normal">(veya yukarıdan yükleyin)</span></label>
                        <input
                            type="url"
                            value={form.url}
                            onChange={e => { setForm(f => ({ ...f, url: e.target.value })); setImagePreview(e.target.value || null); setImageFile(null); }}
                            placeholder="https://..."
                            className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 transition"
                        />
                    </div>

                    {/* Slogan */}
                    <div>
                        <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Slogan <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            value={form.slogan}
                            onChange={e => setForm(f => ({ ...f, slogan: e.target.value }))}
                            required
                            placeholder="Ana başlık metni"
                            className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 transition"
                        />
                    </div>

                    {/* Sub Slogan */}
                    <div>
                        <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Alt Slogan <span className="text-zinc-400 font-normal">(opsiyonel)</span></label>
                        <input
                            type="text"
                            value={form.subSlogan}
                            onChange={e => setForm(f => ({ ...f, subSlogan: e.target.value }))}
                            placeholder="Alt açıklama metni"
                            className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 transition"
                        />
                    </div>

                    {/* Sort Order */}
                    <div>
                        <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Sıra <span className="text-red-500">*</span></label>
                        <input
                            type="number"
                            min="1"
                            value={form.sortOrder}
                            onChange={e => setForm(f => ({ ...f, sortOrder: e.target.value }))}
                            required
                            className="w-28 px-4 py-2.5 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 transition"
                        />
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={deleteModalOpen}
                onClose={() => { setDeleteModalOpen(false); setDeleteTarget(null); }}
                title="Slaytı Sil"
                footer={
                    <>
                        <Button variant="secondary" size="sm" onClick={() => { setDeleteModalOpen(false); setDeleteTarget(null); }} disabled={formLoading}>
                            İptal
                        </Button>
                        <Button variant="danger" size="sm" onClick={handleDelete} disabled={formLoading}>
                            {formLoading ? <Loader2 size={14} className="animate-spin mr-1.5" /> : <Trash2 size={14} className="mr-1.5" />}
                            Sil
                        </Button>
                    </>
                }
            >
                <p className="text-sm text-zinc-600">
                    <strong className="text-zinc-900">"{deleteTarget?.slogan}"</strong> slaytını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
                </p>
            </Modal>
        </div>
    );
}
