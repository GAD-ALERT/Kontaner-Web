import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CheckCircle2, CloudUpload, Sparkles, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { streamTags, planTagsFor } from '../lib/fakeAI';
import { useDominantColors } from '../hooks/useDominantColors';
import { modalSpring } from '../lib/motion';
import { useLibrary } from '../stores/library';
import { useAuth } from '../stores/auth';
import { useNotifications } from '../stores/notifications';
import { toast } from '../stores/toast';
import type { Asset, AssetFormat, AssetType, VisualClass } from '../types';

type UploadStage = 'idle' | 'uploading' | 'processing' | 'tagging' | 'done';

interface RecentUpload {
  name: string;
  size: string;
  time: string;
  visual: string;
}

interface Step {
  n: number;
  title: string;
  body: string;
}

const seedRecentUploads: readonly RecentUpload[] = [
  { name: 'kente_pattern_01.jpg',   size: '3.4 MB',  time: '2 MINS AGO',  visual: 'visual-kente' },
  { name: 'art_supplies_set.png',   size: '8.1 MB',  time: '15 MINS AGO', visual: 'visual-studio' },
  { name: 'accra_modern_arch.tiff', size: '42.5 MB', time: '1 HOUR AGO',  visual: 'visual-architecture' },
] as const;

const visualPool: VisualClass[] = [
  'visual-kente',
  'visual-market',
  'visual-portrait',
  'visual-village',
  'visual-textile',
  'visual-city',
  'visual-palms',
  'visual-illustration',
  'visual-baskets',
  'visual-gold',
  'visual-studio',
  'visual-architecture',
];

function inferTypeFromMime(mime: string): AssetType {
  if (mime.startsWith('video/')) return 'VIDEO';
  if (mime.includes('illustrator') || mime.includes('svg')) return 'GRAPHIC';
  return 'PHOTO';
}

function inferFormatFromName(name: string, mime: string): AssetFormat {
  const ext = name.split('.').pop()?.toUpperCase() ?? '';
  if (['JPG', 'JPEG'].includes(ext)) return 'JPG';
  if (ext === 'PNG') return 'PNG';
  if (ext === 'WEBP') return 'WEBP';
  if (ext === 'TIFF' || ext === 'TIF') return 'TIFF';
  if (ext === 'MP4') return 'MP4';
  if (ext === 'AI') return 'AI';
  if (ext === 'OBJ') return 'OBJ';
  if (ext === 'RAW') return 'RAW';
  if (mime === 'image/png') return 'PNG';
  if (mime.startsWith('video/')) return 'MP4';
  return 'JPG';
}

function pickVisual(seed: string): VisualClass {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  return visualPool[Math.abs(h) % visualPool.length];
}

const steps: readonly Step[] = [
  {
    n: 1,
    title: 'Upload high-res files',
    body: 'Up to 100 MB per file to maintain quality for print and digital use.',
  },
  {
    n: 2,
    title: 'AI Processing',
    body: 'The engine identifies patterns, colors, and Ghanaian cultural contexts for tagging.',
  },
  {
    n: 3,
    title: 'Organize & Share',
    body: "Add to specific collections like 'Accra Street Life' or 'Kente Weaving'.",
  },
] as const;

