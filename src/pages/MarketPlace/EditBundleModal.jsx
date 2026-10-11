import React, { useEffect, useMemo, useState } from "react";
import { Modal, Button, Form, Badge, Spinner } from "react-bootstrap";
import API from "../../API";
import { toast } from "react-toastify";

const getId = (c) => String(c?._id || c);

const EditBundleModal = ({ show, bundle, onHide, onUpdated }) => {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [selectedIds, setSelectedIds] = useState([]);

    const [myComics, setMyComics] = useState([]);
    const [loadingComics, setLoadingComics] = useState(false);
    const [comicSearch, setComicSearch] = useState("");
    const [saving, setSaving] = useState(false);

    const isPublished = bundle?.status === "published";
    const originalIds = useMemo(
        () => (bundle?.comics || []).map(getId),
        [bundle]
    );

    // Modal khulte hi form fill + teacher ki comics load
    useEffect(() => {
        if (!show || !bundle) return;

        setTitle(bundle.title || "");
        setDescription(bundle.description || "");
        setPrice(bundle.price ?? "");
        setSelectedIds(originalIds);
        setComicSearch("");

        const loadComics = async () => {
            try {
                setLoadingComics(true);
                const { data } = await API.get("/user/getMyComicsForBundle");
                setMyComics(data.data || []);
            } catch (err) {
                console.log(err);
                toast.error("Failed to load your comics");
            } finally {
                setLoadingComics(false);
            }
        };

        loadComics();
    }, [show, bundle, originalIds]);

    const isLocked = (id) => isPublished && originalIds.includes(id);

    // id -> comic lookup
    const comicMap = useMemo(
        () => new Map(myComics.map((c) => [getId(c), c])),
        [myComics]
    );

    // Bundle ka concept FIXED hai = bundle me pehle se jo comics hain unka concept
    const bundleConcept = useMemo(() => {
        for (const id of originalIds) {
            const c = comicMap.get(id);
            if (c) return c.conceptName;
        }
        return null;
    }, [originalIds, comicMap]);

    // Sirf isi concept ki approved comics dikhani hain
    // (jo comics pehle se bundle me hain wo hamesha dikhengi)
    const eligibleComics = useMemo(
        () =>
            myComics.filter((c) => {
                const id = getId(c);
                if (originalIds.includes(id)) return true;
                if (c.status !== "approved") return false;
                return !bundleConcept || c.conceptName === bundleConcept;
            }),
        [myComics, originalIds, bundleConcept]
    );

    const toggleComic = (id) => {
        if (isLocked(id)) return;
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    };

    // Search + selected comics upar
    const visibleComics = useMemo(() => {
        const term = comicSearch.trim().toLowerCase();
        return eligibleComics
            .filter((c) => {
                if (!term) return true;
                return (
                    c.title?.toLowerCase().includes(term) ||
                    c.subjectName?.toLowerCase().includes(term) ||
                    c.conceptName?.toLowerCase().includes(term)
                );
            })
            .sort((a, b) => {
                const aSel = selectedIds.includes(getId(a)) ? 0 : 1;
                const bSel = selectedIds.includes(getId(b)) ? 0 : 1;
                return aSel - bSel;
            });
        // selectedIds ko dependency me nahi rakha taaki click karte hi list jump na kare
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [eligibleComics, comicSearch]);

    const handleSave = async () => {
        if (!title.trim()) return toast.error("Title is required");

        const priceNumber = Number(price);
        if (!Number.isFinite(priceNumber) || priceNumber <= 0) {
            return toast.error("Price must be greater than 0");
        }

        if (selectedIds.length === 0) {
            return toast.error("Select at least one comic");
        }

        const wrongConcept = selectedIds.some((id) => {
            const c = comicMap.get(id);
            return bundleConcept && c && c.conceptName !== bundleConcept;
        });
        if (wrongConcept) {
            return toast.error(`Only ${bundleConcept} comics can be added to this bundle`);
        }

        try {
            setSaving(true);
            const { data } = await API.put(`/user/updateBundle/${bundle._id}`, {
                title: title.trim(),
                description,
                price: priceNumber,
                comics: selectedIds,
            });

            if (!data.error) {
                toast.success(data.message || "Bundle updated");
                onUpdated?.(data.data);
                onHide();
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to update bundle");
        } finally {
            setSaving(false);
        }
    };

    const addedCount = selectedIds.filter((id) => !originalIds.includes(id)).length;
    const removedCount = originalIds.filter((id) => !selectedIds.includes(id)).length;

    return (
        <Modal show={show} onHide={saving ? undefined : onHide} centered size="lg" scrollable>
            <Modal.Header closeButton className="border-0">
                <Modal.Title className="d-flex align-items-center">
                    <i className="bi bi-pencil-square text-primary me-2 fs-3"></i>
                    Edit bundle
                </Modal.Title>
            </Modal.Header>

            <Modal.Body>
                {/* Details */}
                <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold">Title</Form.Label>
                    <Form.Control
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Bundle title"
                    />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold">Description</Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={3}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="What's inside this bundle?"
                    />
                </Form.Group>

                <Form.Group className="mb-4" style={{ maxWidth: 200 }}>
                    <Form.Label className="fw-semibold">Price ($)</Form.Label>
                    <Form.Control
                        type="number"
                        min="0"
                        step="0.01"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                    />
                </Form.Group>

                {/* Comics */}
                <div className="d-flex justify-content-between align-items-center mb-2">
                    <Form.Label className="fw-semibold mb-0">Comics in this bundle</Form.Label>
                    <div className="small text-muted">
                        {selectedIds.length} selected
                        {addedCount > 0 && <span className="text-success ms-2">+{addedCount} new</span>}
                        {removedCount > 0 && <span className="text-danger ms-2">−{removedCount} removed</span>}
                    </div>
                </div>

                {bundleConcept && (
                    <div className="small text-success mb-2">
                        <i className="bi bi-tag me-1"></i>
                        Concept: <strong>{bundleConcept}</strong>
                        <span className="text-muted ms-2">
                            Only approved comics from this concept are shown.
                        </span>
                    </div>
                )}

                {isPublished && (
                    <div className="alert alert-info py-2 small mb-2">
                        <i className="bi bi-lock-fill me-1"></i>
                        This bundle is published. You can add comics, but existing ones stay so buyers keep access.
                    </div>
                )}

                <Form.Control
                    className="mb-2"
                    placeholder="Search your comics by title, subject or concept"
                    value={comicSearch}
                    onChange={(e) => setComicSearch(e.target.value)}
                />

                <div className="border rounded-3" style={{ maxHeight: 340, overflowY: "auto" }}>
                    {loadingComics ? (
                        <div className="text-center py-4">
                            <Spinner animation="border" size="sm" className="me-2" />
                            Loading your comics...
                        </div>
                    ) : visibleComics.length === 0 ? (
                        <div className="text-center text-muted py-4">
                            {eligibleComics.length === 0
                                ? `You don't have any approved ${bundleConcept || ""} comics yet.`
                                : "No comics match this search."}
                        </div>
                    ) : (
                        visibleComics.map((comic) => {
                            const id = getId(comic);
                            const checked = selectedIds.includes(id);
                            const locked = isLocked(id);

                            return (
                                <label
                                    key={id}
                                    htmlFor={`comic-${id}`}
                                    className={`d-flex align-items-center gap-3 px-3 py-2 border-bottom ${checked ? "bg-light" : ""}`}
                                    style={{ cursor: locked ? "not-allowed" : "pointer" }}
                                >
                                    <Form.Check
                                        id={`comic-${id}`}
                                        type="checkbox"
                                        checked={checked}
                                        disabled={locked}
                                        onChange={() => toggleComic(id)}
                                    />

                                    {comic.thumbnail ? (
                                        <img
                                            src={comic.thumbnail}
                                            alt=""
                                            width={48}
                                            height={48}
                                            className="rounded"
                                            style={{ objectFit: "cover" }}
                                        />
                                    ) : (
                                        <div
                                            className="rounded bg-secondary-subtle d-flex align-items-center justify-content-center"
                                            style={{ width: 48, height: 48 }}
                                        >
                                            <i className="bi bi-image text-muted"></i>
                                        </div>
                                    )}

                                    <div className="flex-grow-1 min-w-0">
                                        <div className="fw-semibold text-truncate">{comic.title}</div>
                                        <div className="small text-muted text-truncate">
                                            {comic.subjectName} / {comic.conceptName}
                                        </div>
                                    </div>

                                    {locked && (
                                        <Badge bg="secondary">
                                            <i className="bi bi-lock-fill me-1"></i>In bundle
                                        </Badge>
                                    )}
                                </label>
                            );
                        })
                    )}
                </div>
            </Modal.Body>

            <Modal.Footer className="border-0">
                <Button variant="secondary" onClick={onHide} disabled={saving}>
                    Cancel
                </Button>
                <Button variant="primary" onClick={handleSave} disabled={saving || loadingComics} className="px-4">
                    {saving ? (
                        <>
                            <span className="spinner-border spinner-border-sm me-2"></span>
                            Saving...
                        </>
                    ) : (
                        <>
                            <i className="bi bi-check2 me-2"></i>
                            Save changes
                        </>
                    )}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default EditBundleModal;