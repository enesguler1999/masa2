import React, { useState } from 'react';
import Layout from '../components/layout/Layout';
import Button from '../components/common/Button';
import Card, { CardHeader, CardFooter } from '../components/common/Card';
import Input from '../components/forms/Input';
import Badge from '../components/common/Badge';
import Avatar from '../components/common/Avatar';
import Modal from '../components/common/Modal';
import Table, { TableHead, TableBody, TableRow, TableHeader, TableCell } from '../components/common/Table';
import SearchBar from '../components/forms/SearchBar';
import Slider from '../components/forms/Slider';
import Checkbox from '../components/forms/Checkbox';
import MasaSpinner from '../components/common/MasaSpinner';
import { useToast } from '../components/common/Toast';

function ComponentsPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [sliderValue, setSliderValue] = useState(50);
    const [searchValue, setSearchValue] = useState('');
    const [cbDefault, setCbDefault] = useState(false);
    const [cbChecked, setCbChecked] = useState(true);
    const [cbSmall, setCbSmall] = useState(false);
    const [cbLarge, setCbLarge] = useState(false);
    const [cbError, setCbError] = useState(false);
    const { showToast } = useToast();

    return (
        <Layout>

            {/* ── Toast Notifications section ── */}
            <section className="mb-10">
                <h2 className="text-2xl font-bold mb-6">Toast Notifications</h2>
                <Card className="space-y-4">
                    <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Variant'lar</p>
                    <div className="flex flex-wrap gap-3">
                        <Button
                            size="sm"
                            onClick={() => showToast({ message: 'İşlem başarıyla tamamlandı!', variant: 'success' })}
                            className="!bg-green-500 hover:!bg-green-600"
                        >
                            ✅ Success
                        </Button>
                        <Button
                            size="sm"
                            onClick={() => showToast({ message: 'Bir hata oluştu. Lütfen tekrar deneyin.', variant: 'error' })}
                            className="!bg-red-500 hover:!bg-red-600"
                        >
                            ❌ Error
                        </Button>
                        <Button
                            size="sm"
                            onClick={() => showToast({ message: 'Bu işlemi yapmak üzerinizsiniz, dikkat edin!', variant: 'warning' })}
                            className="!bg-yellow-400 hover:!bg-yellow-500 !text-zinc-900"
                        >
                            ⚠️ Warning
                        </Button>
                        <Button
                            size="sm"
                            onClick={() => showToast({ message: 'Yeni bir güncelleme mevcut.', variant: 'info' })}
                            className="!bg-blue-500 hover:!bg-blue-600"
                        >
                            ℹ️ Info
                        </Button>
                    </div>
                    <div className="w-full h-px bg-neutral-100" />
                    <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Uzun süre (8sn)</p>
                    <div className="flex flex-wrap gap-3">
                        <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => showToast({ message: 'Bu bildirim 8 saniye görünür kalır.', variant: 'info', duration: 8000 })}
                        >
                            8 sn Toast
                        </Button>
                        <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => {
                                showToast({ message: 'Birinci bildirim!', variant: 'success', duration: 5000 });
                                setTimeout(() => showToast({ message: 'İkinci bildirim!', variant: 'warning', duration: 5000 }), 600);
                                setTimeout(() => showToast({ message: 'Üçüncü bildirim!', variant: 'error', duration: 5000 }), 1200);
                            }}
                        >
                            Çoklu Toast
                        </Button>
                    </div>
                </Card>
            </section>

            {/* ── Spinners & Loaders section (full width) ── */}
            <section className="mb-10">
                <h2 className="text-2xl font-bold mb-6">Spinners & Loaders</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Dark variant */}
                    <Card className="flex flex-col gap-4">
                        <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Dark (light bg)</p>
                        <div className="flex items-end justify-around gap-6 py-4">
                            <div className="flex flex-col items-center gap-3">
                                <MasaSpinner size={56} color="#18181b" />
                                <span className="text-xs text-zinc-400 font-mono">56px</span>
                            </div>
                            <div className="flex flex-col items-center gap-3">
                                <MasaSpinner size={80} color="#18181b" />
                                <span className="text-xs text-zinc-400 font-mono">80px</span>
                            </div>
                            <div className="flex flex-col items-center gap-3">
                                <MasaSpinner size={112} color="#18181b" />
                                <span className="text-xs text-zinc-400 font-mono">112px</span>
                            </div>
                        </div>
                    </Card>

                    {/* Light variant */}
                    <Card noPadding>
                        <div className="rounded-2xl bg-zinc-900 p-6 h-full flex flex-col gap-4">
                            <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Light (dark bg)</p>
                            <div className="flex items-end justify-around gap-6 py-4">
                                <div className="flex flex-col items-center gap-3">
                                    <MasaSpinner size={56} light />
                                    <span className="text-xs text-zinc-500 font-mono">56px</span>
                                </div>
                                <div className="flex flex-col items-center gap-3">
                                    <MasaSpinner size={80} light />
                                    <span className="text-xs text-zinc-500 font-mono">80px</span>
                                </div>
                                <div className="flex flex-col items-center gap-3">
                                    <MasaSpinner size={112} light />
                                    <span className="text-xs text-zinc-500 font-mono">112px</span>
                                </div>
                            </div>
                        </div>
                    </Card>

                </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Typography & Buttons Section */}
                <div className="space-y-8">
                    <section>
                        <h2 className="text-2xl font-bold mb-6">Buttons</h2>
                        <Card className="flex flex-wrap gap-4 items-center">
                            <Button>Primary Button</Button>
                            <Button variant="secondary">Secondary</Button>
                            <Button variant="ghost">Ghost</Button>
                            <Button variant="danger">Danger</Button>
                            <div className="w-full h-px bg-neutral-100 my-2"></div>
                            <Button size="sm">Small</Button>
                            <Button size="md">Medium</Button>
                            <Button size="lg">Large</Button>
                        </Card>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-6">Badges & Avatars</h2>
                        <Card className="space-y-6">
                            <div className="flex flex-wrap gap-3">
                                <Badge variant="neutral">Neutral</Badge>
                                <Badge variant="primary">Primary</Badge>
                                <Badge variant="success">Success</Badge>
                                <Badge variant="warning">Warning</Badge>
                                <Badge variant="danger">Danger</Badge>
                            </div>
                            <div className="flex items-center gap-4">
                                <Avatar size="sm" alt="User" />
                                <Avatar size="md" alt="Admin" />
                                <Avatar size="lg" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=64&h=64" />
                                <Avatar size="xl" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=128&h=128" />
                            </div>
                        </Card>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-6">Overlays & Data</h2>
                        <Card className="space-y-6">
                            <div>
                                <h3 className="text-lg font-bold mb-2">Modal</h3>
                                <Button onClick={() => setIsModalOpen(true)}>Open Modal</Button>
                            </div>

                            <div>
                                <h3 className="text-lg font-bold mb-2">Table</h3>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableHeader>Name</TableHeader>
                                            <TableHeader>Role</TableHeader>
                                            <TableHeader>Status</TableHeader>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        <TableRow>
                                            <TableCell>Jane Cooper</TableCell>
                                            <TableCell>Admin</TableCell>
                                            <TableCell><Badge variant="success">Active</Badge></TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>Cody Fisher</TableCell>
                                            <TableCell>User</TableCell>
                                            <TableCell><Badge variant="neutral">Offline</Badge></TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </div>
                        </Card>
                    </section>
                </div>

                {/* Forms Section */}
                <div className="space-y-8">
                    <section>
                        <h2 className="text-2xl font-bold mb-6">Forms</h2>
                        <Card className="space-y-6">
                            <div className="flex flex-col gap-4">
                                <h3 className="text-lg font-bold">Inputs</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Input label="First Name" placeholder="John" />
                                    <Input label="Last Name" placeholder="Doe" />
                                </div>
                                <Input label="Email Address" type="email" placeholder="john@example.com" />
                            </div>

                            <div className="flex flex-col gap-4 pt-4 border-t border-neutral-100">
                                <h3 className="text-lg font-bold">Search & Selection</h3>
                                <SearchBar
                                    placeholder="Search users..."
                                    value={searchValue}
                                    onChange={(e) => setSearchValue(e.target.value)}
                                />

                                <Slider
                                    label="Volume Control"
                                    value={sliderValue}
                                    onChange={(e) => setSliderValue(parseInt(e.target.value))}
                                    min={0}
                                    max={100}
                                />
                            </div>

                            <div className="flex flex-col gap-4 pt-4 border-t border-neutral-100">
                                <h3 className="text-lg font-bold">Checkboxes</h3>
                                <div className="flex flex-col gap-3">
                                    <Checkbox
                                        id="cb-demo-default"
                                        checked={cbDefault}
                                        onChange={(e) => setCbDefault(e.target.checked)}
                                        label="Varsayılan checkbox (md)"
                                    />
                                    <Checkbox
                                        id="cb-demo-checked"
                                        checked={cbChecked}
                                        onChange={(e) => setCbChecked(e.target.checked)}
                                        label="Başlangıçta işaretli"
                                    />
                                    <Checkbox
                                        id="cb-demo-small"
                                        size="sm"
                                        checked={cbSmall}
                                        onChange={(e) => setCbSmall(e.target.checked)}
                                        label="Küçük boyut (sm)"
                                    />
                                    <Checkbox
                                        id="cb-demo-large"
                                        size="lg"
                                        checked={cbLarge}
                                        onChange={(e) => setCbLarge(e.target.checked)}
                                        label="Büyük boyut (lg)"
                                    />
                                    <Checkbox
                                        id="cb-demo-error"
                                        checked={cbError}
                                        onChange={(e) => setCbError(e.target.checked)}
                                        error={!cbError ? 'Bu alanı onaylamanız zorunludur.' : ''}
                                        label={
                                            <span>
                                                <a href="#" className="underline underline-offset-2 hover:text-zinc-900 transition-colors">Kullanım Koşulları</a>'nı kabul ediyorum.
                                            </span>
                                        }
                                    />
                                    <Checkbox
                                        id="cb-demo-disabled"
                                        checked={false}
                                        disabled
                                        label="Devre dışı checkbox"
                                    />
                                </div>
                            </div>

                            <div className="pt-2">
                                <Button className="w-full">Submit Form</Button>
                            </div>
                        </Card>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-6">Cards</h2>
                        <Card noPadding>
                            <img
                                src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80"
                                alt="Card Header"
                                className="w-full h-48 object-cover"
                            />
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <Badge variant="primary" className="mb-2">New</Badge>
                                        <h3 className="text-xl font-bold">Modern Loft Design</h3>
                                    </div>
                                    <span className="text-lg font-bold">$1,200</span>
                                </div>
                                <p className="text-neutral-500 mb-6">
                                    Experience modern living in this beautifully designed loft space, featuring high ceilings and natural light.
                                </p>
                                <div className="flex gap-2">
                                    <Button variant="secondary" className="flex-1">Details</Button>
                                    <Button className="flex-1">Book Now</Button>
                                </div>
                            </div>
                        </Card>
                    </section>
                </div>

            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Example Modal"
                footer={
                    <>
                        <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button onClick={() => setIsModalOpen(false)}>Confirm</Button>
                    </>
                }
            >
                <p className="text-neutral-600">
                    This is an example modal component. It uses React Portal to render the overlay at the root level of the document body.
                </p>
            </Modal>

        </Layout>
    );
}

export default ComponentsPage;