function formatBytes(b: number): string {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1024 / 1024).toFixed(1)} MB`;
}

export function Upload() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const navigate = useNavigate();
  const user = useAuth((s) => s.user);
  const addUpload = useLibrary((s) => s.addUpload);
  const removeUpload = useLibrary((s) => s.removeUpload);
  const uploads = useLibrary((s) => s.uploads);
  const pushNotif = useNotifications((s) => s.push);

  const [stage, setStage] = useState<UploadStage>('idle');
  const [progress, setProgress] = useState<number>(0);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);
  const [insight, setInsight] = useState<string>('');
  const [savedAssetId, setSavedAssetId] = useState<string | null>(null);
  const palette = useDominantColors(stage === 'done' ? previewUrl : undefined, 5);

  const recentUploads = uploads.length > 0
    ? uploads.slice(0, 3).map((a) => ({
        name: a.title,
        size: a.size,
        time: 'Just now',
        visual: a.visual,
      }))
    : seedRecentUploads;

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const reset = (): void => {
    setStage('idle');
    setProgress(0);
    setTags([]);
    setInsight('');
    setSavedAssetId(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl('');
    setFile(null);
  };

  const handleSaveToLibrary = (): void => {
    if (!file) return;
    const id = `up-${Date.now().toString(36)}-${Math.random()
      .toString(36)
      .slice(2, 6)}`;
    const asset: Asset = {
      id,
      title: file.name,
      displayTitle: file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' '),
      type: inferTypeFromMime(file.type),
      format: inferFormatFromName(file.name, file.type),
      size: formatBytes(file.size),
      date: new Date().toLocaleDateString('en-GB', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
      }),
      owner: user?.name ?? 'Verified Author',
      visual: pickVisual(file.name),
      tags,
      src: previewUrl,
      likes: 0,
      downloads: 0,
      premium: false,
    };
    addUpload(asset);
    setSavedAssetId(id);
    pushNotif({
      tone: 'collection',
      title: `${asset.displayTitle} saved`,
      body: `Tagged with ${tags.slice(0, 3).join(', ')}.`,
      href: `/asset/${asset.id}`,
    });
    toast.success('Saved to your library', undefined);
  };

  const handleFile = async (next: File | undefined): Promise<void> => {
    if (!next) return;
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    const url = URL.createObjectURL(next);
    setFile(next);
    setPreviewUrl(url);
    setTags([]);
    setInsight('');

    // ── 1. Fake upload progress ─────────────────────────
    setStage('uploading');
    setProgress(0);
    for (let p = 0; p <= 100; p += 6) {
      await new Promise((r) => setTimeout(r, 60));
      setProgress(p);
    }
    setProgress(100);

    // ── 2. Processing beat ─────────────────────────────
    setStage('processing');
    await new Promise((r) => setTimeout(r, 700));

    // ── 3. Stream tags in ──────────────────────────────
    setStage('tagging');
    const collected: string[] = [];
    for await (const { tag } of streamTags(next.name)) {
      collected.push(tag);
      setTags([...collected]);
    }

    // ── 4. Final insight + done ────────────────────────
    const plan = planTagsFor(next.name);
    setInsight(plan.insight);
    setStage('done');
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>): void => {
    event.preventDefault();
    void handleFile(event.dataTransfer.files?.[0]);
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>): void => {
    void handleFile(event.target.files?.[0]);
  };

  const showProcess = stage !== 'idle';

  return (
    <div className="upload-v2-page">
      <div className="upload-v2-header">
        <h1>Upload to your library</h1>
        <p className="upload-v2-subtitle">
          <Sparkles size={16} />
          Our AI tags every upload with Ghanaian-aware vision so your assets
          surface in the right searches.
        </p>
      </div>

      <div className="upload-v2-body">
        <div className="upload-v2-left">
          <AnimatePresence mode="wait" initial={false}>
            {!showProcess ? (
              <motion.div
                key="dropzone"
                className="upload-v2-dropzone idle"
                onDragOver={(e: DragEvent<HTMLDivElement>) => e.preventDefault()}
                onDrop={handleDrop}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
              >
                <div className="upload-v2-icon-ring">
                  <CloudUpload size={36} />
                </div>
                <div className="upload-v2-drop-copy">
                  <h2>Drag and drop your image here</h2>
                  <p>JPG, PNG, TIFF, WEBP · up to 100 MB</p>
                </div>
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/tiff,image/heic,image/heif"
                  hidden
                  onChange={handleInputChange}
                />
                <button
                  className="upload-v2-browse-btn"
                  type="button"
                  onClick={() => inputRef.current?.click()}
                >
                  Browse files
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="process"
                className="upload-process"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={modalSpring}
              >
                <button
                  className="upload-process-reset"
                  type="button"
                  onClick={reset}
                  aria-label="Cancel and start over"
                >
                  <X size={18} />
                </button>

                <div className="upload-process-preview">
                  {previewUrl && (
                    <img src={previewUrl} alt={file?.name ?? 'upload preview'} />
                  )}
                  {stage !== 'done' && (
                    <div className="upload-process-veil">
                      <span className="upload-process-stage">
                        {stage === 'uploading' && `Uploading ${progress}%`}
                        {stage === 'processing' && 'Analysing image…'}
                        {stage === 'tagging' && 'Generating tags…'}
                      </span>
                    </div>
                  )}
                </div>

                <div className="upload-process-bar">
                  <div
                    className={`upload-process-fill stage-${stage}`}
                    style={{
                      width:
                        stage === 'uploading'
                          ? `${progress}%`
                          : stage === 'processing'
                            ? '100%'
                            : '100%',
                    }}
                  />
                </div>

                <div className="upload-process-meta">
                  <strong>{file?.name}</strong>
                  <span>
                    {file ? formatBytes(file.size) : ''}
                    {stage === 'done' && (
                      <>
                        {' · '}
                        <CheckCircle2 size={13} /> Tagged
                      </>
                    )}
                  </span>
                </div>

                <div className="upload-tag-stream">
                  <h3>
                    <Sparkles size={15} />
                    {stage === 'done' ? 'AI-generated tags' : 'Detecting…'}
                  </h3>
                  <div className="upload-tag-cloud">
                    <AnimatePresence>
                      {tags.map((tag) => (
                        <motion.span
                          key={tag}
                          className="tag primary"
                          initial={{ opacity: 0, y: 6, scale: 0.92 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.28 }}
                        >
                          {tag}
                        </motion.span>
                      ))}
                    </AnimatePresence>
                    {stage === 'tagging' && (
                      <span className="tag tag-pending">…</span>
                    )}
                  </div>
                </div>

                {insight && (
                  <motion.section
                    className="upload-insight"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15, duration: 0.4 }}
                  >
                    <h3>
                      <Sparkles size={15} />
                      Editorial insight
                    </h3>
                    <p>{insight}</p>
                  </motion.section>
                )}

                {stage === 'done' && palette && palette.length > 0 && (
                  <motion.section
                    className="upload-palette"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.25 }}
                  >
                    <h3>Extracted palette</h3>
                    <div>
                      {palette.map((hex) => (
                        <span
                          key={hex}
                          style={{ background: hex }}
                          title={hex.toUpperCase()}
                        />
                      ))}
                    </div>
                  </motion.section>
                )}

                {stage === 'done' && (
                  <div className="upload-process-actions">
                    {savedAssetId ? (
                      <>
                        <button
                          className="primary-button wide"
                          type="button"
                          onClick={() => navigate(`/asset/${savedAssetId}`)}
                        >
                          View in library
                        </button>
                        <button
                          className="outline-button wide"
                          type="button"
                          onClick={reset}
                        >
                          Upload another
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className="primary-button wide"
                          type="button"
                          onClick={handleSaveToLibrary}
                        >
                          Save to library
                        </button>
                        <button
                          className="outline-button wide"
                          type="button"
                          onClick={reset}
                        >
                          Discard
                        </button>
                      </>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="upload-v2-bars">
            <span className="upload-v2-bar green" />
            <span className="upload-v2-bar blue" />
            <span className="upload-v2-bar red" />
          </div>
        </div>

        <aside className="upload-v2-right">
          <section className="upload-v2-how-card">
            <h2>How it works</h2>
            <ol className="upload-v2-steps">
              {steps.map(({ n, title, body }) => (
                <li key={n} className="upload-v2-step">
                  <span className="upload-v2-step-num">{n}</span>
                  <div>
                    <strong>{title}</strong>
                    <p>{body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section className="upload-v2-recent">
            <div className="upload-v2-recent-header">
              <h2>Recent uploads</h2>
              <Link to="/library" className="text-button">View all</Link>
            </div>

            <ul className="upload-v2-recent-list">
              {uploads.length > 0
                ? uploads.slice(0, 3).map((a) => (
                    <li key={a.id} className="upload-v2-recent-item">
                      <Link
                        to={`/asset/${a.id}`}
                        className={`upload-v2-recent-thumb ${a.visual}`}
                        aria-label={`Open ${a.displayTitle}`}
                      >
                        {a.src && <img src={a.src} alt="" />}
                      </Link>
                      <div className="upload-v2-recent-meta">
                        <Link to={`/asset/${a.id}`}>
                          <strong>{a.displayTitle}</strong>
                        </Link>
                        <span>{a.size} · {a.date}</span>
                      </div>
                      <button
                        type="button"
                        className="upload-v2-check"
                        aria-label="Remove from recent uploads"
                        onClick={() => {
                          removeUpload(a.id);
                          toast.info('Removed from library');
                        }}
                      >
                        <X size={15} />
                      </button>
                    </li>
                  ))
                : recentUploads.map((u) => (
                    <li key={u.name} className="upload-v2-recent-item">
                      <div className={`upload-v2-recent-thumb ${u.visual}`} />
                      <div className="upload-v2-recent-meta">
                        <strong>{u.name}</strong>
                        <span>{u.size} · {u.time}</span>
                      </div>
                      <CheckCircle2 size={17} className="upload-v2-check" />
                    </li>
                  ))}
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}
