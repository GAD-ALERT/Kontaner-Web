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
import { useDominantColors } from '../hooks/useDominantColors';
import { modalSpring } from '../lib/motion';
import { useLibrary } from '../stores/library';
import { useNotifications } from '../stores/notifications';
import { toast } from '../stores/toast';
import { apiStreamUpload } from '../lib/api';
import type { UploadResponse } from '../types';

type UploadStage = 'idle' | 'uploading' | 'processing' | 'tagging' | 'done';

interface Step {
  n: number;
  title: string;
  body: string;
}


const steps: readonly Step[] = [
  {
    n: 1,
    title: 'Upload high-res files',
    body: 'Up to 25 MB per file to maintain quality for print and digital use.',
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

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function Upload() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const navigate = useNavigate();
  const addUpload = useLibrary((s) => s.addUpload);
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
    : [];

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
    if (savedAssetId) navigate(`/asset/${savedAssetId}`);
  };

  const handleFile = async (next: File | undefined): Promise<void> => {
    if (!next) return;
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    const url = URL.createObjectURL(next);
    setFile(next);
    setPreviewUrl(url);
    setTags([]);
    setInsight('');

    // The backend performs Cloudinary upload, Gemini analysis, and persistence.
    setStage('uploading');
    setProgress(10);

    // ── 2. Processing beat ─────────────────────────────

    // ── 3. Stream tags in ──────────────────────────────

    // ── 4. Final insight + done ────────────────────────
    try {
      const result = await apiStreamUpload<UploadResponse & { tags: string[]; insight: string }>(next, {
        onStatus: ({ stage: nextStage }) => {
          if (nextStage === 'uploading') { setStage('uploading'); setProgress(10); }
          if (nextStage === 'uploaded') { setStage('processing'); setProgress(35); }
          if (nextStage === 'analyzing') { setStage('processing'); setProgress(55); }
          if (nextStage === 'indexing') setProgress(85);
        },
        onTag: ({ tag }) => {
          setStage('tagging');
          setTags((current) => current.includes(tag) ? current : [...current, tag]);
        },
        onInsight: ({ insight: nextInsight }) => setInsight(nextInsight),
      });
      setProgress(100);
      setTags(result.tags);
      setInsight(result.insight);
      addUpload(result.asset);
      setSavedAssetId(result.asset.id);
      setStage('done');
      pushNotif({ tone: 'collection', title: `${result.asset.displayTitle} uploaded`, body: `Tagged with ${result.tags.slice(0, 3).join(', ')}.`, href: `/asset/${result.asset.id}` });
      toast.success('Upload complete');
    } catch (err) {
      toast.error('Upload failed', err instanceof Error ? err.message : undefined);
      reset();
    }
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
                  <p>JPG, PNG, TIFF, WEBP · up to 25 MB</p>
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
                      <CheckCircle2 size={17} className="upload-v2-check" />
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
