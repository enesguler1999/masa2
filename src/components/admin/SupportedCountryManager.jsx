import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, Globe, Check, AlertCircle, Loader2, Hash, X } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Table, { TableHead, TableBody, TableRow, TableHeader, TableCell } from '../common/Table';
import { supportedCountryService } from '../../services/masaSettingsService';

export default function SupportedCountryManager() {
    const [countries, setCountries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Modal state
    const [modalOpen, setModalOpen] = useState(false);
    const [editingCountry, setEditingCountry] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);

    // Form state
    const [form, setForm] = useState({ code: '', country: '', sortOrder: '' });
    const [formError, setFormError] = useState(null);
    const [formLoading, setFormLoading] = useState(false);

    const fetchCountries = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await supportedCountryService.list();
            const list = data?.supportedCountries || [];
            setCountries([...list].sort((a, b) => a.sortOrder - b.sortOrder));
        } catch (err) {
            setError(err?.response?.data?.message || 'Veriler yüklenirken hata oluştu.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCountries();
    }, [fetchCountries]);

    const openCreate = () => {
        setEditingCountry(null);
        setForm({ code: '+', country: '', sortOrder: String(countries.length + 1) });
        setFormError(null);
        setModalOpen(true);
    };

    const openEdit = (country) => {
        setEditingCountry(country);
        setForm({
            code: country.code || '',
            country: country.country || '',
            sortOrder: String(country.sortOrder ?? ''),
        });
        setFormError(null);
        setModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError(null);
        setFormLoading(true);

        try {
            const payload = {
                code: form.code,
                country: form.country,
                sortOrder: parseInt(form.sortOrder, 10),
            };

            if (editingCountry) {
                await supportedCountryService.update(editingCountry.id, payload);
            } else {
                await supportedCountryService.create(payload);
            }

            setModalOpen(false);
            await fetchCountries();
        } catch (err) {
            setFormError(err?.response?.data?.message || err?.message || 'İşlem başarısız oldu.');
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setFormLoading(true);
        try {
            await supportedCountryService.delete(deleteTarget.id);
            setDeleteModalOpen(false);
            setDeleteTarget(null);
            await fetchCountries();
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
                    <h2 className="text-xl font-bold text-zinc-900">Desteklenen Ülkeler</h2>
                    <p className="text-sm text-zinc-500 mt-0.5">{countries.length} ülke / alan kodu</p>
                </div>
                <Button onClick={openCreate} variant="primary" size="sm">
                    <Plus size={16} className="mr-1.5" />
                    Yeni Ülke
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
            ) : countries.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-zinc-400 gap-3">
                    <Globe size={40} className="opacity-40" />
                    <p className="text-sm">Henüz ülke eklenmemiş.</p>
                    <Button onClick={openCreate} variant="secondary" size="sm">
                        <Plus size={14} className="mr-1" /> İlk ülkeyi ekle
                    </Button>
                </div>
            ) : (
                <Table>
                    <TableHead>
                        <tr>
                            <TableHeader className="w-12">#</TableHeader>
                            <TableHeader className="w-28">Alan Kodu</TableHeader>
                            <TableHeader>Ülke Adı</TableHeader>
                            <TableHeader className="w-24 text-center">Sıra</TableHeader>
                            <TableHeader className="w-28 text-right">İşlemler</TableHeader>
                        </tr>
                    </TableHead>
                    <TableBody>
                        {countries.map((country, idx) => (
                            <TableRow key={country.id}>
                                <TableCell className="text-zinc-400 font-mono text-xs">{idx + 1}</TableCell>
                                <TableCell>
                                    <span className="inline-flex items-center px-2.5 py-1 bg-zinc-900 text-white text-sm font-bold rounded-lg font-mono">
                                        {country.code}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <Globe size={15} className="text-zinc-400" />
                                        <span className="font-semibold text-zinc-900">{country.country}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-center">
                                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-zinc-100 text-zinc-700 font-bold text-sm">
                                        {country.sortOrder}
                                    </span>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-1">
                                        <button
                                            onClick={() => openEdit(country)}
                                            className="p-2 rounded-lg hover:bg-zinc-100 text-zinc-600 hover:text-zinc-900 transition-colors"
                                            title="Düzenle"
                                        >
                                            <Pencil size={15} />
                                        </button>
                                        <button
                                            onClick={() => { setDeleteTarget(country); setDeleteModalOpen(true); }}
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
                title={editingCountry ? 'Ülkeyi Düzenle' : 'Yeni Ülke Ekle'}
                footer={
                    <>
                        <Button variant="secondary" size="sm" onClick={() => setModalOpen(false)} disabled={formLoading}>
                            İptal
                        </Button>
                        <Button variant="primary" size="sm" onClick={handleSubmit} disabled={formLoading}>
                            {formLoading ? (
                                <><Loader2 size={14} className="animate-spin mr-1.5" />Kaydediliyor...</>
                            ) : (
                                <><Check size={14} className="mr-1.5" />{editingCountry ? 'Güncelle' : 'Oluştur'}</>
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

                    {/* Code */}
                    <div>
                        <label className="block text-sm font-semibold text-zinc-700 mb-1.5">
                            Alan Kodu <span className="text-red-500">*</span>
                            <span className="text-zinc-400 font-normal ml-1">(örn: +90, +1)</span>
                        </label>
                        <div className="relative">
                            <Hash size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                            <input
                                type="text"
                                value={form.code}
                                onChange={e => setForm(f => ({ ...f, code: e.target.value }))}
                                required
                                placeholder="+90"
                                className="w-full pl-9 pr-4 py-2.5 border border-zinc-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-zinc-900 transition"
                            />
                        </div>
                    </div>

                    {/* Country Name */}
                    <div>
                        <label className="block text-sm font-semibold text-zinc-700 mb-1.5">
                            Ülke Adı <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <Globe size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                            <input
                                type="text"
                                value={form.country}
                                onChange={e => setForm(f => ({ ...f, country: e.target.value }))}
                                required
                                placeholder="Türkiye"
                                className="w-full pl-9 pr-4 py-2.5 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 transition"
                            />
                        </div>
                    </div>

                    {/* Sort Order */}
                    <div>
                        <label className="block text-sm font-semibold text-zinc-700 mb-1.5">
                            Sıra <span className="text-red-500">*</span>
                        </label>
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
                title="Ülkeyi Sil"
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
                    <strong className="text-zinc-900">{deleteTarget?.country} ({deleteTarget?.code})</strong> ülkesini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
                </p>
            </Modal>
        </div>
    );
}
