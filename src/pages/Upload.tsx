import { useRef, useState, type ChangeEvent, type DragEvent } from 'react';
import { CheckCircle2, CloudUpload, Sparkles } from 'lucide-react';
import { uploadAsset } from '../lib/api';

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

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

const recentUploads: readonly RecentUpload[] = [
  { name: 'kente_pattern_01.jpg',   size: '3.4 MB',  time: '2 MINS AGO',  visual: 'visual-kente' },
  { name: 'art_supplies_set.png',   size: '8.1 MB',  time: '15 MINS AGO', visual: 'visual-studio' },
  { name: 'accra_modern_arch.tiff', size: '42.5 MB', time: '1 HOUR AGO',  visual: 'visual-architecture' },
] as const;

const steps: readonly Step[] = [
  {
    n: 1,
    title: 'Upload high-res files',
    body: 'We support up to 100MB per file to maintain quality for print and digital use.',
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

export function Upload() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [message, setMessage] = useState<string>('');

  const handleFile = async (file: File | undefined): Promise<void> => {
    if (!file) return;
    setStatus('uploading');
    setMessage(`Uploading ${file.name}…`);
    try {
      const asset = await uploadAsset(file);
      setStatus('success');
      setMessage(`Uploaded and tagged: ${asset.tags.join(', ')}`);
    } catch (err: unknown) {
      setStatus('error');
      setMessage(err instanceof Error ? err.message : 'Upload failed');
    }
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>): void => {
    event.preventDefault();
    void handleFile(event.dataTransfer.files?.[0]);
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>): void => {
    void handleFile(event.target.files?.[0]);
  };

  return (
    <div className="upload-v2-page">

      {/* ── Page header (spans full width above both columns) ── */}
      <div className="upload-v2-header">
        <h1>Upload to your library</h1>
        <p className="upload-v2-subtitle">
          <Sparkles size={16} />
          Our AI will automatically tag your assets for easier discovery within your Ghanaian creative community.
        </p>
      </div>

      {/* ── Two-column body ── */}
      <div className="upload-v2-body">

        {/* Left column: dropzone + colour bars */}
        <div className="upload-v2-left">
          <div
            className={`upload-v2-dropzone ${status}`}
            onDragOver={(e: DragEvent<HTMLDivElement>) => e.preventDefault()}
            onDrop={handleDrop}
          >
            <div className="upload-v2-icon-ring">
              <CloudUpload size={36} />
            </div>

            <div className="upload-v2-drop-copy">
              <h2>Drag and drop your image here</h2>
              <p>Support for high-resolution JPG, PNG, and TIFF formats.</p>
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

            {message && (
              <strong className={`upload-v2-status ${status}`}>{message}</strong>
            )}
          </div>

          {/* Colour bars sit below the dropzone, same width */}
          <div className="upload-v2-bars">
            <span className="upload-v2-bar green" />
            <span className="upload-v2-bar blue"  />
            <span className="upload-v2-bar red"   />
          </div>
        </div>

        {/* Right column: How it works + Recent uploads */}
        <aside className="upload-v2-right">

          {/* How it works */}
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

          {/* Recent uploads */}
          <section className="upload-v2-recent">
            <div className="upload-v2-recent-header">
              <h2>Recent uploads</h2>
              <button type="button" className="text-button">View all</button>
            </div>

            <ul className="upload-v2-recent-list">
              {recentUploads.map((u) => (
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
